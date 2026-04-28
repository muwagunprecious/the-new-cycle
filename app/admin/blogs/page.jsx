'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { FileText as FileTextIcon, Plus as PlusIcon, Trash as TrashIcon, Eye as EyeIcon } from "lucide-react"
import { adminGetBlogs, deleteBlog } from "@/backend-actions/actions/blog"
import toast from "react-hot-toast"
import { showLoader, hideLoader } from "@/lib/features/ui/uiSlice"

export default function AdminBlogsPage() {
    const router = useRouter()
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)

    const [blogs, setBlogs] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })

    const loadBlogs = async (page = 1) => {
        if (!user?.id) return
        setIsLoading(true)
        const res = await adminGetBlogs(page, 20, user.id)
        if (res.success) {
            setBlogs(res.blogs)
            setPagination(res.pagination)
        } else {
            toast.error(res.error || "Failed to load blogs")
        }
        setIsLoading(false)
    }

    useEffect(() => {
        if (user) loadBlogs()
    }, [user])

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this article? This action cannot be undone.")) {
            dispatch(showLoader("Deleting article..."))
            const res = await deleteBlog(id, user.id)
            dispatch(hideLoader())
            if (res.success) {
                toast.success("Blog deleted successfully")
                loadBlogs(pagination.page)
            } else {
                toast.error(res.error)
            }
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manage <span className="text-[#05DF72]">Blogs</span></h1>
                    <p className="text-slate-500 mt-1">Publish news, insights, and updates directly to the platform.</p>
                </div>
                <button
                    onClick={() => {
                        dispatch(showLoader("Loading editor..."))
                        setTimeout(() => router.push('/admin/blogs/create'), 300)
                    }}
                    className="btn-primary"
                >
                    <PlusIcon size={18} />
                    Create New Article
                </button>
            </div>

            <div className="card bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-400">Loading articles...</div>
                ) : blogs.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FileTextIcon className="text-slate-400" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No Articles Found</h3>
                        <p className="text-slate-500 text-sm mt-2">Get started by creating your first blog post.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Article</th>
                                    <th className="px-6 py-4 font-semibold">Author</th>
                                    <th className="px-6 py-4 font-semibold">Published</th>
                                    <th className="px-6 py-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {blogs.map((blog) => (
                                    <tr key={blog.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                                    {blog.headlineImage ? (
                                                        <img src={blog.headlineImage} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FileTextIcon size={20} className="text-slate-300" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 line-clamp-1">{blog.title}</span>
                                                    <span className="text-xs text-slate-400 font-mono mt-0.5">{blog.slug}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-slate-700">{blog.user?.name || "Unknown Admin"}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-700">{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                <span className={`text-[10px] uppercase font-black tracking-widest ${blog.status === 'published' ? 'text-emerald-500' : 'text-slate-400'}`}>{blog.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => window.open(`/blog/${blog.slug}`, '_blank')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-500 transition-colors" title="View Public Article">
                                                    <EyeIcon size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(blog.id)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-500 transition-colors" title="Delete Article">
                                                    <TrashIcon size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between p-6 border-t border-slate-100">
                                <button 
                                    disabled={pagination.page <= 1} 
                                    onClick={() => loadBlogs(pagination.page - 1)}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="text-sm font-medium text-slate-500">Page {pagination.page} of {pagination.totalPages}</span>
                                <button 
                                    disabled={pagination.page >= pagination.totalPages} 
                                    onClick={() => loadBlogs(pagination.page + 1)}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
