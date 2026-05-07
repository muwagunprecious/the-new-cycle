import { logToFile } from "./server-logger";

/**
 * Verifies if the provided images are actually batteries using Groq Vision (Llama 3.2).
 * @param {string[]} images - Array of base64 image strings.
 * @returns {Promise<{ isBattery: boolean, confidence: number, reason: string }>}
 */
export async function verifyIsBattery(images) {
    if (!images || images.length === 0) {
        return { isBattery: false, confidence: 0, reason: "No images provided" };
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        logToFile("AI_SERVICE_ERROR: Groq API key is missing");
        return { isBattery: true, confidence: 0, reason: "Verification skipped: AI service unavailable (Key missing)" };
    }

    try {
        // We only check the first 2 images to save tokens/time
        const imagesToCheck = images.slice(0, 2);
        
        const content = [
            {
                type: "text",
                text: `CRITICAL TASK: Verify if the primary object in these images is a recycling-grade battery (Car battery, Inverter/UPS battery, Solar battery, Deep cycle, or Lead-acid). 
                Reject consumer electronics (Phones, Laptops, Remote controls) and household AA/AAA batteries. 
                Answer ONLY in JSON format: { "isBattery": boolean, "confidence": number (0-1), "reason": "string explanation" }. 
                If the image is not a battery or contains prohibited items, set isBattery: false.`
            }
        ];

        for (const img of imagesToCheck) {
            const base64Data = img.includes(",") ? img.split(",")[1] : img;
            content.push({
                type: "image_url",
                image_url: {
                    url: `data:image/jpeg;base64,${base64Data}`
                }
            });
        }

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "meta-llama/llama-4-scout-17b-16e-instruct",
                messages: [
                    {
                        role: "user",
                        content: content
                    }
                ],
                response_format: { type: "json_object" },
                max_tokens: 300
            })
        });

        const data = await response.json();
        
        if (data.error) {
            logToFile("GROQ_SERVICE_ERROR", data.error);
            return { isBattery: false, confidence: 0, reason: `AI service error: ${data.error.message || 'Unknown error'}` };
        }

        const result = JSON.parse(data.choices[0].message.content);
        logToFile("GROQ_VERIFICATION_RESULT", result);
        return result;

    } catch (error) {
        logToFile("GROQ_SERVICE_EXCEPTION", error.message);
        return { isBattery: false, confidence: 0, reason: `Exception during AI verification: ${error.message}` };
    }
}
