const { registerUser } = require('../backend/actions/auth');

async function testRegistration() {
    const testData = {
        name: 'Test User',
        email: 'test_' + Date.now() + '@example.com',
        password: 'password123',
        role: 'BUYER',
        whatsapp: '1234567890_' + Date.now(),
        businessName: ''
    };

    console.log('Testing registration with:', testData.email);
    const result = await registerUser(testData);

    if (result.success) {
        console.log('REGISTRATION_SUCCESS');
        console.log('User ID:', result.user.id);
    } else {
        console.log('REGISTRATION_FAILED');
        console.log('Error:', result.error);
    }
}

testRegistration().catch(err => {
    console.error('FATAL_ERROR');
    console.error(err);
});
