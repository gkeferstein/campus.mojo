import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthUser } from '../middleware/auth.js';

interface AuthenticatedRequest extends FastifyRequest {
  user: AuthUser;
}

// Types
interface CreatePostBody {
  type: 'post' | 'success_story' | 'question' | 'tip' | 'inspiration';
  title?: string;
  content: string;
  imageUrl?: string;
  beforeScore?: number;
  afterScore?: number;
}

interface CreateCommentBody {
  content: string;
  parentId?: string;
}

interface PostQuery {
  type?: string;
  page?: string;
  limit?: string;
}

export async function communityRoutes(fastify: FastifyInstance) {
  // ============================================
  // Posts
  // ============================================

  // Get community posts (feed)
  fastify.get(
    '/community/posts',
    {
      preHandler: authenticate,
      schema: {
        querystring: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            page: { type: 'string' },
            limit: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { type, page = '1', limit = '20' } = request.query as PostQuery;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Check user's community access
      const journey = await prisma.userJourney.findUnique({
        where: { userId: (request as any).user.id },
      });

      const hasReadAccess = journey && ['trial_active', 'lebensenergie_active', 'resilienz_active'].includes(journey.state);
      
      if (!hasReadAccess && (journey?.checkInsCompleted ?? 0) < 1) {
        return reply.status(403).send({ 
          error: 'Complete at least one check-in to access the community',
          requiredCheckIns: 1,
        });
      }

      const where = {
        isPublished: true,
        ...(type && { type }),
      };

      const [posts, total] = await Promise.all([
        prisma.communityPost.findMany({
          where,
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
            _count: {
              select: { comments: true, likes: true },
            },
          },
          orderBy: [
            { isPinned: 'desc' },
            { createdAt: 'desc' },
          ],
          skip,
          take: parseInt(limit),
        }),
        prisma.communityPost.count({ where }),
      ]);

      // Check which posts the user has liked
      const userLikes = await prisma.communityLike.findMany({
        where: {
          userId: (request as any).user.id,
          postId: { in: posts.map(p => p.id) },
        },
        select: { postId: true },
      });
      const likedPostIds = new Set(userLikes.map(l => l.postId));

      return reply.send({
        posts: posts.map(p => ({
          id: p.id,
          type: p.type,
          title: p.title,
          content: p.content,
          imageUrl: p.imageUrl,
          beforeScore: p.beforeScore,
          afterScore: p.afterScore,
          likesCount: p._count.likes,
          commentsCount: p._count.comments,
          isPinned: p.isPinned,
          isLiked: likedPostIds.has(p.id),
          author: {
            id: p.author.id,
            name: [p.author.firstName, p.author.lastName].filter(Boolean).join(' ') || 'Anonym',
            avatarUrl: p.author.avatarUrl,
          },
          createdAt: p.createdAt,
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      });
    }
  );

  // Create a new post
  fastify.post(
    '/community/posts',
    {
      preHandler: authenticate,
      schema: {
        body: {
          type: 'object',
          required: ['type', 'content'],
          properties: {
            type: { type: 'string', enum: ['post', 'success_story', 'question', 'tip', 'inspiration'] },
            title: { type: 'string' },
            content: { type: 'string' },
            imageUrl: { type: 'string' },
            beforeScore: { type: 'number' },
            afterScore: { type: 'number' },
          },
        },
      },
    },
    async (request, reply) => {
      const body = request.body as CreatePostBody;
      const { type, title, content, imageUrl, beforeScore, afterScore } = body;

      // Check user's community write access
      const journey = await prisma.userJourney.findUnique({
        where: { userId: (request as any).user.id },
      });

      const hasWriteAccess = journey && ['trial_active', 'lebensenergie_active', 'resilienz_active'].includes(journey.state);
      
      if (!hasWriteAccess) {
        return reply.status(403).send({ 
          error: 'You need an active subscription or trial to post',
        });
      }

      // For success stories, require before/after scores
      if (type === 'success_story' && (!beforeScore || !afterScore)) {
        return reply.status(400).send({
          error: 'Success stories require before and after LEBENSENERGIE scores',
        });
      }

      const post = await prisma.communityPost.create({
        data: {
          authorId: (request as any).user.id,
          type,
          title,
          content,
          imageUrl,
          beforeScore,
          afterScore,
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Award badge for first post
      const postCount = await prisma.communityPost.count({
        where: { authorId: (request as any).user.id },
      });

      if (postCount === 1) {
        await prisma.userBadge.upsert({
          where: { userId_badgeSlug: { userId: (request as any).user.id, badgeSlug: 'first-post' } },
          create: { userId: (request as any).user.id, badgeSlug: 'first-post' },
          update: {},
        });
      }

      // Award badge for success story
      if (type === 'success_story' && afterScore && beforeScore && afterScore > beforeScore) {
        await prisma.userBadge.upsert({
          where: { userId_badgeSlug: { userId: (request as any).user.id, badgeSlug: 'success-story' } },
          create: { userId: (request as any).user.id, badgeSlug: 'success-story' },
          update: {},
        });
      }

      return reply.status(201).send({
        post: {
          id: post.id,
          type: post.type,
          title: post.title,
          content: post.content,
          imageUrl: post.imageUrl,
          beforeScore: post.beforeScore,
          afterScore: post.afterScore,
          likesCount: 0,
          commentsCount: 0,
          author: {
            id: post.author.id,
            name: [post.author.firstName, post.author.lastName].filter(Boolean).join(' ') || 'Anonym',
            avatarUrl: post.author.avatarUrl,
          },
          createdAt: post.createdAt,
        },
      });
    }
  );

  // Get single post with comments
  fastify.get(
    '/community/posts/:postId',
    {
      preHandler: authenticate,
      schema: {
        params: {
          type: 'object',
          required: ['postId'],
          properties: {
            postId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { postId } = request.params as { postId: string };

      const post = await prisma.communityPost.findUnique({
        where: { id: postId, isPublished: true },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          comments: {
            where: { parentId: null }, // Top-level comments only
            include: {
              author: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
              replies: {
                include: {
                  author: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      avatarUrl: true,
                    },
                  },
                },
                orderBy: { createdAt: 'asc' },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: { likes: true },
          },
        },
      });

      if (!post) {
        return reply.status(404).send({ error: 'Post not found' });
      }

      // Check if user liked
      const userLike = await prisma.communityLike.findUnique({
        where: { userId_postId: { userId: (request as any).user.id, postId } },
      });

      return reply.send({
        post: {
          id: post.id,
          type: post.type,
          title: post.title,
          content: post.content,
          imageUrl: post.imageUrl,
          beforeScore: post.beforeScore,
          afterScore: post.afterScore,
          likesCount: post._count.likes,
          commentsCount: post.comments.length + post.comments.reduce((sum, c) => sum + c.replies.length, 0),
          isPinned: post.isPinned,
          isLiked: !!userLike,
          author: {
            id: post.author.id,
            name: [post.author.firstName, post.author.lastName].filter(Boolean).join(' ') || 'Anonym',
            avatarUrl: post.author.avatarUrl,
          },
          createdAt: post.createdAt,
          comments: post.comments.map(c => ({
            id: c.id,
            content: c.content,
            likesCount: c.likesCount,
            author: {
              id: c.author.id,
              name: [c.author.firstName, c.author.lastName].filter(Boolean).join(' ') || 'Anonym',
              avatarUrl: c.author.avatarUrl,
            },
            createdAt: c.createdAt,
            replies: c.replies.map(r => ({
              id: r.id,
              content: r.content,
              likesCount: r.likesCount,
              author: {
                id: r.author.id,
                name: [r.author.firstName, r.author.lastName].filter(Boolean).join(' ') || 'Anonym',
                avatarUrl: r.author.avatarUrl,
              },
              createdAt: r.createdAt,
            })),
          })),
        },
      });
    }
  );

  // Like/unlike a post
  fastify.post(
    '/community/posts/:postId/like',
    {
      preHandler: authenticate,
      schema: {
        params: {
          type: 'object',
          required: ['postId'],
          properties: {
            postId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { postId } = request.params as { postId: string };

      // Check if post exists
      const post = await prisma.communityPost.findUnique({
        where: { id: postId },
      });

      if (!post) {
        return reply.status(404).send({ error: 'Post not found' });
      }

      // Toggle like
      const existingLike = await prisma.communityLike.findUnique({
        where: { userId_postId: { userId: (request as any).user.id, postId } },
      });

      if (existingLike) {
        // Unlike
        await prisma.communityLike.delete({
          where: { id: existingLike.id },
        });
        await prisma.communityPost.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } },
        });
        return reply.send({ liked: false });
      } else {
        // Like
        await prisma.communityLike.create({
          data: { userId: (request as any).user.id, postId },
        });
        await prisma.communityPost.update({
          where: { id: postId },
          data: { likesCount: { increment: 1 } },
        });
        return reply.send({ liked: true });
      }
    }
  );

  // ============================================
  // Comments
  // ============================================

  // Add comment to a post
  fastify.post(
    '/community/posts/:postId/comments',
    {
      preHandler: authenticate,
      schema: {
        params: {
          type: 'object',
          required: ['postId'],
          properties: {
            postId: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          required: ['content'],
          properties: {
            content: { type: 'string' },
            parentId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { postId } = request.params as { postId: string };
      const body = request.body as CreateCommentBody;
      const { content, parentId } = body;

      // Check user's community write access
      const journey = await prisma.userJourney.findUnique({
        where: { userId: (request as any).user.id },
      });

      const hasWriteAccess = journey && ['trial_active', 'lebensenergie_active', 'resilienz_active'].includes(journey.state);
      
      if (!hasWriteAccess) {
        return reply.status(403).send({ 
          error: 'You need an active subscription or trial to comment',
        });
      }

      // Check if post exists
      const post = await prisma.communityPost.findUnique({
        where: { id: postId },
      });

      if (!post) {
        return reply.status(404).send({ error: 'Post not found' });
      }

      // If replying, check if parent comment exists
      if (parentId) {
        const parentComment = await prisma.communityComment.findUnique({
          where: { id: parentId, postId },
        });
        if (!parentComment) {
          return reply.status(404).send({ error: 'Parent comment not found' });
        }
      }

      const comment = await prisma.communityComment.create({
        data: {
          postId,
          authorId: (request as any).user.id,
          content,
          parentId,
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Update comment count
      await prisma.communityPost.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } },
      });

      return reply.status(201).send({
        comment: {
          id: comment.id,
          content: comment.content,
          likesCount: 0,
          author: {
            id: comment.author.id,
            name: [comment.author.firstName, comment.author.lastName].filter(Boolean).join(' ') || 'Anonym',
            avatarUrl: comment.author.avatarUrl,
          },
          createdAt: comment.createdAt,
        },
      });
    }
  );

  // ============================================
  // Success Stories Feed
  // ============================================

  // Get success stories (featured)
  fastify.get(
    '/community/success-stories',
    { preHandler: authenticate },
    async (request, reply) => {
      const stories = await prisma.communityPost.findMany({
        where: {
          type: 'success_story',
          isPublished: true,
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: { likes: true, comments: true },
          },
        },
        orderBy: [
          { isPinned: 'desc' },
          { likesCount: 'desc' },
          { createdAt: 'desc' },
        ],
        take: 10,
      });

      return reply.send({
        stories: stories.map(s => ({
          id: s.id,
          title: s.title,
          content: s.content.substring(0, 200) + (s.content.length > 200 ? '...' : ''),
          beforeScore: s.beforeScore,
          afterScore: s.afterScore,
          improvement: s.beforeScore && s.afterScore 
            ? Math.round(((s.afterScore - s.beforeScore) / s.beforeScore) * 100)
            : null,
          likesCount: s._count.likes,
          commentsCount: s._count.comments,
          author: {
            id: s.author.id,
            name: [s.author.firstName, s.author.lastName].filter(Boolean).join(' ') || 'Anonym',
            avatarUrl: s.author.avatarUrl,
          },
          createdAt: s.createdAt,
        })),
      });
    }
  );

  // ============================================
  // Daily Inspiration
  // ============================================

  // Get today's inspiration post
  fastify.get(
    '/community/daily-inspiration',
    { preHandler: authenticate },
    async (request, reply) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get pinned inspiration or most recent
      const inspiration = await prisma.communityPost.findFirst({
        where: {
          type: 'inspiration',
          isPublished: true,
          createdAt: { gte: today },
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
      });

      if (!inspiration) {
        // Fallback to most recent inspiration
        const fallback = await prisma.communityPost.findFirst({
          where: {
            type: 'inspiration',
            isPublished: true,
          },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (!fallback) {
          return reply.send({ inspiration: null });
        }

        return reply.send({
          inspiration: {
            id: fallback.id,
            content: fallback.content,
            author: {
              id: fallback.author.id,
              name: [fallback.author.firstName, fallback.author.lastName].filter(Boolean).join(' ') || 'MOJO Team',
              avatarUrl: fallback.author.avatarUrl,
            },
          },
        });
      }

      return reply.send({
        inspiration: {
          id: inspiration.id,
          content: inspiration.content,
          author: {
            id: inspiration.author.id,
            name: [inspiration.author.firstName, inspiration.author.lastName].filter(Boolean).join(' ') || 'MOJO Team',
            avatarUrl: inspiration.author.avatarUrl,
          },
        },
      });
    }
  );
}

