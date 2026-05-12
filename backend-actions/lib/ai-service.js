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
        // We check up to 3 images for better accuracy with stacks
        const imagesToCheck = images.slice(0, 3);
        
        const content = [
            {
                type: "text",
                text: `CRITICAL TASK: Verify if these images contain recycling-grade batteries.
                
                ACCEPTABLE ITEMS:
                - Lead-acid car/truck batteries (Wet, AGM, Gel)
                - Inverter or UPS batteries
                - Solar/Deep cycle storage batteries
                - Industrial batteries
                
                IMPORTANT GUIDELINES:
                - MULTIPLE BATTERIES: It is common for users to photograph stacks of batteries or multiple batteries together. This IS acceptable.
                - BACKGROUND: Batteries are often photographed in industrial, outdoor, or "informal" settings (e.g., near vehicles, in scrapyards, on the ground). This IS acceptable as long as the batteries are the subject.
                - CONDITION: Recyclable batteries are often dirty, dusty, or have minor external wear. This IS acceptable.
                
                REJECT:
                - Consumer electronics (Phones, Laptops, Remote controls)
                - Household AA/AAA/9V batteries
                - Random objects that are NOT batteries
                
                OUTPUT FORMAT (JSON ONLY):
                { 
                  "isBattery": boolean, 
                  "confidence": number (0-1), 
                  "reason": "short explanation of what was detected" 
                }`
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

        const models = ["meta-llama/llama-4-scout-17b-16e-instruct", "llama-3.2-11b-vision-preview"];
        let lastError = null;

        for (const modelId of models) {
            try {
                console.log(`[AI_SERVICE] Attempting verification with model: ${modelId}`);
                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: modelId,
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
                    console.warn(`[AI_SERVICE] Model ${modelId} failed:`, data.error.message);
                    lastError = data.error.message;
                    continue; // Try next model
                }

                const result = JSON.parse(data.choices[0].message.content);
                logToFile("GROQ_VERIFICATION_RESULT", result);
                return result;
            } catch (err) {
                console.error(`[AI_SERVICE] Exception with model ${modelId}:`, err.message);
                lastError = err.message;
                continue;
            }
        }

        // If we reach here, all models failed
        logToFile("GROQ_SERVICE_ALL_MODELS_FAILED", lastError);
        return { 
            isBattery: true, 
            confidence: 0, 
            reason: `AI service error (All models failed): ${lastError}. Proceeding with caution.` 
        };

    } catch (error) {
        logToFile("GROQ_SERVICE_EXCEPTION", error.message);
        return { isBattery: false, confidence: 0, reason: `Exception during AI verification: ${error.message}` };
    }
}
