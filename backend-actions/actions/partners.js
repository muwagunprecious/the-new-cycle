'use server'

import { ApiResponse, handleDbError } from "@/backend-actions/lib/api-response"
import { logger } from "@/backend-actions/lib/api-utils"
import prisma from "@/backend-actions/lib/prisma"
import { revalidatePath } from "next/cache"
import { cache } from "react"

// Cache the database query to prevent duplicate requests across components
const fetchPartnersCached = cache(async () => {
    return prisma.partner.findMany({
        where: { isActive: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        take: 20
    })
});

export async function getPartners() {
    try {
        const partners = await fetchPartnersCached();
        return ApiResponse.success(partners);
    } catch (error) {
        logger.error("Get Partners Error", error);
        return ApiResponse.error("Failed to fetch partners");
    }
}

const fetchAllPartnersAdminCached = cache(async () => {
    return prisma.partner.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100
    })
});

export async function getAllPartnersAdmin() {
    try {
        const partners = await fetchAllPartnersAdminCached();
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
        await prisma.partner.delete({ where: { id } });

        revalidatePath('/');
        return ApiResponse.success(null, "Partner deleted successfully");
    } catch (error) {
        logger.error("Delete Partner Error", error);
        return ApiResponse.error("Failed to delete partner");
    }
}
