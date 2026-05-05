export async function addWatermark(base64Image) {
    if (!base64Image || typeof window === 'undefined') return base64Image;
    if (base64Image.startsWith('http') || !base64Image.startsWith('data:image')) return base64Image;

    return new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(base64Image), 10000); // 10s timeout safety

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Scale handling: limit max size to reduce payload
                const MAX_WIDTH = 1000;
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
                const fontSize = Math.max(20, Math.floor(width / 15));
                ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
                
                const text = "GOCYCLE.NG";
                const metrics = ctx.measureText(text);
                const textWidth = metrics.width;
                const padding = fontSize * 0.4;
                
                // Draw background (fillRect for max compatibility)
                ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.fillRect(width - textWidth - padding * 2 - 20, height - fontSize - padding - 20, textWidth + padding * 2, fontSize + padding);

                // Draw text
                ctx.fillStyle = 'rgba(5, 223, 114, 1)'; // emerald-500
                ctx.textAlign = 'right';
                ctx.textBaseline = 'bottom';
                ctx.fillText(text, width - 30, height - 30);

                // Add a secondary subtle diagonal watermark for protection
                ctx.globalAlpha = 0.05;
                ctx.fillStyle = '#000000';
                ctx.font = `bold ${fontSize * 0.6}px Inter, sans-serif`;
                ctx.save();
                ctx.translate(width / 2, height / 2);
                ctx.rotate(-Math.PI / 4);
                ctx.textAlign = 'center';
                ctx.fillText("PROPERTY OF GOCYCLE", 0, 0);
                ctx.restore();
                
                clearTimeout(timeout);
                // Lower quality to 0.7 to keep base64 string length manageable
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            } catch (err) {
                console.error("Watermark processing error:", err);
                clearTimeout(timeout);
                resolve(base64Image);
            }
        };
        img.onerror = () => {
            clearTimeout(timeout);
            resolve(base64Image);
        };
        img.src = base64Image;
    });
}

