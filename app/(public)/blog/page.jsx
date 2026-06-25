import Link from "next/link"
import Image from "next/image"
import { ArrowRight as ArrowRightIcon, FileText as FileTextIcon, Calendar, Clock, ArrowUpRight } from "lucide-react"
import { getBlogs } from "@/backend-actions/actions/blog"

export const dynamic = 'force-dynamic'

// Strip HTML tags and get plain text excerpt
function getExcerpt(htmlContent, maxLength = 160) {
    if (!htmlContent) return ''
    const text = htmlContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

export default async function BlogListingPage() {
    const res = await getBlogs(1, 20)
    const blogs = res.success ? res.blogs : []

    return (
        <div className="bg-[#0f172a] text-white min-h-screen pt-32 pb-36 relative overflow-hidden">
            {/* Background glowing effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#05DF72]/[0.03] rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-20 left-0 w-[600px] h-[600px] bg-[#05DF72]/[0.02] rounded-full blur-[150px] pointer-events-none" />
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">

                {/* Page Header */}
                <div className="mb-24 max-w-3xl space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#05DF72] animate-pulse"></div>
                        <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#05DF72]">Insights Hub</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-light text-white tracking-tight leading-[1.05]">
                        Ideas, News & <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#05DF72] to-[#05DF72]/80">Updates</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 font-normal leading-relaxed max-w-2xl pt-2">
                        Stay informed with the latest insights on e-waste recycling, circular economy trends, and platform innovations shaping Nigeria's green future.
                    </p>
                </div>

                {blogs.length === 0 ? (
                    <div className="text-center py-32 bg-slate-900/40 backdrop-blur-md rounded-[32px] border border-slate-800/80 max-w-4xl mx-auto shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-[#05DF72]/[0.02] to-transparent pointer-events-none" />
                        <div className="w-20 h-20 bg-[#0f172a] rounded-2xl flex items-center justify-center mx-auto text-slate-500 mb-6 shadow-inner border border-slate-800">
                            <FileTextIcon size={40} className="text-[#05DF72]" />
                        </div>
                        <h3 className="text-2xl font-semibold text-white tracking-tight mb-3">No articles published yet</h3>
                        <p className="text-slate-400 max-w-md mx-auto">Our editors are working on new pieces. Check back soon for industry reports and updates!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map(blog => {
                            const excerpt = getExcerpt(blog.content)
                            const dateString = new Date(blog.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                            })

                            return (
                                <Link 
                                    href={`/blog/${blog.slug}`} 
                                    key={blog.id} 
                                    className="group flex flex-col bg-slate-900/40 hover:bg-slate-900/80 backdrop-blur-sm border border-slate-800 hover:border-[#05DF72]/30 rounded-[24px] overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(5,223,114,0.05)] hover:-translate-y-1.5"
                                >
                                    {/* Image Container */}
                                    <div className="relative aspect-[16/10] w-full bg-slate-950 overflow-hidden border-b border-slate-800/50">
                                        {blog.headlineImage ? (
                                            <Image 
                                                src={blog.headlineImage} 
                                                alt={blog.title} 
                                                fill 
                                                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100" 
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
                                                <FileTextIcon size={44} className="text-slate-700 group-hover:text-[#05DF72]/40 transition-colors duration-500" />
                                            </div>
                                        )}

                                        {/* Category Badge */}
                                        <div className="absolute top-4 left-4 z-10">
                                            <span className="bg-slate-950/80 backdrop-blur-md text-white border border-slate-800 text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-lg">
                                                E-Waste
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col flex-1 p-7 md:p-8">
                                        <div className="flex items-center gap-4 text-slate-500 text-xs font-semibold mb-4">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-[#05DF72]/85" />
                                                <span>{dateString}</span>
                                            </div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} />
                                                <span>5 min read</span>
                                            </div>
                                        </div>

                                        <h2 className="text-xl md:text-2xl font-medium text-white leading-snug mb-3 line-clamp-2 group-hover:text-[#05DF72] transition-colors duration-300 tracking-tight">
                                            {blog.title}
                                        </h2>

                                        {excerpt && (
                                            <p className="text-slate-400 font-normal leading-relaxed line-clamp-3 mb-6 text-[15px]">
                                                {excerpt}
                                            </p>
                                        )}

                                        {/* Read More */}
                                        <div className="mt-auto pt-5 border-t border-slate-800/80 flex items-center justify-between">
                                            <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-widest group-hover:text-[#05DF72] transition-colors duration-300">
                                                Read Article
                                                <ArrowRightIcon size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                                            </span>
                                            <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-[#05DF72] group-hover:border-[#05DF72]/30 transition-all duration-300">
                                                <ArrowUpRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
