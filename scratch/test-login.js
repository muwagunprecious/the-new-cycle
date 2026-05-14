import { loginUser } from './backend-actions/actions/auth.js';

async function runTest() {
    try {
        const res = await loginUser('admin@gocycle.com', 'admin'); // Assuming 'admin' is password or it will fail
        console.log("LOGIN RESULT KEYS:", Object.keys(res));
        console.log("HAS USER:", !!res.user);
        console.log("HAS DATA.USER:", !!(res.data && res.data.user));
    } catch (e) {
        console.error(e);
    }
}
runTest();
