import { getAdminDashboardSummary, getAllUsers, getAdminPayoutHistory } from "@/backend-actions/actions/admin"
import { getAllOrders } from "@/backend-actions/actions/order"
import AdminDashboardClient from "@/components/admin/AdminDashboardClient"

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    // Only fetch the summary on the server for instant initial load
    const summaryRes = await getAdminDashboardSummary()

    return (
        <AdminDashboardClient 
            initialSummary={summaryRes.success ? summaryRes.data : null}
            initialUsers={null}
            initialOrders={null}
            initialPayouts={null}
        />
    )
}
