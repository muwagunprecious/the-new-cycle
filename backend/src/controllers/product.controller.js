const prisma = require('../config/prisma');
const { mapProductToFrontend } = require('../lib/api-utils');

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Seller
 */
exports.createProduct = async (req, res) => {
    try {
        const { data, userId } = req.body; // In a real app, userId comes from auth middleware

        if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });
        if (!data.collectionDates?.length) return res.status(400).json({ success: false, message: 'Please select at least one collection date' });

        const price = parseFloat(data.price);
        const units = parseInt(data.unitsAvailable) || 0;
        const amps = parseInt(data.amps) || 0;

        if (isNaN(price) || price <= 0) return res.status(400).json({ success: false, message: 'Invalid price' });

        const store = await prisma.store.findUnique({ where: { userId } });
        if (!store) return res.status(404).json({ success: false, message: 'Store not found. Please create a store first.' });
        
        if (store.status !== 'approved' || !store.isActive) {
            return res.status(403).json({ success: false, message: 'Your store must be Approved and Active to list batteries.' });
        }

        const collectionDateStart = data.collectionDates?.length ? new Date(data.collectionDates[0]) : new Date();
        const collectionDateEnd = data.collectionDates?.length ? new Date(data.collectionDates[data.collectionDates.length - 1]) : new Date();

        const product = await prisma.product.create({
            data: {
                name: data.name,
                description: data.comments || "",
                mrp: price * 1.2,
                price: price,
                images: data.images || [],
                category: "Battery",
                type: data.batteryType === 'Cars and Truck batt (Wet cell)' ? 'CAR_TRUCK_WET' :
                    data.batteryType === 'Inverter Batt (Dry cell)' ? 'INVERTER_DRY' : 'INVERTER_WET',
                brand: data.brand || "",
                amps: amps,
                condition: data.condition || "SCRAP",
                pickupAddress: data.address,
                collectionDateStart,
                collectionDateEnd,
                collectionDates: data.collectionDates,
                quantity: units,
                storeId: store.id,
                inStock: true,
                status: "pending"
            }
        });

        res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
    } catch (error) {
        console.error("Create Product Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get all approved products for marketplace
 * @route   GET /api/products
 * @access  Public
 */
exports.getAllProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                status: 'approved',
                inStock: true,
                store: {
                    status: 'approved',
                    isActive: true
                }
            },
            include: {
                store: {
                    select: {
                        name: true,
                        address: true,
                        isVerified: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        const formatted = products.map(mapProductToFrontend);
        res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        console.error("Get All Products Error:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
};

/**
 * @desc    Get product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProductById = async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: {
                store: {
                    select: { name: true, address: true, isVerified: true, logo: true, status: true }
                }
            }
        });

        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        const mapped = mapProductToFrontend(product);
        res.status(200).json({ success: true, data: mapped });
    } catch (error) {
        console.error("Get Product By ID Error:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch product details' });
    }
};

/**
 * @desc    Get seller's products
 * @route   GET /api/products/seller/:userId
 * @access  Private/Seller
 */
exports.getSellerProducts = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const store = await prisma.store.findUnique({ where: { userId } });
        if (!store) return res.status(200).json({ success: true, data: [], pagination: { page, totalPages: 0 } });

        const [products, totalCount] = await Promise.all([
            prisma.product.findMany({
                where: { storeId: store.id },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.product.count({ where: { storeId: store.id } })
        ]);

        const formatted = products.map(mapProductToFrontend);
        res.status(200).json({
            success: true,
            data: formatted,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error) {
        console.error("Get Seller Products Error:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private/Seller
 */
exports.deleteProduct = async (req, res) => {
    try {
        const { userId } = req.body; // Mocked auth
        const productId = req.params.id;

        const store = await prisma.store.findUnique({ where: { userId } });
        if (!store) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product || product.storeId !== store.id) {
            return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });
        }

        await prisma.product.delete({ where: { id: productId } });
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
};
