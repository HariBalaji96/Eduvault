const axios = require('axios');

async function check() {
    try {
        const loginRes = await axios.post('http://localhost:8080/api/auth/login', {
            email: 'teacher@eduvault.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Login successful. Token:', token.substring(0, 10) + '...');

        const classesRes = await axios.get('http://localhost:8080/api/admin/classes', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Classes:', classesRes.data);
    } catch (e) {
        console.error('Error:', e.response ? e.response.status + ' ' + e.response.data.error : e.message);
    }
}
check();
