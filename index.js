const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors'); // Add cors package
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const url=process.env.url;
// Middleware
app.use(bodyParser.json());
app.use(cors()); // Use cors middleware

// Connect to MongoDB
mongoose.connect('mongodb://0.0.0.0:27017/referralDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// Define Referral Schema
const referralSchema = new mongoose.Schema({
    referrerName: String,
    referrerEmail: String,
    refereeName: String,
    refereeEmail: String,
    createdAt: { type: Date, default: Date.now }
});

const Referral = mongoose.model('Referral', referralSchema);

// API endpoint to save referral data
app.post('/api/referrals', async (req, res) => {
    const { referrerName, referrerEmail, refereeName, refereeEmail } = req.body;

    // Validation
    if (!referrerName || !referrerEmail || !refereeName || !refereeEmail) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const newReferral = new Referral({ referrerName, referrerEmail, refereeName, refereeEmail });
        await newReferral.save();

        // Send email notification
        sendReferralEmail(referrerName, referrerEmail, refereeName, refereeEmail);

        res.status(201).json(newReferral);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// Function to send referral email
const sendReferralEmail = async (referrerName, referrerEmail, refereeName, refereeEmail) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    let mailOptions = {
        from: process.env.GMAIL_USER,
        to: refereeEmail,
        subject: 'Referral from ' + referrerName,
        text: `Hi ${refereeName},\n\n${referrerName} has referred you to our service. Please contact them at ${referrerEmail} for more information.\n\nBest regards,\nYour Company`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Referral email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

app.listen(PORT, () => {
    console.log(`${url}`);
});
