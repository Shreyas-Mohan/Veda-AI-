import { create } from 'zustand';

export interface QuestionConfig {
  id: string;
  type: string;
  count: number;
  marks: number;
}

interface AssignmentState {
  dueDate: string;
  subject: string;
  questionConfigs: QuestionConfig[];
  additionalInfo: string;
  setDueDate: (date: string) => void;
  setSubject: (subject: string) => void;
  addQuestionConfig: () => void;
  removeQuestionConfig: (id: string) => void;
  updateQuestionConfig: (id: string, field: keyof QuestionConfig, value: string | number) => void;
  setAdditionalInfo: (info: string) => void;
  getTotalQuestions: () => number;
  getTotalMarks: () => number;
}

const QUESTION_TYPES = [
  'Multiple Choice Questions',
  'Short Questions',
  'Long Questions',
  'Numerical Problems'
];

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
  dueDate: '',
  subject: 'Science',
  // Start with some default rows to match Figma
  questionConfigs: [
    { id: '1', type: 'Multiple Choice Questions', count: 4, marks: 1 },
    { id: '2', type: 'Short Questions', count: 3, marks: 2 },
  ],
  additionalInfo: '',

  setDueDate: (date) => set({ dueDate: date }),
  setSubject: (subject) => set({ subject }),
  
  addQuestionConfig: () => set((state) => ({
    questionConfigs: [
      ...state.questionConfigs,
      { id: Date.now().toString(), type: QUESTION_TYPES[0], count: 1, marks: 1 }
    ]
  })),

  removeQuestionConfig: (id) => set((state) => ({
    questionConfigs: state.questionConfigs.filter(q => q.id !== id)
  })),

  updateQuestionConfig: (id, field, value) => set((state) => ({
    questionConfigs: state.questionConfigs.map(q => {
      if (q.id === id) {
        // Prevent negative values for counts and marks
        const safeValue = typeof value === 'number' ? Math.max(0, value) : value;
        return { ...q, [field]: safeValue };
      }
      return q;
    })
  })),

  setAdditionalInfo: (info) => set({ additionalInfo: info }),

  getTotalQuestions: () => get().questionConfigs.reduce((total, q) => total + q.count, 0),
  getTotalMarks: () => get().questionConfigs.reduce((total, q) => total + (q.count * q.marks), 0),
}));