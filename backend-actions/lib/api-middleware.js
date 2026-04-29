import { ApiResponse } from "./api-response";
import { logger } from "./api-utils";
import prisma from "./prisma";
import { verifyToken } from "./jwt";

import { cookies, headers } from "next/headers";

/**
 * Zero Trust Authorization Wrapper
 * 1. Verifies JWT authenticity
 * 2. Fetches current state from DB
 * 3. Cross-checks roles to prevent privilege escalation
 */
export async function authorize(token = null, allowedRoles = []) {
    const headerList = await headers();
    const cookieStore = await cookies();
    const ip = headerList.get('x-forwarded-for') || 'unknown';
    
    // Auto-extract token from cookies if not provided
    const authToken = token || cookieStore.get("gocycle_auth_token")?.value;

    if (!authToken) {
        logger.warn("Security: Authorization failed - No token provided", { ip });
        return { success: false, error: "Unauthorized", status: 401 };
    }

    try {
        // 1. Verify JWT
        const decoded = verifyToken(authToken);
        if (!decoded || !decoded.userId) {
            logger.error("Security: Invalid or expired token", { ip });
            return { success: false, error: "Session expired. Please log in again.", status: 401 };
        }

        const { userId, role: jwtRole } = decoded;

        // 2. Fetch User from DB (Single Source of Truth)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, status: true }
        });

        if (!user) {
            logger.error(`Security Incident: User ${userId} in token not found in DB`, { ip });
            return { success: false, error: "User not found", status: 404 };
        }

        // 3. ROLE CROSS-CHECK (CRITICAL FIX)
        if (user.role !== jwtRole) {
            logger.error(`SECURITY ALERT: Role mismatch for ${userId}`, {
                jwtRole,
                dbRole: user.role,
                ip,
                incident: "POTENTIAL_PRIVILEGE_ESCALATION"
            });
            // Force logout by returning 401
            return { success: false, error: "Security violation: Role mismatch", status: 401 };
        }

        if (user.status === 'banned') {
            logger.warn(`Access Denied: User ${userId} is banned`, { ip });
            return { success: false, error: "Account suspended", status: 403 };
        }

        // 4. RBAC Check
        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
            logger.error(`Access Denied: Insufficient privileges for ${userId}`, { 
                required: allowedRoles, 
                actual: user.role,
                ip
            });
            return { success: false, error: "Forbidden: Insufficient privileges", status: 403 };
        }

        return { success: true, user };
    } catch (error) {
        logger.error("Internal Authorization Error", { error: error.message, stack: error.stack });
        return { success: false, error: "Authorization failed", status: 500 };
    }
}
