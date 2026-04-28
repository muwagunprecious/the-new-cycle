import { getPendingAdminProducts } from "@/backend-actions/actions/product"
import AdminPendingProductsClient from "@/components/admin/pending-products/AdminPendingProductsClient"

export const dynamic = 'force-dynamic'

export default async function AdminPendingProductsPage() {
    const res = await getPendingAdminProducts()
    
    return (
        <AdminPendingProductsClient 
            initialProducts={res.success ? res.products : []} 
        />
    )
}
