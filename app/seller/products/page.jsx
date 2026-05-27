'use client'
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Plus as PlusIcon, Search as SearchIcon, Edit3 as Edit3Icon, Trash as TrashIcon, Battery as BatteryIcon, Image as ImageIcon, X as XIcon, Calendar as CalendarIcon, MapPin as MapPinIcon, Box as BoxIcon, AlertCircle as AlertCircleIcon, CreditCard as CreditCardIcon, Loader as LoaderIcon, CheckCircle as CheckCircleIcon } from "lucide-react"
import { lagosLGAs } from "@/assets/assets"
import toast from "react-hot-toast"
import { useDispatch, useSelector } from "react-redux"
import { showLoader, hideLoader } from "@/lib/features/ui/uiSlice"
import Button from "@/components/Button"
import ScheduleCalendar from "@/components/ScheduleCalendar"
import { createProduct, updateProduct, getSellerProducts, deleteProduct as deleteProductAction, verifyProductImages } from "@/backend-actions/actions/product"
import { getUserStoreStatus } from "@/backend-actions/actions/auth"
import { updateStoreBankDetails, updateStoreAddress } from "@/backend-actions/actions/seller"
import { getPricingConfig } from "@/backend-actions/actions/settings"
import { DEFAULT_BATTERY_PRICES, BATTERY_SIZE_OPTIONS, BATTERY_TYPES } from "@/lib/pricing"
import { addWatermark } from "@/lib/image-utils"


const NIGERIAN_BANKS = {
    "Access Bank": "044",
    "Citibank": "023",
    "Diamond Bank": "063",
    "Ecobank": "050",
    "Fidelity Bank": "070",
    "First Bank": "011",
    "First City Monument Bank (FCMB)": "214",
    "Guaranty Trust Bank (GTBank)": "058",
    "Heritage Bank": "030",
    "Jaiz Bank": "301",
    "Keystone Bank": "082",
    "Kuda Bank": "090267",
    "Moniepoint MFB": "50515",
    "OPay Digital Bank": "100004",
    "Palmpay": "100033",
    "Polaris Bank": "076",
    "Providus Bank": "101",
    "Stanbic IBTC Bank": "221",
    "Standard Chartered Bank": "068",
    "Sterling Bank": "232",
    "Suntrust Bank": "100",
    "Union Bank": "032",
    "United Bank for Africa (UBA)": "033",
    "Unity Bank": "215",
    "VFD Microfinance Bank": "566",
    "Wema Bank": "035",
    "Zenith Bank": "057"
}

