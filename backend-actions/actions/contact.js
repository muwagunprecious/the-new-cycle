'use server'

import prisma from "../lib/prisma"

export async function submitContactMessage(data) {
    try {
        const { firstName, lastName, email, organization, phone, message } = data;

        if (!firstName || !lastName || !email || !phone || !message) {
            return { success: false, message: "Please fill in all required fields." };
        }

        const newMessage = await prisma.contactMessage.create({
            data: {
                firstName,
                lastName,
                email,
                organization,
                phone,
                message,
            }
        });

        return { success: true, message: "Your message has been sent successfully!", data: newMessage };
    } catch (error) {
        console.error("Error submitting contact message:", error);
        return { success: false, message: "Failed to send message. Please try again." };
    }
}

export async function getContactMessages() {
    try {
        const messages = await prisma.contactMessage.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        return { success: true, data: messages };
    } catch (error) {
        console.error("Error fetching contact messages:", error);
        return { success: false, message: "Failed to load messages." };
    }
}

export async function markMessageAsRead(id) {
    try {
        await prisma.contactMessage.update({
            where: { id },
            data: { status: "read" }
        });
        return { success: true };
    } catch (error) {
        console.error("Error marking message as read:", error);
        return { success: false };
    }
}
