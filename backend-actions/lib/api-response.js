import { logToFile } from "./server-logger"

/**
 * Standardized API response structure
 */


/**
 * Centralized Prisma/DB error handler.
 * Returns a safe, user-facing ApiResponse for any DB error.
 */
export function handleDbError(error, context = "") {
    const msg = error?.message || ""
    const code = error?.code || ""

    logToFile(`DB ERROR [${context}]`, { code, message: msg });


    // Connection / reachability errors
    if (
        code === 'P1001' ||
        code === 'P1002' ||
        msg.includes("Can't reach database") ||
        msg.includes("connection") ||
        msg.includes("ECONNREFUSED") ||
        msg.includes("pooler")
    ) {
        return ApiResponse.error("Our service is temporarily unavailable. Please try again in a moment.", 503)
    }

    // Unique constraint
    if (code === 'P2002') {
        const target = error?.meta?.target || []
        if (target.includes('email')) return ApiResponse.error("An account with this email already exists.", 409)
        if (target.includes('phone')) return ApiResponse.error("This phone number is already registered.", 409)
        return ApiResponse.error("An account with these details already exists.", 409)
    }

    // Not found
    if (code === 'P2025') {
        return ApiResponse.error("Record not found.", 404)
    }

    // Timeout / query engine
    if (code === 'P1008' || code === 'P2024') {
        return ApiResponse.error("Request timed out. Please try again.", 504)
    }

    return ApiResponse.error("Something went wrong. Please try again later.", 500)
}

export const ApiResponse = {
    success: (data = null, message = "Success") => {
        const response = {
            success: true,
            data,
            message,
            error: null,
        }
        // Backward compatibility: Spread data if it's a non-array object
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            const { data: dataProp, ...others } = data
            if (dataProp !== undefined) {
                return { ...response, data: dataProp, ...others }
            }
            return { ...response, ...data }
        }
        return response
    },

    error: (errorMessage = "An unexpected error occurred", code = 500) => ({
        success: false,
        data: null,
        error: errorMessage,
        code,
    }),

    validationError: (errors) => ({
        success: false,
        data: null,
        error: "Validation failed",
        validationErrors: errors,
        code: 400,
    }),

    unauthorized: (message = "Unauthorized access") => ({
        success: false,
        data: null,
        error: message,
        code: 401,
    }),
};

