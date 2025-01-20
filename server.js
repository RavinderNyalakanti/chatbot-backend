import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';

const app = express();
const port = 3000;

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI("AIzaSyAkolq55CBSU_pvcia0AFd_uvBCRBKyw8Y");

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());
// POST endpoint to generate content from the AI model
app.post('/generate', async (req, res) => {
    const { prompt, maxOutputTokens = 300, temperature = 0.1 } = req.body;

    if (!prompt) {
        return res.status(400).send({ error: "Prompt is required" });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(prompt, {
            maxOutputTokens: maxOutputTokens,
            temperature: temperature,
        });

        return res.status(200).send({ response: result.response.text() });
    } catch (error) {
        return res.status(500).send({ error: 'Failed to generate content', details: error.message });
    }
});

// GET endpoint to fetch a basic status or model info (can be expanded for more functionality)
app.get('/status', (req, res) => {
    res.status(200).send({ message: 'Generative AI service is running.' });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
