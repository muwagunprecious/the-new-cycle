import { getVerifiedSellers } from "@/backend-actions/actions/admin"
import AdminSellersClient from "@/components/admin/sellers/AdminSellersClient"

export const dynamic = 'force-dynamic'

export default async function AdminSellersPage() {
    const res = await getVerifiedSellers()
    
    return (
        <AdminSellersClient 
            initialSellers={res.success ? res.data : []} 
        />
    )
}
