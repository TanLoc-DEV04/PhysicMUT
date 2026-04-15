import { useQuery } from '@tanstack/react-query';
import api from '../services/api.service';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Theory {
  id: string;
  model_type_name: string;
  title: string;
  content_html: string;
  theory_type_name?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Example {
  id: string;
  model_type_name: string;
  title: string;
  problem: string;
  solution: string;
  example_type_name?: string;
  status?: string;
  reference?: string;
}

export interface Exercise {
  id: string;
  model_type_name: string;
  question: string;
  options: { id: string; text: string }[];
  correct_answer: string;
  level: string;
  type?: 'MultipleChoice' | 'Essay';
  exercise_type_name?: string;
  status?: string;
  reference?: string;
  solution?: string;
}

export interface Model3D {
  model_type_name: string;  // Primary Key
  name: string;
  description?: string;
  source_url: string;
  thumbnail_url?: string;
  status?: string;
  theories?: Theory[];
  examples?: Example[];
  exercises?: Exercise[];
  created_at?: string;
  updated_at?: string;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** Fetch the full list of active 3D models (for the models list page) */
export const useModels3D = () => {
  return useQuery({
    queryKey: ['models3d-public'],
    queryFn: async () => {
      const { data } = await api.get<Model3D[]>('/content/models3d');
      return data;
    },
  });
};

/** Fetch a single Model3D by its type name, including all linked content */
export const useModel3DByTypeName = (typeName: string | undefined) => {
  return useQuery({
    queryKey: ['model3d', typeName],
    queryFn: async () => {
      if (!typeName) return null;
      const { data } = await api.get<Model3D>(`/content/models3d/${typeName}`);
      return data;
    },
    enabled: !!typeName,
  });
};

// ── Legacy stubs (kept so old imports don't break immediately) ────────────────
// TODO: Remove these once all callers are migrated.
export interface Lesson {
  id: string;
  name: string;
  chapter_id?: string;
  order?: number;
  status?: string;
  theories?: Theory[];
  models3d?: { name: string; description?: string; thumbnail_url?: string; type?: string; source_url?: string; status?: string }[];
  examples?: Example[];
  exercises?: Exercise[];
}
export interface Chapter {
  id: string;
  name: string;
  description?: string;
  order?: number;
  lessons: Lesson[];
}
export const useChapters = () => useQuery({ queryKey: ['chapters-stub'], queryFn: async () => [] as Chapter[] });
export const useLesson = (_lessonId: string | undefined) => useQuery({ queryKey: ['lesson-stub', _lessonId], queryFn: async () => null as Lesson | null, enabled: false });
