import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  question: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Medium' | 'Challenging';
  marks: number;
}

export interface ISection {
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IQuestionPaper extends Document {
  assignmentId: mongoose.Types.ObjectId;
  sections: ISection[];
}

const QuestionSchema: Schema = new Schema({
  question: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard', 'Medium', 'Challenging'], required: true },
  marks: { type: Number, required: true },
});

const SectionSchema: Schema = new Schema({
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: { type: [QuestionSchema], required: true }
});

const QuestionPaperSchema: Schema = new Schema({
  assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
  sections: { type: [SectionSchema], required: true }
}, { timestamps: true });

export default mongoose.model<IQuestionPaper>('QuestionPaper', QuestionPaperSchema);
