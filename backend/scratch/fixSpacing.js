import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const AdminActivitySchema = new mongoose.Schema({
    details: String,
    targetType: String
});

const AdminActivity = mongoose.model('AdminActivity', AdminActivitySchema, 'adminactivities');

async function updateLogs() {
    try {
        const uri = process.env.DB_URL;
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const logs = await AdminActivity.find({ 
            details: { $regex: /Stockmanager/, $options: 'i' }
        });

        console.log(`Found ${logs.length} 'Stockmanager' logs to fix spacing for.`);

        let count = 0;
        for (const log of logs) {
            log.details = log.details.replace(/Stockmanager/gi, 'Stock manager');
            await log.save();
            count++;
        }

        console.log(`Successfully fixed spacing for ${count} log entries.`);
        process.exit(0);
    } catch (err) {
        console.error('Error updating logs:', err);
        process.exit(1);
    }
}

updateLogs();
