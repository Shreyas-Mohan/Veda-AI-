import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createServer } from 'http';
import Assignment from './models/Assignment';
import QuestionPaper from './models/QuestionPaper';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { RedisMemoryServer } from 'redis-memory-server';

dotenv.config();

let socketIO: Server;
export const getSocketIO = () => socketIO;

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

let mongoServer: any;
let redisServer: any;

(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  redisServer = new RedisMemoryServer();
  const redisHost = await redisServer.getHost();
  const redisPort = await redisServer.getPort();
  process.env.REDIS_URL = `redis://${redisHost}:${redisPort}`;

  await mongoose.connect(mongoUri, { family: 4 });
  console.log('Local memory MongoDB connected');

  const { initQueue } = await import('./queue/index');
  const assignmentQueue = initQueue();

  const httpServer = createServer(app);
  socketIO = new Server(httpServer, { cors: { origin: '*' } });

  // Cleanup on process termination
  const cleanup = async () => {
    console.log('Cleaning up...');
    if (httpServer.listening) httpServer.close();
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
    if (redisServer) await redisServer.stop();
    process.exit(0);
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGUSR2', cleanup); // Catch nodemon restarts

  app.post('/api/assignments', async (req, res) => {
    try {
      const assignment = new Assignment(req.body);
      await assignment.save();
      await assignmentQueue.add('generate', { assignmentId: assignment._id });
      res.status(201).json(assignment);
    } catch (error) {
      res.status(400).json({ error: 'Error creating assignment' });
    }
  });

  app.get('/api/papers/:assignmentId', async (req, res) => {
    try {
      const paper = await QuestionPaper.findOne({ assignmentId: req.params.assignmentId });
      if (!paper) return res.status(404).json({ error: 'Paper not found' });
      res.json(paper);
    } catch (error) {
      res.status(400).json({ error: 'Error fetching paper' });
    }
  });

  socketIO.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
  });

  httpServer.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();
