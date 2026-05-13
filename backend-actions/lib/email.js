import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.gocycle.africa',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // Use false for 587 (STARTTLS)
    auth: {
        user: process.env.SMTP_USER || 'admin@gocycle.africa',
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
})

import worker from './worker.js'

/**
 * Internal synchronous sender for the worker
 */
async function _sendEmailInternal({ to, subject, html, text }) {
    console.log(`[Email] Attempting to send to ${to}... Subject: ${subject}`);
    const mailOptions = {
        from: process.env.EMAIL_FROM || 'admin@gocycle.africa',
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ''),
    }

    try {
        const info = await transporter.sendMail(mailOptions)
        console.log(`[Email] SUCCESS: Sent to ${to} — MessageId: ${info.messageId}`)
        return { success: true, messageId: info.messageId }
    } catch (error) {
        console.error(`[Email] FAILED to send to ${to}:`, error.message)
        return { success: false, error: error.message }
    }
}

/**
 * Send a transactional email (Non-blocking by default)
 */
export async function sendEmail(options) {
    // Return immediately and let the worker handle it
    worker.enqueue(`EMAIL_TO_${options.to}`, () => _sendEmailInternal(options));
    return { success: true, status: 'enqueued' };
}

// ─── Email Templates ───────────────────────────────────────────────────────────

export function orderConfirmationEmail({ buyerName, orderId, productName, amount, collectionDate, sellerName, sellerPhone, sellerAddress }) {
    return {
        subject: `Order Confirmed – #${orderId}`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:#0f172a;padding:24px;text-align:center;">
                <h1 style="color:#05DF72;margin:0;font-size:22px;">Go-Cycle</h1>
                <p style="color:#94a3b8;margin:4px 0 0;font-size:12px;">Battery Recycling Marketplace</p>
            </div>
            <div style="padding:28px;">
                <h2 style="color:#0f172a;margin-top:0;">Hi ${buyerName},</h2>
                <p style="color:#475569;">Your order has been placed successfully!</p>
                
                <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #bbf7d0;border-radius:12px;padding:24px;margin:20px 0;text-align:center;">
                    <p style="margin:0;font-size:14px;color:#15803d;font-weight:bold;">Safe Pickup Instructions</p>
                    <p style="margin:8px 0 0;font-size:13px;color:#1e293b;line-height:1.5;">When you arrive at the pickup location, <strong>ask the seller for the verification code</strong>. You will need to enter this code in your dashboard to confirm receipt of your battery.</p>
                </div>

                <div style="background:#f8fafc;border-radius:10px;padding:20px;margin:20px 0;">
                    <p style="margin:0 0 12px;font-size:11px;color:#64748b;font-weight:black;text-transform:uppercase;letter-spacing:1px;">Seller & Pickup Details</p>
                    <p style="margin:4px 0;font-size:14px;color:#0f172a;"><strong>Seller:</strong> ${sellerName || 'Verified Seller'}</p>
                    <p style="margin:4px 0;font-size:14px;color:#0f172a;"><strong>Phone:</strong> ${sellerPhone || 'N/A'}</p>
                    <p style="margin:4px 0;font-size:14px;color:#0f172a;"><strong>Address:</strong> ${sellerAddress || 'See dashboard for details'}</p>
                    <p style="margin:12px 0 4px;font-size:14px;color:#0f172a;"><strong>Collection Date:</strong> ${collectionDate}</p>
                </div>

                <div style="background:#fefce8;border:1px solid #fef08a;border-radius:10px;padding:16px;margin:20px 0;">
                    <p style="margin:0;font-size:13px;color:#854d0e;"><strong>Need to change the date?</strong> You can reschedule your pickup date by going to your <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://the-new-cycle-m8zx.vercel.app'}/buyer" style="color:#854d0e;font-weight:bold;text-decoration:underline;">Dashboard</a> and clicking the <strong>Manage Pickup</strong> button.</p>
                </div>

                <div style="background:#f8fafc;border-radius:10px;padding:16px;margin:20px 0;">
                    <p style="margin:0 0 8px;font-size:13px;color:#64748b;">ORDER SUMMARY</p>
                    <p style="margin:4px 0;"><strong>Order ID:</strong> #${orderId}</p>
                    <p style="margin:4px 0;"><strong>Product:</strong> ${productName}</p>
                    <p style="margin:4px 0;"><strong>Amount:</strong> ₦${Number(amount).toLocaleString()}</p>
                </div>
                <p style="color:#475569;font-size:14px;">The seller will provide you with the secret code only after they have handed over the items to you.</p>
            </div>
            <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} Go-Cycle. All rights reserved.</p>
            </div>
        </div>`
    }
}

export function verificationCodeEmail({ name, code }) {
    return {
        subject: `${code} is your Go-Cycle verification code`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:#0f172a;padding:24px;text-align:center;">
                <h1 style="color:#05DF72;margin:0;font-size:22px;">Go-Cycle</h1>
            </div>
            <div style="padding:28px;text-align:center;">
                <h2 style="color:#0f172a;margin-top:0;">Verify your account</h2>
                <p style="color:#475569;">Hi ${name}, thank you for joining Go-Cycle. Use the verification code below to complete your registration:</p>
                <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin:24px 0;">
                    <h2 style="margin:0;font-size:36px;color:#0f172a;letter-spacing:10px;">${code}</h2>
                </div>
                <p style="color:#94a3b8;font-size:12px;">This code has also been sent to your registered phone number. It will expire in 10 minutes.</p>
            </div>
            <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} Go-Cycle Nigeria. All rights reserved.</p>
            </div>
        </div>`
    }
}

