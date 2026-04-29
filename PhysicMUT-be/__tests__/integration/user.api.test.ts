import request from 'supertest';
import express from 'express';
import userRouter from '../../src/routes/users';
import * as userService from '../../src/services/userService';

const app = express();
app.use(express.json());
app.use('/users', userRouter);

jest.mock('../../src/services/userService');

const mockedUserService = userService as jest.Mocked<typeof userService>;

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(500).json({ success: false, message: err.message });
});

describe('User API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    it('[Success] Should return 200 and list of users', async () => {
      const mockUsers = [
        { id: '1', username: 'user1', email: 'user1@test.com', full_name: 'User 1', department: null, role: { name: 'USER' }, is_active: true, last_login: null, created_at: new Date() },
        { id: '2', username: 'user2', email: 'user2@test.com', full_name: 'User 2', department: null, role: { name: 'ADMIN' }, is_active: true, last_login: null, created_at: new Date() }
      ];

      mockedUserService.getUsers.mockResolvedValue(mockUsers);

      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(mockedUserService.getUsers).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /users', () => {
    it('[Success] Should return 201 when creating user successfully', async () => {
      const mockPayload = { username: 'newadmin', email: 'admin@test.com', password: 'password123', full_name: 'New Admin', role_name: 'ADMIN' };
      const mockResponse = { id: '3', username: 'newadmin', email: 'admin@test.com', full_name: 'New Admin', department: null, role: { name: 'ADMIN' }, is_active: true, last_login: null, created_at: new Date() };

      mockedUserService.createUser.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/users')
        .send(mockPayload);

      expect(response.status).toBe(201);
      expect(mockedUserService.createUser).toHaveBeenCalledTimes(1);
    });

    it('[Failure] Should return 400 Bad Request if missing required fields', async () => {
      const invalidPayload = { email: 'admin@test.com', full_name: 'No Username' };

      const response = await request(app)
        .post('/users')
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(mockedUserService.createUser).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /users/:id', () => {
    it('[Success] Should delete user successfully', async () => {
      mockedUserService.deleteUser.mockResolvedValue({ id: '1' } as any);

      const response = await request(app).delete('/users/1');

      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(300);
      expect(mockedUserService.deleteUser).toHaveBeenCalledWith('1');
    });
  });
});
