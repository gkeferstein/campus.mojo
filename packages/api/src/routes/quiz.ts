import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { getQuizById } from '../lib/directus.js';

export async function quizRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /quiz/:quizId/start - Start a quiz attempt
  fastify.post('/quiz/:quizId/start', {
    preHandler: [authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['quizId'],
        properties: {
          quizId: {
            type: 'string',
            format: 'uuid',
          },
        },
      },
    },
  }, async (request, reply) => {
    const { quizId } = request.params as { quizId: string };

    // Get quiz from Directus
    const quiz = await getQuizById(quizId);

    if (!quiz) {
      return reply.status(404).send({ error: 'Quiz not found' });
    }

    // Check for existing incomplete attempt
    const existingAttempt = await prisma.quizAttempt.findFirst({
      where: {
        userId: request.user!.id,
        quizId,
        completedAt: null,
      },
    });

    if (existingAttempt) {
      return reply.send({
        attemptId: existingAttempt.id,
        startedAt: existingAttempt.startedAt,
        quiz: {
          id: quiz.id,
          title: quiz.title,
          timeLimit: quiz.time_limit_minutes,
          questions: quiz.questions?.map(q => ({
            id: q.id,
            type: q.type,
            prompt: q.prompt,
            options: q.answer_options?.map(o => ({
              id: o.id,
              label: o.label,
            })),
          })),
        },
      });
    }

    // Create new attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: request.user!.id,
        quizId,
      },
    });

    return reply.status(201).send({
      attemptId: attempt.id,
      startedAt: attempt.startedAt,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        timeLimit: quiz.time_limit_minutes,
        questions: quiz.questions?.map(q => ({
          id: q.id,
          type: q.type,
          prompt: q.prompt,
          options: q.answer_options?.map(o => ({
            id: o.id,
            label: o.label,
          })),
        })),
      },
    });
  });

  // POST /quiz/:quizId/submit - Submit quiz answers
  fastify.post('/quiz/:quizId/submit', {
    preHandler: [authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['quizId'],
        properties: {
          quizId: {
            type: 'string',
            format: 'uuid',
          },
        },
      },
      body: {
        type: 'object',
        required: ['responses'],
        properties: {
          responses: {
            type: 'array',
            items: {
              type: 'object',
              required: ['questionId', 'answer'],
              properties: {
                questionId: {
                  type: 'string',
                },
                answer: {
                  oneOf: [
                    { type: 'string' },
                    { type: 'array', items: { type: 'string' } },
                  ],
                },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { quizId } = request.params as { quizId: string };
    const body = request.body as { responses: Array<{ questionId: string; answer: string | string[] }> };

    // Get quiz from Directus
    const quiz = await getQuizById(quizId);

    if (!quiz) {
      return reply.status(404).send({ error: 'Quiz not found' });
    }

    // Find the active attempt
    const attempt = await prisma.quizAttempt.findFirst({
      where: {
        userId: request.user!.id,
        quizId,
        completedAt: null,
      },
    });

    if (!attempt) {
      return reply.status(400).send({ error: 'No active quiz attempt found' });
    }

    // Check time limit
    if (quiz.time_limit_minutes) {
      const elapsed = (Date.now() - attempt.startedAt.getTime()) / 1000 / 60;
      if (elapsed > quiz.time_limit_minutes + 1) { // 1 minute grace
        return reply.status(400).send({ error: 'Time limit exceeded' });
      }
    }

    // Grade responses
    const questions = quiz.questions || [];
    const questionMap = new Map(questions.map(q => [q.id, q]));
    
    let correctCount = 0;
    const gradedResponses: Array<{
      questionId: string;
      answer: unknown;
      correct: boolean;
    }> = [];

    for (const response of body.responses) {
      const question = questionMap.get(response.questionId);
      if (!question) continue;

      let isCorrect = false;

      if (question.type === 'single_choice') {
        const correctOption = question.answer_options?.find(o => o.is_correct);
        isCorrect = correctOption?.id === response.answer;
      } else if (question.type === 'multi_choice') {
        const correctIds = new Set(
          question.answer_options?.filter(o => o.is_correct).map(o => o.id) || []
        );
        const answerIds = new Set(response.answer as string[]);
        isCorrect = correctIds.size === answerIds.size &&
          [...correctIds].every(id => answerIds.has(id));
      } else if (question.type === 'short_answer') {
        // Short answers need manual grading - mark as pending
        isCorrect = false;
      }

      if (isCorrect) correctCount++;

      gradedResponses.push({
        questionId: response.questionId,
        answer: response.answer,
        correct: isCorrect,
      });
    }

    // Calculate score
    const score = questions.length > 0 
      ? Math.round((correctCount / questions.length) * 100) 
      : 0;
    const passed = score >= quiz.passing_score;

    // Save responses and update attempt
    await prisma.$transaction([
      ...gradedResponses.map(r => 
        prisma.quizResponse.create({
          data: {
            attemptId: attempt.id,
            questionId: r.questionId,
            answer: r.answer as object,
            correct: r.correct,
          },
        })
      ),
      prisma.quizAttempt.update({
        where: { id: attempt.id },
        data: {
          score,
          passed,
          completedAt: new Date(),
        },
      }),
    ]);

    return reply.send({
      attemptId: attempt.id,
      score,
      passed,
      passingScore: quiz.passing_score,
      results: gradedResponses.map(r => ({
        questionId: r.questionId,
        correct: r.correct,
        explanation: questionMap.get(r.questionId)?.explanation,
      })),
    });
  });

  // GET /quiz/:quizId/attempts - Get user's quiz attempts
  fastify.get('/quiz/:quizId/attempts', {
    preHandler: [authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['quizId'],
        properties: {
          quizId: {
            type: 'string',
            format: 'uuid',
          },
        },
      },
    },
  }, async (request, reply) => {
    const { quizId } = request.params as { quizId: string };

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId: request.user!.id,
        quizId,
      },
      include: {
        responses: true,
      },
      orderBy: { startedAt: 'desc' },
    });

    return reply.send(attempts);
  });
}









