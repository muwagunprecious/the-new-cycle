import { getAllProducts } from "@/backend-actions/actions/product"
import ShopClient from "@/components/ShopClient"

export const dynamic = 'force-dynamic' 

export default async function Shop() {
    // 1. Fetch data directly on the server before sending HTML to browser
    const serverResult = await getAllProducts()
    
    // 2. Ensure initial dataset is robust
    const initialProducts = serverResult.success ? serverResult.products : []

    // 3. Render the client component immediately populated with data
    return <ShopClient initialProducts={initialProducts} />
}