export function orderCollectedEmail({ sellerName, orderId, amount }) {
    return {
        subject: `Order Collected – Payout Pending #${orderId}`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:#0f172a;padding:24px;text-align:center;">
                <h1 style="color:#05DF72;margin:0;font-size:22px;">Go-Cycle</h1>
            </div>
            <div style="padding:28px;">
                <h2 style="color:#0f172a;margin-top:0;">Hi ${sellerName},</h2>
                <p style="color:#475569;">Great news! Order <strong>#${orderId}</strong> has been collected successfully.</p>
                <p style="color:#475569;">Your payout of <strong>₦${Number(amount * 0.95).toLocaleString()}</strong> (after 5% platform fee) is now pending admin approval.</p>
                <p style="color:#475569;font-size:14px;">You'll receive a payment confirmation email once the payout is released.</p>
            </div>
            <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} Go-Cycle. All rights reserved.</p>
            </div>
        </div>`
    }
}

export function payoutReleasedEmail({ sellerName, amount, orderId }) {
    return {
        subject: `Payout Released – ₦${Number(amount).toLocaleString()}`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:#0f172a;padding:24px;text-align:center;">
                <h1 style="color:#05DF72;margin:0;font-size:22px;">Go-Cycle</h1>
            </div>
            <div style="padding:28px;">
                <h2 style="color:#0f172a;margin-top:0;">Hi ${sellerName},</h2>
                <p style="color:#475569;">💰 Your payout for order <strong>#${orderId}</strong> has been released!</p>
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin:20px 0;text-align:center;">
                    <p style="margin:0;font-size:28px;font-weight:bold;color:#16a34a;">₦${Number(amount).toLocaleString()}</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Credited to your wallet</p>
                </div>
                <p style="color:#475569;font-size:14px;">Log in to your seller dashboard to view your updated wallet balance.</p>
            </div>
            <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} Go-Cycle. All rights reserved.</p>
            </div>
        </div>`
    }
}

