export interface ExerciseInfo {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  modelId?: string; // Reference to 3D model if applicable
  questions: Question[];
  theory?: string; // Theory content
  exampleSolution?: ExampleSolution; // Example solution step-by-step
  createdAt?: string;
  updatedAt?: string;
}

export interface Question {
  id: string;
  questionText: string;
  type: 'text' | 'multiple-choice' | 'calculation';
  correctAnswer?: string;
  solution?: string;
  points?: number;
  options?: string[]; // multiple choices?
}

export interface ExampleSolution {
  exampleQuestion?: string; // Example question text
  steps: SolutionStep[];
  finalAnswer: string;
}

export interface SolutionStep {
  stepNumber: number;
  description: string;
  formula?: string;
  calculation?: string;
  explanation: string;
}

export interface AnswerData {
  exerciseId: string;
  answers: Record<string, string>; // questionId -> answer
  submittedAt?: string;
}

export interface SubmissionResult {
  submissionId: string;
  exerciseId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  results: QuestionResult[];
  submittedAt: string;
  feedback?: string;
}

export interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  points: number;
  maxPoints: number;
  feedback?: string;
}

export interface Result {
  id: string;
  exerciseId: string;
  userId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  submittedAt: string;
  completedAt?: string;
}
