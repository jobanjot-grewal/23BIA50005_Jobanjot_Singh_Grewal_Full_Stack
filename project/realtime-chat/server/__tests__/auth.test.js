const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth API', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBeTruthy();
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user).toHaveProperty('username', 'testuser');
  });

  it('should not register user with existing email', async () => {
    await User.create({
      name: 'Existing',
      username: 'exist',
      email: 'exist@test.com',
      passwordHash: 'hashedpassword'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        username: 'testuser',
        email: 'exist@test.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBeFalsy();
  });

  it('should login successfully with correct credentials', async () => {
    // Need to register through API to hash password properly
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.data).toHaveProperty('token');
  });
});
