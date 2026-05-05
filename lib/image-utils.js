/**
 * Adds a Gocycle watermark to a base64 image string.
 * @param {string} base64Image - The original image in base64 format.
 * @returns {Promise<string>} - A promise that resolves with the watermarked base64 image.
 */
export async function addWatermark(base64Image) {
    if (!base64Image || typeof window === 'undefined') return base64Image;
    if (base64Image.startsWith('http') || !base64Image.startsWith('data:image')) return base64Image;

    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Scale handling: limit max size for performance but keep quality
            const MAX_WIDTH = 1200;
            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;

            // Draw original image
            ctx.drawImage(img, 0, 0, width, height);

            // Watermark configuration
            const fontSize = Math.max(24, Math.floor(width / 12));
            ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
            
            // Draw semi-transparent background for the watermark text to ensure readability
            const text = "GOCYCLE.NG";
            const metrics = ctx.measureText(text);
            const textWidth = metrics.width;
            const padding = fontSize * 0.5;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.roundRect(width - textWidth - padding * 2 - 20, height - fontSize - padding - 20, textWidth + padding * 2, fontSize + padding, 10);
            ctx.fill();

            // Draw text
            ctx.fillStyle = 'rgba(5, 223, 114, 0.9)'; // emerald-500
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            ctx.fillText(text, width - 30, height - 30);

            // Add a secondary subtle diagonal watermark for protection
            ctx.globalAlpha = 0.1;
            ctx.fillStyle = '#000000';
            ctx.font = `bold ${fontSize * 0.8}px Inter, sans-serif`;
            ctx.translate(width / 2, height / 2);
            ctx.rotate(-Math.PI / 4);
            ctx.textAlign = 'center';
            ctx.fillText("PROPERTY OF GOCYCLE", 0, 0);
            
            resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => resolve(base64Image);
        img.src = base64Image;
    });
}
