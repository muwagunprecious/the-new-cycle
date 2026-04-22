'use server'

import { ApiResponse } from "@/backend/lib/api-response";
import prisma from "@/backend/lib/prisma";

export async function testServerConnection() {
    console.log("!!! CONNECTION TEST RECEIVED ON SERVER !!!");
    try {
        // Quick DB check
        const userCount = await prisma.user.count();
        console.log(`[CONN TEST] DB is reachable. User count: ${userCount}`);
        
        return ApiResponse.success({ 
            connected: true, 
            dbStatus: "Healthy",
            userCount,
            serverTime: new Date().toISOString()
        }, "Server is alive and reaching the database.");
    } catch (error) {
        console.error("[CONN TEST ERROR]", error.message);
        return ApiResponse.error("Server is alive but DB is unreachable: " + error.message);
    }
}
