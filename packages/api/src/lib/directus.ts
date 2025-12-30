// Directus API Client for fetching content

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://directus:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;
const DIRECTUS_TIMEOUT_MS = parseInt(process.env.DIRECTUS_TIMEOUT_MS || '5000', 10);

interface DirectusResponse<T> {
  data: T;
  meta?: {
    total_count?: number;
    filter_count?: number;
  };
}

async function directusFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (DIRECTUS_TOKEN) {
    headers['Authorization'] = `Bearer ${DIRECTUS_TOKEN}`;
  }

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DIRECTUS_TIMEOUT_MS);

  try {
    const response = await fetch(`${DIRECTUS_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Directus API error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json() as DirectusResponse<T>;
    return json.data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Directus request timeout after ${DIRECTUS_TIMEOUT_MS}ms`);
    }
    
    throw error;
  }
}

// ============================================
// Course Types
// ============================================

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  published: boolean;
  tenant_id: string | null;
  modules?: Module[];
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  order_index: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  description: string | null;
  duration_minutes: number | null;
  order_index: number;
  content_blocks: ContentBlock[];
}

export interface ContentBlock {
  type: 'heading' | 'paragraph' | 'callout' | 'code_block' | 'image' | 
        'video_embed' | 'divider' | 'card_grid' | 'pro_tip' | 'quiz_embed';
  data: Record<string, unknown>;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  passing_score: number;
  time_limit_minutes: number | null;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  type: 'single_choice' | 'multi_choice' | 'short_answer';
  prompt: string;
  explanation: string | null;
  order_index: number;
  answer_options?: QuizAnswerOption[];
}

export interface QuizAnswerOption {
  id: string;
  question_id: string;
  label: string;
  is_correct: boolean;
}

// ============================================
// API Functions
// ============================================

export async function getCourses(tenantId?: string): Promise<Course[]> {
  const filter = tenantId 
    ? `&filter[_or][0][tenant_id][_null]=true&filter[_or][1][tenant_id][_eq]=${tenantId}`
    : '&filter[tenant_id][_null]=true';
  
  return directusFetch<Course[]>(
    `/items/courses?filter[published][_eq]=true${filter}&sort=title`
  );
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const courses = await directusFetch<Course[]>(
    `/items/courses?filter[slug][_eq]=${slug}&filter[published][_eq]=true&fields=*,modules.id,modules.title,modules.slug,modules.order_index,modules.lessons.id,modules.lessons.title,modules.lessons.slug,modules.lessons.duration_minutes,modules.lessons.order_index&deep[modules][_sort]=order_index&deep[modules][lessons][_sort]=order_index`
  );
  return courses[0] || null;
}

export async function getLessonBySlug(slug: string): Promise<Lesson | null> {
  const lessons = await directusFetch<Lesson[]>(
    `/items/lessons?filter[slug][_eq]=${slug}&fields=*,module_id.course_id`
  );
  return lessons[0] || null;
}

export async function getLessonById(id: string): Promise<(Lesson & { course_id?: string }) | null> {
  try {
    const lesson = await directusFetch<Lesson & { module_id: { course_id: string } }>(
      `/items/lessons/${id}?fields=*,module_id.course_id`
    );
    // Extract course_id from nested module_id object
    const courseId = typeof lesson.module_id === 'object' 
      ? (lesson.module_id as { course_id: string }).course_id 
      : undefined;
    return { ...lesson, course_id: courseId };
  } catch {
    return null;
  }
}

export async function getQuizById(quizId: string): Promise<Quiz | null> {
  try {
    return await directusFetch<Quiz>(
      `/items/quizzes/${quizId}?fields=*,questions.id,questions.type,questions.prompt,questions.explanation,questions.order_index,questions.answer_options.id,questions.answer_options.label,questions.answer_options.is_correct&deep[questions][_sort]=order_index`
    );
  } catch {
    return null;
  }
}

export async function getQuizByLessonId(lessonId: string): Promise<Quiz | null> {
  const quizzes = await directusFetch<Quiz[]>(
    `/items/quizzes?filter[lesson_id][_eq]=${lessonId}&fields=*,questions.id,questions.type,questions.prompt,questions.explanation,questions.order_index,questions.answer_options.id,questions.answer_options.label,questions.answer_options.is_correct&deep[questions][_sort]=order_index`
  );
  return quizzes[0] || null;
}


export async function getTotalLessonsForCourse(courseId: string): Promise<number> {
  try {
    const lessons = await directusFetch<{ id: string }[]>(
      `/items/lessons?filter[module_id][course_id][_eq]=${courseId}&fields=id`
    );
    return lessons.length;
  } catch {
    return 0;
  }
}