export default function SellerProducts() {
    const router = useRouter()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [showAddressModal, setShowAddressModal] = useState(false)
    const [products, setProducts] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
    const [storeInfo, setStoreInfo] = useState({ status: null, isActive: false })
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [addressMode, setAddressMode] = useState('registered') // 'registered' or 'new'
    const [saveAccount, setSaveAccount] = useState(true)
    const [bankLookupLoading, setBankLookupLoading] = useState(false)
    // Dynamic pricing — loaded from admin settings, falls back to defaults
    const [batteryPrices, setBatteryPrices] = useState(DEFAULT_BATTERY_PRICES)
    const [bankDetails, setBankDetails] = useState({
        bankName: '',
        bankCode: '',
        accountNumber: '',
        accountName: ''
    })
    const [editingProductId, setEditingProductId] = useState(null)

    const lookupAccountName = async (accNum, bankCode) => {
        if (accNum.length !== 10 || !bankCode) return

        // Test Mode Bypass
        if (accNum === "0000000000") {
            setBankDetails(prev => ({ ...prev, accountName: "TEST ACCOUNT (GoCycle)" }))
            toast.success("Test account verified successfully")
            return
        }

        setBankLookupLoading(true)
        try {
            const res = await fetch('/api/verify-bank', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accountNumber: accNum,
                    bankCode: bankCode,
                    firstname: user?.firstName || user?.name?.split(' ')[0] || 'N/A',
                    lastname: user?.lastName || user?.name?.split(' ').slice(1).join(' ') || 'N/A'
                })
            })
            const data = await res.json()
            if (data.success) {
                setBankDetails(prev => ({ ...prev, accountName: data.accountName }))
                toast.success(`Account verified: ${data.accountName}`)
            } else {
                toast.error(data.message || 'Could not resolve account name')
            }
        } catch {
            toast.error('Failed to verify account')
        } finally {
            setBankLookupLoading(false)
        }
    }

    const useRegisteredAddress = () => {
        if (storeInfo.lga && storeInfo.address) {
            setFormData(prev => ({
                ...prev,
                lga: storeInfo.lga,
                address: storeInfo.address
            }))
            setAddressMode('registered')
            toast.success("Profile address applied")
        } else {
            toast.error("No address found in your profile. Please enter one below.")
            setAddressMode('new')
        }
    }

    const [tempAddressData, setTempAddressData] = useState({ lga: '', address: '' })
    const [saveAddressPermanently, setSaveAddressPermanently] = useState(true)

    const handleSaveAddressModal = async (e) => {
        e.preventDefault()
        if (!tempAddressData.lga || !tempAddressData.address) {
            toast.error("Please fill out both LGA and full address")
            return
        }

        // Apply it directly to form data
        setFormData(prev => ({
            ...prev,
            lga: tempAddressData.lga,
            address: tempAddressData.address
        }))

        // Keep it in storeInfo temporarily so they can click "Use Registered Address" again without popup
        setStoreInfo(prev => ({
            ...prev,
            lga: tempAddressData.lga,
            address: tempAddressData.address
        }))

        setShowAddressModal(false)

        if (saveAddressPermanently && user?.id) {
            dispatch(showLoader("Saving address..."))
            const res = await updateStoreAddress(user.id, `${tempAddressData.address}, ${tempAddressData.lga}`)
            dispatch(hideLoader())
            if (res.success) {
                toast.success("Address saved to profile!")
            } else {
                toast.error("Failed to save address permanently, but it was applied to the form")
            }
        } else {
            toast.success("Address applied to form!")
        }
    }

    // Get minimum date (24h from now)
    const getMinDate = () => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow.toISOString().split('T')[0]
    }

    // Form State
    const [formData, setFormData] = useState({
        batteryType: BATTERY_TYPES[0],
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

    const [selectedDates, setSelectedDates] = useState([])

    const loadProducts = async (page = 1) => {
        if (!user) return
        if (page === 1) setIsLoading(true)
        const result = await getSellerProducts(user.id, page, 20);
        if (result.success && result.data) {
            const { products, pagination } = result.data;
            if (page === 1) {
                setProducts(products || []);
            } else {
                setProducts(prev => [...prev, ...(products || [])]);
            }
            setPagination(pagination);
        }
        setIsLoading(false)
    }

    const loadMoreProducts = () => {
        if (pagination.page < pagination.totalPages) {
            loadProducts(pagination.page + 1)
        }
    }

    // Price calc logic: uses admin-configured prices from DB
    useEffect(() => {
        if (formData.batteryType && formData.amps && formData.unitsAvailable && !formData.isManualPrice) {
            const priceList = batteryPrices[formData.batteryType]
            const suggestedPerUnit = priceList ? (priceList[formData.amps] || 0) : 0
            const totalSuggested = suggestedPerUnit * parseInt(formData.unitsAvailable)
            if (totalSuggested > 0) {
                setFormData(prev => ({ ...prev, price: totalSuggested.toString() }))
            }
        }
    }, [formData.batteryType, formData.amps, formData.unitsAvailable, formData.isManualPrice, batteryPrices])

    useEffect(() => {
        if (user) {
            loadProducts(1)
            // Load admin-configured pricing
            getPricingConfig().then(res => {
                if (res.success && res.data) setBatteryPrices(res.data)
            })
            const checkStatus = async () => {
                const res = await getUserStoreStatus(user.id)
                if (res.success && res.exists) {
                    setStoreInfo({
                        status: res.status,
                        isActive: res.isActive,
                        bankName: res.bankName,
                        accountNumber: res.accountNumber,
                        accountName: res.accountName,
                        lga: res.lga,
                        address: res.address
                    })
                    // Pre-fill location from store info
                    if (res.lga || res.address) {
                        setFormData(prev => ({
                            ...prev,
                            lga: res.lga || prev.lga,
                            address: res.address || prev.address,
                        }))
                    }
                }
            }
            checkStatus()
        }
    }, [user?.id])

    // Pre-select tomorrow as default collection date
    useEffect(() => {
        if (isUploadModalOpen && selectedDates.length === 0) {
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            const dateStr = tomorrow.toISOString().split('T')[0]
            setSelectedDates([dateStr])
        }
    }, [isUploadModalOpen])

    const getImageUrl = (image) => {
        if (!image) return '/placeholder-battery.jpg'
        if (typeof image === 'string') {
            if (image === '[object Object]' || image === '') return '/placeholder-battery.jpg'
            return image
        }
        if (typeof image === 'object' && image.src) return image.src
        return '/placeholder-battery.jpg'
    }

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
        // Prevent selecting today's date
        const today = new Date().toISOString().split('T')[0]
        if (date === today) {
            toast.error("You cannot select today's date. Please choose from tomorrow onwards.")
            return
        }
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

    // Generate next 14 days for date picker (starting from tomorrow)
    const getAvailableDates = () => {
        const dates = []
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)

        for (let i = 0; i < 14; i++) {
            const date = new Date(tomorrow)
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

        // Max 5 images total
        if (files.length + formData.images.length > 5) {
            toast.error("Maximum 5 images allowed")
            return
        }

        const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

        files.forEach(file => {
            // Check size per file
            if (file.size > MAX_FILE_SIZE) {
                toast.error(`${file.name} is too large. Max size per image is 5MB.`)
                return
            }

            const reader = new FileReader()
            reader.onloadend = async () => {
                const watermarked = await addWatermark(reader.result)
                setFormData(prev => ({ ...prev, images: [...prev.images, watermarked] }))
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


        if (formData.images.length < 2) {
            toast.error("Please upload at least 2 images of the battery")
            return
        }

        // If seller already has saved bank details, skip the popup
        if (storeInfo.bankName && storeInfo.accountNumber) {
            setBankDetails({
                bankName: storeInfo.bankName,
                accountNumber: storeInfo.accountNumber,
                accountName: storeInfo.accountName || ''
            })
            doPublish()
        } else {
            // Show the payment account modal
            setShowPaymentModal(true)
        }
    }

    const handleEditProduct = (product) => {
        // Find battery type from BATTERY_TYPE_MAPPING or defaults
        // Since product.type is a code (e.g. 'CAR_TRUCK_WET'), we might need to map it back or just use the name
        // However, the form uses BATTERY_TYPES array.
        
        const addressParts = (product.pickupAddress || "").split(' | ')
        const cleanAddress = addressParts[0] || ""
        const cleanLga = addressParts[1] || ""

        setFormData({
            batteryType: product.batteryType || BATTERY_TYPES[0],
            brand: product.brand || '',
            amps: product.amps?.toString() || '',
            unitsAvailable: product.quantity || 1,
            price: product.price?.toString() || '',
            isManualPrice: true,
            lga: cleanLga,
            address: cleanAddress,
            collectionDates: product.collectionDates || [],
            comments: product.description || '',
            images: product.images || []
        })
        setSelectedDates(product.collectionDates || [])
        setEditingProductId(product.id)
        setIsUploadModalOpen(true)
    }

    const doPublish = async () => {
        // Check image size (Total base64 characters)
        const totalImageSize = formData.images.reduce((acc, img) => acc + img.length, 0)
        if (totalImageSize > 10 * 1024 * 1024) { // ~7.5MB decoded
            toast.error("Images are too large. Please upload smaller files or fewer images.")
            return
        }

        setIsLoading(true)
        dispatch(showLoader(editingProductId ? "Updating listing..." : "Submitting listing..."))

        // Add a timeout warning after 10 seconds
        const timeoutId = setTimeout(() => {
            toast("Still working... hang tight!", {
                icon: '⏳',
                duration: 5000
            })
        }, 10000)

        try {
            let result;
            if (editingProductId) {
                result = await updateProduct(editingProductId, {
                    name: `Scrap ${formData.batteryType} (${formData.amps}Ah) - ${formData.lga}`,
                    batteryType: formData.batteryType,
                    brand: formData.brand || null,
                    amps: formData.amps,
                    condition: 'SCRAP',
                    unitsAvailable: parseInt(formData.unitsAvailable),
                    price: parseInt(formData.price),
                    lga: formData.lga,
                    address: formData.address,
                    collectionDates: selectedDates.sort(),
                    comments: formData.comments,
                    images: formData.images,
                }, user.id)
            } else {
                result = await createProduct({
                    name: `Scrap ${formData.batteryType} (${formData.amps}Ah) - ${formData.lga}`,
                    batteryType: formData.batteryType,
                    brand: formData.brand || null,
                    amps: formData.amps,
                    condition: 'SCRAP',
                    unitsAvailable: parseInt(formData.unitsAvailable),
                    price: parseInt(formData.price),
                    lga: formData.lga,
                    address: formData.address,
                    collectionDates: selectedDates.sort(),
                    comments: formData.comments,
                    images: formData.images.length > 0 ? formData.images : ['/placeholder-battery.jpg'],
                }, user.id)
            }

            clearTimeout(timeoutId)
            dispatch(hideLoader())
            setIsLoading(false)

            if (result.success) {
                toast.success(
                    editingProductId 
                        ? "Listing updated! It is now pending re-approval."
                        : "Listing submitted! Pending approval.",
                    { duration: 5000 }
                )
                setIsUploadModalOpen(false)
                setEditingProductId(null)
                loadProducts()

                // Reset form
                setFormData({
                    batteryType: 'Cars and Truck batt (Wet cell)',
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
                toast.error(result.error || "Operation failed")
            }
        } catch (error) {
            clearTimeout(timeoutId)
            dispatch(hideLoader())
            setIsLoading(false)
            toast.error("An error occurred. Please try again.")
        }
    }

    const handlePaymentSubmitAndPublish = async () => {
        if (!bankDetails.bankName.trim() || !bankDetails.accountNumber.trim() || !bankDetails.accountName.trim()) {
            toast.error("Please fill in all bank details")
            return
        }
        if (bankDetails.accountNumber.length < 10) {
            toast.error("Account number must be at least 10 digits")
            return
        }

        // Save bank details if checkbox is checked
        if (saveAccount && user?.id) {
            const res = await updateStoreBankDetails(user.id, bankDetails)
            if (res.success) {
                setStoreInfo(prev => ({ ...prev, ...bankDetails }))
            }
        }

        setShowPaymentModal(false)
        doPublish()
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My <span className="text-[#05DF72]">Inventory</span></h1>
                    <p className="text-slate-500 mt-1">Manage your battery listings and stock levels.</p>
                </div>
                <button
                    type="button"
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

                {products?.length === 0 ? (
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
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Product</th>
                                        <th className="px-6 py-4 font-semibold">Location</th>
                                        <th className="px-6 py-4 font-semibold">Price & Units</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold">Collection Dates</th>
                                        <th className="px-6 py-4 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                                                        {getImageUrl(product.images?.[0]) ? (
                                                            <img
                                                                src={getImageUrl(product.images?.[0])}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => { e.target.src = '/placeholder-battery.jpg' }}
                                                            />
                                                        ) : (
                                                            <BatteryIcon size={20} />
                                                        )}
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
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className={`status-badge ${product.status === 'approved' ? 'status-completed' : product.status === 'rejected' ? 'status-cancelled' : 'status-pending'}`}>
                                                        {product.status?.charAt(0).toUpperCase() + product.status?.slice(1)}
                                                    </span>
                                                    {product.status === 'rejected' && product.rejectionReason && (
                                                        <p className="text-[10px] text-rose-500 mt-1 max-w-[150px] line-clamp-2" title={product.rejectionReason}>
                                                            {product.rejectionReason}
                                                        </p>
                                                    )}
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
                                                    <button 
                                                        onClick={() => handleEditProduct(product)}
                                                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"
                                                    >
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
                        {pagination.page < pagination.totalPages && (
                            <div className="p-6 text-center border-t border-slate-100">
                                <button
                                    onClick={loadMoreProducts}
                                    className="text-sm font-bold text-[#05DF72] hover:underline"
                                >
                                    Load More Products
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-slate-900">{editingProductId ? 'Edit' : 'List New'} <span className="text-[#05DF72]">Battery</span></h2>
                            <button 
                                onClick={() => {
    setIsUploadModalOpen(false)
    setEditingProductId(null)
    setFormData({
        batteryType: BATTERY_TYPES[0],
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
    setIsLoading(false)
    dispatch(hideLoader())
}}
                                className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400"
                            >
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
                                            {BATTERY_TYPES.map(type => (
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
                                            {(BATTERY_SIZE_OPTIONS[formData.batteryType] || []).map(size => (
                                                <option key={size} value={size}>{size} Amps</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#05DF72]">Standard Applied</label>
                                        <div className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-xs">
                                            <span className="text-slate-500">Condition: <span className="text-slate-900 font-bold">SCRAP</span></span>
                                            <span className="text-slate-500">State: <span className="text-slate-900 font-bold">LAGOS</span></span>
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                                        {/* Suggested Price Box */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Suggested Price (₦)</label>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    value={formData.batteryType && formData.amps ? ((batteryPrices[formData.batteryType]?.[formData.amps] || 0) * parseInt(formData.unitsAvailable || 1)).toLocaleString() : ''}
                                                    readOnly
                                                    placeholder="Auto-calculated"
                                                    className="w-full p-4 bg-slate-100/50 text-slate-400 border-none rounded-2xl outline-none font-medium text-sm cursor-not-allowed"
                                                />
                                                {formData.amps !== '' && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#05DF72]/10 text-[#05DF72] rounded-full text-[10px] font-bold uppercase">
                                                        Suggested
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Custom Price Box */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Selling Price (₦) *</label>
                                                {formData.amps !== '' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, isManualPrice: false }))}
                                                        className="text-[10px] font-bold text-[#05DF72] uppercase tracking-widest hover:underline"
                                                    >
                                                        Use Suggested
                                                    </button>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <input
                                                    value={formData.price}
                                                    onChange={e => setFormData({ ...formData, price: e.target.value, isManualPrice: true })}
                                                    type="number"
                                                    min="1"
                                                    placeholder="e.g. 15000"
                                                    required
                                                    className={`w-full p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium text-sm transition-all ${!formData.isManualPrice && formData.amps !== '' ? 'bg-[#05DF72]/5 text-[#05DF72] border border-[#05DF72]/20' : 'bg-slate-50 border-none'}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location Section */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <MapPinIcon size={16} className="text-[#05DF72]" />
                                    Location & Pickup Address
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-4 mb-2">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="addressMode"
                                                checked={addressMode === 'registered'}
                                                onChange={() => useRegisteredAddress()}
                                                className="w-4 h-4 text-[#05DF72] focus:ring-[#05DF72] border-slate-300"
                                            />
                                            <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Use Registered Address</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="addressMode"
                                                checked={addressMode === 'new'}
                                                onChange={() => {
                                                    setAddressMode('new')
                                                    setFormData(prev => ({ ...prev, lga: '', address: '' }))
                                                }}
                                                className="w-4 h-4 text-[#05DF72] focus:ring-[#05DF72] border-slate-300"
                                            />
                                            <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Enter New Address</span>
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2 flex flex-col items-start gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Local Government Area *</label>
                                            <select
                                                value={formData.lga}
                                                onChange={e => {
                                                    setFormData({ ...formData, lga: e.target.value })
                                                    if (addressMode === 'registered') setAddressMode('new')
                                                }}
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
                                                onChange={e => {
                                                    setFormData({ ...formData, address: e.target.value })
                                                    if (addressMode === 'registered') setAddressMode('new')
                                                }}
                                                placeholder="e.g. 12 Admiralty Way, Lekki Phase 1"
                                                required
                                                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Collection Dates Section */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <CalendarIcon size={16} className="text-[#05DF72]" />
                                    Available Collection Dates *
                                </h3>
                                <p className="text-xs text-slate-500">Select up to 2 dates when you are available for collection (starting from tomorrow)</p>

                                <ScheduleCalendar
                                    mode="days"
                                    multiSelect={true}
                                    onSelect={(dates) => setSelectedDates(dates)}
                                    preSelected={selectedDates}
                                />

                                {selectedDates.length > 0 && (
                                    <p className="text-xs text-[#05DF72] font-medium">
                                        {selectedDates.length} date(s) selected
                                    </p>
                                )}
                            </div>

                            {/* Media Section */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <ImageIcon size={16} className="text-[#05DF72]" />
                                    Media Upload <span className="text-xs font-normal text-slate-400">(Min 2, Max 5)</span>
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
                                <p className="text-xs text-slate-400">Supported: JPG, PNG. Max 5MB per picture.</p>
                            </div>

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

                            {/* Terms and Conditions */}
                            <div className="pt-4 border-t border-slate-100">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={acceptedTerms}
                                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                                        className="mt-0.5 w-5 h-5 rounded-md border-2 border-slate-300 text-[#05DF72] focus:ring-[#05DF72] focus:ring-offset-0 cursor-pointer accent-[#05DF72]"
                                    />
                                    <span className="text-xs text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors">
                                        I agree to Go-Cycle's <a href="/terms" target="_blank" className="text-[#05DF72] font-bold hover:underline">Terms and Conditions</a> and confirm that the battery details provided are accurate. I understand that misrepresentation may result in account suspension.
                                    </span>
                                </label>
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
                                    loadingText={editingProductId ? "Updating..." : "Submitting..."}
                                    className="flex-1"
                                    disabled={!acceptedTerms}
                                >
                                    {editingProductId ? 'Update Listing' : 'Submit Listing'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment Account Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full border border-slate-100 animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">Payment <span className="text-[#05DF72]">Details</span></h2>
                            <p className="text-xs text-slate-400 mt-1">Enter your bank account to receive payment for this listing</p>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Bank Selection Dropdown */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Bank *</label>
                                <select
                                    value={bankDetails.bankName}
                                    onChange={e => {
                                        const name = e.target.value
                                        const code = NIGERIAN_BANKS[name] || ''
                                        setBankDetails(prev => ({ ...prev, bankName: name, bankCode: code, accountName: '' }))
                                        // Auto-lookup if 10-digit account already entered
                                        if (bankDetails.accountNumber.length === 10 && code) {
                                            lookupAccountName(bankDetails.accountNumber, code)
                                        }
                                    }}
                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-medium text-sm"
                                >
                                    <option value="">-- Select your bank --</option>
                                    {Object.keys(NIGERIAN_BANKS).map(bank => (
                                        <option key={bank} value={bank}>{bank}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Account Number */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Number *</label>
                                <div className="relative">
                                    <input
                                        value={bankDetails.accountNumber}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '')
                                            setBankDetails(prev => ({ ...prev, accountNumber: val, accountName: '' }))
                                            if (val.length === 10 && bankDetails.bankCode) {
                                                lookupAccountName(val, bankDetails.bankCode)
                                            }
                                        }}
                                        placeholder="0123456789"
                                        maxLength={10}
                                        className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#05DF72]/20 font-bold text-lg tracking-[0.15em]"
                                    />
                                    {bankLookupLoading && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <LoaderIcon className="animate-spin text-[#05DF72]" size={20} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Account Name (auto-resolved) */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Name</label>
                                {bankDetails.accountName ? (
                                    <div className="w-full p-4 bg-[#05DF72]/5 border border-[#05DF72]/20 rounded-2xl flex items-center gap-3">
                                        <CheckCircleIcon className="text-[#05DF72] shrink-0" size={20} />
                                        <span className="font-bold text-slate-900">{bankDetails.accountName}</span>
                                    </div>
                                ) : (
                                    <div className="w-full p-4 bg-slate-50 rounded-2xl text-sm text-slate-400 font-medium">
                                        {bankLookupLoading ? 'Verifying account...' : 'Will auto-resolve when you select bank and enter account number'}
                                    </div>
                                )}
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer group pt-2">
                                <input
                                    type="checkbox"
                                    checked={saveAccount}
                                    onChange={(e) => setSaveAccount(e.target.checked)}
                                    className="mt-0.5 w-5 h-5 rounded-md border-2 border-slate-300 text-[#05DF72] focus:ring-[#05DF72] cursor-pointer accent-[#05DF72]"
                                />
                                <span className="text-xs text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors">
                                    Save this account number for future transactions
                                </span>
                            </label>
                        </div>

                        <div className="p-6 border-t border-slate-100 flex gap-3">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <Button
                                onClick={handlePaymentSubmitAndPublish}
                                className="flex-1"
                                disabled={!bankDetails.accountName || bankLookupLoading}
                            >
                                Proceed to Submit
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
