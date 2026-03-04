const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Manual .env loading
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = fs.readFileSync(envPath, 'utf8');
const env = {};
envConfig.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
    }
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: env.GMAIL_USER,
        pass: env.GMAIL_APP_PASSWORD,
    },
});

async function test() {
    console.log("Testing email with user:", env.GMAIL_USER);
    const mailOptions = {
        from: env.EMAIL_FROM,
        to: env.GMAIL_USER, // Send to self for test
        subject: "Test Email from Go-Cycle",
        html: "<h1>Test</h1><p>This is a test email to verify SMTP configuration.</p>",
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.messageId);
    } catch (error) {
        console.error("Email failed:", error.message);
    }
}

test();
