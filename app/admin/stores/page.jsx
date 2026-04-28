import { getPendingSellers } from "@/backend-actions/actions/admin"
import AdminStoresClient from "@/components/admin/stores/AdminStoresClient"

export const dynamic = 'force-dynamic'

export default async function AdminStoresPage() {
    const res = await getPendingSellers()
    
    return (
        <AdminStoresClient 
            initialStores={res.success ? res.data : []} 
        />
    )
}
