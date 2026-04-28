import { getPendingSellers } from "@/backend-actions/actions/admin"
import AdminApproveClient from "@/components/admin/approve/AdminApproveClient"

export const dynamic = 'force-dynamic'

export default async function AdminApprovePage() {
    const res = await getPendingSellers()
    
    return (
        <AdminApproveClient 
            initialStores={res.success ? res.data : []} 
        />
    )
}
