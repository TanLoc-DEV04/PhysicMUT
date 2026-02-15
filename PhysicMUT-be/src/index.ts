import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import healthRouter from './routes/health';
import userRouter from './routes/users';
import authRouter from './routes/auth';
import roleRouter from './routes/roles';
import contentRouter from './routes/content';

import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Swagger Page
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/health', healthRouter);
app.use('/users', userRouter);
app.use('/auth', authRouter);
app.use('/roles', roleRouter);
app.use('/content', contentRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('PhysicMUT Backend is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
});
