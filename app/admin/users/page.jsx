import { getAllUsers } from "@/backend-actions/actions/admin"
import AdminUsersClient from "@/components/admin/users/AdminUsersClient"

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
    const buyerFilters = { role: 'USER' }
    const res = await getAllUsers(1, 50, buyerFilters)
    
    return (
        <AdminUsersClient 
            initialUsers={res.success ? res.data : []} 
            userFilters={buyerFilters}
        />
    )
}
