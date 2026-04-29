import { ApiResponse } from "./api-response";
import { logger } from "./api-utils";
import prisma from "./prisma";

/**
 * Strict Role-Based Access Control (RBAC) wrapper for server actions.
 * Ensures the backend is the single source of truth for user roles.
 */
export async function authorize(userId, allowedRoles = []) {
    if (!userId) {
        logger.warn("Authorization failed: No userId provided");
        return { success: false, error: "Unauthorized", status: 401 };
    }

    try {
        // Fetch user directly from DB to ensure freshest role
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, status: true }
        });

        if (!user) {
            logger.error(`Authorization failed: User ${userId} not found in DB`);
            return { success: false, error: "User not found", status: 404 };
        }

        if (user.status === 'banned') {
            logger.warn(`Authorization failed: User ${userId} is banned`);
            return { success: false, error: "Account suspended", status: 403 };
        }

        const userRole = user.role;
        logger.info(`Authorizing user ${userId}`, { role: userRole, allowedRoles });

        if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
            logger.error(`Authorization failed: Role mismatch for ${userId}`, { 
                required: allowedRoles, 
                actual: userRole 
            });
            return { success: false, error: "Forbidden: Insufficient privileges", status: 403 };
        }

        return { success: true, user };
    } catch (error) {
        logger.error("Authorization error", error);
        return { success: false, error: "Authorization process failed", status: 500 };
    }
}
