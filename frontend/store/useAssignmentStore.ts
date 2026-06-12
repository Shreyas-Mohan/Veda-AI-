import { create } from 'zustand';

interface AssignmentState {
  currentAssignmentId: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed' | null;
  setAssignmentId: (id: string) => void;
  setStatus: (status: 'pending' | 'processing' | 'completed' | 'failed' | null) => void;
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
  currentAssignmentId: null,
  status: null,
  setAssignmentId: (id) => set({ currentAssignmentId: id }),
  setStatus: (status) => set({ status: status }),
}));
