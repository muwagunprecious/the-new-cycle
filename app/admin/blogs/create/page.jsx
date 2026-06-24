'use client'

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { FileText as FileTextIcon, Image as ImageIcon, ArrowLeft as ArrowLeftIcon, Save as SaveIcon } from "lucide-react"
import { createBlog } from "@/backend-actions/actions/blog"
import toast from "react-hot-toast"
import { showLoader, hideLoader } from "@/lib/features/ui/uiSlice"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default function CreateBlogPage() {
    const router = useRouter()
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const contentRef = useRef(null)

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        headlineImage: ''
    })

    const handleHeadlineImage = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > MAX_FILE_SIZE) {
            toast.error(`Image is too large. Max size is 5MB.`)
            return
        }
        const reader = new FileReader()
        reader.onloadend = () => setFormData(prev => ({ ...prev, headlineImage: reader.result }))
        reader.readAsDataURL(file)
    }

    const handleBodyImage = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > MAX_FILE_SIZE) {
            toast.error(`Image is too large. Max size is 5MB.`)
            return
        }
        
        const reader = new FileReader()
        reader.onloadend = () => {
            const base64 = reader.result
            const imgHtml = `<br><img src="${base64}" alt="Article Image" class="article-image" /><br>`
            
            // Insert at current cursor position or append
            const textarea = contentRef.current
            if (textarea) {
                const start = textarea.selectionStart
                const end = textarea.selectionEnd
                const newContent = formData.content.substring(0, start) + imgHtml + formData.content.substring(end)
                setFormData(prev => ({ ...prev, content: newContent }))
            } else {
                setFormData(prev => ({ ...prev, content: prev.content + imgHtml }))
            }
            toast.success("Image inserted into body")
        }
        reader.readAsDataURL(file)
    }

    const handlePublish = async (e) => {
        e.preventDefault()

        if (!formData.title.trim() || !formData.content.trim()) {
            toast.error("Please provide both a title and article content")
            return
        }

        dispatch(showLoader("Publishing Article..."))
        
        // Timeout warning
        const timeoutId = setTimeout(() => {
            toast("Still saving... Large images may take a moment to compress & upload.", { icon: '⏳', duration: 5000 })
        }, 8000)

        const res = await createBlog(formData, user?.id)
        
        clearTimeout(timeoutId)
        dispatch(hideLoader())

        if (res.success) {
            toast.success("Article Published Successfully!")
            router.push('/admin/blogs')
        } else {
            toast.error(res.error || "Failed to publish article")
        }
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => router.push('/admin/blogs')} 
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-sm transition-colors border border-slate-200"
                >
                    <ArrowLeftIcon size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Create <span className="text-[#05DF72]">Article</span></h1>
                    <p className="text-slate-500 text-sm mt-1">Write your content and embed images directly.</p>
                </div>
            </div>

            <form onSubmit={handlePublish} className="space-y-6 bg-white p-8 rounded-sm shadow-sm border border-slate-200">
                
                {/* Headline Image */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Headline Banner Image</label>
                    <div className="relative group cursor-pointer border-2 border-dashed border-slate-200 hover:border-[#05DF72] rounded-sm overflow-hidden transition-colors h-48 bg-slate-50 flex items-center justify-center">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleHeadlineImage}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        {formData.headlineImage ? (
                            <img src={formData.headlineImage} alt="Headline" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center text-slate-400 group-hover:text-[#05DF72] transition-colors">
                                <ImageIcon size={32} className="mx-auto mb-2" />
                                <span className="text-sm font-semibold">Click to upload banner</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Article Title *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Navigating Nigeria's E-Waste Challenges"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-sm outline-none focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72] font-medium text-lg"
                        required
                    />
                </div>

                {/* Content Editor */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Body Content (HTML/Markdown supported) *</label>
                        <div className="relative overflow-hidden cursor-pointer">
                            <button type="button" className="text-xs font-bold text-[#05DF72] hover:bg-[#05DF72]/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
                                <ImageIcon size={14} /> Insert Image Here
                            </button>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleBodyImage}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                title="Insert Image into body text"
                            />
                        </div>
                    </div>
                    <textarea
                        ref={contentRef}
                        value={formData.content}
                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                        placeholder="<p>Write your article here...</p>"
                        className="w-full p-5 text-sm bg-slate-50 border border-slate-200 rounded-sm outline-none focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72] min-h-[350px] font-mono leading-relaxed"
                        required
                    ></textarea>
                    <p className="text-[10px] text-slate-400 text-right">You can use standard HTML tags perfectly.</p>
                </div>

                {/* Action */}
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button type="submit" className="btn-primary w-full md:w-auto px-10">
                        <SaveIcon size={18} /> Publish Article
                    </button>
                </div>
            </form>
        </div>
    )
}
