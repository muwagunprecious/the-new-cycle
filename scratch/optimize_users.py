import os

seller_path = r'c:\Users\TINGO-AI-010\Documents\Go-cycle\backend-actions\actions\seller.js'
order_path = r'c:\Users\TINGO-AI-010\Documents\Go-cycle\backend-actions\actions\order.js'

# --- 1. Optimize seller.js ---
with open(seller_path, 'r', encoding='utf-8') as f:
    seller_content = f.read()

# Add unstable_cache to imports
if 'unstable_cache' not in seller_content:
    seller_content = seller_content.replace(
        'import { revalidatePath } from "next/cache"',
        'import { revalidatePath, unstable_cache } from "next/cache"'
    )

# Wrap getSellerDashboardSummary in cache
seller_summary_pattern = "export async function getSellerDashboardSummary(userId) {"
seller_summary_replacement = """
/**
 * Performance-optimized aggregated dashboard summary for a seller.
 * Uses Next.js unstable_cache for high-speed loads.
 */
export async function getSellerDashboardSummary(userId) {
    if (!userId) return ApiResponse.unauthorized()
    
    return unstable_cache(
        async () => {
            try {
                logger.info(`[CACHE_MISS] Calculating Seller Dashboard Summary for ${userId}`);
"""

if seller_summary_pattern in seller_content:
    # This is a bit complex for a simple replace, we'll use markers
    # Find the try block start
    try_index = seller_content.find('try {', seller_content.find(seller_summary_pattern))
    # Replace the start
    seller_content = seller_content.replace(seller_summary_pattern, 'export async function getSellerDashboardSummary_Internal(userId) {')
    
    # We'll just append the wrapper at the end or replace the whole function
    # Let's try a safer approach: replace the entire function body
    
    start_marker = 'export async function getSellerDashboardSummary(userId) {'
    end_marker = 'return ApiResponse.error("Failed to fetch dashboard summary")\n    }\n}'
    
    # Re-reading to be sure
    with open(seller_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    skip = False
    for line in lines:
        if 'export async function getSellerDashboardSummary(userId)' in line:
            new_lines.append('export async function getSellerDashboardSummary(userId) {\n')
            new_lines.append('    if (!userId) return ApiResponse.unauthorized()\n')
            new_lines.append('    return unstable_cache(\n')
            new_lines.append('        async () => {\n')
            new_lines.append('            try {\n')
            skip = True
            continue
        if skip and 'return ApiResponse.error("Failed to fetch dashboard summary")' in line:
            new_lines.append('                return ApiResponse.error("Failed to fetch dashboard summary")\n')
            new_lines.append('            }\n')
            new_lines.append('        },\n')
            new_lines.append(f"        [`seller-summary-${{userId}}`],\n")
            new_lines.append("        { revalidate: 60, tags: [`seller-stats-${userId}`] }\n")
            new_lines.append('    )();\n')
            new_lines.append('}\n')
            skip = False
            continue
        if not skip:
            new_lines.append(line)
        else:
            # We are inside the function, indent the lines
            new_lines.append('    ' + line)

    with open(seller_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Successfully optimized seller.js")

# --- 2. Optimize order.js ---
with open(order_path, 'r', encoding='utf-8') as f:
    order_content = f.read()

# Add unstable_cache and revalidateTag to imports
if 'unstable_cache' not in order_content:
    order_content = order_content.replace(
        'import { revalidatePath } from "next/cache"',
        'import { revalidatePath, unstable_cache, revalidateTag } from "next/cache"'
    )

# Add revalidateTag to updateOrderStatus and verifyOrderCollection
if "revalidateTag(`seller-stats" not in order_content:
    # Simple injection after revalidatePath
    order_content = order_content.replace(
        "revalidatePath('/seller/orders')",
        "revalidatePath('/seller/orders'); revalidateTag(`seller-stats-${order.store.userId}`); revalidateTag(`buyer-stats-${order.userId}`)"
    )

with open(order_path, 'w', encoding='utf-8') as f:
    f.write(order_content)
print("Successfully optimized order.js with revalidation tags")
