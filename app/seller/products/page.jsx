'use client'
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { PlusIcon, SearchIcon, Edit3Icon, TrashIcon, BatteryIcon, ImageIcon, XIcon, CalendarIcon, MapPinIcon, BoxIcon, AlertCircleIcon } from "lucide-react"
import { lagosLGAs } from "@/assets/assets"
import toast from "react-hot-toast"
import { useDispatch, useSelector } from "react-redux"
import { showLoader, hideLoader } from "@/lib/features/ui/uiSlice"
import Button from "@/components/Button"
import { createProduct, getSellerProducts, deleteProduct as deleteProductAction } from "@/backend/actions/product"
import { getUserStoreStatus } from "@/backend/actions/auth"
import { CONSTANTS } from "@/lib/mockService"

export default function SellerProducts() {
    const router = useRouter()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [products, setProducts] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [storeInfo, setStoreInfo] = useState({ status: null, isActive: false })

    // Get minimum date (24h from now)
    const getMinDate = () => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow.toISOString().split('T')[0]
    }

    // Form State
    const [formData, setFormData] = useState({
        batteryType: 'Car Battery',
        brand: '',
        amps: '', // New Field
        unitsAvailable: 1,
        price: '',
        isManualPrice: false, // New Field
        lga: '',
        address: '',
        collectionDates: [],
        comments: '',
        images: []
    })

    const [selectedDates, setSelectedDates] = useState([])

    const loadProducts = async () => {
        if (!user) return
        const result = await getSellerProducts(user.id)
        if (result.success) {
            setProducts(result.products)
        }
    }

    // Price calc logic: (Amps * 250) * units
    useEffect(() => {
        if (formData.amps && formData.unitsAvailable && !formData.isManualPrice) {
            const suggestedPerUnit = parseInt(formData.amps) * 250
            const totalSuggested = suggestedPerUnit * parseInt(formData.unitsAvailable)
            setFormData(prev => ({ ...prev, price: totalSuggested.toString() }))
        }
    }, [formData.amps, formData.unitsAvailable, formData.isManualPrice])

    useEffect(() => {
        if (user) {
            loadProducts()
            const checkStatus = async () => {
                const res = await getUserStoreStatus(user.id)
                if (res.success && res.exists) {
                    setStoreInfo({ status: res.status, isActive: res.isActive })
                }
            }
            checkStatus()
        }
    }, [user])

    const deleteProduct = async (id) => {
        if (confirm("Confirm deletion of this listing?")) {
            dispatch(showLoader("Removing listing..."))
            const result = await deleteProductAction(id, user.id)
            dispatch(hideLoader())
            if (result.success) {
                setProducts(products.filter(p => p.id !== id))
                toast.success("Listing removed")
            } else {
                toast.error(result.error)
            }
        }
    }

    const handleDateToggle = (date) => {
        if (selectedDates.includes(date)) {
            setSelectedDates(selectedDates.filter(d => d !== date))
        } else {
            if (selectedDates.length >= 2) {
                toast.error("You can select a maximum of 2 collection dates.")
                return
            }
            setSelectedDates([...selectedDates, date])
        }
    }

    // Generate next 14 days for date picker
    const getAvailableDates = () => {
        const dates = []
        const minDate = new Date()
        minDate.setDate(minDate.getDate() + 1) // Start from tomorrow

        // Limit to 2 options as requested
        for (let i = 0; i < 2; i++) {
            const date = new Date(minDate)
            date.setDate(date.getDate() + i)
            dates.push({
                value: date.toISOString().split('T')[0],
                label: date.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })
            })
        }
        return dates
    }

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files)
        if (files.length + formData.images.length > 5) {
            toast.error("Maximum 5 images allowed")
            return
        }

        files.forEach(file => {
            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, images: [...prev.images, reader.result] }))
            }
            reader.readAsDataURL(file)
        })
    }

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
    }

    const handlePublish = async (e) => {
        e.preventDefault()

        // Validation
        if (!formData.lga) {
            toast.error("Please select a Local Government Area")
            return
        }
        if (!formData.address) {
            toast.error("Pickup address is required")
            return
        }
        if (selectedDates.length === 0) {
            toast.error("Please select at least one collection date")
            return
        }
        if (!formData.price || formData.price < 1) {
            toast.error("Please enter a valid price")
            return
        }

        setIsLoading(true)
        dispatch(showLoader("Publishing listing..."))

        try {
            const result = await createProduct({
                name: `Scrap ${formData.batteryType} (${formData.amps}Ah) - ${formData.lga}`,
                batteryType: formData.batteryType,
                brand: formData.brand || null,
                amps: formData.amps,
                condition: 'SCRAP', // Always SCRAP
                unitsAvailable: parseInt(formData.unitsAvailable),
                price: parseInt(formData.price),
                lga: formData.lga,
                address: formData.address,
                collectionDates: selectedDates.sort(),
                comments: formData.comments,
                images: formData.images.length > 0 ? formData.images : ['/placeholder-battery.jpg']
            }, user.id)

            dispatch(hideLoader())
            setIsLoading(false)

            if (result.success) {
                toast.success("Listing published successfully!")
                setIsUploadModalOpen(false)
                // Refresh products
                loadProducts()

                // Reset form
                setFormData({
                    batteryType: 'Car Battery',
                    brand: '',
                    amps: '',
                    unitsAvailable: 1,
                    price: '',
                    isManualPrice: false,
                    lga: '',
                    address: '',
                    collectionDates: [],
                    comments: '',
                    images: []
                })
                setSelectedDates([])
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            dispatch(hideLoader())
            setIsLoading(false)
            toast.error("Failed to publish listing")
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My <span className="text-[#05DF72]">Inventory</span></h1>
                    <p className="text-slate-500 mt-1">Manage your battery listings and stock levels.</p>
                </div>
                <button
                    disabled={storeInfo.status !== 'approved'}
                    onClick={() => setIsUploadModalOpen(true)}
                    className={`btn-primary ${storeInfo.status !== 'approved' ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                >
                    <PlusIcon size={18} />
                    {storeInfo.status === 'pending' ? 'Verification Pending' :
                        storeInfo.status === 'approved' ? 'List New Battery' : 'Listing Disabled'}
                </button>
            </div>

            {storeInfo.status && storeInfo.status !== 'approved' && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-700 text-sm font-medium">
                    <AlertCircleIcon size={20} className="shrink-0" />
                    <p>Your seller account is currently {storeInfo.status}. Please wait for admin approval before you can list products.</p>
                </div>
            )}

            <div className="card bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full max-w-md">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search listings..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#05DF72] transition-all text-sm"
                        />
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <BatteryIcon className="text-slate-400" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No Listings Yet</h3>
                        <p className="text-slate-500 text-sm mt-2">Start by listing your first battery for sale.</p>
                        <button onClick={() => setIsUploadModalOpen(true)} className="mt-6 btn-primary">
                            <PlusIcon size={18} />
                            Add First Listing
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Product</th>
                                    <th className="px-6 py-4 font-semibold">Location</th>
                                    <th className="px-6 py-4 font-semibold">Price & Units</th>
                                    <th className="px-6 py-4 font-semibold">Collection Dates</th>
                                    <th className="px-6 py-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <BatteryIcon size={20} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900">{product.name}</span>
                                                    <span className="text-xs text-slate-400">{product.batteryType} • {product.amps}Ah • {product.brand || 'No Brand'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <MapPinIcon size={14} className="text-slate-400" />
                                                <span className="text-sm text-slate-600">{product.lga}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 text-sm">₦{product.price?.toLocaleString()}</span>
                                                <span className="text-xs text-slate-400">{product.unitsAvailable} units</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {product.collectionDates?.slice(0, 2).map(date => (
                                                    <span key={date} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                                                        {new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                ))}
                                                {product.collectionDates?.length > 2 && (
                                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                                                        +{product.collectionDates.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-500 transition-colors">
                                                    <Edit3Icon size={18} />
                                                </button>
                                                <button onClick={() => deleteProduct(product.id)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-500 transition-colors">
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

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-slate-900">List New <span className="text-[#05DF72]">Battery</span></h2>
                            <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                                <XIcon size={24} />
                            </button>
                        </div>

                        <form className="p-8 space-y-6" onSubmit={handlePublish}>
                            {/* Battery Specifications Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <BatteryIcon size={16} className="text-[#05DF72]" />
                                    Battery Specifications
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Battery Type *</label>
                                        <select
                                            value={formData.batteryType}
                                            onChange={e => setFormData({ ...formData, batteryType: e.target.value })}
                                            className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium text-sm"
                                            required
                                        >
                                            {CONSTANTS.BATTERY_TYPES.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Brand (Optional)</label>
                                        <input
                                            value={formData.brand}
                                            onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                            placeholder="e.g. Bosch, Luminous"
                                            className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Battery Size (Ah) *</label>
                                        <select
                                            value={formData.amps}
                                            onChange={e => setFormData({ ...formData, amps: e.target.value })}
                                            className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium text-sm"
                                            required
                                        >
                                            <option value="">Select Size</option>
                                            {[45, 60, 75, 100, 150, 200, 220].map(size => (
                                                <option key={size} value={size}>{size} Amps</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Condition</label>
                                        <div className="w-full p-4 bg-slate-100 rounded-2xl font-medium text-sm text-slate-500 cursor-not-allowed">
                                            SCRAP (Default)
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Units Available *</label>
                                        <input
                                            value={formData.unitsAvailable}
                                            onChange={e => setFormData({ ...formData, unitsAvailable: e.target.value })}
                                            type="number"
                                            min="1"
                                            max="100"
                                            required
                                            className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Listing Price (₦) *</label>
                                            {formData.amps && (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, isManualPrice: !prev.isManualPrice }))}
                                                    className="text-[10px] font-bold text-[#05DF72] uppercase tracking-widest hover:underline"
                                                >
                                                    {formData.isManualPrice ? 'Reset to Suggested' : 'Enter My Own Price'}
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <input
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                type="number"
                                                min="1"
                                                placeholder="e.g. 15000"
                                                readOnly={!formData.isManualPrice && formData.amps !== ''}
                                                required
                                                className={`w-full p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium text-sm transition-all ${!formData.isManualPrice && formData.amps !== '' ? 'bg-slate-100/50 text-slate-400 border-none' : 'bg-slate-50 border-none'
                                                    }`}
                                            />
                                            {formData.amps && !formData.isManualPrice && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#05DF72]/10 text-[#05DF72] rounded-full text-[10px] font-bold uppercase">
                                                    Suggested
                                                </div>
                                            )}
                                        </div>
                                        {formData.amps && !formData.isManualPrice && (
                                            <p className="text-[10px] text-slate-400 mt-2 font-medium">
                                                Suggested price: (₦250 × {formData.amps}Ah) × {formData.unitsAvailable} unit{formData.unitsAvailable > 1 ? 's' : ''} = ₦{parseInt(formData.price).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Location Section */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <MapPinIcon size={16} className="text-[#05DF72]" />
                                    Location & Pickup Address
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">State</label>
                                        <div className="w-full p-4 bg-slate-100 rounded-2xl font-medium text-sm text-slate-500 cursor-not-allowed">
                                            Lagos (Fixed)
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Local Government Area *</label>
                                        <select
                                            value={formData.lga}
                                            onChange={e => setFormData({ ...formData, lga: e.target.value })}
                                            className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium text-sm"
                                            required
                                        >
                                            <option value="">Select LGA</option>
                                            {lagosLGAs.map(lga => (
                                                <option key={lga} value={lga}>{lga}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Pickup Address *</label>
                                        <input
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="e.g. 45 Ikeja Industrial Estate, Near LASUTH"
                                            required
                                            className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Collection Dates Section */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <CalendarIcon size={16} className="text-[#05DF72]" />
                                    Available Collection Dates *
                                </h3>
                                <p className="text-xs text-slate-500">Select dates when buyers can pickup (must be 24h+ from now)</p>

                                <div className="flex flex-wrap gap-2">
                                    {getAvailableDates().map(date => (
                                        <button
                                            key={date.value}
                                            type="button"
                                            onClick={() => handleDateToggle(date.value)}
                                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${selectedDates.includes(date.value)
                                                ? 'bg-[#05DF72] text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {date.label}
                                        </button>
                                    ))}
                                </div>
                                {selectedDates.length > 0 && (
                                    <p className="text-xs text-[#05DF72] font-medium">
                                        {selectedDates.length}/2 date(s) selected
                                    </p>
                                )}
                            </div>

                            {/* Media Section */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <ImageIcon size={16} className="text-[#05DF72]" />
                                    Media Upload <span className="text-xs font-normal text-slate-400">({formData.images.length}/5)</span>
                                </h3>

                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                    {formData.images.map((img, index) => (
                                        <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 group">
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                                            >
                                                <XIcon size={14} />
                                            </button>
                                        </div>
                                    ))}

                                    {formData.images.length < 5 && (
                                        <label className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-4 text-center hover:border-[#05DF72]/50 hover:bg-[#05DF72]/5 transition-all cursor-pointer aspect-square">
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                            />
                                            <ImageIcon className="text-slate-300 mb-2" size={24} />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Add Image</span>
                                        </label>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400">Supported: JPG, PNG. Max 5 images.</p>
                            </div>

                            {/* Description Section */}
                            <div className="space-y-2 pt-4 border-t border-slate-100">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Comments / Description</label>
                                <textarea
                                    value={formData.comments}
                                    onChange={e => setFormData({ ...formData, comments: e.target.value })}
                                    placeholder="Any additional details about the batteries..."
                                    rows={3}
                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium text-sm resize-none"
                                />
                            </div>

                            {/* Submit */}
                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <Button
                                    type="submit"
                                    loading={isLoading}
                                    loadingText="Publishing..."
                                    className="flex-1"
                                >
                                    Publish Listing
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
