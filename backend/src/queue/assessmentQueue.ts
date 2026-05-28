import { Queue, Worker, Job } from 'bullmq';
import redisConnection from '../config/redis';
import { generateQuestionPaper } from '../services/aiService';
import { Assignment, QuestionPaper } from '../models/Assignment';
import { io } from '../server';

// Initialize the Queue
export const assessmentQueue = new Queue('assessment-queue', {
  connection: redisConnection as any
});

// Initialize the Worker
const assessmentWorker = new Worker(
  'assessment-queue',
  async (job: Job) => {
    const { assignmentId, formData } = job.data;
    
    try {
      console.log(`[Worker] Started processing assignment ${assignmentId}`);
      
      // 1. Generate Question Paper using our mock AI Service
      const jsonStr = await generateQuestionPaper(formData);
      
      // 2. Parse the output JSON
      const parsedData = JSON.parse(jsonStr);
      
      // 3. Save QuestionPaper document linked to Assignment ID
      const newQuestionPaper = new QuestionPaper({
        assignmentId,
        ...parsedData
      });
      await newQuestionPaper.save();
      
      // 4. Update existing Assignment status to 'completed'
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'completed' });
      
      console.log(`[Worker] Completed assignment ${assignmentId}`);
      io.emit('generation_complete', { assignmentId: assignmentId });
      
    } catch (error) {
      console.error(`[Worker] Failed assignment ${assignmentId}:`, error);
      // Ensure the assignment status is updated to failed
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });
      throw error;
    }
  },
  { 
    connection: redisConnection as any
  }
);

assessmentWorker.on('failed', (job, err) => {
    console.error(`[BullMQ] Job ${job?.id} failed with error: ${err.message}`);
});
