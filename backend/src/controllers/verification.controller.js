const prisma = require('../config/prisma');
const { logger } = require('../lib/api-utils');
const { verifyNIN, verifyCAC } = require('../lib/qoreid');

/**
 * @desc    Verify NIN for a user
 * @route   POST /api/verification/nin
 * @access  Private
 */
exports.verifyUserNIN = async (req, res) => {
    try {
        const { userId, nin, userData } = req.body;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        let isVerified = false;
        let result = null;

        // TEST MODE BYPASS for NIN
        if (nin === '70123456789') {
            logger.info('TEST MODE: Bypassing QoreID for NIN', { userId });
            isVerified = true;
            result = { status: 'success', summary: { status: 'VERIFIED', description: 'Test Mode Bypass' } };
        } else {
            result = await verifyNIN(nin, userData);
            isVerified = result.status === 'success' ||
                result.status?.status === 'verified' ||
                result.status?.state === 'complete' ||
                result.summary?.status === 'VERIFIED' ||
                result.summary?.nin_check?.status === 'EXACT_MATCH';
        }

        if (isVerified) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    ninDocument: nin,
                    isPhoneVerified: true,
                    accountStatus: 'pending',
                    verifiedAt: new Date()
                }
            });
            return res.status(200).json({ success: true, data: result, message: "NIN verification successful" });
        }

        const errorMessage = result.summary?.description || result.message || result.error || 'NIN verification failed';
        res.status(400).json({ success: false, message: errorMessage });
    } catch (error) {
        logger.error('NIN Verification Error', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Verify CAC for a seller
 * @route   POST /api/verification/cac
 * @access  Private
 */
exports.verifyUserCAC = async (req, res) => {
    try {
        const { userId, rcNumber } = req.body;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const user = await prisma.user.findUnique({ where: { id: userId } });

        // TEST MODE BYPASS for CAC
        if (rcNumber === 'RC0000000') {
            logger.info('TEST MODE: Bypassing QoreID for CAC', { userId });
            
            const businessName = "GO-CYCLE TEST CORP";
            const businessType = "PRIVATE LIMITED COMPANY";
            const isDirectorVerified = true;

            const store = await prisma.store.findUnique({ where: { userId } });
            if (store) {
                await prisma.store.update({
                    where: { id: store.id },
                    data: { cac: rcNumber, status: 'approved', isVerified: true, isDirectorVerified: isDirectorVerified }
                });
            }

            await prisma.user.update({
                where: { id: userId },
                data: {
                    cacDocument: rcNumber,
                    businessName: businessName,
                    businessType: businessType,
                    isDirectorVerified: isDirectorVerified,
                    verifiedAt: new Date()
                }
            });

            return res.status(200).json({
                success: true,
                message: "CAC verification successful (TEST MODE)",
                data: { businessName, businessType, isDirectorVerified }
            });
        }

        const result = await verifyCAC(rcNumber);
        const isVerified = result.status === 'success' || 
                          result.status?.status === 'verified' || 
                          result.summary?.cac_check === 'verified' ||
                          result.summary?.status === 'VERIFIED';

        if (isVerified) {
            const businessData = result.cac || result.data || {};
            const businessName = businessData.companyName || businessData.entityName || "Unknown Business";
            const businessType = businessData.companyType || businessData.entityType || "N/A";
            
            let isDirectorVerified = false;
            const directors = businessData.directors || businessData.fiduciaries || [];
            
            if (user && user.ninDocument && directors.length > 0) {
                const userFullName = (user.fullName || user.name || "").toLowerCase();
                isDirectorVerified = directors.some(director => {
                    const dFirst = (director.firstname || director.first_name || "").toLowerCase();
                    const dLast = (director.lastname || director.last_name || director.surname || "").toLowerCase();
                    return (dFirst.length > 1 && userFullName.includes(dFirst)) && 
                           (dLast.length > 1 && userFullName.includes(dLast));
                });
            }

            const store = await prisma.store.findUnique({ where: { userId } });
            if (store) {
                await prisma.store.update({
                    where: { id: store.id },
                    data: { cac: rcNumber, status: 'approved', isVerified: true, isDirectorVerified: isDirectorVerified }
                });
            }

            await prisma.user.update({
                where: { id: userId },
                data: {
                    cacDocument: rcNumber,
                    businessName: businessName,
                    businessType: businessType,
                    isDirectorVerified: isDirectorVerified,
                    verifiedAt: new Date()
                }
            });

            return res.status(200).json({
                success: true,
                data: { ...result, businessName, businessType, isDirectorVerified },
                message: "CAC verification successful"
            });
        }

        const errorMessage = result.summary?.description || result.message || result.error || 'CAC verification failed';
        res.status(400).json({ success: false, message: errorMessage });
    } catch (error) {
        logger.error('CAC Verification Error', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
