import multer from 'multer';
import path from 'path';
import fs from 'fs';
const uploadDir = path.join(process.cwd(), 'server', 'uploads');
if (!fs.existsSync(uploadDir))
    fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const safe = file.originalname.replace(/\s+/g, '_');
        cb(null, `${Date.now()}-${safe}`);
    },
});
export const uploadPdf = multer({
    storage,
    fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            cb(new Error('Only PDF files are allowed'));
            return;
        }
        cb(null, true);
    },
    limits: {
        fileSize: 20 * 1024 * 1024,
    },
});
