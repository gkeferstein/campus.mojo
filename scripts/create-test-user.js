/**
 * Create Test User Script
 * 
 * Creates a test user with entitlements for the sample course.
 * Run after the API is up:
 * 
 * node scripts/create-test-user.js
 * 
 * Environment Variables:
 * - API_URL: LMS API URL (default: http://localhost:3001)
 */

const API_URL = process.env.API_URL || 'http://localhost:3001';

const testUser = {
  email: 'test@mojo-institut.de',
  password: 'Test1234!',
  firstName: 'Test',
  lastName: 'User',
};

const sampleCourseId = '550e8400-e29b-41d4-a716-446655440001';

async function main() {
  console.log('🚀 Creating test user...\n');
  console.log(`📡 API URL: ${API_URL}\n`);

  // Check API health
  try {
    const healthResponse = await fetch(`${API_URL}/health`);
    if (!healthResponse.ok) {
      throw new Error('API not healthy');
    }
    console.log('✅ API is healthy\n');
  } catch (error) {
    console.error('❌ API is not reachable:', error.message);
    console.error('   Make sure the API is running first.');
    process.exit(1);
  }

  // Register user
  console.log('📝 Registering user...');
  try {
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });

    if (registerResponse.ok) {
      const data = await registerResponse.json();
      console.log(`✅ User registered: ${data.user.email}`);
      console.log(`   Token: ${data.token.substring(0, 20)}...`);
    } else {
      const error = await registerResponse.json();
      if (error.error === 'Email already registered') {
        console.log('⏭️  User already exists, logging in...');
      } else {
        throw new Error(error.error);
      }
    }
  } catch (error) {
    console.error('❌ Registration failed:', error.message);
  }

  // Login
  console.log('\n🔐 Logging in...');
  const loginResponse = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password,
    }),
  });

  if (!loginResponse.ok) {
    const error = await loginResponse.json();
    throw new Error(`Login failed: ${error.error}`);
  }

  const loginData = await loginResponse.json();
  console.log(`✅ Logged in as: ${loginData.user.email}`);

  console.log('\n✨ Test user setup complete!');
  console.log('\n📋 Login Credentials:');
  console.log(`   Email: ${testUser.email}`);
  console.log(`   Password: ${testUser.password}`);
  console.log('\n⚠️  Note: To access courses, you need to create an entitlement manually in the database:');
  console.log(`\n   INSERT INTO lms.entitlements (id, user_id, course_id, source)`);
  console.log(`   VALUES (gen_random_uuid(), '${loginData.user.id}', '${sampleCourseId}', 'manual');`);
}

main().catch((error) => {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
});






