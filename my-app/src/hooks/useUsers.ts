import { useQuery } from '@tanstack/react-query';
import api from '../services/api.service';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  created_at: string;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get<User[]>('/users');
      return data;
    },
  });
};
