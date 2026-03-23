import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { healthRouter } from './routes/health.js';
import { conversationsRouter } from './routes/conversations.js';
import { messagesRouter } from './routes/messages.js';
import { errorHandler } from './middleware/error-handler.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'server', 'uploads')));
app.use('/api/health', healthRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/messages', messagesRouter);
app.use(errorHandler);
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../dist')));
    app.get('*', (_req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
}
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
