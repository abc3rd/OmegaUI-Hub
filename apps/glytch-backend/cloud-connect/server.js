// GLYTCH Platform - Complete Backend Server
// File: server.js
// Production-ready Node.js backend with all features

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { Pool } = require('pg');
const redis = require('redis');
const nodemailer = require('nodemailer');
const Stripe = require('stripe');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs').promises;
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const validator = require('email-validator');
const sharp = require('sharp');
const tesseract = require('tesseract.js');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Environment variables
require('dotenv').config();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// Database connections
const db = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/glytch_db'
});

const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// External service configurations
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const emailTransporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// File upload configuration
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = `uploads/${req.user.id}`;
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /\.(csv|txt|xlsx|json|png|jpg|jpeg)$/i;
        if (allowedTypes.test(file.originalname)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Middleware for authentication
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'glytch_secret_key');
        const userResult = await db.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
        
        if (userResult.rows.length === 0) {
            return res.status(403).json({ error: 'Invalid token' });
        }

        req.user = userResult.rows[0];
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid token' });
    }
};

// Database initialization
const initializeDatabase = async () => {
    try {
        // Users table
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                plan_type VARCHAR(50) DEFAULT 'basic',
                stripe_customer_id VARCHAR(255),
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // Chat sessions table
        await db.query(`
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) DEFAULT 'New Chat',
                messages JSONB DEFAULT '[]',
                ai_settings JSONB DEFAULT '{"temperature": 0.7, "maxTokens": 2048}',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // Lead data table
        await db.query(`
            CREATE TABLE IF NOT EXISTS leads (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                contact_data JSONB NOT NULL,
                source VARCHAR(100),
                tags VARCHAR(255)[],
                is_verified BOOLEAN DEFAULT false,
                processed_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // File uploads table
        await db.query(`
            CREATE TABLE IF NOT EXISTS file_uploads (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                filename VARCHAR(255) NOT NULL,
                original_name VARCHAR(255) NOT NULL,
                file_type VARCHAR(50) NOT NULL,
                file_size INTEGER NOT NULL,
                processing_status VARCHAR(50) DEFAULT 'pending',
                processed_data JSONB,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // Usage analytics table
        await db.query(`
            CREATE TABLE IF NOT EXISTS usage_analytics (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                action_type VARCHAR(100) NOT NULL,
                action_data JSONB,
                timestamp TIMESTAMP DEFAULT NOW()
            )
        `);

        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
    }
};

// AI Integration (Mistral API)
const callMistralAPI = async (messages, settings = {}) => {
    try {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
            },
            body: JSON.stringify({
                model: 'mistral-7b-instruct',
                messages: messages,
                temperature: settings.temperature || 0.7,
                max_tokens: settings.maxTokens || 2048,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Mistral API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Mistral API error:', error);
        // Fallback to local response generation
        return generateFallbackResponse(messages[messages.length - 1].content);
    }
};

const generateFallbackResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('lead') || message.includes('find')) {
        return "I can help you find leads! I have access to millions of verified contacts. What type of leads are you looking for? You can search by industry, location, company size, or keywords.";
    } else if (message.includes('price') || message.includes('cost')) {
        return "Our pricing starts at $97/month for the Basic plan, $197/month for Pro, and $297/month for Elite. All plans include a 14-day free trial and setup assistance.";
    } else if (message.includes('export') || message.includes('download')) {
        return "I can help you export data in various formats including CSV, Excel, and JSON. What data would you like to export?";
    } else {
        return `I understand you're asking about "${userMessage}". As your GLYTCH AI assistant, I can help with lead generation, data processing, automation, and platform navigation. How can I assist you today?`;
    }
};

// Email validation service
const validateEmailList = async (emails) => {
    const results = {
        valid: [],
        invalid: [],
        disposable: [],
        risky: []
    };

    for (const email of emails) {
        if (validator.validate(email)) {
            // Basic validation passed
            if (isDisposableEmail(email)) {
                results.disposable.push(email);
            } else if (isRiskyEmail(email)) {
                results.risky.push(email);
            } else {
                results.valid.push(email);
            }
        } else {
            results.invalid.push(email);
        }
    }

    return results;
};

const isDisposableEmail = (email) => {
    const disposableDomains = ['tempmail.org', '10minutemail.com', 'guerrillamail.com'];
    const domain = email.split('@')[1];
    return disposableDomains.some(d => domain.includes(d));
};

const isRiskyEmail = (email) => {
    const riskyPatterns = [/^[a-z]+\d+@/, /test|demo|example/i];
    return riskyPatterns.some(pattern => pattern.test(email));
};

// OCR Processing
const processOCRImage = async (imagePath) => {
    try {
        const { data: { text } } = await tesseract.recognize(imagePath, 'eng', {
            logger: m => console.log(m)
        });

        // Extract contact information from OCR text
        const contacts = extractContactsFromText(text);
        return { text, contacts };
    } catch (error) {
        console.error('OCR processing error:', error);
        throw error;
    }
};

const extractContactsFromText = (text) => {
    const contacts = [];
    const lines = text.split('\n');

    for (const line of lines) {
        const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        const phoneMatch = line.match(/(\+\d{1,2}\s?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
        const nameMatch = line.match(/([A-Z][a-z]+\s[A-Z][a-z]+)/);

        if (emailMatch || phoneMatch || nameMatch) {
            contacts.push({
                name: nameMatch ? nameMatch[0] : '',
                email: emailMatch ? emailMatch[0] : '',
                phone: phoneMatch ? phoneMatch[0] : '',
                source: 'OCR',
                raw_text: line.trim()
            });
        }
    }

    return contacts;
};

// Contact parsing from clipboard text
const parseContactsFromText = (text) => {
    const contacts = [];
    const lines = text.split('\n');

    for (const line of lines) {
        const contact = {
            name: '',
            email: '',
            phone: '',
            company: '',
            website: '',
            source: 'clipboard'
        };

        // Extract email
        const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) contact.email = emailMatch[0];

        // Extract phone
        const phoneMatch = line.match(/(\+\d{1,2}\s?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
        if (phoneMatch) contact.phone = phoneMatch[0];

        // Extract name (two capitalized words)
        const nameMatch = line.match(/([A-Z][a-z]+\s[A-Z][a-z]+)/);
        if (nameMatch) contact.name = nameMatch[0];

        // Extract website
        const websiteMatch = line.match(/https?:\/\/[\w.-]+\.[a-z]{2,}(\/[\w.-]*)*/);
        if (websiteMatch) contact.website = websiteMatch[0];

        // Extract company (look for "Company:" pattern)
        const companyMatch = line.match(/Company\s*:\s*(.+)/i);
        if (companyMatch) contact.company = companyMatch[1];

        // Only add if we found at least email or phone
        if (contact.email || contact.phone) {
            contacts.push(contact);
        }
    }

    return contacts;
};

// ===== API ROUTES =====

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        // Check if user already exists
        const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user
        const result = await db.query(
            'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, plan_type',
            [email, passwordHash, fullName]
        );

        const user = result.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'glytch_secret_key',
            { expiresIn: '7d' }
        );

        // Create default chat session
        await db.query(
            'INSERT INTO chat_sessions (user_id, title) VALUES ($1, $2)',
            [user.id, 'Welcome Chat']
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                planType: user.plan_type
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'glytch_secret_key',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                planType: user.plan_type
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Chat routes
app.get('/api/chat/sessions', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, title, created_at, updated_at FROM chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC',
            [req.user.id]
        );

        res.json({ sessions: result.rows });
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/chat/sessions', authenticateToken, async (req, res) => {
    try {
        const { title = 'New Chat' } = req.body;

        const result = await db.query(
            'INSERT INTO chat_sessions (user_id, title) VALUES ($1, $2) RETURNING *',
            [req.user.id, title]
        );

        res.status(201).json({ session: result.rows[0] });
    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/chat/message', authenticateToken, async (req, res) => {
    try {
        const { sessionId, message, aiSettings = {} } = req.body;

        // Get current session
        const sessionResult = await db.query(
            'SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2',
            [sessionId, req.user.id]
        );

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const session = sessionResult.rows[0];
        const messages = session.messages || [];

        // Add user message
        const userMessage = {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        };
        messages.push(userMessage);

        // Prepare messages for AI API
        const aiMessages = [
            {
                role: 'system',
                content: 'You are GLYTCH AI, a helpful assistant specializing in lead generation, website analysis, business automation, and data processing. Provide detailed, actionable responses.'
            },
            ...messages.slice(-10) // Keep last 10 messages for context
        ];

        // Get AI response
        const aiResponse = await callMistralAPI(aiMessages, aiSettings);

        // Add AI message
        const aiMessage = {
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date().toISOString()
        };
        messages.push(aiMessage);

        // Update session
        await db.query(
            'UPDATE chat_sessions SET messages = $1, ai_settings = $2, updated_at = NOW() WHERE id = $3',
            [JSON.stringify(messages), JSON.stringify(aiSettings), sessionId]
        );

        // Log usage
        await db.query(
            'INSERT INTO usage_analytics (user_id, action_type, action_data) VALUES ($1, $2, $3)',
            [req.user.id, 'ai_chat', { sessionId, messageLength: message.length }]
        );

        res.json({ message: aiMessage });
    } catch (error) {
        console.error('Chat message error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Lead processing routes
app.post('/api/leads/parse-text', authenticateToken, async (req, res) => {
    try {
        const { text } = req.body;
        const contacts = parseContactsFromText(text);

        // Save contacts to database
        for (const contact of contacts) {
            await db.query(
                'INSERT INTO leads (user_id, contact_data, source) VALUES ($1, $2, $3)',
                [req.user.id, JSON.stringify(contact), contact.source]
            );
        }

        res.json({
            success: true,
            contactsFound: contacts.length,
            contacts
        });
    } catch (error) {
        console.error('Parse text error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/leads/export', authenticateToken, async (req, res) => {
    try {
        const { format = 'csv', filters = {} } = req.body;

        // Get user's leads
        let query = 'SELECT contact_data, source, processed_at FROM leads WHERE user_id = $1';
        const params = [req.user.id];

        if (filters.source) {
            query += ' AND source = $2';
            params.push(filters.source);
        }

        const result = await db.query(query, params);
        const leads = result.rows.map(row => ({
            ...row.contact_data,
            source: row.source,
            processed_at: row.processed_at
        }));

        if (format === 'csv') {
            // Generate CSV
            const filename = `leads-export-${Date.now()}.csv`;
            const filepath = path.join(__dirname, 'temp', filename);

            await fs.mkdir(path.dirname(filepath), { recursive: true });

            const csvWriter = createCsvWriter({
                path: filepath,
                header: [
                    { id: 'name', title: 'Name' },
                    { id: 'email', title: 'Email' },
                    { id: 'phone', title: 'Phone' },
                    { id: 'company', title: 'Company' },
                    { id: 'website', title: 'Website' },
                    { id: 'source', title: 'Source' },
                    { id: 'processed_at', title: 'Date Added' }
                ]
            });

            await csvWriter.writeRecords(leads);

            res.download(filepath, filename, (err) => {
                if (err) {
                    console.error('Download error:', err);
                }
                // Clean up temp file
                fs.unlink(filepath).catch(console.error);
            });
        } else {
            res.json({ leads });
        }
    } catch (error) {
        console.error('Export leads error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// File processing routes
app.post('/api/files/upload', authenticateToken, upload.array('files', 10), async (req, res) => {
    try {
        const uploadedFiles = [];

        for (const file of req.files) {
            // Save file info to database
            const result = await db.query(
                `INSERT INTO file_uploads (user_id, filename, original_name, file_type, file_size) 
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [req.user.id, file.filename, file.originalname, file.mimetype, file.size]
            );

            uploadedFiles.push(result.rows[0]);

            // Process file asynchronously
            processFileAsync(file, result.rows[0].id, req.user.id);
        }

        res.json({
            success: true,
            files: uploadedFiles
        });
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/files/validate-emails', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Read and parse CSV file
        const emails = [];
        const filePath = file.path;

        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (row) => {
                    // Extract email from any column
                    Object.values(row).forEach(value => {
                        if (validator.validate(value)) {
                            emails.push(value);
                        }
                    });
                })
                .on('end', async () => {
                    try {
                        // Validate emails
                        const validationResults = await validateEmailList(emails);

                        // Generate results CSV
                        const resultsFilename = `email-validation-${Date.now()}.csv`;
                        const resultsPath = path.join(__dirname, 'temp', resultsFilename);

                        await fs.mkdir(path.dirname(resultsPath), { recursive: true });

                        const allResults = [
                            ...validationResults.valid.map(email => ({ email, status: 'valid' })),
                            ...validationResults.invalid.map(email => ({ email, status: 'invalid' })),
                            ...validationResults.disposable.map(email => ({ email, status: 'disposable' })),
                            ...validationResults.risky.map(email => ({ email, status: 'risky' }))
                        ];

                        const csvWriter = createCsvWriter({
                            path: resultsPath,
                            header: [
                                { id: 'email', title: 'Email' },
                                { id: 'status', title: 'Status' }
                            ]
                        });

                        await csvWriter.writeRecords(allResults);

                        // Clean up uploaded file
                        await fs.unlink(filePath);

                        res.json({
                            success: true,
                            results: validationResults,
                            downloadUrl: `/api/files/download/${resultsFilename}`,
                            summary: {
                                total: emails.length,
                                valid: validationResults.valid.length,
                                invalid: validationResults.invalid.length,
                                disposable: validationResults.disposable.length,
                                risky: validationResults.risky.length
                            }
                        });

                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                })
                .on('error', reject);
        });
    } catch (error) {
        console.error('Email validation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/files/ocr-process', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        // Process OCR
        const ocrResults = await processOCRImage(file.path);

        // Save extracted contacts
        for (const contact of ocrResults.contacts) {
            await db.query(
                'INSERT INTO leads (user_id, contact_data, source) VALUES ($1, $2, $3)',
                [req.user.id, JSON.stringify(contact), 'OCR']
            );
        }

        // Clean up uploaded file
        await fs.unlink(file.path);

        res.json({
            success: true,
            extractedText: ocrResults.text,
            contactsFound: ocrResults.contacts.length,
            contacts: ocrResults.contacts
        });
    } catch (error) {
        console.error('OCR processing error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// File download route
app.get('/api/files/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'temp', filename);
    
    res.download(filepath, (err) => {
        if (err) {
            res.status(404).json({ error: 'File not found' });
        } else {
            // Clean up file after download
            setTimeout(() => {
                fs.unlink(filepath).catch(console.error);
            }, 5000);
        }
    });
});

// Analytics and dashboard routes
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
    try {
        // Get user stats
        const leadsResult = await db.query(
            'SELECT COUNT(*) as total_leads FROM leads WHERE user_id = $1',
            [req.user.id]
        );

        const sessionsResult = await db.query(
            'SELECT COUNT(*) as total_sessions FROM chat_sessions WHERE user_id = $1',
            [req.user.id]
        );

        const filesResult = await db.query(
            'SELECT COUNT(*) as total_files FROM file_uploads WHERE user_id = $1',
            [req.user.id]
        );

        const activityResult = await db.query(
            `SELECT action_type, COUNT(*) as count 
             FROM usage_analytics 
             WHERE user_id = $1 AND timestamp > NOW() - INTERVAL '30 days'
             GROUP BY action_type`,
            [req.user.id]
        );

        res.json({
            stats: {
                totalLeads: parseInt(leadsResult.rows[0].total_leads),
                totalSessions: parseInt(sessionsResult.rows[0].total_sessions),
                totalFiles: parseInt(filesResult.rows[0].total_files),
                planType: req.user.plan_type
            },
            activity: activityResult.rows
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Async file processing function
const processFileAsync = async (file, fileId, userId) => {
    try {
        let processedData = {};

        if (file.mimetype === 'text/csv') {
            // Process CSV file
            const emails = [];
            
            fs.createReadStream(file.path)
                .pipe(csv())
                .on('data', (row) => {
                    Object.values(row).forEach(value => {
                        if (validator.validate(value)) {
                            emails.push(value);
                        }
                    });
                })
                .on('end', async () => {
                    processedData = { emailsFound: emails.length, emails: emails.slice(0, 10) };
                    
                    await db.query(
                        'UPDATE file_uploads SET processing_status = $1, processed_data = $2 WHERE id = $3',
                        ['completed', JSON.stringify(processedData), fileId]
                    );
                });
        } else if (file.mimetype.startsWith('image/')) {
            // Process image with OCR
            const ocrResults = await processOCRImage(file.path);
            processedData = ocrResults;

            await db.query(
                'UPDATE file_uploads SET processing_status = $1, processed_data = $2 WHERE id = $3',
                ['completed', JSON.stringify(processedData), fileId]
            );
        }
    } catch (error) {
        console.error('File processing error:', error);
        await db.query(
            'UPDATE file_uploads SET processing_status