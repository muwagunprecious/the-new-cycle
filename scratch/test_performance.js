require('dotenv').config();

async function run() {
    const productLib = await import('../backend-actions/actions/product.js');
    const { getAllProducts } = productLib;

    console.log('Testing getAllProducts performance...');
    const start = Date.now();
    
    try {
        const result = await getAllProducts();
        const duration = Date.now() - start;
        console.log(`getAllProducts took: ${duration}ms`);
        console.log(`Products found: ${result.data?.length || 0}`);
    } catch (err) {
        console.error('Performance test failed:', err);
    }
}

run().catch(console.error);
