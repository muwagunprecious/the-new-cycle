const { getAllProducts } = require('./backend/actions/product');

async function main() {
    try {
        const res = await getAllProducts();
        console.log(JSON.stringify(res, null, 2));
    } catch (err) {
        console.error("Error calling getAllProducts:", err);
    }
}
main();
