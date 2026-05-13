import os

file_path = r'c:\Users\TINGO-AI-010\Documents\Go-cycle\backend-actions\actions\order.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix redundant counts (lines 182-189)
# Current lines:
# 181: export async function getUserOrders(userId) {
# 182:     // Deep Diagnostics: Log total orders in DB
# 183:     const [totalCount, userCount] = await Promise.all([
# 184:         prisma.order.count(),
# 185:         prisma.order.count({ where: { userId } })
# 186:     ]);
# 187:     
# 188:     logger.info(`[DIAGNOSTIC] Total Orders in DB: ${totalCount}, Orders for User ${userId}: ${userCount}`);
# 189:     
# 190:     try {

# New lines for 181-190
new_start = [
    "export async function getUserOrders(userId) {\n",
    "    try {\n"
]

# Fix syntax error (extra brace at 226)
# 225:         });
# 226:         });
# 227:         logger.info(`Found ${orders.length} orders for user ${userId}`)

# We will remove line 182-189 and line 226
# But indices are 0-based.
# line 181 is index 180.

lines_fixed = lines[:181] + ["    try {\n"] + lines[190:225] + lines[226:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines_fixed)

print("Successfully patched order.js")
