import os

file_path = r'c:\Users\TINGO-AI-010\Documents\Go-cycle\backend-actions\actions\admin.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update imports to include revalidateTag
if 'revalidateTag' not in content:
    content = content.replace(
        'import { revalidatePath, unstable_cache } from "next/cache"',
        'import { revalidatePath, unstable_cache, revalidateTag } from "next/cache"'
    )

# Functions to add revalidateTag('admin-stats') to
functions_to_update = [
    'approveSeller',
    'rejectSeller',
    'updateSellerWallet',
    'releasePayout',
    'approveBuyer',
    'rejectBuyer',
    'verifyOrderPayment'
]

for func in functions_to_update:
    # Find the function and its return ApiResponse.success line
    pattern = rf'export async function {func}[\s\S]+?return ApiResponse\.success'
    replacement = f"revalidateTag('admin-stats')\n        return ApiResponse.success"
    
    # Simple replacement if unique enough, otherwise more complex regex
    # We'll search for the function and then the next return success
    func_index = content.find(f'export async function {func}')
    if func_index != -1:
        next_success = content.find('return ApiResponse.success', func_index)
        if next_success != -1:
            # Check if already has revalidateTag
            if "revalidateTag('admin-stats')" not in content[next_success-50:next_success]:
                content = content[:next_success] + "revalidateTag('admin-stats')\n        " + content[next_success:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully added revalidateTag to admin actions")
