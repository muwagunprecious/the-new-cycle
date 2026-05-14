import Link from "next/link"
import Image from "next/image"
import { ArrowRight as ArrowRightIcon, FileText as FileTextIcon } from "lucide-react"
import { getBlogs } from "@/backend-actions/actions/blog"

export const revalidate = 60

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
        <div className="bg-white min-h-screen pt-24 pb-32">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">

                {/* Page Header */}
                <div className="mb-20 max-w-3xl space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#00D166]"></div>
                        <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#00D166]">Blog</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-medium text-slate-900 tracking-[-0.02em] leading-[1.1]">
                        Insights & <span className="text-[#00D166]">Resources</span>
                    </h1>
                    <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-2xl pt-4">
                        News, updates, and articles on e-waste recycling, circular economy trends, and platform developments.
                    </p>
                </div>

                {blogs.length === 0 ? (
                    <div className="text-center py-32 bg-[#F4F6F8] rounded-[40px] border border-slate-100 max-w-4xl mx-auto">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto text-slate-300 mb-6 shadow-sm">
                            <FileTextIcon size={40} />
                        </div>
                        <h3 className="text-3xl font-medium text-slate-900 tracking-[-0.01em] mb-4">No articles yet</h3>
                        <p className="text-slate-500 font-medium text-lg">Check back later for insights and news!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map(blog => {
                            const excerpt = getExcerpt(blog.content)

                            return (
                                <Link 
                                    href={`/blog/${blog.slug}`} 
                                    key={blog.id} 
                                    className="group flex flex-col bg-white border border-slate-100 rounded-[32px] overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                                >
                                    {/* Image Container */}
                                    <div className="relative aspect-[16/10] w-full bg-[#F4F6F8] overflow-hidden">
                                        {blog.headlineImage ? (
                                            <Image 
                                                src={blog.headlineImage} 
                                                alt={blog.title} 
                                                fill 
                                                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <FileTextIcon size={40} className="text-slate-300" />
                                            </div>
                                        )}

                                        {/* Category Badge */}
                                        <div className="absolute top-4 left-4 z-10">
                                            <span className="bg-white/90 backdrop-blur-sm text-slate-900 text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-sm">
                                                E-Waste
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col flex-1 p-8">
                                        <p className="text-[12px] font-bold text-[#00D166] uppercase tracking-widest mb-4">
                                            {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>

                                        <h2 className="text-2xl font-medium text-slate-900 leading-snug mb-4 line-clamp-2 group-hover:text-[#00D166] transition-colors tracking-[-0.01em]">
                                            {blog.title}
                                        </h2>

                                        {excerpt && (
                                            <p className="text-slate-600 font-medium leading-relaxed line-clamp-3 mb-8">
                                                {excerpt}
                                            </p>
                                        )}

                                        {/* Read More */}
                                        <div className="mt-auto pt-6 border-t border-slate-100">
                                            <span className="inline-flex items-center gap-2 text-[14px] font-bold text-slate-900 uppercase tracking-widest group-hover:text-[#00D166] transition-colors">
                                                Read article
                                                <ArrowRightIcon size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                                            </span>
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
