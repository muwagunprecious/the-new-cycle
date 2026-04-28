import { getAdminProducts } from "@/backend-actions/actions/product"
import AdminProductsClient from "@/components/admin/products/AdminProductsClient"

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
    const res = await getAdminProducts()
    
    return (
        <AdminProductsClient 
            initialProducts={res.success ? res.products : []} 
        />
    )
}
