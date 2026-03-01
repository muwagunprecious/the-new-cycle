/**
 * Standardized API response structure
 */
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
