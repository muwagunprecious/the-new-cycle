'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'

const BestSelling = () => {

    const displayQuantity = 8
    const products = useSelector(state => state.product.list)

    // Sort by lowest units available (simulating high demand/sales)
    const bestSellers = products
        .slice()
        .sort((a, b) => (a.unitsAvailable || 0) - (b.unitsAvailable || 0))
        .slice(0, displayQuantity)

    return (
        <div className='px-6 my-32 max-w-7xl mx-auto'>
            <Title
                title='Best <span className="text-[#05DF72]">Selling</span> Batteries'
                description="High demand batteries moving fast in the marketplace."
                href='/shop'
            />
            <div className='mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
                {bestSellers.map((product, index) => (
                    <ProductCard key={index} product={product} />
                ))}
            </div>
        </div>
    )
}

export default BestSelling
