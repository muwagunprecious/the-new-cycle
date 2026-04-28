import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft as ArrowLeftIcon, Calendar as CalendarIcon, User as UserIcon } from "lucide-react"
import prisma from "@/backend-actions/lib/prisma"

// Generate static params for existing blogs (optional optimization)
export async function generateStaticParams() {
    try {
        const blogs = await prisma.blog.findMany({
            where: { status: 'published' },
            select: { slug: true }
        })
        return blogs.map(blog => ({ slug: blog.slug }))
    } catch (error) {
        console.warn("Failed to fetch blogs during build. The Blog table might not exist yet:", error.message)
        return []
    }
}

// Ensure the page gets dynamically regenerated or is dynamic
export const revalidate = 60

export default async function BlogReadingPage({ params }) {
    const { slug } = await params
    
    // Fetch blog directly here since Server Components run perfectly for SEO & speed
    const blog = await prisma.blog.findUnique({
        where: { slug: slug, status: 'published' },
        include: { user: { select: { name: true } } }
    })

    if (!blog) {
        notFound()
    }

    return (
        <article className="bg-white min-h-screen">
            {/* Minimalist Header */}
            <div className="bg-slate-50 border-b border-slate-100">
                <div className="max-w-[800px] mx-auto px-6 pt-16 pb-12">
                    <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#05DF72] uppercase tracking-widest transition-colors mb-10">
                        <ArrowLeftIcon size={16} /> Back to Insights
                    </Link>
                    
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.2] mb-8">
                        {blog.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 font-semibold">
                        <div className="flex items-center gap-2">
                            <CalendarIcon size={16} className="text-[#05DF72]" />
                            {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2 border-l border-slate-200 pl-6">
                            <UserIcon size={16} className="text-[#05DF72]" />
                            {blog.user?.name || "GoCycle Admin"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Headline Image if exists */}
            {blog.headlineImage && (
                <div className="w-full max-w-[1000px] mx-auto px-6 -mt-8 relative z-10">
                    <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl bg-slate-100 relative">
                        <Image 
                            src={blog.headlineImage} 
                            alt={blog.title} 
                            fill
                            className="object-cover" 
                        />
                    </div>
                </div>
            )}

            {/* Markdown / HTML Content rendered */}
            <div className={`max-w-[800px] mx-auto px-6 ${blog.headlineImage ? 'pt-20' : 'pt-16'} pb-32`}>
                <div 
                    className="prose prose-lg prose-slate prose-img:rounded-2xl prose-img:shadow-lg prose-headings:font-bold prose-a:text-[#05DF72] hover:prose-a:text-emerald-600 prose-p:leading-relaxed max-w-none"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />
            </div>
        </article>
    )
}
