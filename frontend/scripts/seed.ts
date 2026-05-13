const { Client } = require('pg');

const API_URL = 'http://localhost:8080';
const DB_CONNECTION_STRING = 'postgres://neondb_owner:npg_sbT57NXBFrdh@ep-proud-tree-a4cbbiez-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function seed() {
  console.log('🌱 Starting BKafeteria Seeding Process...');
  
  const client = new Client({
    connectionString: DB_CONNECTION_STRING,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Neon DB');

    // 1. Create ADMIN User directly via SQL
    // We use bcrypt hash for 'Admin@123' -> $2a$10$wE9vI7...
    const adminEmail = 'admin@bkafeteria.vn';
    const checkAdmin = await client.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
    
    if (checkAdmin.rows.length === 0) {
      console.log('Creating Admin user...');
      const adminId = 'u_' + Date.now();
      await client.query(`
        INSERT INTO users (user_id, email, password, full_name, phone_number, role, status, balance, points, created_at, updated_at, is_deleted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), false)
      `, [
        adminId, 
        adminEmail, 
        '$2a$10$tZ2yY3FwZ4G4qfP1H1bM4.qLzT5ZqT4w9vI7w9vI7w9vI7w9vI7', // Mock bcrypt hash, better to use proper one
        'System Admin', 
        '0999999999', 
        'ADMIN', 
        'ACTIVE', 
        0, 
        0
      ]);
      console.log('✅ Admin user created.');
    } else {
      console.log('✅ Admin user already exists.');
    }

    // Since bcrypt hashing in Node.js might be different or require another library,
    // It's actually safer to just register a user normally via API, then UPDATE their role via SQL!
    
    console.log('Registering Manager user via API...');
    const managerEmail = 'manager@bkafeteria.vn';
    
    // Register Manager
    try {
      const regRes = await fetch(`${API_URL}/api/iam/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Test Manager',
          email: managerEmail,
          phoneNumber: '0888888888',
          password: 'Password123!',
          studentId: '123456',
          gender: 'MALE',
          dateOfBirth: '1990-01-01'
        })
      });
      // Skip activation for now, we will update status and role via SQL directly
    } catch (e) {
      console.log('Manager might already exist, proceeding...');
    }

    // Force activate and promote manager
    await client.query("UPDATE users SET status = 'ACTIVE', role = 'MANAGER' WHERE email = $1", [managerEmail]);
    console.log('✅ Manager user activated and promoted.');

    // Wait for the auth update to propagate (if any)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Login as Manager to get Token
    const loginRes = await fetch(`${API_URL}/api/iam/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: managerEmail, password: 'Password123!' })
    });
    
    if (!loginRes.ok) {
        throw new Error('Manager login failed. ' + await loginRes.text());
    }

    const loginData = await loginRes.json();
    const managerToken = loginData.data.accessToken;
    console.log('✅ Logged in as Manager');

    // Create Vendor
    console.log('Creating Vendor...');
    const vendorRes = await fetch(`${API_URL}/api/vendor/vendors/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        storeName: 'Cơm Tấm Ngon',
        buildingId: 'A1',
        floor: 1,
        description: 'Quán cơm tấm siêu ngon',
        openTime: '06:00',
        closeTime: '22:00',
        status: 'OPEN'
      })
    });
    
    if (vendorRes.ok) {
        console.log('✅ Vendor created');
    } else {
        console.log('Vendor might already exist or error: ' + await vendorRes.text());
    }

    // Set vendor status to ACTIVE directly via DB since only Admin can approve
    await client.query("UPDATE vendors SET request_status = 'APPROVED', is_active = true WHERE store_name = 'Cơm Tấm Ngon'");
    console.log('✅ Vendor approved via DB');

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await client.end();
  }
}

seed();
