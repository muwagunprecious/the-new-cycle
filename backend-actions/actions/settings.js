'use server'

import prisma from "@/backend/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * Get all settings for a specific group (e.g., 'termii')
 */
export async function getSettingsByGroup(group) {
    try {
        const settings = await prisma.setting.findMany({
            where: { group }
        })
        
        // Convert array to object
        const config = {}
        settings.forEach(s => {
            config[s.key] = s.value
        })
        
        return { success: true, data: config }
    } catch (error) {
        console.error(`Error fetching ${group} settings:`, error)
        return { success: false, error: "Failed to fetch system settings" }
    }
}

/**
 * Update multiple settings at once
 */
export async function updateSettings(settingsList, group = "general") {
    try {
        const operations = settingsList.map(s => 
            prisma.setting.upsert({
                where: { key: s.key },
                update: { value: s.value, group },
                create: { key: s.key, value: s.value, group }
            })
        )
        
        await Promise.all(operations)
        
        revalidatePath('/admin/settings')
        return { success: true, message: "Settings updated successfully" }
    } catch (error) {
        console.error("Error updating settings:", error)
        return { success: false, error: "Failed to update settings" }
    }
}

/**
 * Test Termii Connection and Fetch Approved Senders
 */
export async function fetchTermiiSenderIds(apiKey, baseUrl) {
    if (!apiKey || !baseUrl) return { success: false, error: "API Key and Base URL are required" }
    
    try {
        const url = `${baseUrl}/api/sender-id?api_key=${apiKey}`
        const response = await fetch(url)
        const data = await response.json()
        
        if (response.ok && data.content) {
            // Filter for active senders in Nigeria (common usecase)
            const activeSenders = data.content
                .filter(s => s.status === 'active')
                .map(s => s.sender_id)
            
            return { 
                success: true, 
                senders: activeSenders,
                allSenders: data.content 
            }
        } else {
            return { 
                success: false, 
                error: data.message || "Failed to fetch sender IDs from Termii" 
            }
        }
    } catch (error) {
        console.error("Termii Fetch Error:", error)
        return { success: false, error: "Connection to Termii failed" }
    }
}

/**
 * Get Comprehensive Termii Status (Balance + Senders)
 */
export async function getTermiiFullStatus(apiKey, baseUrl) {
    if (!apiKey || !baseUrl) return { success: false, error: "API Credentials missing" }

    try {
        const [sendersRes, balanceRes] = await Promise.all([
            fetch(`${baseUrl}/api/sender-id?api_key=${apiKey}`).then(r => r.json()),
            fetch(`${baseUrl}/api/get-balance?api_key=${apiKey}`).then(r => r.json())
        ])

        return {
            success: true,
            balance: balanceRes.balance || 0,
            currency: balanceRes.currency || 'NGN',
            senders: sendersRes.content || [],
            raw: { sendersRes, balanceRes }
        }
    } catch (error) {
        return { success: false, error: "Failed to communicate with Termii" }
    }
}

/**
 * Test QoreID connection by attempting to get a token
 */
export async function testQoreIDConnection(clientId, secretKey, baseUrl) {
    if (!clientId || !secretKey || !baseUrl) return { success: false, error: "All credentials are required" }

    try {
        const url = `${baseUrl}/token`
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                clientId: clientId,
                secret: secretKey
            })
        })

        const data = await response.json()
        
        if (response.ok && data.accessToken) {
            return { 
                success: true, 
                message: "Connection successful!",
                expiresIn: data.expiresIn 
            }
        } else {
            return { 
                success: false, 
                error: data.message || data.error || "Authentication failed" 
            }
        }
    } catch (error) {
        console.error("QoreID Test Error:", error)
        return { success: false, error: "Connection to QoreID failed" }
    }
}
