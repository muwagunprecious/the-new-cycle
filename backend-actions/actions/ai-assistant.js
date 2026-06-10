'use server'

import prisma from "@/backend-actions/lib/prisma"
import { sendEmail } from "@/backend-actions/lib/email"
import { deleteUser, banUser } from "@/backend-actions/actions/admin"
import { logger } from "@/backend-actions/lib/api-utils"

// Helper to check if SMTP config is present
function checkSmtpConfig() {
    return {
        host: !!process.env.SMTP_HOST,
        port: !!process.env.SMTP_PORT,
        user: !!process.env.SMTP_USER,
        pass: !!process.env.SMTP_PASS,
    }
}

// AI TOOLS IMPLEMENTATION

/**
 * 1. Check system diagnostics and health status.
 */
async function getSystemHealth() {
    try {
        // Test database connection
        const dbCheck = await prisma.$queryRaw`SELECT 1`.then(() => "CONNECTED").catch((err) => `FAILED: ${err.message}`);
        
        // Check key env vars
        const envVars = {
            DATABASE_URL: !!process.env.DATABASE_URL,
            SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            SMTP: checkSmtpConfig(),
            TERMII: !!process.env.TERMII_API_KEY,
            QOREID: !!process.env.QOREID_SECRET_KEY,
            FLUTTERWAVE: !!process.env.FLUTTERWAVE_SECRET_KEY,
            GROQ: !!process.env.GROQ_API_KEY
        };

        // Active disputes
        const activeDisputes = await prisma.order.count({
            where: { collectionStatus: 'DISPUTED' }
        });

        // Count pending manual verifications
        const pendingVerifications = await prisma.manualVerification.count({
            where: { status: 'pending' }
        });

        // Count pending products
        const pendingProducts = await prisma.product.count({
            where: { status: 'pending' }
        });

        // Count failed payments (orders marked failed/pending verification)
        const failedPayments = await prisma.order.count({
            where: { paymentStatus: 'failed' }
        });

        const status = (dbCheck === "CONNECTED" && activeDisputes === 0 && failedPayments === 0) ? "healthy" : "warning";

        return {
            status,
            database: dbCheck,
            environment: envVars,
            activeDisputes,
            pendingVerifications,
            pendingProducts,
            failedPayments,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            status: "error",
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * 2. Email the web developer about diagnostic/system errors.
 */
async function emailWebDeveloper({ errorMessage }) {
    try {
        const developerEmail = "professorprecious03@gmail.com";
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
                <h2 style="color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 8px;">System Error Alert</h2>
                <p>Hello Precious,</p>
                <p>An administrator has triggered a diagnostic report from the Go-Cycle AI Admin Co-pilot. The following system error or diagnostic warning was flagged:</p>
                <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; font-family: monospace; white-space: pre-wrap; font-size: 14px; color: #334155;">
                    ${errorMessage}
                </div>
                <p>Please log in to the server or database console to resolve this as soon as possible.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">This is an automated alert sent from your Go-Cycle Admin Dashboard AI Co-pilot.</p>
            </div>
        `;

        const response = await sendEmail({
            to: developerEmail,
            subject: "Go-Cycle Admin Alert: Developer Attention Required",
            html: emailContent
        });

        return { success: response.success, message: `Email successfully sent to ${developerEmail}` };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * 3. Send custom emails to any user.
 */
async function sendEmailToUser({ to, subject, body }) {
    try {
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #05DF72; margin: 0;">Go-Cycle Support</h2>
                </div>
                <p>${body.replace(/\n/g, '<br/>')}</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">Go-Cycle Marketplace Admin Team</p>
            </div>
        `;

        const response = await sendEmail({
            to,
            subject,
            html: emailContent
        });

        return { success: response.success, message: `Custom email successfully sent to ${to}` };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * 4. Delete or block a user by ID, email, or phone.
 */
async function deleteOrBlockUser({ emailOrPhoneOrId, action }) {
    try {
        // Resolve user
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: emailOrPhoneOrId },
                    { email: emailOrPhoneOrId },
                    { phone: emailOrPhoneOrId }
                ]
            }
        });

        if (!user) {
            return { success: false, error: `User matching query "${emailOrPhoneOrId}" not found.` };
        }

        if (action === 'delete') {
            const res = await deleteUser(user.id);
            return { success: res.success, message: `User ${user.name} (${user.email || 'No Email'}) has been deleted.`, detail: res };
        } else if (action === 'block') {
            const res = await banUser(user.id, true);
            return { success: res.success, message: `User ${user.name} (${user.email || 'No Email'}) has been blocked/banned.`, detail: res };
        } else if (action === 'unblock') {
            const res = await banUser(user.id, false);
            return { success: res.success, message: `User ${user.name} (${user.email || 'No Email'}) has been unblocked/activated.`, detail: res };
        }

        return { success: false, error: `Invalid action "${action}". Must be 'delete', 'block', or 'unblock'.` };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * 5. Retrieve verification codes (e.g. for orders or manual transfers, or custom verification tasks).
 */
async function getVerificationCodes({ query }) {
    try {
        // Search orders
        const orders = await prisma.order.findMany({
            where: {
                OR: [
                    { id: query },
                    { transactionId: query },
                    { paymentReference: query },
                    { user: { email: query } },
                    { user: { phone: query } }
                ]
            },
            select: {
                id: true,
                transactionId: true,
                total: true,
                status: true,
                verificationCode: true,
                collectionToken: true,
                verificationStatus: true,
                createdAt: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            },
            take: 5
        });

        // Search users for registration/verification codes
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { id: query },
                    { email: query },
                    { phone: query }
                ]
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                verificationCode: true,
                isEmailVerified: true,
                isPhoneVerified: true
            },
            take: 5
        });

        return {
            success: true,
            orders,
            users
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * 6. Audit a buyer/seller account in detail.
 */
async function auditAccount({ emailOrPhoneOrId }) {
    try {
        // Resolve user
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: emailOrPhoneOrId },
                    { email: emailOrPhoneOrId },
                    { phone: emailOrPhoneOrId }
                ]
            },
            include: {
                store: true
            }
        });

        if (!user) {
            return { success: false, error: `User with identifier "${emailOrPhoneOrId}" not found.` };
        }

        // Get uploaded products (if seller store exists)
        let products = [];
        if (user.store) {
            products = await prisma.product.findMany({
                where: { storeId: user.store.id },
                select: {
                    id: true,
                    name: true,
                    price: true,
                    status: true,
                    createdAt: true,
                    brand: true,
                    condition: true
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        // Get purchases
        const purchases = await prisma.order.findMany({
            where: { userId: user.id },
            select: {
                id: true,
                transactionId: true,
                total: true,
                status: true,
                collectionStatus: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Get notifications sent (which represents communications log)
        const notifications = await prisma.notification.findMany({
            where: { userId: user.id },
            select: {
                id: true,
                title: true,
                message: true,
                type: true,
                status: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 15
        });

        // Strip password for safety
        const { password, ...safeUser } = user;

        return {
            success: true,
            profile: safeUser,
            products,
            purchases,
            notifications,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * 7. Get dashboard statistics and aggregations.
 */
async function getDashboardStats() {
    try {
        // Count users by status and role
        const userCounts = await prisma.user.groupBy({
            by: ['role'],
            _count: true
        });

        const activeStores = await prisma.store.count({ where: { status: 'approved', isActive: true } });
        const pendingStores = await prisma.store.count({ where: { status: 'pending' } });
        
        // Pending payouts
        const pendingCashoutsCount = await prisma.order.count({
            where: {
                status: 'COMPLETED',
                payoutStatus: 'pending'
            }
        });
        
        const pendingCashoutsSum = await prisma.order.aggregate({
            where: {
                status: 'COMPLETED',
                payoutStatus: 'pending'
            },
            _sum: {
                payoutAmount: true
            }
        });

        // Best sellers (stores with most completed orders)
        const storeOrdersGroup = await prisma.order.groupBy({
            by: ['storeId'],
            where: { status: 'COMPLETED' },
            _count: { id: true },
            _sum: { total: true },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            },
            take: 5
        });

        const bestSellers = [];
        for (const group of storeOrdersGroup) {
            const store = await prisma.store.findUnique({
                where: { id: group.storeId },
                select: { name: true, email: true, contact: true }
            });
            bestSellers.push({
                storeName: store?.name || "Unknown Store",
                email: store?.email,
                phone: store?.contact,
                ordersCount: group._count.id,
                totalSales: group._sum.total || 0
            });
        }

        // Recent contact messages
        const recentComplaints = await prisma.contactMessage.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                message: true,
                status: true,
                createdAt: true
            }
        });

        return {
            success: true,
            userCounts,
            activeStores,
            pendingStores,
            pendingCashouts: {
                count: pendingCashoutsCount,
                totalAmount: pendingCashoutsSum._sum.payoutAmount || 0
            },
            bestSellers,
            recentComplaints
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Router/mapper for tools
async function executeTool(name, args) {
    console.log(`[AI_ASSISTANT] Executing tool: ${name} with args:`, args);
    switch (name) {
        case "getSystemHealth":
            return await getSystemHealth();
        case "emailWebDeveloper":
            return await emailWebDeveloper(args);
        case "sendEmailToUser":
            return await sendEmailToUser(args);
        case "deleteOrBlockUser":
            return await deleteOrBlockUser(args);
        case "getVerificationCodes":
            return await getVerificationCodes(args);
        case "auditAccount":
            return await auditAccount(args);
        case "getDashboardStats":
            return await getDashboardStats();
        default:
            throw new Error(`Tool ${name} not found.`);
    }
}

// Tool definitions for Groq API
const assistantTools = [
    {
        type: "function",
        function: {
            name: "getSystemHealth",
            description: "Check system database connection, check active disputes, environment variables configuration, and overall health.",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    },
    {
        type: "function",
        function: {
            name: "emailWebDeveloper",
            description: "Email the web developer professorprecious03@gmail.com about diagnostic errors or system issues to fix.",
            parameters: {
                type: "object",
                properties: {
                    errorMessage: {
                        type: "string",
                        description: "The description of the error/diagnostic failure to email to the developer."
                    }
                },
                required: ["errorMessage"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "sendEmailToUser",
            description: "Send a support or notification email to any user email address.",
            parameters: {
                type: "object",
                properties: {
                    to: {
                        type: "string",
                        description: "The recipient's email address."
                    },
                    subject: {
                        type: "string",
                        description: "Subject of the email."
                    },
                    body: {
                        type: "string",
                        description: "The body content of the email."
                    }
                },
                required: ["to", "subject", "body"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "deleteOrBlockUser",
            description: "Delete or block/ban/unblock a buyer or seller account based on admin instruction.",
            parameters: {
                type: "object",
                properties: {
                    emailOrPhoneOrId: {
                        type: "string",
                        description: "The user's ID, email address, or phone number."
                    },
                    action: {
                        type: "string",
                        enum: ["delete", "block", "unblock"],
                        description: "The action to perform: delete (permanent), block (ban), unblock (restore)."
                    }
                },
                required: ["emailOrPhoneOrId", "action"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getVerificationCodes",
            description: "Retrieve verification codes, collection tokens, or transaction reference codes for a buyer, seller, or order.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "Order transaction ID, user email, or phone number to look up verification codes."
                    }
                },
                required: ["query"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "auditAccount",
            description: "Look up a buyer/seller account by email, phone, or ID and get details of products uploaded, orders bought, upload/buy dates, and sent notifications history.",
            parameters: {
                type: "object",
                properties: {
                    emailOrPhoneOrId: {
                        type: "string",
                        description: "The email, phone number, or user ID to audit."
                    }
                },
                required: ["emailOrPhoneOrId"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getDashboardStats",
            description: "Retrieve core dashboard statistics including user counts, active stores, pending cashouts/payouts, best-selling sellers, and recent contact message complaints.",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    }
];

const SYSTEM_PROMPT = `You are the Go-Cycle AI Admin Co-pilot (Assistant), a premium intelligence interface built into the admin console of the Go-Cycle Battery Recycling Marketplace.
Your primary role is to assist super administrators in tracking metrics, monitoring system diagnostics, auditing user accounts (buyers and sellers), sending emails, and executing moderation commands (blocking/deleting users).

GUIDELINES:
1. When asked about system errors or if you run "getSystemHealth" and find any database failure or warning, ALWAYS politely ask the admin: "Should I email professorprecious03@gmail.com, the web developer, to fix this error?"
2. When asked to block, delete, or send emails, execute the corresponding tool, and then report the success clearly.
3. Be professional, concise, and formatting-oriented (use lists, bold values, and Markdown tables where appropriate).
4. If the user asks about dashboard pages, you can explain the following pages in the admin portal:
   - Dashboard (/admin): Main overview displaying verified users, sales numbers, pending pickups, and pending cashouts.
   - Manual Verifications (/admin/manual-verifications): Verification list for manual bank transfers.
   - Verified Sellers (/admin/sellers) & Buyers (/admin/users): Detailed accounts management.
   - Pending Products (/admin/pending-products): Inspection queue for new scrap battery listings.
   - Disputes & Audits (/admin/disputes): Track transaction lifecycles, timeline stepper, and communication logs.
   - Approve Pickups (/admin/approve-pickups): Confirm pickup logistics and mark orders picked up.
   - Pending Cashouts (/admin/payments): Approve and release payouts to sellers.
   - Contact Messages (/admin/messages): Inbox containing queries from users.
5. If the admin asks questions that require database audits (e.g., best sellers, cashouts, verification codes, uploaded products, notifications), use the tools first to retrieve facts before answering. Do not guess or hallucinate details.
`;

/**
 * Handle administrative assistant message requests.
 * Runs the tool-calling execution loop on the server.
 */
export async function handleAssistantMessage(chatHistory) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return {
            success: false,
            content: "The GROQ_API_KEY is not configured in the server environment variables (.env). Please set it to proceed."
        };
    }

    try {
        // Build messages queue, pre-pending system prompt if not present
        const messages = [];
        const systemMessage = chatHistory.find(m => m.role === 'system');
        if (!systemMessage) {
            messages.push({ role: 'system', content: SYSTEM_PROMPT });
        }
        
        // Add chat history (limit to last 20 messages for context safety)
        const historySlice = chatHistory.slice(-20);
        messages.push(...historySlice.map(msg => ({
            role: msg.role,
            content: msg.content,
            tool_calls: msg.tool_calls,
            tool_call_id: msg.tool_call_id,
            name: msg.name
        })));

        let toolLogs = [];
        let loopAttempts = 0;
        const maxLoopAttempts = 4;
        let assistantResponseContent = "";

        while (loopAttempts < maxLoopAttempts) {
            loopAttempts++;
            console.log(`[AI_ASSISTANT] Groq API Request loop ${loopAttempts}...`);

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: messages,
                    tools: assistantTools,
                    tool_choice: "auto",
                    temperature: 0.1, // low temperature for precise tool calls and factual responses
                    max_tokens: 2000
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Groq API returned HTTP ${response.status}: ${errText}`);
            }

            const data = await response.json();
            const choice = data.choices[0];
            const message = choice.message;

            // Log tool_calls if any
            if (message.tool_calls && message.tool_calls.length > 0) {
                console.log(`[AI_ASSISTANT] Model requested tool call:`, message.tool_calls);
                
                // Add the assistant's request for tool calls to the context
                messages.push(message);

                for (const toolCall of message.tool_calls) {
                    const toolName = toolCall.function.name;
                    let toolArgs = {};
                    try {
                        toolArgs = JSON.parse(toolCall.function.arguments);
                    } catch (e) {
                        console.warn("[AI_ASSISTANT] Failed to parse tool arguments:", toolCall.function.arguments);
                    }

                    // Log action in toolLogs for frontend timeline display
                    toolLogs.push({
                        id: toolCall.id,
                        tool: toolName,
                        args: toolArgs,
                        timestamp: new Date().toLocaleTimeString()
                    });

                    // Execute tool
                    let toolResult;
                    try {
                        toolResult = await executeTool(toolName, toolArgs);
                    } catch (err) {
                        console.error(`[AI_ASSISTANT] Error running tool ${toolName}:`, err);
                        toolResult = { error: err.message };
                    }

                    // Push the tool execution result back to the LLM context
                    messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        name: toolName,
                        content: JSON.stringify(toolResult)
                    });
                }
                
                // Continue the loop to let the model generate the conversational response based on tool results
                continue;
            }

            // If no tool call, this is the final text response
            assistantResponseContent = message.content;
            break;
        }

        return {
            success: true,
            content: assistantResponseContent || "I was unable to complete the request.",
            toolLogs: toolLogs
        };

    } catch (error) {
        logger.error("AI Assistant Server Action Exception", error);
        return {
            success: false,
            content: `An error occurred while communicating with the AI service: ${error.message}`
        };
    }
}
