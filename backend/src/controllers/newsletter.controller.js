const prisma = require('../config/prisma');
const { logger } = require('../lib/api-utils');

/**
 * @desc    Subscribe to newsletter
 * @route   POST /api/newsletter/subscribe
 * @access  Public
 */
exports.subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ success: false, message: "Please provide a valid email address." });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email: normalizedEmail }
        });

        if (existingSubscriber) {
            return res.status(200).json({ success: true, message: "You are already subscribed to our newsletter!" });
        }

        await prisma.newsletterSubscriber.create({
            data: { email: normalizedEmail }
        });

        logger.info(`New newsletter subscription: ${normalizedEmail}`);
        res.status(201).json({ success: true, message: "Successfully subscribed to the newsletter!" });

    } catch (error) {
        logger.error("Subscribe Newsletter Error:", error);
        res.status(500).json({ success: false, message: "Failed to subscribe. Please try again later." });
    }
};
