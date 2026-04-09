import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.TERMII_API_KEY || "TLdMBwHsEWxlbAzZPtDWdOVFMODSEtPmSPNZMzOrxhJrudeOJQmPwxOJUkeNsi";
const PHONE = "2349023323399";
const BASE_URL = "https://api.ng.termii.com";
const MESSAGE_ID = "3017752429014359703559856"; // Last SMS ID

async function runDeepDiagnostic() {
    console.log(`--- Starting Deep Diagnostic for ${PHONE} ---`);
    
    // 1. Check DND Status
    try {
        console.log(`\nStep 1: Checking DND Status...`);
        const url = `${BASE_URL}/api/check/dnd?api_key=${API_KEY}&phone_number=${PHONE}`;
        const res = await fetch(url);
        const data = await res.json();
        console.log("DND Status Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("DND Check Error:", e.message);
    }

    // 2. Check Search (Network & Validity)
    try {
        console.log(`\nStep 2: Checking Network Identity (Search API)...`);
        const url = `${BASE_URL}/api/check/search?api_key=${API_KEY}&phone_number=${PHONE}`;
        const res = await fetch(url);
        const data = await res.json();
        console.log("Search API Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Search API Error:", e.message);
    }

    // 3. Check Account Configuration (Self)
    /** 
    try {
        console.log(`\nStep 3: Checking Account Details...`);
        const url = `${BASE_URL}/api/insight/internal/account?api_key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        console.log("Account Info:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Account Check Error:", e.message);
    }
    **/
}

runDeepDiagnostic();
