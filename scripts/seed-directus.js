/**
 * Directus Content Seeding Script
 * 
 * This script creates the content schema and seeds sample course data in Directus.
 * Run after Directus is up and configured:
 * 
 * node scripts/seed-directus.js
 * 
 * Environment Variables:
 * - DIRECTUS_URL: Directus API URL (default: http://localhost:8055)
 * - DIRECTUS_TOKEN: Admin API token
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

if (!DIRECTUS_TOKEN) {
  console.error('❌ DIRECTUS_TOKEN environment variable is required');
  console.error('   Generate a static token in Directus Admin > Settings > Access Tokens');
  process.exit(1);
}

async function directusFetch(endpoint, options = {}) {
  const response = await fetch(`${DIRECTUS_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Directus API error: ${response.status} - ${error}`);
  }

  return response.json();
}

// Collection schemas
const collections = [
  {
    collection: 'courses',
    meta: {
      icon: 'school',
      note: 'LMS Courses',
      display_template: '{{title}}',
      sort_field: 'title',
    },
    schema: {},
    fields: [
      { field: 'id', type: 'uuid', meta: { hidden: true }, schema: { is_primary_key: true, has_auto_increment: false } },
      { field: 'title', type: 'string', meta: { required: true, width: 'half' }, schema: { is_nullable: false } },
      { field: 'slug', type: 'string', meta: { required: true, width: 'half' }, schema: { is_unique: true, is_nullable: false } },
      { field: 'description', type: 'text', meta: { interface: 'input-rich-text-md' }, schema: {} },
      { field: 'thumbnail', type: 'uuid', meta: { interface: 'file-image' }, schema: {} },
      { field: 'published', type: 'boolean', meta: { width: 'half' }, schema: { default_value: false } },
      { field: 'tenant_id', type: 'uuid', meta: { width: 'half', note: 'Optional tenant restriction' }, schema: {} },
      { field: 'date_created', type: 'timestamp', meta: { readonly: true, hidden: true, special: ['date-created'] } },
      { field: 'date_updated', type: 'timestamp', meta: { readonly: true, hidden: true, special: ['date-updated'] } },
    ],
  },
  {
    collection: 'modules',
    meta: {
      icon: 'folder',
      note: 'Course Modules',
      display_template: '{{title}}',
      sort_field: 'order_index',
    },
    schema: {},
    fields: [
      { field: 'id', type: 'uuid', meta: { hidden: true }, schema: { is_primary_key: true } },
      { field: 'course_id', type: 'uuid', meta: { required: true, interface: 'select-dropdown-m2o' }, schema: { foreign_key_table: 'courses' } },
      { field: 'title', type: 'string', meta: { required: true, width: 'half' }, schema: { is_nullable: false } },
      { field: 'slug', type: 'string', meta: { required: true, width: 'half' }, schema: { is_nullable: false } },
      { field: 'order_index', type: 'integer', meta: { width: 'half' }, schema: { default_value: 0 } },
    ],
  },
  {
    collection: 'lessons',
    meta: {
      icon: 'article',
      note: 'Module Lessons',
      display_template: '{{title}}',
      sort_field: 'order_index',
    },
    schema: {},
    fields: [
      { field: 'id', type: 'uuid', meta: { hidden: true }, schema: { is_primary_key: true } },
      { field: 'module_id', type: 'uuid', meta: { required: true, interface: 'select-dropdown-m2o' }, schema: { foreign_key_table: 'modules' } },
      { field: 'title', type: 'string', meta: { required: true, width: 'half' }, schema: { is_nullable: false } },
      { field: 'slug', type: 'string', meta: { required: true, width: 'half' }, schema: { is_nullable: false } },
      { field: 'description', type: 'text', meta: { interface: 'input-multiline' }, schema: {} },
      { field: 'duration_minutes', type: 'integer', meta: { width: 'half' }, schema: {} },
      { field: 'order_index', type: 'integer', meta: { width: 'half' }, schema: { default_value: 0 } },
      { field: 'content_blocks', type: 'json', meta: { interface: 'input-code', options: { language: 'json' } }, schema: {} },
    ],
  },
  {
    collection: 'quizzes',
    meta: {
      icon: 'quiz',
      note: 'Lesson Quizzes',
      display_template: '{{title}}',
    },
    schema: {},
    fields: [
      { field: 'id', type: 'uuid', meta: { hidden: true }, schema: { is_primary_key: true } },
      { field: 'lesson_id', type: 'uuid', meta: { required: true, interface: 'select-dropdown-m2o' }, schema: { foreign_key_table: 'lessons' } },
      { field: 'title', type: 'string', meta: { required: true, width: 'half' }, schema: { is_nullable: false } },
      { field: 'passing_score', type: 'integer', meta: { width: 'half', note: 'Percentage (0-100)' }, schema: { default_value: 70 } },
      { field: 'time_limit_minutes', type: 'integer', meta: { width: 'half' }, schema: {} },
    ],
  },
  {
    collection: 'quiz_questions',
    meta: {
      icon: 'help',
      note: 'Quiz Questions',
      display_template: '{{prompt}}',
      sort_field: 'order_index',
    },
    schema: {},
    fields: [
      { field: 'id', type: 'uuid', meta: { hidden: true }, schema: { is_primary_key: true } },
      { field: 'quiz_id', type: 'uuid', meta: { required: true, interface: 'select-dropdown-m2o' }, schema: { foreign_key_table: 'quizzes' } },
      { field: 'type', type: 'string', meta: { required: true, width: 'half', interface: 'select-dropdown', options: { choices: [{ text: 'Single Choice', value: 'single_choice' }, { text: 'Multi Choice', value: 'multi_choice' }, { text: 'Short Answer', value: 'short_answer' }] } }, schema: { default_value: 'single_choice' } },
      { field: 'prompt', type: 'text', meta: { required: true }, schema: { is_nullable: false } },
      { field: 'explanation', type: 'text', meta: { note: 'Shown after answering' }, schema: {} },
      { field: 'order_index', type: 'integer', meta: { width: 'half' }, schema: { default_value: 0 } },
    ],
  },
  {
    collection: 'quiz_answer_options',
    meta: {
      icon: 'check_circle',
      note: 'Answer Options for Questions',
      display_template: '{{label}}',
    },
    schema: {},
    fields: [
      { field: 'id', type: 'uuid', meta: { hidden: true }, schema: { is_primary_key: true } },
      { field: 'question_id', type: 'uuid', meta: { required: true, interface: 'select-dropdown-m2o' }, schema: { foreign_key_table: 'quiz_questions' } },
      { field: 'label', type: 'string', meta: { required: true }, schema: { is_nullable: false } },
      { field: 'is_correct', type: 'boolean', meta: { width: 'half' }, schema: { default_value: false } },
    ],
  },
];

// Sample content
const sampleCourse = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  title: 'Einführung in TypeScript',
  slug: 'einfuehrung-typescript',
  description: 'Lerne die Grundlagen von TypeScript und wie du typsicheren Code schreibst.',
  published: true,
  tenant_id: null,
};

const sampleModules = [
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    course_id: sampleCourse.id,
    title: 'Grundlagen',
    slug: 'grundlagen',
    order_index: 0,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    course_id: sampleCourse.id,
    title: 'Fortgeschrittene Typen',
    slug: 'fortgeschrittene-typen',
    order_index: 1,
  },
];

const sampleLessons = [
  {
    id: '550e8400-e29b-41d4-a716-446655440020',
    module_id: sampleModules[0].id,
    title: 'Was ist TypeScript?',
    slug: 'was-ist-typescript',
    description: 'Eine Einführung in TypeScript und warum es so beliebt ist.',
    duration_minutes: 10,
    order_index: 0,
    content_blocks: [
      {
        type: 'heading',
        data: { level: 2, text: 'Was ist TypeScript?' },
      },
      {
        type: 'paragraph',
        data: { text: 'TypeScript ist eine von Microsoft entwickelte Programmiersprache, die auf JavaScript aufbaut. Sie fügt statische Typisierung hinzu, was bedeutet, dass du Variablen, Funktionsparameter und Rückgabewerte mit Typen versehen kannst.' },
      },
      {
        type: 'callout',
        data: { variant: 'info', text: 'TypeScript wird zu JavaScript kompiliert und kann überall dort ausgeführt werden, wo JavaScript läuft.' },
      },
      {
        type: 'heading',
        data: { level: 3, text: 'Warum TypeScript?' },
      },
      {
        type: 'card_grid',
        data: {
          cards: [
            { title: 'Frühe Fehlererkennung', description: 'Finde Bugs bereits während der Entwicklung, nicht erst zur Laufzeit.' },
            { title: 'Bessere IDE-Unterstützung', description: 'Profitiere von Autovervollständigung, Refactoring und Navigation.' },
            { title: 'Selbstdokumentierender Code', description: 'Typen machen deinen Code lesbarer und verständlicher.' },
            { title: 'Große Community', description: 'Nutze tausende typisierte Bibliotheken über DefinitelyTyped.' },
          ],
        },
      },
      {
        type: 'pro_tip',
        data: { text: 'Auch wenn du JavaScript-Projekte hast, kannst du TypeScript schrittweise einführen - es ist vollständig rückwärtskompatibel!' },
      },
    ],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440021',
    module_id: sampleModules[0].id,
    title: 'Erste Schritte',
    slug: 'erste-schritte',
    description: 'Installation und Einrichtung von TypeScript.',
    duration_minutes: 15,
    order_index: 1,
    content_blocks: [
      {
        type: 'heading',
        data: { level: 2, text: 'TypeScript installieren' },
      },
      {
        type: 'paragraph',
        data: { text: 'Die Installation von TypeScript ist einfach. Du benötigst nur Node.js und npm.' },
      },
      {
        type: 'code_block',
        data: {
          language: 'bash',
          code: '# Global installieren\nnpm install -g typescript\n\n# Oder lokal im Projekt\nnpm install --save-dev typescript',
        },
      },
      {
        type: 'heading',
        data: { level: 3, text: 'Dein erstes TypeScript-Programm' },
      },
      {
        type: 'paragraph',
        data: { text: 'Erstelle eine Datei mit der Endung .ts und füge folgenden Code hinzu:' },
      },
      {
        type: 'code_block',
        data: {
          language: 'typescript',
          code: '// hello.ts\nfunction greet(name: string): string {\n  return `Hallo, ${name}!`;\n}\n\nconsole.log(greet("Welt"));',
        },
      },
      {
        type: 'callout',
        data: { variant: 'tip', text: 'Kompiliere die Datei mit: tsc hello.ts' },
      },
    ],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440022',
    module_id: sampleModules[0].id,
    title: 'Grundlegende Typen',
    slug: 'grundlegende-typen',
    description: 'Die wichtigsten TypeScript-Typen im Überblick.',
    duration_minutes: 20,
    order_index: 2,
    content_blocks: [
      {
        type: 'heading',
        data: { level: 2, text: 'Primitive Typen' },
      },
      {
        type: 'paragraph',
        data: { text: 'TypeScript kennt alle JavaScript-Primitiven plus einige zusätzliche Typen.' },
      },
      {
        type: 'code_block',
        data: {
          language: 'typescript',
          code: '// Primitive Typen\nlet name: string = "Max";\nlet age: number = 25;\nlet isStudent: boolean = true;\nlet nothing: null = null;\nlet notDefined: undefined = undefined;\n\n// Arrays\nlet numbers: number[] = [1, 2, 3];\nlet names: Array<string> = ["Anna", "Ben"];\n\n// Tuple\nlet person: [string, number] = ["Max", 25];',
        },
      },
      {
        type: 'divider',
        data: {},
      },
      {
        type: 'heading',
        data: { level: 3, text: 'Spezielle Typen' },
      },
      {
        type: 'code_block',
        data: {
          language: 'typescript',
          code: '// any - Opt-out der Typprüfung\nlet anything: any = "kann alles sein";\n\n// unknown - Sichere Alternative zu any\nlet userInput: unknown = getUserInput();\n\n// void - Kein Rückgabewert\nfunction log(message: string): void {\n  console.log(message);\n}\n\n// never - Funktion kehrt nie zurück\nfunction throwError(msg: string): never {\n  throw new Error(msg);\n}',
        },
      },
      {
        type: 'callout',
        data: { variant: 'warning', text: 'Vermeide any wenn möglich! Es schaltet die Typprüfung aus.' },
      },
    ],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440030',
    module_id: sampleModules[1].id,
    title: 'Interfaces und Types',
    slug: 'interfaces-und-types',
    description: 'Lerne eigene Typen mit Interfaces und Type-Aliases zu definieren.',
    duration_minutes: 25,
    order_index: 0,
    content_blocks: [
      {
        type: 'heading',
        data: { level: 2, text: 'Interfaces' },
      },
      {
        type: 'paragraph',
        data: { text: 'Interfaces definieren die Struktur von Objekten. Sie sind eines der Kernkonzepte von TypeScript.' },
      },
      {
        type: 'code_block',
        data: {
          language: 'typescript',
          code: 'interface User {\n  id: number;\n  name: string;\n  email: string;\n  age?: number; // Optional\n  readonly createdAt: Date; // Nur lesen\n}\n\nconst user: User = {\n  id: 1,\n  name: "Max",\n  email: "max@example.com",\n  createdAt: new Date(),\n};',
        },
      },
      {
        type: 'heading',
        data: { level: 3, text: 'Type Aliases' },
      },
      {
        type: 'code_block',
        data: {
          language: 'typescript',
          code: '// Type Alias für Union Types\ntype ID = string | number;\n\n// Type Alias für Objekte\ntype Point = {\n  x: number;\n  y: number;\n};\n\n// Type Alias für Funktionen\ntype Callback = (data: string) => void;',
        },
      },
      {
        type: 'pro_tip',
        data: { text: 'Interface vs Type: Nutze Interfaces für Objekte und Classes, Type Aliases für Unions und komplexe Typen.' },
      },
    ],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440031',
    module_id: sampleModules[1].id,
    title: 'Generics',
    slug: 'generics',
    description: 'Schreibe wiederverwendbaren Code mit Generics.',
    duration_minutes: 30,
    order_index: 1,
    content_blocks: [
      {
        type: 'heading',
        data: { level: 2, text: 'Was sind Generics?' },
      },
      {
        type: 'paragraph',
        data: { text: 'Generics erlauben es, Funktionen und Typen zu schreiben, die mit verschiedenen Typen arbeiten können, ohne die Typsicherheit zu verlieren.' },
      },
      {
        type: 'code_block',
        data: {
          language: 'typescript',
          code: '// Generische Funktion\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n\n// Nutzung\nconst str = identity<string>("Hallo");\nconst num = identity<number>(42);\n\n// TypeScript kann den Typ oft inferieren\nconst inferred = identity("Welt");',
        },
      },
      {
        type: 'heading',
        data: { level: 3, text: 'Generische Interfaces' },
      },
      {
        type: 'code_block',
        data: {
          language: 'typescript',
          code: 'interface Response<T> {\n  data: T;\n  status: number;\n  message: string;\n}\n\ninterface User {\n  id: number;\n  name: string;\n}\n\nconst userResponse: Response<User> = {\n  data: { id: 1, name: "Max" },\n  status: 200,\n  message: "Success",\n};',
        },
      },
      {
        type: 'callout',
        data: { variant: 'info', text: 'Generics sind besonders nützlich für Arrays, Promises und API-Responses.' },
      },
      {
        type: 'quiz_embed',
        data: { quizId: '550e8400-e29b-41d4-a716-446655440040' },
      },
    ],
  },
];

const sampleQuiz = {
  id: '550e8400-e29b-41d4-a716-446655440040',
  lesson_id: sampleLessons[4].id,
  title: 'Generics Quiz',
  passing_score: 70,
  time_limit_minutes: 10,
};

const sampleQuestions = [
  {
    id: '550e8400-e29b-41d4-a716-446655440050',
    quiz_id: sampleQuiz.id,
    type: 'single_choice',
    prompt: 'Was ist der Hauptvorteil von Generics?',
    explanation: 'Generics ermöglichen wiederverwendbaren Code, der mit verschiedenen Typen arbeiten kann, ohne die Typsicherheit zu verlieren.',
    order_index: 0,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440051',
    quiz_id: sampleQuiz.id,
    type: 'single_choice',
    prompt: 'Welche Syntax wird für Generics verwendet?',
    explanation: 'In TypeScript werden spitze Klammern <T> verwendet, um einen generischen Typparameter zu definieren.',
    order_index: 1,
  },
];

const sampleAnswerOptions = [
  // Question 1
  { id: '550e8400-e29b-41d4-a716-446655440060', question_id: sampleQuestions[0].id, label: 'Bessere Performance', is_correct: false },
  { id: '550e8400-e29b-41d4-a716-446655440061', question_id: sampleQuestions[0].id, label: 'Wiederverwendbarkeit mit Typsicherheit', is_correct: true },
  { id: '550e8400-e29b-41d4-a716-446655440062', question_id: sampleQuestions[0].id, label: 'Kleinere Bundle-Größe', is_correct: false },
  { id: '550e8400-e29b-41d4-a716-446655440063', question_id: sampleQuestions[0].id, label: 'Einfachere Syntax', is_correct: false },
  // Question 2
  { id: '550e8400-e29b-41d4-a716-446655440064', question_id: sampleQuestions[1].id, label: '[T]', is_correct: false },
  { id: '550e8400-e29b-41d4-a716-446655440065', question_id: sampleQuestions[1].id, label: '<T>', is_correct: true },
  { id: '550e8400-e29b-41d4-a716-446655440066', question_id: sampleQuestions[1].id, label: '{T}', is_correct: false },
  { id: '550e8400-e29b-41d4-a716-446655440067', question_id: sampleQuestions[1].id, label: '(T)', is_correct: false },
];

async function createCollection(collection) {
  try {
    console.log(`  Creating collection: ${collection.collection}`);
    await directusFetch('/collections', {
      method: 'POST',
      body: JSON.stringify(collection),
    });
    console.log(`  ✅ ${collection.collection}`);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`  ⏭️  ${collection.collection} (already exists)`);
    } else {
      throw error;
    }
  }
}

async function createItem(collection, item) {
  try {
    await directusFetch(`/items/${collection}`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  } catch (error) {
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      // Item already exists, skip
    } else {
      throw error;
    }
  }
}

async function main() {
  console.log('🚀 Starting Directus Content Seeding...\n');
  console.log(`📡 Directus URL: ${DIRECTUS_URL}\n`);

  // Step 1: Create collections
  console.log('📦 Creating collections...');
  for (const collection of collections) {
    await createCollection(collection);
  }
  console.log('');

  // Step 2: Create sample content
  console.log('📝 Creating sample content...');

  console.log('  Creating course...');
  await createItem('courses', sampleCourse);
  console.log('  ✅ Course created');

  console.log('  Creating modules...');
  for (const module of sampleModules) {
    await createItem('modules', module);
  }
  console.log(`  ✅ ${sampleModules.length} modules created`);

  console.log('  Creating lessons...');
  for (const lesson of sampleLessons) {
    await createItem('lessons', lesson);
  }
  console.log(`  ✅ ${sampleLessons.length} lessons created`);

  console.log('  Creating quiz...');
  await createItem('quizzes', sampleQuiz);
  console.log('  ✅ Quiz created');

  console.log('  Creating questions...');
  for (const question of sampleQuestions) {
    await createItem('quiz_questions', question);
  }
  console.log(`  ✅ ${sampleQuestions.length} questions created`);

  console.log('  Creating answer options...');
  for (const option of sampleAnswerOptions) {
    await createItem('quiz_answer_options', option);
  }
  console.log(`  ✅ ${sampleAnswerOptions.length} answer options created`);

  console.log('\n✨ Seeding complete!');
  console.log('\n📚 Sample Course:');
  console.log(`   Title: ${sampleCourse.title}`);
  console.log(`   Slug: ${sampleCourse.slug}`);
  console.log(`   Modules: ${sampleModules.length}`);
  console.log(`   Lessons: ${sampleLessons.length}`);
}

main().catch((error) => {
  console.error('\n❌ Seeding failed:', error.message);
  process.exit(1);
});






