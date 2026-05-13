const { sendEmail, buyerReceiptEmail } = require('../backend/src/lib/email');

async function testSend() {
    const emailData = buyerReceiptEmail({
        buyerName: 'Ademuwagun Mayokun',
        orderId: 'GCY-P2YQJWP',
        productName: 'Scrap Inverter Batt (Dry cell) (150Ah) - Ikorodu',
        quantity: 1,
        unitPrice: 50000,
        totalAmount: 52500,
        collectionDate: '2026-05-31',
        storeName: "Ademuwagun Mayor's Store"
    });

    console.log('Sending receipt for GCY-P2YQJWP...');
    const res = await sendEmail({
        to: 'ademuwagunmayokun@gmail.com',
        ...emailData
    });

    console.log('Result:', res);
}

testSend().catch(console.error);
