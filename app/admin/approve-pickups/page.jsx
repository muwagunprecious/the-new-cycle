import { getAllOrders } from "@/backend-actions/actions/order"
import OrderManagementClient from "@/components/admin/orders/OrderManagementClient"

export const dynamic = 'force-dynamic'

export default async function ApprovePickupsPage() {
    // Fetch orders on the server
    const res = await getAllOrders()
    
    // Filter strictly for orders that need pickup approval (or just pass all and let the client handle it)
    // The client component already manages the full order list, so we'll pass it all
    
    return (
        <OrderManagementClient 
            initialOrders={res.success ? res.data : []} 
        />
    )
}
