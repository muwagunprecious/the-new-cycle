require('dotenv').config();

async function run() {
    // ESM requires dynamic import in CJS scripts
    const emailLib = await import('../backend-actions/lib/email.js');
    const { sendEmail, buyerReceiptEmail } = emailLib;

    const orders = [
        {
            id: 'GCY-P2YQJWP',
            total: 52500,
            buyerName: 'Ademuwagun Mayokun',
            items: [{ name: 'Scrap Inverter Batt (Dry cell) (150Ah) - Ikorodu', quantity: 1, price: 50000 }],
            collectionDate: '2026-05-31',
            storeName: "Ademuwagun Mayor's Store"
        },
        {
            id: 'GCY-AY2XCZ6',
            total: 52500,
            buyerName: 'Ademuwagun Mayokun',
            items: [{ name: 'Scrap Inverter Batt (Dry cell) (150Ah) - Alimosho', quantity: 1, price: 50000 }],
            collectionDate: '2026-05-12',
            storeName: "Ademuwagun Mayor's Store"
        },
        {
            id: 'GCY-5LN7ARB',
            total: 52500,
            buyerName: 'Ademuwagun Mayokun',
            items: [{ name: 'Scrap Inverter Batt (Dry cell) (150Ah) - Agege', quantity: 1, price: 50000 }],
            collectionDate: '2026-05-12',
            storeName: "Ademuwagun Mayor's Store"
        }
    ];

    for (const order of orders) {
        console.log(`Sending receipt for ${order.id}...`);
        const emailContent = buyerReceiptEmail(order);
        const res = await sendEmail({
            to: 'ademuwagunmayokun@gmail.com',
            ...emailContent
        });
        console.log(`Result for ${order.id}:`, res);
    }
}

run().catch(console.error);
