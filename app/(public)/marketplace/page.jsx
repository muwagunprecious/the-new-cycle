import { getAllProducts } from "@/backend-actions/actions/product"
import ShopClient from "@/components/ShopClient"

export const dynamic = 'force-dynamic'

export default async function MarketplacePage() {
    const serverResult = await getAllProducts()
    const initialProducts = serverResult.success ? serverResult.products : []

    return <ShopClient initialProducts={initialProducts} />
}
