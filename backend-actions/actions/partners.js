'use server'

import { ApiResponse, handleDbError } from "@/backend-actions/lib/api-response"
import { logger } from "@/backend-actions/lib/api-utils"
import prisma, { withRetry } from "@/backend-actions/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getPartners() {
    try {
        const partners = await prisma.partner.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        });
        return ApiResponse.success(partners);
    } catch (error) {
        logger.error("Get Partners Error", error);
        return ApiResponse.error("Failed to fetch partners");
    }
}

export async function getAllPartnersAdmin() {
    try {
        const partners = await prisma.partner.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return ApiResponse.success(partners);
    } catch (error) {
        logger.error("Get All Partners Admin Error", error);
        return ApiResponse.error("Failed to fetch partners for admin");
    }
}

export async function createPartner(data) {
    try {
        if (!data.name || !data.logo) {
            return ApiResponse.error("Name and logo are required", 400);
        }

        const partner = await prisma.partner.create({
            data: {
                name: data.name,
                logo: data.logo,
                link: data.link || null,
                order: parseInt(data.order) || 0,
                isActive: data.isActive !== undefined ? data.isActive : true
            }
        });

        revalidatePath('/');
        return ApiResponse.success(partner, "Partner added successfully");
    } catch (error) {
        logger.error("Create Partner Error", error);
        return handleDbError(error, "createPartner");
    }
}

export async function updatePartner(id, data) {
    try {
        const partner = await prisma.partner.update({
            where: { id },
            data: {
                name: data.name,
                logo: data.logo,
                link: data.link,
                order: parseInt(data.order),
                isActive: data.isActive
            }
        });

        revalidatePath('/');
        return ApiResponse.success(partner, "Partner updated successfully");
    } catch (error) {
        logger.error("Update Partner Error", error);
        return handleDbError(error, "updatePartner");
    }
}

export async function deletePartner(id) {
    try {
        await prisma.partner.delete({
            where: { id }
        });

        revalidatePath('/');
        return ApiResponse.success(null, "Partner deleted successfully");
    } catch (error) {
        logger.error("Delete Partner Error", error);
        return ApiResponse.error("Failed to delete partner");
    }
}
