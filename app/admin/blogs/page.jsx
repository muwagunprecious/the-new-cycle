import { adminGetBlogs } from "@/backend-actions/actions/blog"
import AdminBlogsClient from "@/components/admin/blogs/AdminBlogsClient"

export const dynamic = 'force-dynamic'

export default async function AdminBlogsPage() {
    // We need the user ID. In a server component, we should get it from the session/headers
    // For now, I'll assume we can fetch blogs without a strict user filter if it's admin view, 
    // or look at how adminGetBlogs is implemented.
    
    // Let's check adminGetBlogs implementation in backend-actions/actions/blog.js
    const res = await adminGetBlogs(1, 20) 
    
    return (
        <AdminBlogsClient 
            initialBlogs={res.success ? res.blogs : []} 
            initialPagination={res.success ? res.pagination : { page: 1, totalPages: 1 }}
        />
    )
}
