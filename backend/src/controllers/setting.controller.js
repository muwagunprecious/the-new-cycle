const prisma = require('../config/prisma');

/**
 * @desc    Get all settings for a specific group
 * @route   GET /api/settings/:group
 */
exports.getSettingsByGroup = async (req, res) => {
    try {
        const { group } = req.params;
        const settings = await prisma.setting.findMany({
            where: { group }
        });
        
        const config = {};
        settings.forEach(s => {
            config[s.key] = s.value;
        });
        
        res.status(200).json({ success: true, data: config });
    } catch (error) {
        console.error(`Error fetching ${req.params.group} settings:`, error);
        res.status(500).json({ success: false, message: "Failed to fetch system settings" });
    }
};

/**
 * @desc    Update multiple settings
 * @route   POST /api/settings
 */
exports.updateSettings = async (req, res) => {
    try {
        const { settingsList, group = "general" } = req.body;
        
        const operations = settingsList.map(s => 
            prisma.setting.upsert({
                where: { key: s.key },
                update: { value: s.value, group },
                create: { key: s.key, value: s.value, group }
            })
        );
        
        await Promise.all(operations);
        res.status(200).json({ success: true, message: "Settings updated successfully" });
    } catch (error) {
        console.error("Error updating settings:", error);
        res.status(500).json({ success: false, message: "Failed to update settings" });
    }
};

/**
 * @desc    Test Termii Connection
 * @route   POST /api/settings/test-termii
 */
exports.testTermii = async (req, res) => {
    const { apiKey, baseUrl } = req.body;
    if (!apiKey || !baseUrl) return res.status(400).json({ success: false, message: "API Credentials missing" });

    try {
        const [sendersRes, balanceRes] = await Promise.all([
            fetch(`${baseUrl}/api/sender-id?api_key=${apiKey}`).then(r => r.json()),
            fetch(`${baseUrl}/api/get-balance?api_key=${apiKey}`).then(r => r.json())
        ]);

        res.status(200).json({
            success: true,
            balance: balanceRes.balance || 0,
            currency: balanceRes.currency || 'NGN',
            senders: sendersRes.content || []
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to communicate with Termii" });
    }
};

/**
 * @desc    Test QoreID Connection
 * @route   POST /api/settings/test-qoreid
 */
exports.testQoreID = async (req, res) => {
    const { clientId, secretKey, baseUrl } = req.body;
    if (!clientId || !secretKey || !baseUrl) return res.status(400).json({ success: false, message: "All credentials are required" });

    try {
        const response = await fetch(`${baseUrl}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ clientId, secret: secretKey })
        });

        const data = await response.json();
        if (response.ok && data.accessToken) {
            res.status(200).json({ success: true, message: "Connection successful!", expiresIn: data.expiresIn });
        } else {
            res.status(400).json({ success: false, message: data.message || data.error || "Authentication failed" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Connection to QoreID failed" });
    }
};
