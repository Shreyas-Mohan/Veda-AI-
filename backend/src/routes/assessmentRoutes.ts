
import mongoose from 'mongoose';
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import { assessmentQueue } from '../queue/assessmentQueue';
import { Assignment, QuestionPaper } from '../models/Assignment';
import { generateQuestionPaper } from '../services/aiService';
import { io } from '../server';
import redisConnection from '../config/redis';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'text/plain'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
            return;
        }

        cb(new Error('Only PDF, PNG, JPEG, WEBP, and TXT files are supported.'));
    }
});

// Mock persistence for Hackathon demo (if DB fails)
const memoryAssignments: any[] = [];
const memoryPapers: any[] = [];

const parseQuestions = (questions: any) => {
    if (Array.isArray(questions)) return questions;
    if (typeof questions !== 'string') return [];

    try {
        return JSON.parse(questions);
    } catch {
        return [];
    }
};

const buildReferenceFile = async (file?: Express.Multer.File) => {
    if (!file) return undefined;

    const referenceFile: any = {
        name: file.originalname,
        mimeType: file.mimetype
    };

    if (file.mimetype === 'application/pdf') {
        const parser = new PDFParse({ data: file.buffer });
        try {
            const parsed = await parser.getText();
            referenceFile.content = parsed.text.slice(0, 45000);
            referenceFile.images = [];

            if (parsed.text.trim().length < 200) {
                try {
                    const screenshots = await parser.getScreenshot({
                        first: 3,
                        desiredWidth: 1400,
                        imageDataUrl: true,
                        imageBuffer: false
                    });

                    referenceFile.images = screenshots.pages
                        .map((page) => {
                            const match = page.dataUrl.match(/^data:(.+);base64,(.+)$/);
                            if (!match) return null;
                            return {
                                label: `PDF page ${page.pageNumber}`,
                                mimeType: match[1],
                                data: match[2]
                            };
                        })
                        .filter(Boolean);
                } catch (screenshotError: any) {
                    console.warn('Could not render PDF pages for vision context:', screenshotError.message);
                }
            }
        } finally {
            await parser.destroy();
        }
        referenceFile.kind = 'pdf';
        return referenceFile;
    }

    if (file.mimetype.startsWith('image/')) {
        referenceFile.kind = 'image';
        referenceFile.data = file.buffer.toString('base64');
        return referenceFile;
    }

    if (file.mimetype === 'text/plain') {
        referenceFile.kind = 'text';
        referenceFile.content = file.buffer.toString('utf-8').slice(0, 45000);
    }

    return referenceFile;
};

const buildFormData = async (body: any, file?: Express.Multer.File) => {
    const questions = parseQuestions(body.questions);
    const totalQuestions = Number(body.totalQuestions || questions.reduce((total: number, q: any) => total + Number(q.count || 0), 0));
    const totalMarks = Number(body.totalMarks || questions.reduce((total: number, q: any) => total + (Number(q.count || 0) * Number(q.marks || 0)), 0));

    return {
        ...body,
        questions,
        totalMarks,
        totalQuestions,
        referenceFile: await buildReferenceFile(file)
    };
};

// Fallback logic for when Redis is unavailable (Hackathon Resilience)
const processDirectly = async (assignmentId: string, formData: any) => {
    try {
        console.log(`[Fallback] Processing assignment ${assignmentId} directly without Redis`);
        const jsonStr = await generateQuestionPaper(formData);
        const parsedData = JSON.parse(jsonStr);
        
        const paperData = {
            assignmentId,
            ...parsedData,
            _id: new mongoose.Types.ObjectId()
        };

        if (mongoose.connection.readyState === 1) {
            const newQuestionPaper = new QuestionPaper(paperData);
            await newQuestionPaper.save();
            await Assignment.findByIdAndUpdate(assignmentId, { status: 'completed' });
        } else {
            // Update memory store
            const index = memoryAssignments.findIndex(a => a._id.toString() === assignmentId);
            if (index !== -1) memoryAssignments[index].status = 'completed';
            memoryPapers.push(paperData);
        }
        
        // Notify frontend via Socket.io
        io.emit('assignment-status', { 
            assignmentId, 
            status: 'completed' 
        });
        
        console.log(`[Fallback] Successfully processed assignment ${assignmentId}`);
    } catch (error: any) {
        console.error(`[Fallback] Failed to process ${assignmentId}:`, error.message);
        if (mongoose.connection.readyState === 1) {
            await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });
        }
        
        io.emit('assignment-status', { 
            assignmentId, 
            status: 'failed' 
        });
    }
};

