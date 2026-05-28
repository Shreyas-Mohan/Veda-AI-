import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import dns from 'dns';
import { Server } from 'socket.io';
import assessmentRoutes from './routes/assessmentRoutes';

dotenv.config();
// Force Node.js to use Google's DNS to bypass Mobile Hotspot blocks
// dns.setServers(['8.8.8.8', '8.8.4.4']); // REMOVED: This causes MongoDB connection timeouts by breaking SRV resolution on certain networks.

const app = express();
const PORT = process.env.PORT || 5001;

// 1. Create HTTP server AND Socket.io server
const httpServer = http.createServer(app);
export const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allows your Next.js frontend to connect later
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/assignments', assessmentRoutes);

// 2. Import queue AFTER io is exported (prevents circular dependency bugs)
import './queue/assessmentQueue';

// 3. Listen for frontend connections
io.on('connection', (socket) => {
    console.log(`[Socket] Frontend connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`[Socket] Frontend disconnected: ${socket.id}`);
    });
});

// Database Connection
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MONGODB_URI is not defined in the environment variables');
        }
        await mongoose.connect(mongoURI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        console.warn('Server will continue running, but database operations will fail.');
    }
};

// Start server using httpServer, NOT app!
httpServer.listen(PORT, async () => {
    await connectDB();
    console.log(`Server is running on port ${PORT}`);
});