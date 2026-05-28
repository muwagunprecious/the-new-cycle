import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getBlogBySlug } from "@/backend-actions/actions/blog"
import prisma from "@/backend-actions/lib/prisma"

// Generate static params for existing blogs (optional optimization)
export async function generateStaticParams() {
    try {
        const blogs = await prisma.blog.findMany({
            where: { status: { equals: 'published', mode: 'insensitive' } },
            select: { slug: true }
        })
        return blogs.map(blog => ({ slug: blog.slug }))
    } catch (error) {
        console.warn("Failed to fetch blogs during build. The Blog table might not exist yet:", error.message)
        return []
    }
}

export const dynamic = 'force-dynamic'

export default async function BlogReadingPage({ params }) {
    const { slug } = await params
    
    const res = await getBlogBySlug(slug)
    const blog = res.success ? res.data : null

    if (!blog) {
        notFound()
    }

    return (
        <article className="bg-[#F4F5F7] min-h-screen">
            {/* Header: Blue background, rounded bottom, left-aligned text */}
            <div className="bg-[#E5ECF6] pt-36 pb-24 rounded-b-[40px] mb-16">
                <div className="max-container text-left">
                    <h1 className="text-5xl md:text-[64px] font-bold text-slate-900 leading-[1.1] tracking-[-0.02em] mb-6 break-words max-w-5xl">
                        {blog.title}
                    </h1>
                    <p className="text-[18px] text-slate-600 font-semibold">
                        Updated on {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Headline Image (if any, placed below header) */}
            {blog.headlineImage && (
                <div className="max-w-[1000px] mx-auto px-6 mb-16">
                    <div className="aspect-[21/9] w-full rounded-2xl overflow-hidden bg-slate-100 relative shadow-xl">
                        <Image 
                            src={blog.headlineImage} 
                            alt={blog.title} 
                            fill
                            className="object-cover" 
                        />
                    </div>
                </div>
            )}

            {/* Content Container: Full width, left-to-right aligned */}
            <div className="max-container pb-32">
                <div className="prose text-[22px] md:text-[28px] prose-slate break-words prose-img:rounded-2xl prose-img:shadow-lg prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800 prose-p:leading-[1.9] prose-p:text-slate-900 prose-p:mb-14 max-w-none text-left font-medium">
                    {blog.content.split('\n').map((line, index) => {
                        if (!line.trim()) return null;
                        
                        // If this specific line contains HTML (like an inserted image or strong tags), render as HTML
                        if (/<[a-z][\s\S]*>/i.test(line)) {
                            return <div key={index} dangerouslySetInnerHTML={{ __html: line }} className="my-8" />;
                        }
                        
                        // Otherwise, it's plain text — wrap in <p> so spacing and size apply correctly
                        return <p key={index}>{line}</p>;
                    })}
                </div>
            </div>
        </article>
    )
}
