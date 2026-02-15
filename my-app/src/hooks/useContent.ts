import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

// Types (You might move these to a types file later)
export interface Chapter {
  id: string;
  name: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  name: string;
  chapter_id: string;
  order: number;
  status?: string;
  theories?: Theory[];
  models3d?: Model3D[];
  examples?: Example[];
  exercises?: Exercise[];
}

export interface Theory {
  id: string;
  title: string;
  content_html: string;
  status?: string;
}

export interface Model3D {
  id: string;
  name: string;
  description?: string;
  source_url: string;
  thumbnail_url?: string;
  status?: string;
  type?: string;
  category?: string;
}

export interface Example {
  id: string;
  title: string;
  problem: string;
  solution: string; // JSON string
  status?: string;
}

export interface Exercise {
  id: string;
  question: string;
  options: any; // JSON
  correct_answer: string;
  level: string;
  status?: string;
  type?: 'MultipleChoice' | 'Essay';
}

// Hooks
export const useChapters = () => {
  return useQuery({
    queryKey: ['chapters'],
    queryFn: async () => {
      const { data } = await api.get<Chapter[]>('/content/chapters');
      return data;
    },
  });
};

export const useLesson = (lessonId: string | undefined) => {
  return useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      if (!lessonId) return null;
      const { data } = await api.get<Lesson>(`/content/lessons/${lessonId}`);
      return data;
    },
    enabled: !!lessonId,
  });
};
