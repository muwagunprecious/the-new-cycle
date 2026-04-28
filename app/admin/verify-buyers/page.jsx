import { getPendingBuyers } from "@/backend-actions/actions/admin"
import VerifyBuyersClient from "@/components/admin/verify-buyers/VerifyBuyersClient"

export const dynamic = 'force-dynamic'

export default async function VerifyBuyersPage() {
    const res = await getPendingBuyers()
    
    return (
        <VerifyBuyersClient 
            initialBuyers={res.success ? res.data : []} 
        />
    )
}