router.post('/', upload.single('referenceFile'), async (req: Request, res: Response) => {
    try {
        const formData = await buildFormData(req.body, req.file);
        
        // 1. Create a new Assignment mapping ALL the fields
        const assignmentData = {
            _id: new mongoose.Types.ObjectId(),
            title: formData.title || 'Untitled Assessment',
            subject: formData.subject || 'General Knowledge',
            className: formData.className || '5th',
            timeAllowed: formData.timeAllowed || '45 Minutes',
            dueDate: formData.dueDate,
            totalMarks: formData.totalMarks,
            totalQuestions: formData.totalQuestions,
            additionalInstructions: formData.additionalInstructions,
            status: 'pending',
            createdAt: new Date()
        };

        // Try to save to MongoDB, else use memory
        if (mongoose.connection.readyState === 1) {
            const assignment = new Assignment(assignmentData);
            await assignment.save();
            console.log('Saved to MongoDB');
        } else {
            console.warn('MongoDB NOT connected. Using In-Memory fallback for demo.');
            memoryAssignments.push(assignmentData);
        }
        
        // 2. Try to dispatch to BullMQ (preferred)
        try {
            if (mongoose.connection.readyState !== 1) {
                throw new Error('MongoDB is not connected, bypassing Redis queue for in-memory fallback');
            }
            if (!redisConnection || redisConnection.status !== 'ready') {
                throw new Error('Redis connection is not ready');
            }
            await assessmentQueue.add('generate-assessment-job', {
                assignmentId: assignmentData._id,
                formData
            });
            console.log('Assessment queued in Redis.');
        } catch (queueError: any) {
            console.warn('Redis queue failed, falling back to direct processing:', queueError.message);
            // Non-blocking direct processing
            processDirectly(assignmentData._id.toString(), formData);
        }
        
        // 3. Immediately return status 202 (Accepted)
        res.status(202).json({
            message: 'Assessment generation has been started.',
            assignmentId: assignmentData._id
        });
        
    } catch (error: any) {
        console.error('Error in assessment creation:', error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            details: error.message 
        });
    }
});

// Fetch assignments created by the user
router.get('/', async (_req: Request, res: Response) => {
    try {
        let assignments;

        if (mongoose.connection.readyState === 1) {
            assignments = await Assignment.find()
                .sort({ createdAt: -1 })
                .lean();
        } else {
            assignments = [...memoryAssignments].sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
        }

        res.status(200).json(assignments);
    } catch (error: any) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Fetch a specific assignment by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        let assignment;
        let questionPapers;

        if (mongoose.connection.readyState === 1) {
            assignment = await Assignment.findById(id).lean();
            questionPapers = await QuestionPaper.find({ assignmentId: id }).lean();
        } else {
            assignment = memoryAssignments.find(a => a._id.toString() === id);
            questionPapers = memoryPapers.filter(p => p.assignmentId === id);
        }

        if (!assignment) {
             res.status(404).json({ error: 'Assignment not found' });
             return;
        }

        res.status(200).json({
            ...assignment,
            questionPapers
        });
        
    } catch (error: any) {
        console.error('Error fetching assignment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete an assignment and its associated question papers
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (mongoose.connection.readyState === 1) {
            let assignment = null;
            if (mongoose.Types.ObjectId.isValid(id)) {
                assignment = await Assignment.findByIdAndDelete(id);
                if (assignment) {
                    await QuestionPaper.deleteMany({ assignmentId: id });
                }
            }
            
            if (!assignment) {
                // Try memory fallback just in case
                const assignmentIndex = memoryAssignments.findIndex(a => a._id.toString() === id);
                if (assignmentIndex !== -1) {
                    memoryAssignments.splice(assignmentIndex, 1);
                    const papersToKeep = memoryPapers.filter(p => p.assignmentId !== id);
                    memoryPapers.length = 0;
                    memoryPapers.push(...papersToKeep);
                } else {
                    res.status(404).json({ error: 'Assignment not found' });
                    return;
                }
            }
        } else {
            const assignmentIndex = memoryAssignments.findIndex(a => a._id.toString() === id);
            if (assignmentIndex === -1) {
                res.status(404).json({ error: 'Assignment not found' });
                return;
            }
            memoryAssignments.splice(assignmentIndex, 1);
            // Clean memory papers
            const papersToKeep = memoryPapers.filter(p => p.assignmentId !== id);
            memoryPapers.length = 0;
            memoryPapers.push(...papersToKeep);
        }

        res.status(200).json({ message: 'Assignment deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting assignment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
