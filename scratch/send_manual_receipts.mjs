import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Standalone SMTP transporter using the project's env variables (hardcoded for this scratch fix)
const transporter = nodemailer.createTransport({
    host: 'mail.gocycle.ng',
    port: 587,
    secure: false, // TLS
    auth: {
        user: 'admin@gocycle.ng',
        pass: 'Gocycle@2024' 
    },
});

function buyerReceiptEmail({ name, orderId, total, items = [] }) {
    const yr = new Date().getFullYear();
    const subtotal = total - 2500; // Rough estimate for fee
    
    return {
        subject: `Order Confirmed: ${orderId} – Your Go-Cycle Receipt`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;background:#fff;">
            <div style="background:#0f172a;padding:32px;text-align:center;">
                <h1 style="color:#05DF72;margin:0;font-size:24px;">Go-Cycle</h1>
                <p style="color:#94a3b8;margin:8px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Payment Received</p>
            </div>
            <div style="padding:40px;">
                <h2 style="color:#0f172a;margin-top:0;">Thanks for your purchase, ${name}!</h2>
                <p style="color:#475569;line-height:1.6;">Your battery order has been confirmed. You can now coordinate your pickup directly from your dashboard.</p>
                
                <div style="background:#f8fafc;border-radius:12px;padding:24px;margin:32px 0;">
                    <div style="display:flex;justify-content:between;margin-bottom:12px;border-bottom:1px solid #e5e7eb;padding-bottom:12px;">
                        <span style="color:#64748b;font-weight:bold;text-transform:uppercase;font-size:11px;">Order ID</span>
                        <span style="margin-left:auto;font-weight:bold;color:#0f172a;">#${orderId}</span>
                    </div>
                    
                    ${items.map(item => `
                        <div style="display:flex;justify-content:between;margin-top:12px;">
                            <span style="color:#0f172a;font-weight:bold;">${item.name} x${item.quantity}</span>
                            <span style="margin-left:auto;color:#0f172a;">₦${item.price.toLocaleString()}</span>
                        </div>
                    `).join('')}
                    
                    <div style="margin-top:24px;padding-top:12px;border-top:2px solid #0f172a;display:flex;justify-content:between;">
                        <span style="font-weight:bold;color:#0f172a;font-size:18px;">Total Paid</span>
                        <span style="margin-left:auto;font-weight:900;color:#05DF72;font-size:22px;">₦${total.toLocaleString()}</span>
                    </div>
                </div>

                <div style="text-align:center;">
                    <a href="https://gocycle.ng/buyer" style="background:#05DF72;color:#000;padding:16px 32px;border-radius:12px;text-decoration:none;font-weight:900;display:inline-block;box-shadow:0 10px 15px -3px rgba(5,223,114,0.3);">Go to Dashboard</a>
                </div>
            </div>
            <div style="background:#f8fafc;padding:24px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">© ${yr} Go-Cycle Nigeria. All rights reserved.</p>
            </div>
        </div>`
    };
}

async function main() {
    const userId = 'user_y6noa0ikq';
    const email = 'ademuwagunmayokun@gmail.com';
    
    const orders = await prisma.order.findMany({
        where: { userId, isPaid: true },
        include: { orderItems: { include: { product: true } } }
    });
    
    console.log(`Processing ${orders.length} orders for ${email}...`);
    
    for (const order of orders) {
        const { subject, html } = buyerReceiptEmail({
            name: "Ademuwagun Mayokun",
            orderId: order.id,
            total: order.total,
            items: order.orderItems.map(i => ({ 
                name: i.product?.name || 'Battery', 
                price: i.price, 
                quantity: i.quantity 
            }))
        });
        
        await transporter.sendMail({
            from: '"Go-Cycle Nigeria" <admin@gocycle.ng>',
            to: email,
            subject,
            html
        });
        console.log(`SENT: ${order.id}`);
    }
}

main().finally(() => prisma.$disconnect());
