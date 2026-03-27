import { api } from './client';
import type {
  Routine,
  Category,
  CreateRoutineBody,
  ApplyBody,
  ApplyResult,
} from '../types';

// Paths are relative to VITE_ROUTINE_ORIGIN (BASE_URL).
// Do NOT include the /api prefix here; it is part of VITE_ROUTINE_ORIGIN.
export const routineApi = {
  list: () => api.get<Routine[]>('/routines'),
  categories: () => api.get<Category[]>('/categories'),
  create: (body: CreateRoutineBody) =>
    api.post<{ id: number }>('/routines', body),
  update: (id: number, body: CreateRoutineBody) =>
    api.put<{ id: number }>(`/routines/${id}`, body),
  remove: (id: number) =>
    api.delete<{ message: string }>(`/routines/${id}`),
  apply: (id: number, body: ApplyBody) =>
    api.post<ApplyResult>(`/routines/${id}/apply`, body),
  applyAll: (body: ApplyBody) =>
    api.post<ApplyResult>('/routines/apply-all', body),
};
