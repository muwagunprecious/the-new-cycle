import pg from 'pg';
const { Client } = pg;
import bcrypt from 'bcryptjs';

// Trying the previously reachable host with the new password
// Host: aws-1-eu-west-1.pooler.supabase.com
// User: postgres.fbsmnlinkndqiiicpuet
// Pass: 66bL8Z0vCK31RR7W
// Use DIRECT_URL for direct connection (bypassing pooler if needed for scripts) or DATABASE_URL
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
    console.error("❌ No database connection string found in environment variables.");
    process.exit(1);
}

async function createAdmin() {
    const client = new Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('🔄 Connecting to database...');
        console.log('   Host: aws-1-eu-west-1.pooler.supabase.com');
        await client.connect();
        console.log('✅ Connected!');

        console.log('🔄 Hashing password...');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        console.log('🔄 Creating admin user...');

        const query = `
            INSERT INTO "User" (id, email, name, password, role, image, cart, "isEmailVerified")
            VALUES ($1, $2, $3, $4, 'ADMIN', $5, '{}'::jsonb, true)
            ON CONFLICT (email) 
            DO UPDATE SET 
                role = 'ADMIN',
                "isEmailVerified" = true,
                password = EXCLUDED.password
            RETURNING id, email, name, role;
        `;

        const values = [
            'user_admin_seed',
            'admin@gmail.com',
            'System Admin',
            hashedPassword,
            ''
        ];

        const result = await client.query(query, values);

        console.log('\n✅ Admin user created successfully!');
        console.log('📧 Email:', result.rows[0].email);
        console.log('👤 Name:', result.rows[0].name);
        console.log('🔑 Role:', result.rows[0].role);
        console.log('\n🔐 Login credentials:');
        console.log('   Email: admin@gmail.com');
        console.log('   Password: admin123');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Details:', error);
        throw error;
    } finally {
        await client.end();
    }
}

createAdmin()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
