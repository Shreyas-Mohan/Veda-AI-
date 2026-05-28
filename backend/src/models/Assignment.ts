import mongoose, { Document, Schema, Types } from 'mongoose';

// ------------------------------------------------------------------------
// TypeScript Interfaces
// ------------------------------------------------------------------------

export interface IQuestion {
    text: string;
    difficulty: 'Easy' | 'Moderate' | 'Challenging';
    marks: number;
    type: string;
}

export interface ISection {
    title: string;
    instructions: string;
    questions: IQuestion[];
}

export interface IQuestionPaper extends Document {
    assignmentId: Types.ObjectId;
    sections: ISection[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IAssignment extends Document {
    title: string;
    subject?: string;
    className?: string;
    dueDate: Date;
    totalMarks?: number;
    totalQuestions?: number;
    additionalInstructions?: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}

// ------------------------------------------------------------------------
// Mongoose Schemas
// ------------------------------------------------------------------------

const QuestionSchema = new Schema<IQuestion>({
    text: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Moderate', 'Challenging'], required: true },
    marks: { type: Number, required: true },
    type: { type: String, required: true },
}, { _id: false });

const SectionSchema = new Schema<ISection>({
    title: { type: String, required: true },
    instructions: { type: String, required: false },
    questions: [QuestionSchema],
}, { _id: false });

const QuestionPaperSchema = new Schema<IQuestionPaper>({
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    sections: [SectionSchema],
}, { timestamps: true });

const AssignmentSchema = new Schema<IAssignment>({
    title: { type: String, required: true },
    subject: { type: String, required: false },
    className: { type: String, required: false },
    dueDate: { type: Date, required: true },
    totalMarks: { type: Number, required: false },
    totalQuestions: { type: Number, required: false },
    additionalInstructions: { type: String, required: false },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
}, { timestamps: true });

// ------------------------------------------------------------------------
// Models
// ------------------------------------------------------------------------

export const QuestionPaper = mongoose.model<IQuestionPaper>('QuestionPaper', QuestionPaperSchema);
export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
