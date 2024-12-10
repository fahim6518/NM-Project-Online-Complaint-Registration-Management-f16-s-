import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { Complaint } from './models/complaint';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost/complaint_system', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.log('MongoDB connection error: ', err);
    });

// Complaint Model
const complaintSchema = new mongoose.Schema({
    userId: String,
    complaintText: String,
    status: {
        type: String,
        default: 'Pending',
    },
});

const Complaint = mongoose.model('Complaint', complaintSchema);

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to the Complaint Management System!');
});

// Route to create a new complaint
app.post('/complaints', async (req: Request, res: Response) => {
    const { userId, complaintText } = req.body;

    if (!userId || !complaintText) {
        return res.status(400).send('Missing userId or complaintText');
    }

    try {
        const newComplaint = new Complaint({ userId, complaintText });
        await newComplaint.save();
        res.status(201).json(newComplaint);
    } catch (err) {
        res.status(500).send('Error creating complaint');
    }
});

// Route to get all complaints
app.get('/complaints', async (req: Request, res: Response) => {
    try {
        const complaints = await Complaint.find();
        res.json(complaints);
    } catch (err) {
        res.status(500).send('Error fetching complaints');
    }
});

// Route to update complaint status
app.patch('/complaints/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const updatedComplaint = await Complaint.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        if (!updatedComplaint) {
            return res.status(404).send('Complaint not found');
        }
        res.json(updatedComplaint);
    } catch (err) {
        res.status(500).send('Error updating complaint');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
