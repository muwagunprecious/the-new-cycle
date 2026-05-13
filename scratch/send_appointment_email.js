require('dotenv').config();

async function run() {
    // ESM requires dynamic import in CJS scripts
    const emailLib = await import('../backend-actions/lib/email.js');
    const { sendEmail, appointmentEmail } = emailLib;

    console.log('Preparing official appointment email...');
    
    const emailData = appointmentEmail({
        name: 'Ademuwagun Mayokun',
        role: 'Technical Lead',
        department: 'Technical Department',
        effectiveDate: new Date().toLocaleDateString('en-NG', { dateStyle: 'long' })
    });

    console.log('Sending appointment email to ademuwagunmayokun@gmail.com...');
    
    const res = await sendEmail({
        to: 'ademuwagunmayokun@gmail.com',
        ...emailData
    });

    console.log('Result:', res);
}

run().catch(console.error);
