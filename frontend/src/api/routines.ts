import { api } from './client';
import type {
  Routine,
  Category,
  CreateRoutineBody,
  ApplyBody,
  ApplyResult,
} from '../types';

export const routineApi = {
  list: () => api.get<Routine[]>('/api/routines'),
  categories: () => api.get<Category[]>('/api/categories'),
  create: (body: CreateRoutineBody) =>
    api.post<{ id: number }>('/api/routines', body),
  update: (id: number, body: CreateRoutineBody) =>
    api.put<{ id: number }>(`/api/routines/${id}`, body),
  remove: (id: number) =>
    api.delete<{ message: string }>(`/api/routines/${id}`),
  apply: (id: number, body: ApplyBody) =>
    api.post<ApplyResult>(`/api/routines/${id}/apply`, body),
  applyAll: (body: ApplyBody) =>
    api.post<ApplyResult>('/api/routines/apply-all', body),
};
