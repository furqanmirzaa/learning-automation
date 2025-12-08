// src/index.ts
// Load environment variables FIRST before anything else
import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import express, { Request, Response } from 'express';
import Imap from 'node-imap';
import { simpleParser } from 'mailparser';
import emailListernerRouter from './routes/emailListerner.route'

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// ---------------------------------------------
// Send Email To Discord
// ---------------------------------------------


// ------------------------------------------------------
// EMAIL LISTENER
// ------------------------------------------------------


app.get('/health', (req, res) => {
    res.send('Hello from TypeScript Express!');
});

// Mount email listener routes
app.use('/api', emailListernerRouter)



app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});