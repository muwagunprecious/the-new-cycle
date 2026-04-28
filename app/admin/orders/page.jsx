import { getAllOrders } from "@/backend-actions/actions/order"
import OrderManagementClient from "@/components/admin/orders/OrderManagementClient"

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
    // Fetch orders on the server
    const res = await getAllOrders()
    
    return (
        <OrderManagementClient 
            initialOrders={res.success ? res.data : []} 
        />
    )
}
