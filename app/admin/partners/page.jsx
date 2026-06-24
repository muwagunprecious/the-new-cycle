'use client'

import { useState, useEffect } from "react"
import { Plus as PlusIcon, Trash as TrashIcon, Edit3 as Edit3Icon, Image as ImageIcon, ExternalLink as ExternalLinkIcon, Save as SaveIcon, X as XIcon, Loader2 as Loader2Icon, CheckCircle as CheckCircleIcon } from "lucide-react"
import toast from "react-hot-toast"
import { useDispatch } from "react-redux"
import { showLoader, hideLoader } from "@/lib/features/ui/uiSlice"
import Button from "@/components/Button"
import { getAllPartnersAdmin, createPartner, updatePartner, deletePartner } from "@/backend-actions/actions/partners"

export default function AdminPartnersPage() {
    const dispatch = useDispatch()
    const [partners, setPartners] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPartner, setEditingPartner] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [formData, setFormData] = useState({
        name: '',
        logo: '',
        link: '',
        order: 0,
        isActive: true
    })

    useEffect(() => {
        loadPartners()
    }, [])

    const loadPartners = async () => {
        setIsLoading(true)
        const res = await getAllPartnersAdmin()
        if (res.success) {
            setPartners(res.data)
        } else {
            toast.error(res.message || "Failed to load partners")
        }
        setIsLoading(false)
    }

    const handleOpenModal = (partner = null) => {
        if (partner) {
            setEditingPartner(partner)
            setFormData({
                name: partner.name,
                logo: partner.logo,
                link: partner.link || '',
                order: partner.order || 0,
                isActive: partner.isActive
            })
        } else {
            setEditingPartner(null)
            setFormData({
                name: '',
                logo: '',
                link: '',
                order: partners.length,
                isActive: true
            })
        }
        setIsModalOpen(true)
    }

    const handleLogoUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (file.size > 1024 * 1024) {
            return toast.error("Logo file is too large. Max 1MB.")
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, logo: reader.result }))
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.name || !formData.logo) {
            return toast.error("Name and logo are required")
        }

        dispatch(showLoader(editingPartner ? "Updating partner..." : "Adding partner..."))
        
        const res = editingPartner 
            ? await updatePartner(editingPartner.id, formData)
            : await createPartner(formData)

        dispatch(hideLoader())
        
        if (res.success) {
            toast.success(res.message)
            setIsModalOpen(false)
            loadPartners()
        } else {
            toast.error(res.message)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to remove this partner?")) return

        dispatch(showLoader("Removing partner..."))
        const res = await deletePartner(id)
        dispatch(hideLoader())

        if (res.success) {
            toast.success(res.message)
            loadPartners()
        } else {
            toast.error(res.message)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manage <span className="text-[#05DF72]">Partners</span></h1>
                    <p className="text-slate-500 mt-1">Upload and manage partner logos displayed in the website footer.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn-primary"
                >
                    <PlusIcon size={18} />
                    Add New Partner
                </button>
            </div>

            <div className="card bg-white rounded-sm overflow-hidden border border-slate-200 shadow-sm">
                {isLoading ? (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                        <Loader2Icon className="animate-spin text-[#05DF72]" size={40} />
                        <p className="text-slate-500 font-medium">Loading partners...</p>
                    </div>
                    ) : partners.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-sm flex items-center justify-center mx-auto mb-6 text-slate-300 border border-slate-200">
                            <ImageIcon size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No Partners Yet</h3>
                        <p className="text-slate-500 mt-2 max-w-sm mx-auto">Start by adding your first partner logo to display in the website footer.</p>
                        <button onClick={() => handleOpenModal()} className="mt-8 btn-primary mx-auto">
                            Add First Partner
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                                <tr>
                                    <th className="px-8 py-5">Logo</th>
                                    <th className="px-8 py-5">Partner Name</th>
                                    <th className="px-8 py-5">Display Order</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {partners.map((partner) => (
                                    <tr key={partner.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="w-20 h-12 bg-slate-50 rounded-sm border border-slate-200 p-2 flex items-center justify-center overflow-hidden">
                                                <img src={partner.logo} alt={partner.name} className="max-w-full max-h-full object-contain" />
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">{partner.name}</span>
                                                {partner.link && (
                                                    <a href={partner.link} target="_blank" className="text-xs text-[#05DF72] flex items-center gap-1 hover:underline">
                                                        {partner.link} <ExternalLinkIcon size={10} />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-medium text-slate-600">
                                            {partner.order}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${partner.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                {partner.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => handleOpenModal(partner)} className="p-2 bg-slate-50 text-slate-400 hover:text-[#05DF72] hover:bg-[#05DF72]/5 rounded-sm transition-all border border-slate-200">
                                                    <Edit3Icon size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(partner.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-sm transition-all border border-slate-200">
                                                    <TrashIcon size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Partner Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-sm shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-200">
                        <div className="p-8 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">{editingPartner ? 'Edit' : 'Add'} <span className="text-[#05DF72]">Partner</span></h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-sm transition-colors text-slate-400 border border-slate-200">
                                <XIcon size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Partner Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Lagos State Government"
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-sm outline-none focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72] font-medium text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Partner Logo *</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 h-24 bg-slate-50 rounded-sm border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                                            {formData.logo ? (
                                                <>
                                                    <img src={formData.logo} alt="Preview" className="w-full h-full object-contain p-2" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <span className="text-white text-[10px] font-bold uppercase">Change</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <ImageIcon className="text-slate-300" size={32} />
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={handleLogoUpload}
                                                required={!editingPartner}
                                            />
                                        </div>
                                        <div className="flex-1 text-xs text-slate-500">
                                            <p className="font-bold text-slate-900 mb-1">Upload PNG or JPG</p>
                                            <p>Recommended size: 300x150px (Transparent background looks best in footer)</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Website Link (Optional)</label>
                                    <input
                                        type="url"
                                        value={formData.link}
                                        onChange={e => setFormData({ ...formData, link: e.target.value })}
                                        placeholder="https://partner-website.com"
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-sm outline-none focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72] font-medium text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Display Order</label>
                                        <input
                                            type="number"
                                            value={formData.order}
                                            onChange={e => setFormData({ ...formData, order: e.target.value })}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-sm outline-none focus:border-[#05DF72] focus:ring-1 focus:ring-[#05DF72] font-medium text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
                                        <div className="flex items-center h-[52px]">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isActive}
                                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#05DF72]"></div>
                                                <span className="ml-3 text-sm font-medium text-slate-600">{formData.isActive ? 'Active' : 'Inactive'}</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                >
                                    <SaveIcon size={18} />
                                    {editingPartner ? 'Save Changes' : 'Add Partner'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
