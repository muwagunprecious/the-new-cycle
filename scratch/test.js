const ApiResponse = {
    success: (data = null, message = "Success") => {
        const response = {
            success: true,
            data,
            message,
            error: null,
        }
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            const { data: dataProp, ...others } = data
            if (dataProp !== undefined) {
                return { ...response, data: dataProp, ...others }
            }
            return { ...response, ...data }
        }
        return response
    }
}

const user = { id: 1, role: 'ADMIN' }
const token = '123'

const result1 = ApiResponse.success({ user, token })
console.log("TEST 1 - Data object payload:", result1.user?.id) // Expect 1

const result2 = ApiResponse.success({ data: { user, token } })
console.log("TEST 2 - Nested data payload:", result2.user?.id) // Expect undefined, but data.user.id is 1
console.log("TEST 2 - Nested data.user.id:", result2.data?.user?.id)
