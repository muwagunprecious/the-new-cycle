'use server'

import { ApiResponse } from "@/backend-actions/lib/api-response"
import { logger } from "@/backend-actions/lib/api-utils"
import prisma from "@/backend-actions/lib/prisma"

export async function subscribeNewsletter(email) {
    try {
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return ApiResponse.error("Please provide a valid email address.", 400)
        }

        const normalizedEmail = email.toLowerCase().trim()

        const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email: normalizedEmail }
        })

        if (existingSubscriber) {
            return ApiResponse.success(null, "You are already subscribed to our newsletter!")
        }

        await prisma.newsletterSubscriber.create({
            data: { email: normalizedEmail }
        })

        logger.info(`New newsletter subscription: ${normalizedEmail}`)
        return ApiResponse.success(null, "Successfully subscribed to the newsletter!")

    } catch (error) {
        logger.error("Subscribe Newsletter Error:", error)
        return ApiResponse.error("Failed to subscribe. Please try again later.")
    }
}
