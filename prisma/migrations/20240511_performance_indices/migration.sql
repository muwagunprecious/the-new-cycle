-- Performance indices for slow query optimization
-- Add index on users.name for alphabetical queries
CREATE INDEX IF NOT EXISTS "users_name_idx" ON "users"("name");

-- Add index on users.accountStatus for verification queries
CREATE INDEX IF NOT EXISTS "users_accountStatus_idx" ON "users"("accountStatus");

-- Add index on Order.payoutStatus for admin dashboard
CREATE INDEX IF NOT EXISTS "Order_payoutStatus_idx" ON "Order"("payoutStatus");

-- Add index on Order.paymentStatus for order filtering
CREATE INDEX IF NOT EXISTS "Order_paymentStatus_idx" ON "Order"("paymentStatus");

-- Add index on Order.isPaid for payment verification
CREATE INDEX IF NOT EXISTS "Order_isPaid_idx" ON "Order"("isPaid");

-- Add index on Store.isActive for marketplace product queries
CREATE INDEX IF NOT EXISTS "Store_isActive_idx" ON "Store"("isActive");

-- Add composite index for product status + store status (most common query)
CREATE INDEX IF NOT EXISTS "Product_status_storeId_idx" ON "Product"("status", "storeId");

-- Add index on Order.createdAt for sorting
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt");

-- Add composite index on notifications for unread queries
CREATE INDEX IF NOT EXISTS "Notification_userId_status_idx" ON "Notification"("userId", "status");