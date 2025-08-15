const { promisePool } = require('../../config/db');
const bcrypt = require('bcrypt');

async function resetSuperAdminPassword() {
  try {
    console.log('🔐 Resetting superadmin password...');
    
    // Create a fresh password hash for "admin123"
    console.log('1. Generating new password hash...');
    const password = 'admin123';
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(password, saltRounds);
    
    console.log('✅ New hash generated');
    
    // Update the user with the new hash
    console.log('2. Updating database...');
    const [result] = await promisePool.query(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE email = ?',
      [newPasswordHash, 'superadmin@orthodoxmetrics.com']
    );
    
    if (result.affectedRows === 0) {
      console.log('❌ No user found with email superadmin@orthodoxmetrics.com');
      process.exit(1);
    }
    
    console.log('✅ Password hash updated successfully');
    
    // Verify the new hash works
    console.log('3. Testing the new password...');
    const [users] = await promisePool.query(
      'SELECT password_hash FROM users WHERE email = ?',
      ['superadmin@orthodoxmetrics.com']
    );
    
    const isValid = await bcrypt.compare(password, users[0].password_hash);
    console.log('✅ Password verification test:', isValid ? 'PASSED' : 'FAILED');
    
    if (!isValid) {
      console.log('❌ Something went wrong with the password reset');
      process.exit(1);
    }
    
    // Show final status
    console.log('\n🎉 SUCCESS! Password reset complete.');
    console.log('');
    console.log('📋 Login credentials:');
    console.log('   Email: superadmin@orthodoxmetrics.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('🔗 Next steps:');
    console.log('1. Go to your login page');
    console.log('2. Use the credentials above');
    console.log('3. Should work immediately');
    console.log('4. After login, Content & Services tabs should be visible');
    
    console.log('\n💡 If login still fails:');
    console.log('- Check browser console for JavaScript errors');
    console.log('- Make sure your application server is running');
    console.log('- Try a different browser or incognito mode');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
    console.log('\n🚨 Manual SQL command to try:');
    
    // Generate a simpler hash manually
    try {
      const simpleHash = await bcrypt.hash('admin123', 10);
      console.log(`UPDATE users SET password_hash = '${simpleHash}' WHERE email = 'superadmin@orthodoxmetrics.com';`);
    } catch (hashError) {
      console.log('UPDATE users SET password_hash = "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi" WHERE email = "superadmin@orthodoxmetrics.com";');
      console.log('(This hash is for password: "hello")');
    }
    
    process.exit(1);
  }
}

resetSuperAdminPassword(); 