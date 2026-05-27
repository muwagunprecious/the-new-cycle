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
                text: `CRITICAL TASK: You are an expert battery appraiser. Verify if these images contain recycling-grade batteries.
                
                ACCEPTABLE ITEMS:
                - Lead-acid car/truck batteries (Wet, AGM, Gel)
                - Inverter or UPS batteries
                - Solar/Deep cycle storage batteries
                - Industrial batteries
                
                VISUAL CHARACTERISTICS TO ACCEPT:
                - Black, white, translucent, or ANY color rectangular plastic casings (they look like heavy plastic boxes).
                - Lead metal terminals, posts, or caps on the top surface.
                - Paper or plastic labels indicating voltage/capacity (e.g., "12V", "38AH", "150AH", "MF", "POWER STAR", "RUNALL").
                
                CRITICAL GUIDELINES (DO NOT REJECT IF THESE ARE TRUE):
                - STACKS/MULTIPLE BATTERIES: Users frequently photograph stacks of batteries resting on top of each other. This is perfectly acceptable.
                - OUTDOOR/INFORMAL SETTINGS: Batteries are almost always photographed outside on dirt, gravel, concrete, or in scrapyards, often with vehicles (like yellow buses or cars) or people in the background. THIS IS THE EXPECTED NORM. Do not reject because of the background.
                - DIRT & WEAR: These are scrap batteries. They will be dirty, dusty, scuffed, or have peeling stickers. This is expected.
                
                REJECT ONLY:
                - Small consumer electronics (Phones, Laptops, Remote controls)
                - Tiny household batteries (AA, AAA, 9V button cells)
                - Images completely devoid of any battery-like rectangular boxes.
                
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

        const models = ["llama-3.2-11b-vision-preview", "llama-3.2-90b-vision-preview"];
        let lastError = null;

        for (const modelId of models) {
            try {
                console.log(`[AI_SERVICE] Attempting verification with model: ${modelId}`);
                const abortController = new AbortController();
                const timeoutId = setTimeout(() => abortController.abort(), 5000); // 5s timeout (Fast UX)
                
                
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
                    }),
                    signal: abortController.signal
                });
                
                clearTimeout(timeoutId);

                const data = await response.json();
                
                if (data.error) {
                    console.warn(`[AI_SERVICE] Model ${modelId} failed:`, data.error.message);
                    lastError = data.error.message;
                    continue; // Try next model
                }

                const result = JSON.parse(data.choices[0].message.content);
                if (!result.reason) result.reason = "No specific reason provided by AI.";
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
