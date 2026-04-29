import request from 'supertest';
import express from 'express';
import contentRouter from '../../src/routes/content';
import * as contentService from '../../src/services/contentService';

const app = express();
app.use(express.json());
app.use('/content', contentRouter);

jest.mock('../../src/services/contentService');

const mockedContentService = contentService as jest.Mocked<typeof contentService>;

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(500).json({ success: false, message: err.message });
});

describe('Content/Theory API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /content/theories', () => {
    it('[Success] Should return 200 and list of theories', async () => {
      const mockTheories = [
        { id: '1', title: 'Theory 1', content_html: '<p>Content</p>', model_type_name: 'Cyclotron', theory_type_name: 'Physics', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() }
      ];

      mockedContentService.getTheories.mockResolvedValue(mockTheories as any);

      const response = await request(app).get('/content/theories');

      expect(response.status).toBe(200);
      expect(mockedContentService.getTheories).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /content/theories', () => {
    it('[Success] Should return 201 and data when theory is created successfully', async () => {
      const mockPayload = { title: 'Định luật Newton', content_html: '<p>F = ma</p>', model_type_name: 'Cyclotron', theory_type_name: 'Physics' };
      const mockCreatedData = { id: '2', ...mockPayload, status: 'ACTIVE', created_at: new Date(), updated_at: new Date() };

      mockedContentService.createTheory.mockResolvedValue(mockCreatedData as any);

      const response = await request(app)
        .post('/content/theories')
        .send(mockPayload);

      expect(response.status).toBe(201);
      
      expect(mockedContentService.createTheory).toHaveBeenCalledTimes(1);
      expect(mockedContentService.createTheory).toHaveBeenCalledWith(mockPayload);
    });

    it('[Failure] Should return 400 Bad Request if missing required title', async () => {
      const invalidPayload = { content_html: '<p>Missing title</p>', model_type_name: 'Cyclotron' };

      const response = await request(app)
        .post('/content/theories')
        .send(invalidPayload);

      expect(response.status).toBe(400); // Do Validator Middleware chặn lại
      expect(mockedContentService.createTheory).not.toHaveBeenCalled();
    });
  });
});
