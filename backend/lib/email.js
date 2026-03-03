import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
})

/**
 * Send a transactional email
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML email body
 * @param {string} [options.text] - Optional plain text fallback
 */
export async function sendEmail({ to, subject, html, text }) {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ''),
    }

    try {
        const info = await transporter.sendMail(mailOptions)
        console.log(`[Email] Sent to ${to} — MessageId: ${info.messageId}`)
        return { success: true, messageId: info.messageId }
    } catch (error) {
        console.error(`[Email] Failed to send to ${to}:`, error.message)
        return { success: false, error: error.message }
    }
}

// ─── Email Templates ───────────────────────────────────────────────────────────

export function orderConfirmationEmail({ buyerName, orderId, productName, amount, collectionDate, token }) {
    return {
        subject: `Order Confirmed – #${orderId.slice(-6).toUpperCase()}`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:#0f172a;padding:24px;text-align:center;">
                <h1 style="color:#05DF72;margin:0;font-size:22px;">Go-Cycle</h1>
                <p style="color:#94a3b8;margin:4px 0 0;font-size:12px;">Battery Recycling Marketplace</p>
            </div>
            <div style="padding:28px;">
                <h2 style="color:#0f172a;margin-top:0;">Hi ${buyerName},</h2>
                <p style="color:#475569;">Your order has been placed successfully!</p>
                
                ${token ? `
                <div style="background:#f0fdf4;border:2px dashed #05DF72;border-radius:12px;padding:24px;margin:20px 0;text-align:center;">
                    <p style="margin:0 0 8px;font-size:12px;color:#15803d;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Collection Token</p>
                    <h2 style="margin:0;font-size:32px;color:#0f172a;letter-spacing:8px;">${token}</h2>
                    <p style="margin:8px 0 0;font-size:11px;color:#64748b;">Present this code to the seller at point of pickup</p>
                </div>
                ` : ''}

                <div style="background:#f8fafc;border-radius:10px;padding:16px;margin:20px 0;">
                    <p style="margin:0 0 8px;font-size:13px;color:#64748b;">ORDER DETAILS</p>
                    <p style="margin:4px 0;"><strong>Order ID:</strong> #${orderId.slice(-6).toUpperCase()}</p>
                    <p style="margin:4px 0;"><strong>Product:</strong> ${productName}</p>
                    <p style="margin:4px 0;"><strong>Amount:</strong> ₦${Number(amount).toLocaleString()}</p>
                    <p style="margin:4px 0;"><strong>Collection Date:</strong> ${collectionDate}</p>
                </div>
                <p style="color:#475569;font-size:14px;">The seller will be in touch with collection details. This 6-digit token is also sent to your registered phone number.</p>
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
        subject: `Order Collected – Payout Pending #${orderId.slice(-6).toUpperCase()}`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:#0f172a;padding:24px;text-align:center;">
                <h1 style="color:#05DF72;margin:0;font-size:22px;">Go-Cycle</h1>
            </div>
            <div style="padding:28px;">
                <h2 style="color:#0f172a;margin-top:0;">Hi ${sellerName},</h2>
                <p style="color:#475569;">Great news! Order <strong>#${orderId.slice(-6).toUpperCase()}</strong> has been collected successfully.</p>
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
                <p style="color:#475569;">💰 Your payout for order <strong>#${orderId.slice(-6).toUpperCase()}</strong> has been released!</p>
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
export function buyerReceiptEmail({ buyerName, orderId, productName, quantity, unitPrice, totalAmount, collectionDate, storeName }) {
    const yr = new Date().getFullYear()
    const shortId = orderId.slice(-6).toUpperCase()
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
                <p style="color:#475569;margin-top:0;">Hi <strong>${buyerName}</strong>, thank you for using Go-Cycle. Here is your official receipt for order <strong>#${shortId}</strong>.</p>

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
                        <tr>
                            <td style="padding:12px;color:#0f172a;">${productName}</td>
                            <td style="padding:12px;text-align:center;color:#0f172a;">${quantity}</td>
                            <td style="padding:12px;text-align:right;color:#0f172a;">₦${Number(unitPrice).toLocaleString()}</td>
                            <td style="padding:12px;text-align:right;color:#0f172a;font-weight:600;">₦${Number(totalAmount).toLocaleString()}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr style="background:#f8fafc;">
                            <td colspan="3" style="padding:12px;font-weight:bold;color:#0f172a;border-top:2px solid #e5e7eb;">TOTAL PAID</td>
                            <td style="padding:12px;text-align:right;font-size:16px;font-weight:bold;color:#05DF72;border-top:2px solid #e5e7eb;">₦${Number(totalAmount).toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>

                <!-- Details -->
                <div style="background:#f8fafc;border-radius:10px;padding:16px;font-size:13px;color:#475569;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span>Order ID</span><strong style="color:#0f172a;">#${shortId}</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span>Collected from</span><strong style="color:#0f172a;">${storeName}</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                        <span>Collection Date</span><strong style="color:#0f172a;">${collectionDate}</strong>
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
    const shortId = orderId ? `#${orderId.slice(-6).toUpperCase()}` : 'N/A'
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
