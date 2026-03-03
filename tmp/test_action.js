const { getProductById } = require('../backend/actions/product');

async function test() {
    const id = 'cmm8b9fol0001sw04gtxkjtw5';
    console.log(`Testing getProductById with ID: ${id}`);

    try {
        const res = await getProductById(id);
        console.log('Response:', JSON.stringify(res, null, 2));
    } catch (err) {
        console.error('Action Threw Error:', err);
    }
}

test();
