'use server'

import prisma from "@/backend-actions/lib/prisma"
import { ApiResponse } from "@/backend-actions/lib/api-response"
import { revalidatePath } from "next/cache"
import { logger } from "@/backend-actions/lib/api-utils"

// Helper to create a slug from title
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Date.now()
}

export async function createBlog(data, userId) {
    try {
        const { authorize } = await import("../lib/api-middleware")
        const auth = await authorize(null, ['ADMIN', 'SUPER_ADMIN'])
        
        if (!auth.success) {
            return ApiResponse.unauthorized(auth.error || "Only admins can create blogs.")
        }

        if (!data.title || !data.content) {
            return ApiResponse.error("Title and content are required.")
        }

        let slug = generateSlug(data.title)
        
        // Ensure slug uniqueness
        let existingBlog = await prisma.blog.findUnique({ where: { slug } })
        while (existingBlog) {
            slug = generateSlug(data.title) + '-' + Math.floor(Math.random() * 1000)
            existingBlog = await prisma.blog.findUnique({ where: { slug } })
        }

        const blog = await prisma.blog.create({
            data: {
                title: data.title,
                slug,
                headlineImage: data.headlineImage || null,
                content: data.content,
                authorId: userId,
                status: data.status || 'published'
            }
        })

        revalidatePath('/blog')
        revalidatePath('/admin/blogs')

        return ApiResponse.success(blog, "Blog published successfully")
    } catch (error) {
        logger.error("Create Blog Error", error)
        return ApiResponse.error("Failed to publish blog")
    }
}

export async function getBlogs(page = 1, limit = 20) {
    try {
        const skip = (page - 1) * limit
        const [blogs, totalCount] = await Promise.all([
            prisma.blog.findMany({
                where: { status: 'published' },
                include: {
                    user: { select: { name: true, image: true, role: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.blog.count({ where: { status: 'published' } })
        ])

        return ApiResponse.success({
            blogs,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        })
    } catch (error) {
        logger.error("Get Blogs Error", error)
        return ApiResponse.error("Failed to fetch blogs")
    }
}

export async function getBlogBySlug(slug) {
    try {
        const blog = await prisma.blog.findUnique({
            where: { slug, status: 'published' },
            include: { user: { select: { name: true, image: true } } }
        })

        if (!blog) {
            return ApiResponse.error("Blog not found", 404)
        }

        return ApiResponse.success(blog)
    } catch (error) {
        logger.error("Get Blog by slug Error", error)
        return ApiResponse.error("Failed to fetch blog")
    }
}

export async function adminGetBlogs(page = 1, limit = 20, userId) {
    try {
        const { authorize } = await import("../lib/api-middleware")
        const auth = await authorize(null, ['ADMIN', 'SUPER_ADMIN'])
        
        if (!auth.success) return ApiResponse.unauthorized(auth.error)

        const skip = (page - 1) * limit
        const [blogs, total] = await Promise.all([
            prisma.blog.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true } } }
            }),
            prisma.blog.count()
        ])

        return ApiResponse.success({
            blogs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        logger.error("Admin Get Blogs Error", error)
        return ApiResponse.error("Failed to fetch admin blogs")
    }
}

export async function deleteBlog(id, userId) {
    try {
        const { authorize } = await import("../lib/api-middleware")
        const auth = await authorize(null, ['ADMIN', 'SUPER_ADMIN'])
        
        if (!auth.success) return ApiResponse.unauthorized(auth.error)

        await prisma.blog.delete({ where: { id } })

        revalidatePath('/blog')
        revalidatePath('/admin/blogs')
        return ApiResponse.success(null, "Blog deleted successfully")
    } catch (error) {
        logger.error("Delete Blog Error", error)
        return ApiResponse.error("Failed to delete blog")
    }
}
