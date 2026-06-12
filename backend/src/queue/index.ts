import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import Assignment from '../models/Assignment';
import QuestionPaper from '../models/QuestionPaper';
import { generateQuestionPaper } from '../services/gemini';
import { getSocketIO } from '../index';

dotenv.config();

export const initQueue = () => {
  const connection = new IORedis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
    family: 4
  });

  const assignmentQueue = new Queue('assignment-queue', { connection: connection as any });

  const assignmentWorker = new Worker('assignment-queue', async job => {
    const { assignmentId } = job.data;
    
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new Error('Assignment not found');
    
    assignment.status = 'processing';
    await assignment.save();
    
    const io = getSocketIO();
    io.emit('status-update', { assignmentId, status: 'processing' });
    
    try {
      const prompt = `
        Due Date: ${assignment.dueDate}
        Question Types: ${assignment.questionTypes.join(', ')}
        Total Questions: ${assignment.totalQuestions}
        Total Marks: ${assignment.totalMarks}
        Instructions: ${assignment.instructions}
        Context/Text: ${assignment.pdfText || 'None'}
      `;
      
      const sections = await generateQuestionPaper(prompt);
      
      const questionPaper = new QuestionPaper({
        assignmentId: assignment._id,
        sections
      });
      
      await questionPaper.save();
      
      assignment.status = 'completed';
      await assignment.save();
      
      io.emit('status-update', { assignmentId, status: 'completed', paperId: questionPaper._id });
    } catch (error) {
      console.error('Job error:', error);
      assignment.status = 'failed';
      await assignment.save();
      io.emit('status-update', { assignmentId, status: 'failed' });
      throw error;
    }
  }, { connection: connection as any });

  return assignmentQueue;
};
