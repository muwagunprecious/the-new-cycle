'use client'
import { Suspense, useState, useEffect, useMemo } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeft as MoveLeftIcon, MapPin, Filter as FilterIcon, ChevronDown, Battery as BatteryIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { ProductCardSkeleton } from "@/components/Skeleton"
import { lagosLGAs } from "@/assets/assets"
import { setProduct } from "@/lib/features/product/productSlice"
import CheckoutModal from "@/components/CheckoutModal"
import toast from "react-hot-toast"

function ShopClientContent({ initialProducts = [] }) {
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const router = useRouter()
    const dispatch = useDispatch()

    const rawProducts = useSelector(state => state.product.list)
    const [localBoughtIds, setLocalBoughtIds] = useState([])
    const [activeLga, setActiveLga] = useState('All')
    const [activeType, setActiveType] = useState('All')
    
    useEffect(() => {
        // Sync SSR products to Redux on mount so cart/etc can rely on it if needed
        if (initialProducts?.length > 0) {
            dispatch(setProduct(initialProducts))
        }
    }, [initialProducts, dispatch])

    useEffect(() => {
        try {
            const bought = JSON.parse(localStorage.getItem('gocycle_bought_products') || '[]')
            setLocalBoughtIds(bought)
        } catch (e) {}
    }, [])

    // Quick Buy State
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const { isLoggedIn, user } = useSelector(state => state.auth)

    const handleQuickBuy = (product) => {
        if (!isLoggedIn) {
            toast.error("Please login to buy instantly")
            router.push('/login?redirect=/shop')
            return
        }

        if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
            toast.error("Administrators are not permitted to make purchases.")
            return
        }

        if (!product.collectionDates || product.collectionDates.length === 0) {
            console.warn("[DEBUG] Missing collectionDates for product:", product.id, {
                collectionDates: product.collectionDates,
                collectionDateStart: product.collectionDateStart,
                collectionDateEnd: product.collectionDateEnd
            });
            
            // Last resort fallback for UI
            if (product.collectionDateStart) {
                product.collectionDates = [new Date(product.collectionDateStart).toISOString().split('T')[0]]
            } else {
                toast.error("This seller has no available collection dates")
                return
            }
        }

        setSelectedProduct(product)
        setIsCheckoutOpen(true)
    }

    const batteryTypes = ["All", "Car Battery", "Inverter Battery", "Heavy Duty Battery"]

    // Use pure derived state (useMemo) instead of useEffect to filter, making it instantly responsive
    const filteredProducts = useMemo(() => {
        // Use Redux state if populated, else fallback to initialProducts
        let result = rawProducts?.length > 0 ? [...rawProducts] : [...initialProducts]

        if (search) {
            result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
        }
        if (activeLga !== 'All') {
            result = result.filter(p => p.lga === activeLga || (p.pickupAddress && p.pickupAddress.includes(activeLga)))
        }
        if (activeType !== 'All') {
            result = result.filter(p => p.batteryType === activeType || p.category === activeType)
        }

        result = result.filter(p => 
            p.status !== 'sold' && 
            p.inStock !== false && 
            !localBoughtIds.includes(p.id)
        )

        result.sort((a, b) => {
            const aSold = a.status === 'sold' || a.inStock === false;
            const bSold = b.status === 'sold' || b.inStock === false;
            if (aSold && !bSold) return 1;
            if (!aSold && bSold) return -1;
            return 0;
        });

        return result
    }, [rawProducts, initialProducts, search, activeLga, activeType, localBoughtIds])

    return (
        <div className="min-h-[70vh] bg-white pt-24 pb-32">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#00D166]"></div>
                            <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#00D166]">Marketplace</span>
                        </div>
                        <h1 onClick={() => router.push('/shop')} className="text-4xl md:text-6xl font-medium text-slate-900 flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity tracking-[-0.02em]">
                            {search && <MoveLeftIcon size={32} className="text-[#00D166]" />}
                            Browse <span className="text-[#00D166]">Marketplace</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-lg mt-2">Showing verified battery listings across Lagos State.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-3 bg-[#F4F6F8] px-6 py-4 rounded-[24px] border border-slate-100 shadow-sm focus-within:ring-2 focus-within:ring-[#00D166]/20 transition-all">
                            <BatteryIcon size={20} className="text-[#00D166]" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Battery Type</span>
                                <select
                                    className="bg-transparent outline-none font-bold text-slate-900 text-base appearance-none pr-6 cursor-pointer w-36"
                                    value={activeType}
                                    onChange={(e) => setActiveType(e.target.value)}
                                >
                                    {batteryTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <ChevronDown size={16} className="text-slate-400 -ml-4" />
                        </div>

                        <div className="flex items-center gap-3 bg-[#F4F6F8] px-6 py-4 rounded-[24px] border border-slate-100 shadow-sm focus-within:ring-2 focus-within:ring-[#00D166]/20 transition-all">
                            <MapPin size={20} className="text-[#00D166]" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Location</span>
                                <select
                                    className="bg-transparent outline-none font-bold text-slate-900 text-base appearance-none pr-6 cursor-pointer w-36"
                                    value={activeLga}
                                    onChange={(e) => setActiveLga(e.target.value)}
                                >
                                    <option value="All">All Lagos</option>
                                    {lagosLGAs.sort().map(lga => (
                                        <option key={lga} value={lga}>{lga}</option>
                                    ))}
                                </select>
                            </div>
                            <ChevronDown size={16} className="text-slate-400 -ml-4" />
                        </div>
                    </div>
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 mb-32">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onQuickBuy={() => handleQuickBuy(product)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-[#F4F6F8] rounded-[40px] border border-slate-100 mb-32 max-w-4xl mx-auto">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <FilterIcon size={32} className="text-[#00D166]" />
                        </div>
                        <h3 className="text-3xl font-medium text-slate-900 tracking-[-0.01em]">No batteries found</h3>
                        <p className="text-slate-500 font-medium text-lg mt-4">Try adjusting your filters or search terms.</p>
                        <button
                            onClick={() => { setActiveLga('All'); setActiveType('All'); router.push('/shop') }}
                            className="mt-10 bg-white border border-slate-200 text-slate-900 font-bold uppercase tracking-widest text-[12px] px-8 py-4 rounded-full hover:bg-slate-50 shadow-sm transition-all"
                        >
                            Reset All Filters
                        </button>
                    </div>
                )}
            </div>

            {selectedProduct && (
                <CheckoutModal
                    isOpen={isCheckoutOpen}
                    onClose={() => setIsCheckoutOpen(false)}
                    product={selectedProduct}
                    quantity={1}
                    selectedDate={selectedProduct.collectionDates[0]}
                />
            )}
        </div>
    )
}

export default function ShopClient({ initialProducts }) {
    return (
        <Suspense fallback={
            <div className="min-h-[70vh] max-w-7xl mx-auto py-20">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
                    {Array(8).fill('').map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
            </div>
        }>
            <ShopClientContent initialProducts={initialProducts} />
        </Suspense>
    )
}
