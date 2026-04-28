import { getAllUsers } from "@/backend-actions/actions/admin"
import AdminUsersClient from "@/components/admin/users/AdminUsersClient"

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
    const res = await getAllUsers()
    
    return (
        <AdminUsersClient 
            initialUsers={res.success ? res.data : []} 
        />
    )
}
