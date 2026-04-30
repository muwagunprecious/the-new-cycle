const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'mail.gocycle.africa',
    port: 465,
    secure: true, // SSL
    auth: {
        user: 'admin@gocycle.africa',
        pass: 'gocycle1234',
    },
});

async function sendTestEmail() {
    try {
        console.log('Connecting to mail.gocycle.africa:465...');
        const info = await transporter.sendMail({
            from: '"Go-Cycle Admin" <admin@gocycle.africa>',
            to: 'professorprecious03@gmail.com',
            subject: '✅ Go-Cycle Email Test — Server Connection Verified',
            html: `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                <div style="background:#0f172a;padding:28px;text-align:center;">
                    <h1 style="color:#05DF72;margin:0 0 4px;font-size:24px;letter-spacing:-0.5px;">Go-Cycle</h1>
                    <p style="color:#94a3b8;margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Email System Test</p>
                </div>
                <div style="padding:28px;text-align:center;">
                    <div style="width:64px;height:64px;background:#f0fdf4;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin:0 auto 20px;border:2px solid #bbf7d0;">
                        <span style="font-size:28px;">✅</span>
                    </div>
                    <h2 style="color:#0f172a;margin-top:0;">Email Server Connected!</h2>
                    <p style="color:#475569;">This is a test email sent from <strong>admin@gocycle.africa</strong> via the custom SMTP server.</p>
                    <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:24px 0;text-align:left;font-size:13px;color:#475569;">
                        <p style="margin:4px 0;"><strong>Host:</strong> mail.gocycle.africa</p>
                        <p style="margin:4px 0;"><strong>Port:</strong> 465 (SSL)</p>
                        <p style="margin:4px 0;"><strong>From:</strong> admin@gocycle.africa</p>
                        <p style="margin:4px 0;"><strong>Time:</strong> ${new Date().toLocaleString('en-NG', { dateStyle: 'full', timeStyle: 'long' })}</p>
                    </div>
                    <p style="color:#15803d;font-weight:bold;font-size:14px;">🚀 Your Go-Cycle email infrastructure is fully operational.</p>
                </div>
                <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                    <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} Go-Cycle Nigeria. All rights reserved.</p>
                </div>
            </div>`,
        });

        console.log('✅ Email sent successfully!');
        console.log('   Message ID:', info.messageId);
        console.log('   Response:', info.response);
    } catch (error) {
        console.error('❌ Failed to send email:');
        console.error('   Error:', error.message);
        if (error.code) console.error('   Code:', error.code);
    }
}

sendTestEmail();
