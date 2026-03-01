'use client'
import { Suspense, useState, useEffect } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeftIcon, MapPin, FilterIcon, ChevronDown, BatteryIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { ProductCardSkeleton } from "@/components/Skeleton"
import { lagosLGAs } from "@/assets/assets"
import { getAllProducts } from "@/backend/actions/product"
import { setProduct } from "@/lib/features/product/productSlice"
import CheckoutModal from "@/components/CheckoutModal"
import toast from "react-hot-toast"

function ShopContent() {
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const router = useRouter()
    const dispatch = useDispatch()

    // Get products from Redux (which should be populated from assets or mock service)
    const products = useSelector(state => state.product.list)

    const [loading, setLoading] = useState(false)
    const [activeLga, setActiveLga] = useState('All')
    const [activeType, setActiveType] = useState('All')
    const [filteredProducts, setFilteredProducts] = useState(products)

    // Quick Buy State
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const { isLoggedIn } = useSelector(state => state.auth)

    const handleQuickBuy = (product) => {
        if (!isLoggedIn) {
            toast.error("Please login to buy instantly")
            router.push('/login?redirect=/shop')
            return
        }

        if (!product.collectionDates || product.collectionDates.length === 0) {
            toast.error("This seller has no available collection dates")
            return
        }

        setSelectedProduct(product)
        setIsCheckoutOpen(true)
    }

    const batteryTypes = ["All", "Car Battery", "Inverter Battery", "Heavy Duty Battery"]

    useEffect(() => {
        const fetchAndFilter = async () => {
            setLoading(true)

            // Fetch fresh data
            const serverResult = await getAllProducts()
            let currentProducts = []

            if (serverResult.success) {
                dispatch(setProduct(serverResult.products))
                currentProducts = serverResult.products
            } else {
                // Fallback to existing state if fetch fails
                currentProducts = products
            }

            let result = [...currentProducts]

            // 1. Search Filter
            if (search) {
                result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
            }

            // 2. LGA Filter
            if (activeLga !== 'All') {
                // For legacy/mock products which have 'lga' property
                // For new products, we might not have it unless we added it to schema.
                // Fallback: check address?
                result = result.filter(p => p.lga === activeLga || (p.pickupAddress && p.pickupAddress.includes(activeLga)))
            }

            // 3. Type Filter
            if (activeType !== 'All') {
                result = result.filter(p => p.batteryType === activeType || p.category === activeType)
            }

            setFilteredProducts(result)
            setLoading(false)
        }

        fetchAndFilter()

    }, [search, activeLga, activeType, dispatch]) // removed 'products' dependency to avoid infinite loop if we update it inside

    const handleLgaChange = (lga) => {
        setActiveLga(lga)
    }

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-7xl mx-auto py-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 onClick={() => router.push('/shop')} className="text-4xl font-black text-slate-900 flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
                            {search && <MoveLeftIcon size={24} className="text-[#05DF72]" />}
                            Browse <span className="text-[#05DF72]">Marketplace</span>
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">Showing verified battery listings across Lagos State.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        {/* Battery Type Filter */}
                        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm focus-within:ring-2 focus-within:ring-[#05DF72]/20 transition-all">
                            <BatteryIcon size={18} className="text-[#05DF72]" />
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Battery Type</span>
                                <select
                                    className="bg-transparent outline-none font-bold text-slate-700 text-sm appearance-none pr-6 cursor-pointer w-32"
                                    value={activeType}
                                    onChange={(e) => setActiveType(e.target.value)}
                                >
                                    {batteryTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <ChevronDown size={14} className="text-slate-400 -ml-4" />
                        </div>

                        {/* LGA Filter */}
                        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm focus-within:ring-2 focus-within:ring-[#05DF72]/20 transition-all">
                            <MapPin size={18} className="text-[#05DF72]" />
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Location</span>
                                <select
                                    className="bg-transparent outline-none font-bold text-slate-700 text-sm appearance-none pr-6 cursor-pointer w-32"
                                    value={activeLga}
                                    onChange={(e) => handleLgaChange(e.target.value)}
                                >
                                    <option value="All">All Lagos</option>
                                    {lagosLGAs.sort().map(lga => (
                                        <option key={lga} value={lga}>{lga}</option>
                                    ))}
                                </select>
                            </div>
                            <ChevronDown size={14} className="text-slate-400 -ml-4" />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 mb-32">
                        {Array(8).fill('').map((_, i) => <ProductCardSkeleton key={i} />)}
                    </div>
                ) : (
                    <>
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 mb-32">
                                {filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onQuickBuy={() => handleQuickBuy(product)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 mb-32">
                                <div className="size-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <FilterIcon size={32} className="text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">No batteries found</h3>
                                <p className="text-slate-500 font-medium mt-2">Try adjusting your filters or search terms.</p>
                                <button
                                    onClick={() => { setActiveLga('All'); setActiveType('All'); router.push('/shop') }}
                                    className="mt-8 text-[#05DF72] font-black uppercase tracking-widest text-[10px] hover:underline"
                                >
                                    Reset All Filters
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {selectedProduct && (
                <CheckoutModal
                    isOpen={isCheckoutOpen}
                    onClose={() => setIsCheckoutOpen(false)}
                    product={selectedProduct}
                    quantity={1}
                    selectedDate={selectedProduct.collectionDates[0]} // Smart default: first available date
                />
            )}
        </div>
    )
}


export default function Shop() {
    return (
        <Suspense fallback={<div>Loading marketplace...</div>}>
            <ShopContent />
        </Suspense>
    );
}