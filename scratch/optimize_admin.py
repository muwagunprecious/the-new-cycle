import os

file_path = r'c:\Users\TINGO-AI-010\Documents\Go-cycle\backend-actions\actions\admin.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports
content = content.replace(
    'import { revalidatePath } from "next/cache"',
    'import { revalidatePath, unstable_cache } from "next/cache"'
)

# The new logic for the dashboard summary
new_logic = """
/**
 * Performance-optimized aggregate summary for the admin dashboard.
 * Uses Next.js unstable_cache to prevent heavy DB load on every refresh.
 */
export const getAdminDashboardSummary = async () => {
    return unstable_cache(
        async () => {
            try {
                logger.info("[CACHE_MISS] Calculating Admin Dashboard Summary...");
                const [
                    sellerCount,
                    productCount,
                    orderCount,
                    revenueData,
                    verifiedCount,
                    userCount,
                    pendingPayoutsData,
                    recentOrders,
                    pendingVerifications
                ] = await withRetry(() => Promise.all([
                    prisma.user.count({ where: { role: 'SELLER' } }),
                    prisma.product.count(),
                    prisma.order.count(),
                    prisma.order.aggregate({
                        _sum: { total: true }
                    }),
                    prisma.user.count({ where: { accountStatus: 'approved' } }),
                    prisma.user.count(),
                    prisma.order.aggregate({
                        where: { status: 'COMPLETED', payoutStatus: 'pending' },
                        _sum: { 
                            total: true,
                            subtotal: true,
                            buyerFee: true,
                            sellerFee: true,
                            payoutAmount: true
                        }
                    }),
                    prisma.order.findMany({
                        take: 5,
                        orderBy: { createdAt: 'desc' },
                        select: {
                            id: true,
                            total: true,
                            createdAt: true,
                            user: { select: { name: true } },
                            store: { select: { name: true } }
                        }
                    }),
                    prisma.order.findMany({
                        where: { paymentStatus: 'pending' },
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                        select: {
                            id: true,
                            total: true,
                            paymentSenderName: true,
                            createdAt: true,
                            user: { select: { name: true } },
                            store: { select: { name: true } }
                        }
                    })
                ]))

                const stats = {
                    products: productCount,
                    revenue: revenueData._sum.total || 0,
                    orders: orderCount,
                    stores: sellerCount,
                    pendingPayouts: pendingPayoutsData._sum.payoutAmount || 0,
                    pendingStats: {
                        subtotal: pendingPayoutsData._sum.subtotal || 0,
                        total: pendingPayoutsData._sum.total || 0,
                        sellerFee: pendingPayoutsData._sum.sellerFee || 0,
                        buyerFee: pendingPayoutsData._sum.buyerFee || 0,
                        payoutAmount: pendingPayoutsData._sum.payoutAmount || 0,
                        platformEarnings: (pendingPayoutsData._sum.buyerFee || 0) + (pendingPayoutsData._sum.sellerFee || 0)
                    },
                    verifiedUsers: verifiedCount,
                    unverifiedUsers: userCount - verifiedCount,
                    totalUsers: userCount,
                    recentOrders: recentOrders,
                    pendingVerifications: pendingVerifications || []
                };

                return ApiResponse.success(stats);
            } catch (error) {
                logger.error("Get Dashboard Summary Error", error)
                return ApiResponse.error("Failed to fetch dashboard stats")
            }
        },
        ['admin-dashboard-summary-v1'],
        { revalidate: 300, tags: ['admin-stats'] }
    )();
};
"""

# Find the start and end of the function to replace it
start_marker = "export async function getAdminDashboardSummary()"
end_marker = 'return ApiResponse.error("Failed to fetch dashboard stats")\n    }\n}'

if start_marker in content and end_marker in content:
    start_index = content.find(start_marker)
    end_index = content.find(end_marker) + len(end_marker)
    
    new_content = content[:start_index] + new_logic + content[end_index:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully optimized admin.js")
else:
    print("Could not find markers in admin.js")
    if start_marker not in content:
        print("Start marker missing")
    if end_marker not in content:
        # Try to find a slightly different end marker (whitespace issues)
        print("End marker missing")