export function welcomeEmail({ name }) {
    return {
        subject: 'Welcome to Go-Cycle! 🌱',
        html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:#0f172a;padding:24px;text-align:center;">
                <h1 style="color:#05DF72;margin:0;font-size:22px;">Go-Cycle</h1>
                <p style="color:#94a3b8;margin:4px 0 0;font-size:12px;">Nigeria's Battery Recycling Marketplace</p>
            </div>
            <div style="padding:28px;">
                <h2 style="color:#0f172a;margin-top:0;">Welcome, ${name}! 👋</h2>
                <p style="color:#475569;">You've successfully joined Go-Cycle — Nigeria's leading platform for buying and recycling batteries responsibly.</p>
                <p style="color:#475569;">Here's what you can do:</p>
                <ul style="color:#475569;padding-left:20px;">
                    <li>Browse verified battery listings from trusted sellers</li>
                    <li>Place orders and track collection status</li>
                    <li>Contribute to a greener Nigeria ♻️</li>
                </ul>
            </div>
            <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} Go-Cycle. All rights reserved.</p>
            </div>
        </div>`
    }
}

/**
 * Buyer Receipt — sent when their battery order is successfully collected/picked up
 */
export function buyerReceiptEmail(data) {
    const { 
        buyerName, name, 
        orderId, id,
        productName, 
        quantity, 
        unitPrice, 
        totalAmount, total, 
        collectionDate, 
        storeName,
        items 
    } = data
    
    const displayBuyerName = buyerName || name || 'Customer'
    const displayTotal = totalAmount || total || 0
    const yr = new Date().getFullYear()
    const shortId = orderId || id
    
    // Handle multiple items if provided, otherwise fallback to single product
    const itemsList = items && items.length > 0 ? items : [
        { name: productName || 'Battery Product', quantity: quantity || 1, price: unitPrice || displayTotal }
    ]

    return {
        subject: `Your Receipt – Go-Cycle Order #${shortId}`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <!-- Header -->
            <div style="background:#0f172a;padding:28px;text-align:center;">
                <h1 style="color:#05DF72;margin:0 0 4px;font-size:24px;letter-spacing:-0.5px;">Go-Cycle</h1>
                <p style="color:#94a3b8;margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Official Receipt</p>
            </div>

            <!-- Badge -->
            <div style="background:#f0fdf4;border-bottom:1px solid #bbf7d0;padding:14px 28px;display:flex;align-items:center;gap:10px;">
                <span style="font-size:20px;">✅</span>
                <div>
                    <p style="margin:0;font-weight:bold;color:#15803d;font-size:14px;">Collection Confirmed</p>
                    <p style="margin:0;color:#64748b;font-size:12px;">Your battery has been successfully picked up</p>
                </div>
            </div>

            <!-- Body -->
            <div style="padding:28px;">
                <p style="color:#475569;margin-top:0;">Hi <strong>${displayBuyerName}</strong>, thank you for using Go-Cycle. Here is your official receipt for order <strong>#${shortId}</strong>.</p>

                <!-- Receipt Table -->
                <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
                    <thead>
                        <tr style="background:#f8fafc;">
                            <th style="text-align:left;padding:10px 12px;color:#64748b;font-weight:600;border-bottom:1px solid #e5e7eb;">Item</th>
                            <th style="text-align:center;padding:10px 12px;color:#64748b;font-weight:600;border-bottom:1px solid #e5e7eb;">Qty</th>
                            <th style="text-align:right;padding:10px 12px;color:#64748b;font-weight:600;border-bottom:1px solid #e5e7eb;">Unit Price</th>
                            <th style="text-align:right;padding:10px 12px;color:#64748b;font-weight:600;border-bottom:1px solid #e5e7eb;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsList.map(item => `
                        <tr>
                            <td style="padding:12px;color:#0f172a;">${item.name}</td>
                            <td style="padding:12px;text-align:center;color:#0f172a;">${item.quantity}</td>
                            <td style="padding:12px;text-align:right;color:#0f172a;">₦${Number(item.price).toLocaleString()}</td>
                            <td style="padding:12px;text-align:right;color:#0f172a;font-weight:600;">₦${Number(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr style="background:#f8fafc;">
                            <td colspan="3" style="padding:12px;font-weight:bold;color:#0f172a;border-top:2px solid #e5e7eb;">TOTAL PAID</td>
                            <td style="padding:12px;text-align:right;font-size:16px;font-weight:bold;color:#05DF72;border-top:2px solid #e5e7eb;">₦${Number(displayTotal).toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>

                <!-- Details -->
                <div style="background:#f8fafc;border-radius:10px;padding:16px;font-size:13px;color:#475569;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span>Order ID</span><strong style="color:#0f172a;">#${shortId}</strong>
                    </div>
                    ${storeName ? `
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span>Collected from</span><strong style="color:#0f172a;">${storeName}</strong>
                    </div>
                    ` : ''}
                    <div style="display:flex;justify-content:space-between;">
                        <span>Collection Date</span><strong style="color:#0f172a;">${collectionDate || new Date().toLocaleDateString()}</strong>
                    </div>
                </div>

                <p style="color:#94a3b8;font-size:12px;margin-top:20px;">Keep this email as proof of collection. Thank you for recycling responsibly with Go-Cycle ♻️</p>
            </div>

            <!-- Footer -->
            <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">© ${yr} Go-Cycle Nigeria. All rights reserved.</p>
            </div>
        </div>`
    }
}

/**
 * Seller Wallet Credit — sent when a seller's wallet is credited (payout released or manual top-up)
 */
export function sellerWalletCreditEmail({ sellerName, amount, newBalance, orderId, creditType = 'PAYOUT' }) {
    const yr = new Date().getFullYear()
    const shortId = orderId ? `#${orderId}` : 'N/A'
    const label = creditType === 'PAYOUT' ? 'Order Payout' : 'Manual Credit'
    return {
        subject: `Wallet Credited – ₦${Number(amount).toLocaleString()} received`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <!-- Header -->
            <div style="background:#0f172a;padding:28px;text-align:center;">
                <h1 style="color:#05DF72;margin:0 0 4px;font-size:24px;letter-spacing:-0.5px;">Go-Cycle</h1>
                <p style="color:#94a3b8;margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Seller Payment Notification</p>
            </div>

            <!-- Amount Hero -->
            <div style="background:linear-gradient(135deg,#052e16,#166534);padding:32px 28px;text-align:center;">
                <p style="color:#86efac;margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Amount Credited</p>
                <p style="color:#ffffff;margin:0;font-size:40px;font-weight:bold;letter-spacing:-1px;">₦${Number(amount).toLocaleString()}</p>
                <div style="display:inline-block;background:#05DF72;color:#052e16;font-size:11px;font-weight:bold;padding:4px 12px;border-radius:20px;margin-top:12px;">
                    💰 ${label}
                </div>
            </div>

            <!-- Body -->
            <div style="padding:28px;">
                <p style="color:#475569;margin-top:0;">Hi <strong>${sellerName}</strong>, your Go-Cycle seller wallet has been credited. Here are the details:</p>

                <div style="background:#f8fafc;border-radius:10px;padding:16px;font-size:14px;color:#475569;margin-bottom:20px;">
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb;">
                        <span>Credit Type</span><strong style="color:#0f172a;">${label}</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb;">
                        <span>Reference</span><strong style="color:#0f172a;">${shortId}</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb;">
                        <span>Amount Credited</span><strong style="color:#16a34a;">+ ₦${Number(amount).toLocaleString()}</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px 0;">
                        <span>New Wallet Balance</span><strong style="color:#0f172a;font-size:16px;">₦${Number(newBalance).toLocaleString()}</strong>
                    </div>
                </div>

                <p style="color:#475569;font-size:14px;">Log in to your seller dashboard to view your full earnings history and request a withdrawal.</p>
            </div>

            <!-- Footer -->
            <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">© ${yr} Go-Cycle Nigeria. All rights reserved.</p>
            </div>
        </div>`
    }
}

/**
 * Buyer Verified Email — sent when an admin manually verifies/approves a buyer's account
 */
export function buyerVerifiedEmail({ name }) {
    const yr = new Date().getFullYear()
    return {
        subject: 'Account Verified – Ready to Trade on Go-Cycle 🎉',
        html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <!-- Header -->
            <div style="background:#0f172a;padding:28px;text-align:center;">
                <h1 style="color:#05DF72;margin:0 0 4px;font-size:24px;letter-spacing:-0.5px;">Go-Cycle</h1>
                <p style="color:#94a3b8;margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Account Status: Verified</p>
            </div>

            <!-- Hero Section -->
            <div style="background:#f0fdf4;padding:32px 28px;text-align:center;">
                <p style="font-size:40px;margin:0 0 16px;">Verified!</p>
                <h2 style="color:#15803d;margin:0;font-size:20px;">Congratulations, ${name}</h2>
            </div>

            <!-- Body -->
            <div style="padding:28px;">
                <p style="color:#475569;margin-top:0;line-height:1.6;">Your identity verification has been successful. Your Go-Cycle account is now <strong>fully approved</strong> and active!</p>
                
                <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:24px 0;">
                    <h3 style="color:#0f172a;margin-top:0;font-size:14px;text-transform:uppercase;letter-spacing:1px;">What's Next?</h3>
                    <ul style="color:#475569;font-size:14px;padding-left:20px;line-height:1.8;">
                        <li>Browse live battery listings across Lagos</li>
                        <li>Coordinate secure pick-ups with verified sellers</li>
                        <li>Track your sustainability impact in your dashboard</li>
                    </ul>
                </div>

                <div style="text-align:center;margin:32px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://the-new-cycle-m8zx.vercel.app'}" style="background:#05DF72;color:#052e16;text-decoration:none;padding:14px 32px;border-radius:30px;font-weight:bold;font-size:14px;display:inline-block;">Start Trading Now</a>
                </div>

                <p style="color:#94a3b8;font-size:12px;">If you have any questions, feel free to reply to this email or reach us on WhatsApp.</p>
            </div>

            <!-- Footer -->
            <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">© ${yr} Go-Cycle Nigeria. All rights reserved.</p>
            </div>
        </div>`
    }
}
/**
 * Buyer Rejected Email — sent when an admin rejects a buyer's verification
 */
export function buyerRejectedEmail({ name, reason }) {
    const yr = new Date().getFullYear()
    return {
        subject: 'Update Regarding Your Go-Cycle Verification ⚠️',
        html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <!-- Header -->
            <div style="background:#0f172a;padding:28px;text-align:center;">
                <h1 style="color:#05DF72;margin:0 0 4px;font-size:24px;letter-spacing:-0.5px;">Go-Cycle</h1>
                <p style="color:#94a3b8;margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Account Status: Action Required</p>
            </div>

            <!-- Hero Section -->
            <div style="background:#fef2f2;padding:32px 28px;text-align:center;">
                <p style="font-size:40px;margin:0 0-16px;">⚠️</p>
                <h2 style="color:#991b1b;margin:0;font-size:20px;">Verification Update for ${name}</h2>
            </div>

            <!-- Body -->
            <div style="padding:28px;">
                <p style="color:#475569;margin-top:0;line-height:1.6;">Thank you for your interest in Go-Cycle. Our team has reviewed your verification documents, and unfortunately, we cannot approve your account at this time.</p>
                
                <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:24px 0;">
                    <h3 style="color:#0f172a;margin-top:0;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Reason for Rejection</h3>
                    <p style="color:#ef4444;font-size:15px;font-weight:bold;margin:10px 0 0;">"${reason || "Your documents did not meet our verification requirements."}"</p>
                </div>

                <div style="background:#fff7ed;border-left:4px solid #f97316;padding:16px;margin:24px 0;">
                    <p style="color:#9a3412;font-size:13px;margin:0;"><strong>What should you do?</strong> Please log in to your dashboard to re-upload the correct documents or contact our support team if you believe this was an error.</p>
                </div>

                <div style="text-align:center;margin:32px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://the-new-cycle-m8zx.vercel.app'}" style="background:#0f172a;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:30px;font-weight:bold;font-size:14px;display:inline-block;">Go to Dashboard</a>
                </div>

                <p style="color:#94a3b8;font-size:12px;">If you have any questions, feel free to reply to this email or reach us on WhatsApp.</p>
            </div>

            <!-- Footer -->
            <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">© ${yr} Go-Cycle Nigeria. All rights reserved.</p>
            </div>
        </div>`
    }
}

/**
 * Product Approved Email — sent when an admin approves a seller's product listing
 */
export function productApprovedEmail({ sellerName, productName }) {
    const yr = new Date().getFullYear()
    return {
        subject: `Product Approved: ${productName} ✅`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <!-- Header -->
            <div style="background:#0f172a;padding:28px;text-align:center;">
                <h1 style="color:#05DF72;margin:0 0 4px;font-size:24px;letter-spacing:-0.5px;">Go-Cycle</h1>
                <p style="color:#94a3b8;margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Listing Approved</p>
            </div>

            <!-- Hero Section -->
            <div style="background:#f0fdf4;padding:32px 28px;text-align:center;">
                <p style="font-size:40px;margin:0 0 16px;">✅</p>
                <h2 style="color:#15803d;margin:0;font-size:20px;">Great news, ${sellerName}!</h2>
            </div>

            <!-- Body -->
            <div style="padding:28px;">
                <p style="color:#475569;margin-top:0;line-height:1.6;">Your product listing for <strong>"${productName}"</strong> has been reviewed and approved by our moderation team.</p>
                
                <p style="color:#475569;line-height:1.6;">It is now live on the Go-Cycle marketplace and available for buyers to purchase.</p>

                <div style="text-align:center;margin:32px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://the-new-cycle-m8zx.vercel.app'}" style="background:#05DF72;color:#052e16;text-decoration:none;padding:14px 32px;border-radius:30px;font-weight:bold;font-size:14px;display:inline-block;">View Marketplace</a>
                </div>
            </div>

            <!-- Footer -->
            <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">© ${yr} Go-Cycle Nigeria. All rights reserved.</p>
            </div>
        </div>`
    }
}

/**
 * Product Rejected Email — sent when an admin rejects a seller's product listing
 */
export function productRejectedEmail({ sellerName, productName, reason }) {
    const yr = new Date().getFullYear()
    return {
        subject: `Listing Action Required: ${productName} ⚠️`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <!-- Header -->
            <div style="background:#0f172a;padding:28px;text-align:center;">
                <h1 style="color:#05DF72;margin:0 0 4px;font-size:24px;letter-spacing:-0.5px;">Go-Cycle</h1>
                <p style="color:#94a3b8;margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Listing Action Required</p>
            </div>

            <!-- Hero Section -->
            <div style="background:#fef2f2;padding:32px 28px;text-align:center;">
                <p style="font-size:40px;margin:0 0-16px;">⚠️</p>
                <h2 style="color:#991b1b;margin:0;font-size:20px;">Update on your listing, ${sellerName}</h2>
            </div>

            <!-- Body -->
            <div style="padding:28px;">
                <p style="color:#475569;margin-top:0;line-height:1.6;">Our moderation team has reviewed your listing for <strong>"${productName}"</strong> and unfortunately, it cannot be approved at this time.</p>
                
                <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:24px 0;">
                    <h3 style="color:#0f172a;margin-top:0;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Reason for Rejection</h3>
                    <p style="color:#ef4444;font-size:15px;font-weight:bold;margin:10px 0 0;">"${reason || "Your listing did not meet our marketplace guidelines."}"</p>
                </div>

                <div style="background:#fff7ed;border-left:4px solid #f97316;padding:16px;margin:24px 0;">
                    <p style="color:#9a3412;font-size:13px;margin:0;"><strong>What should you do?</strong> Please log in to your seller dashboard to correct the listing or contact support if you believe this was an error.</p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">© ${yr} Go-Cycle Nigeria. All rights reserved.</p>
            </div>
        </div>`
    }
}

/**
 * Seller New Order Email — sent to the seller when a buyer places an order, includes the collection token
 */
export function sellerNewOrderEmail({ sellerName, orderId, productName, amount, quantity, collectionDate, token, buyerName }) {
    const yr = new Date().getFullYear()
    const shortId = orderId
    return {
        subject: `New Order Received – #${shortId} 🎉`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <!-- Header -->
            <div style="background:#0f172a;padding:28px;text-align:center;">
                <h1 style="color:#05DF72;margin:0 0 4px;font-size:24px;letter-spacing:-0.5px;">Go-Cycle</h1>
                <p style="color:#94a3b8;margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">New Order Notification</p>
            </div>

            <!-- Body -->
            <div style="padding:28px;">
                <h2 style="color:#0f172a;margin-top:0;">Hi ${sellerName},</h2>
                <p style="color:#475569;">Great news! You have a new order from <strong>${buyerName}</strong>.</p>

                <div style="background:#f0fdf4;border:2px dashed #05DF72;border-radius:12px;padding:24px;margin:20px 0;text-align:center;">
                    <p style="margin:0 0 8px;font-size:12px;color:#15803d;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Verification Code</p>
                    <h2 style="margin:0;font-size:32px;color:#0f172a;letter-spacing:8px;">${token}</h2>
                    <p style="margin:8px 0 0;font-size:11px;color:#64748b;"><strong>Give this code to the buyer</strong> once they have picked up the items. They will need it to confirm the transaction.</p>
                </div>

                <div style="background:#f8fafc;border-radius:10px;padding:16px;margin:20px 0;">
                    <p style="margin:0 0 8px;font-size:13px;color:#64748b;">ORDER DETAILS</p>
                    <p style="margin:4px 0;"><strong>Order ID:</strong> #${shortId}</p>
                    <p style="margin:4px 0;"><strong>Product:</strong> ${productName}</p>
                    <p style="margin:4px 0;"><strong>Quantity:</strong> ${quantity} unit(s)</p>
                    <p style="margin:4px 0;"><strong>Amount:</strong> ₦${Number(amount).toLocaleString()}</p>
                    <p style="margin:4px 0;"><strong>Collection Date:</strong> ${collectionDate}</p>
                </div>

                <p style="color:#475569;font-size:14px;">The buyer will ask you for this secret code to complete the verification on their side. Do not share it until the hand-off is complete.</p>
            </div>

            <!-- Footer -->
            <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">© ${yr} Go-Cycle Nigeria. All rights reserved.</p>
            </div>
        </div>`
    }
}

/**
 * Reschedule Request Email — sent when buyer or seller proposes a new pickup date
 */
export function rescheduleRequestEmail({ recipientName, proposedDate, proposedBy, orderId }) {
    const yr = new Date().getFullYear()
    const shortId = orderId
    return {
        subject: `Pickup Date Change Proposed – Order #${shortId}`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:#0f172a;padding:24px;text-align:center;">
                <h1 style="color:#05DF72;margin:0;font-size:22px;">Go-Cycle</h1>
                <p style="color:#94a3b8;margin:4px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Pickup Reschedule</p>
            </div>
            <div style="padding:28px;">
                <h2 style="color:#0f172a;margin-top:0;">Hi ${recipientName},</h2>
                <p style="color:#475569;"><strong>${proposedBy}</strong> has proposed a new pickup date for your order <strong>#${shortId}</strong>.</p>
                <div style="background:#fff7ed;border:2px solid #fed7aa;border-radius:12px;padding:24px;margin:20px 0;text-align:center;">
                    <p style="margin:0 0 8px;font-size:12px;color:#9a3412;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Proposed Date</p>
                    <h2 style="margin:0;font-size:24px;color:#0f172a;">${proposedDate}</h2>
                </div>
                <p style="color:#475569;font-size:14px;">Please log in to your dashboard to <strong>accept</strong> this date or <strong>propose an alternative</strong>.</p>
            </div>
            <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">© ${yr} Go-Cycle. All rights reserved.</p>
            </div>
        </div>`
    }
}

/**
 * Reschedule Accepted Email — sent when the proposed date is confirmed by either party
 */
export function rescheduleAcceptedEmail({ recipientName, confirmedDate, orderId }) {
    const yr = new Date().getFullYear()
    const shortId = orderId
    return {
        subject: `Pickup Date Confirmed – Order #${shortId} ✅`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:#0f172a;padding:24px;text-align:center;">
                <h1 style="color:#05DF72;margin:0;font-size:22px;">Go-Cycle</h1>
                <p style="color:#94a3b8;margin:4px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Date Confirmed</p>
            </div>
            <div style="padding:28px;">
                <h2 style="color:#0f172a;margin-top:0;">Hi ${recipientName},</h2>
                <p style="color:#475569;">The pickup date for order <strong>#${shortId}</strong> has been confirmed.</p>
                <div style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:12px;padding:24px;margin:20px 0;text-align:center;">
                    <p style="margin:0 0 8px;font-size:12px;color:#15803d;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Confirmed Date</p>
                    <h2 style="margin:0;font-size:24px;color:#0f172a;">${confirmedDate}</h2>
                </div>
                <p style="color:#475569;font-size:14px;">Please ensure you are available on this date for battery collection.</p>
            </div>
            <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">© ${yr} Go-Cycle. All rights reserved.</p>
            </div>
        </div>`
    }
}

/**
 * Appointment Email — Official appointment letter for leadership roles
 */
export function appointmentEmail({ name, role, department, effectiveDate }) {
    const yr = new Date().getFullYear()
    return {
        subject: `Official Appointment: ${role} – Go-Cycle Nigeria`,
        html: `
        <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;color:#1e293b;line-height:1.6;">
            <!-- Premium Header -->
            <div style="background:#0f172a;padding:40px 30px;text-align:center;">
                <h1 style="color:#05DF72;margin:0;font-size:28px;letter-spacing:-1px;font-weight:800;">Go-Cycle</h1>
                <p style="color:#94a3b8;margin:8px 0 0;font-size:13px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Corporate Communications</p>
            </div>

            <!-- Content Body -->
            <div style="padding:45px 40px;background:#ffffff;">
                <div style="margin-bottom:30px;">
                    <p style="color:#64748b;font-size:14px;margin:0;">Date: ${new Date().toLocaleDateString('en-NG', { dateStyle: 'long' })}</p>
                    <p style="color:#64748b;font-size:14px;margin:4px 0 0;">Ref: GCY/HR/APPT/${yr}/001</p>
                </div>

                <h2 style="color:#0f172a;font-size:22px;margin-bottom:20px;font-weight:700;">Dear ${name},</h2>
                
                <p style="margin-bottom:20px;">Following a thorough review of your exceptional contributions and demonstrated expertise, it is with great pleasure that we officially appoint you as the <strong>${role}</strong> at Go-Cycle.</p>
                
                <p style="margin-bottom:20px;">In this pivotal leadership capacity, you will be superheading the <strong>${department}</strong>, where you will be responsible for defining our technological roadmap, driving innovation, and scaling our engineering infrastructure to meet the growing demands of the green energy marketplace in Nigeria.</p>

                <!-- Role Details Box -->
                <div style="background:#f8fafc;border-left:4px solid #05DF72;padding:25px;margin:30px 0;border-radius:0 12px 12px 0;">
                    <h3 style="margin:0 0 15px;font-size:16px;color:#0f172a;text-transform:uppercase;letter-spacing:1px;">Appointment Overview</h3>
                    <table style="width:100%;font-size:15px;border-collapse:collapse;">
                        <tr>
                            <td style="padding:8px 0;color:#64748b;width:140px;">Position:</td>
                            <td style="padding:8px 0;color:#0f172a;font-weight:600;">${role}</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0;color:#64748b;">Department:</td>
                            <td style="padding:8px 0;color:#0f172a;font-weight:600;">${department}</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0;color:#64748b;">Effective Date:</td>
                            <td style="padding:8px 0;color:#0f172a;font-weight:600;">${effectiveDate}</td>
                        </tr>
                    </table>
                </div>

                <p style="margin-bottom:20px;">Your appointment comes at a critical juncture as we transition into a more robust, tech-first circular economy. We are confident that your leadership will be instrumental in positioning Go-Cycle as the gold standard for battery recycling and sustainable energy solutions across Africa.</p>
                
                <p style="margin-bottom:35px;">We look forward to the remarkable milestones we will achieve together under your technical stewardship.</p>

                <!-- Sign-off -->
                <div style="border-top:1px solid #f1f5f9;padding-top:30px;">
                    <p style="margin:0;font-weight:700;color:#0f172a;">Executive Management Team</p>
                    <p style="margin:4px 0 0;color:#64748b;font-size:14px;">Go-Cycle Nigeria</p>
                </div>
            </div>

            <!-- Professional Footer -->
            <div style="background:#f1f5f9;padding:25px;text-align:center;border-top:1px solid #e2e8f0;">
                <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.8;">
                    This is an official communication from Go-Cycle.<br/>
                    &copy; ${yr} Go-Cycle. All rights reserved.<br/>
                    Lagos, Nigeria.
                </p>
            </div>
        </div>`
    }
}
