import { getAllAffiliates, getAffiliateAdminStats } from '@/backend-actions/actions/admin-affiliates'
import AffiliatesAdminClient from './AffiliatesAdminClient'

export const metadata = { title: 'Affiliates | GoCycle Admin' }
export const dynamic = 'force-dynamic'

export default async function AffiliatesAdminPage() {
    const [statsRes, affiliatesRes] = await Promise.all([
        getAffiliateAdminStats(),
        getAllAffiliates()
    ])

    const stats = statsRes.success ? statsRes.data : {}
    const affiliates = affiliatesRes.success ? affiliatesRes.data.affiliates : []

    return <AffiliatesAdminClient stats={stats} affiliates={affiliates} />
}
