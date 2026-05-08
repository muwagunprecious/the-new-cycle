import Link from "next/link"
import Image from "next/image"
import { Calendar as CalendarIcon, ArrowRight as ArrowRightIcon, FileText as FileTextIcon } from "lucide-react"
import { getBlogs } from "@/backend-actions/actions/blog"

export const revalidate = 60 // Revalidate every 60 seconds

export default async function BlogListingPage() {
    const res = await getBlogs(1, 20)
    const blogs = res.success ? res.blogs : []

    return (
        <div className="bg-slate-50 min-h-screen py-12">
            <div className="max-w-[1200px] mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                        GoCycle <span className="text-[#05DF72]">Insights</span>
                    </h1>
                    <p className="text-slate-500 text-lg">
                        News, updates, and articles on e-waste, recycling logic, and platform developments.
                    </p>
                </div>

                {blogs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100 max-w-3xl mx-auto">
                        <FileTextIcon size={48} className="mx-auto text-slate-200 mb-6" />
                        <h3 className="text-2xl font-bold text-slate-900">No blogs now</h3>
                        <p className="text-slate-500 mt-2">Check back later for insights and news!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map(blog => (
                            <Link href={`/blog/${blog.slug}`} key={blog.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all hover:-translate-y-1 flex flex-col">
                                <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
                                    {blog.headlineImage ? (
                                        <Image src={blog.headlineImage} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-emerald-50 text-[#05DF72]/20">
                                            <FileTextIcon size={64} />
                                        </div>
                                    )}
                                </div>
                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                                        <CalendarIcon size={14} className="text-[#05DF72]" />
                                        {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2 break-words group-hover:text-[#05DF72] transition-colors">{blog.title}</h3>
                                    
                                    <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden text-[#05DF72] flex items-center justify-center font-bold text-[10px]">
                                                {blog.user?.name?.charAt(0) || 'A'}
                                            </div>
                                            <span className="text-xs font-semibold text-slate-500">{blog.user?.name || 'GoCycle Auth'}</span>
                                        </div>
                                        <ArrowRightIcon size={18} className="text-slate-300 group-hover:text-[#05DF72] group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
