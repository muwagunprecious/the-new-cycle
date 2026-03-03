const { getProductById } = require('./backend/actions/product');

async function test() {
    const id = 'cmm8b9fol0001sw04gtxkjtw5';
    console.log(`Testing getProductById for ID: ${id}`);
    const result = await getProductById(id);
    console.log("Result success:", result.success);
    console.log("Result keys:", Object.keys(result));
    if (result.success) {
        console.log("Product Name:", result.name || result.product?.name);
        console.log("Product Description:", result.description || result.product?.description);
    }
}

test().catch(console.error);
