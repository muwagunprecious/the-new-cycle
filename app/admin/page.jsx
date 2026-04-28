import { getAdminDashboardSummary, getAllUsers, getAdminPayoutHistory } from "@/backend-actions/actions/admin"
import { getAllOrders } from "@/backend-actions/actions/order"
import AdminDashboardClient from "@/components/admin/AdminDashboardClient"

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    // Fetch critical admin data concurrently on the server
    const [summaryRes, usersRes, ordersRes, payoutsRes] = await Promise.all([
        getAdminDashboardSummary(),
        getAllUsers(1, 50),
        getAllOrders(1, 50),
         getAdminPayoutHistory(1, 50)
    ])

    return (
        <AdminDashboardClient 
            initialSummary={summaryRes.success ? summaryRes.data : null}
            initialUsers={usersRes.success ? usersRes : { data: [], pagination: {page: 1, totalPages: 1} }}
            initialOrders={ordersRes.success ? ordersRes : { data: [], pagination: {page: 1, totalPages: 1} }}
            initialPayouts={payoutsRes.success ? payoutsRes : { data: [], pagination: {page: 1, totalPages: 1} }}
        />
    )
}
