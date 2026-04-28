import { getSettingsByGroup, getPricingConfig, getTermiiFullStatus } from "@/backend-actions/actions/settings"
import AdminSettingsClient from "@/components/admin/settings/AdminSettingsClient"

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
    const [termiiRes, qoreidRes, pricingRes] = await Promise.all([
        getSettingsByGroup('termii'),
        getSettingsByGroup('qoreid'),
        getPricingConfig()
    ])

    let termiiStatus = null
    if (termiiRes.success && termiiRes.data?.apiKey) {
        const statusRes = await getTermiiFullStatus(termiiRes.data.apiKey, termiiRes.data.baseUrl || 'https://api.ng.termii.com')
        if (statusRes.success) {
            termiiStatus = statusRes
        }
    }
    
    return (
        <AdminSettingsClient 
            initialTermii={termiiRes.success ? termiiRes.data : null}
            initialQoreID={qoreidRes.success ? qoreidRes.data : null}
            initialPricing={pricingRes.success ? pricingRes.data : null}
            initialTermiiStatus={termiiStatus}
        />
    )
}
