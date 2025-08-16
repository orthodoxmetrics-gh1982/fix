const express = require('express');
const router = express.Router();
const { requireRole } = require('@/middleware/auth');
const DatabaseService = require('@/src/services/databaseService');

/**
 * User Management API Routes
 * Accessible only to super_admin and admin roles
 */

// GET /api/admin/users - Get all users with optional filters
router.get('/', requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { search, status, limit = 100, offset = 0 } = req.query;
    
    // Build the query
    let query = `
      SELECT 
        u.id,
        u.email,
        u.full_name,
        u.role_id,
        u.is_active,
        u.created_at,
        u.last_login,
        c.name as church_name
      FROM orthodoxmetrics_db.users u
      LEFT JOIN churches c ON u.church_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    
    // Apply search filter
    if (search) {
      query += ` AND (u.email LIKE ? OR u.full_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    // Apply status filter
    if (status === 'locked') {
      query += ` AND u.is_locked = 1`;
    } else if (status === 'active') {
      query += ` AND (u.is_locked = 0 OR u.is_locked IS NULL)`;
    }
    
    // Order by email
    query += ` ORDER BY u.email`;
    
    // Add pagination
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    console.log('🔍 Executing users query:', query);
    console.log('🔍 Query params:', params);
    const usersResult = await DatabaseService.queryPlatform(query, params);
    const users = usersResult[0] || [];
    console.log('🔍 Raw users from DB:', users.slice(0, 2)); // Log first 2 users
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM orthodoxmetrics_db.users u
      WHERE 1=1
    `;
    
    const countParams = [];
    
    if (search) {
      countQuery += ` AND (u.email LIKE ? OR u.full_name LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    if (status === 'locked') {
      countQuery += ` AND u.is_locked = 1`;
    } else if (status === 'active') {
      countQuery += ` AND (u.is_locked = 0 OR u.is_locked IS NULL)`;
    }
    
    const countResult = await DatabaseService.queryPlatform(countQuery, countParams);
    const countData = countResult[0] || [];
    const total = countData[0]?.total || 0;
    
    res.json({ success: true, users: users || [], message: 'Users fetched successfully', pagination: { total, limit: parseInt(limit), offset: parseInt(offset), hasMore: (parseInt(offset) + parseInt(limit)) < total } });
    
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      message: error.message,
      users: []
    });
  }
});

// POST /api/admin/users - Create a new user
router.post('/', requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { email, first_name, last_name, role, church_id, phone, preferred_language, send_welcome_email } = req.body;
    
    // Validate required fields
    if (!email || !first_name || !last_name || !role) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Email, first name, last name, and role are required'
      });
    }
    
    // Check if user already exists
    const existingUserQuery = `SELECT id FROM orthodoxmetrics_db.users WHERE email = ?`;
    const existingUserResult = await DatabaseService.queryPlatform(existingUserQuery, [email]);
    const existingUserData = existingUserResult[0] || [];
    
    if (existingUserData.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'User already exists',
        message: `A user with email ${email} already exists`
      });
    }
    
    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-12);
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    // Create user
    const createUserQuery = `
      INSERT INTO orthodoxmetrics_db.users (email, first_name, last_name, role, church_id, phone, preferred_language, password_hash, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())
    `;
    
    const createResult = await DatabaseService.queryPlatform(createUserQuery, [
      email,
      first_name,
      last_name,
      role,
      church_id || null,
      phone || null,
      preferred_language || 'en',
      hashedPassword
    ]);
    
    const userId = createResult[0].insertId;
    
    console.log(`✅ User created: ${email} (ID: ${userId}) by ${req.user?.email}`);
    
    res.json({
      success: true,
      message: 'User created successfully',
      tempPassword: tempPassword,
      user: {
        id: userId,
        email: email,
        first_name: first_name,
        last_name: last_name,
        role: role,
        church_id: church_id,
        phone: phone,
        preferred_language: preferred_language
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
      message: error.message
    });
  }
});

// PATCH /api/admin/users/:userId/reset-password - Reset user password
router.patch('/:userId/reset-password', requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing user ID',
        message: 'User ID is required'
      });
    }
    
    // Check if user exists
    const userQuery = `SELECT id, email FROM orthodoxmetrics_db.users WHERE id = ?`;
    const userResult = await DatabaseService.queryPlatform(userQuery, [userId]);
    const userData = userResult[0] || [];
    
    if (!userData.length) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: `No user found with ID: ${userId}`
      });
    }
    
    const user = userData[0];
    
    // Generate new password
    const newPassword = Math.random().toString(36).slice(-12);
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    const updateQuery = `UPDATE orthodoxmetrics_db.users SET password_hash = ?, updated_at = NOW() WHERE id = ?`;
    await DatabaseService.queryPlatform(updateQuery, [hashedPassword, userId]);
    
    console.log(`🔑 Password reset for user: ${user.email} by ${req.user?.email}`);
    
    res.json({
      success: true,
      message: 'Password reset successfully',
      newPassword: newPassword,
      user: {
        id: userId,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password',
      message: error.message
    });
  }
});

// DELETE /api/admin/users/:id - Delete a user
router.delete('/:id', requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate user ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID',
        message: 'User ID must be a valid number'
      });
    }
    
    // Check if user exists
    const userQuery = `SELECT id, email, role FROM orthodoxmetrics_db.users WHERE id = ?`;
    const userResult = await DatabaseService.queryPlatform(userQuery, [id]);
    const userData = userResult[0] || [];
    
    if (!userData.length) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: `No user found with ID: ${id}`
      });
    }
    
    const user = userData[0];
    
    // Prevent deleting super_admin users (safety check)
    if (user.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete super admin',
        message: 'Super admin users cannot be deleted'
      });
    }
    
    // Delete user
    const deleteQuery = `DELETE FROM orthodoxmetrics_db.users WHERE id = ?`;
    const deleteResult = await DatabaseService.queryPlatform(deleteQuery, [id]);
    
    if (deleteResult[0].affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Delete failed',
        message: 'User not found or already deleted'
      });
    }
    
    console.log(`🗑️ User deleted: ${user.email} (ID: ${id}) by ${req.user?.email}`);
    
    res.json({
      success: true,
      message: 'User deleted successfully',
      deletedUser: {
        id: parseInt(id),
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
      message: error.message
    });
  }
});

// POST /api/admin/users/:userId/lockout - Lockout a user account
router.post('/:userId/lockout', requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const lockoutReason = req.body.reason || 'Administrative action';
    
    // First check if user exists
    const userQuery = `SELECT id, email, is_locked FROM orthodoxmetrics_db.users WHERE id = ?`;
    const userResult = await DatabaseService.queryPlatform(userQuery, [userId]);
    const userData = userResult[0] || [];
    
    if (!userData.length) {
      return res.status(404).json({
      success: false,
      error: 'User not found',
      message: `No user found with ID: ${userId}`
    });
    }
    
    const user = userData[0];
    
    if (user.is_locked) {
      return res.status(400).json({
        error: 'User already locked',
        message: `User ${user.email} is already locked out`
      });
    }
    
    // Lockout the user
    const lockoutQuery = `
      UPDATE orthodoxmetrics_db.users 
      SET is_locked = 1, locked_at = NOW(), locked_by = ?, lockout_reason = ?
      WHERE id = ?
    `;
    
    await DatabaseService.queryPlatform(lockoutQuery, [
      req.user?.email || 'System',
      lockoutReason,
      userId
    ]);
    
    // Terminate all active sessions for this user
    const terminateSessionsQuery = `
      UPDATE sessions 
      SET expires = UNIX_TIMESTAMP() 
      WHERE JSON_EXTRACT(data, '$.user.id') = ?
    `;
    
    const terminateResult = await DatabaseService.queryPlatform(terminateSessionsQuery, [userId]);
    const terminatedSessions = terminateResult.affectedRows || 0;
    
    // Log the action
    const logQuery = `
      INSERT INTO activity_log (user_id, action, details, ip_address, user_agent, created_at)
      VALUES (?, 'user_locked', ?, ?, ?, NOW())
    `;
    
    await DatabaseService.queryPlatform(logQuery, [
      userId,
      JSON.stringify({
        locked_by: req.user?.email || 'System',
        reason: lockoutReason,
        terminated_sessions: terminatedSessions
      }),
      req.ip || 'unknown',
      req.get('User-Agent') || 'unknown'
    ]);
    
    console.log(`🔒 User locked out: ${req.user?.email || 'System'} locked out user ${user.email} (terminated ${terminatedSessions} sessions)`);
    
    res.json({
      success: true,
      message: `User ${user.email} has been locked out and ${terminatedSessions} active sessions terminated`,
      lockout_details: {
        user_id: userId,
        user_email: user.email,
        locked_by: req.user?.email || 'System',
        terminated_sessions: terminatedSessions,
        locked_at: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error locking out user:', error);
    res.status(500).json({
      error: 'Failed to lockout user',
      message: error.message
    });
  }
});

// POST /api/admin/users/:userId/unlock - Unlock a user account
router.post('/:userId/unlock', requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    
    // First check if user exists and is locked
    const userQuery = `SELECT id, email, is_locked FROM orthodoxmetrics_db.users WHERE id = ?`;
    const userResult = await DatabaseService.queryPlatform(userQuery, [userId]);
    const userData = userResult[0] || [];
    
    if (!userData.length) {
      return res.status(404).json({
      success: false,
      error: 'User not found',
      message: `No user found with ID: ${userId}`
    });
    }
    
    const user = userData[0];
    
    if (!user.is_locked) {
      return res.status(400).json({
        error: 'User not locked',
        message: `User ${user.email} is not currently locked out`
      });
    }
    
    // Unlock the user
    const unlockQuery = `
      UPDATE orthodoxmetrics_db.users 
      SET is_locked = 0, locked_at = NULL, locked_by = NULL, lockout_reason = NULL
      WHERE id = ?
    `;
    
    await DatabaseService.queryPlatform(unlockQuery, [userId]);
    
    // Log the action
    const logQuery = `
      INSERT INTO activity_log (user_id, action, details, ip_address, user_agent, created_at)
      VALUES (?, 'user_unlocked', ?, ?, ?, NOW())
    `;
    
    await DatabaseService.queryPlatform(logQuery, [
      userId,
      JSON.stringify({
        unlocked_by: req.user?.email || 'System'
      }),
      req.ip || 'unknown',
      req.get('User-Agent') || 'unknown'
    ]);
    
    console.log(`🔓 User unlocked: ${req.user?.email || 'System'} unlocked user ${user.email}`);
    
    res.json({
      success: true,
      message: `User ${user.email} has been unlocked and can now log in`,
      unlock_details: {
        user_id: userId,
        user_email: user.email,
        unlocked_by: req.user?.email || 'System',
        unlocked_at: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error unlocking user:', error);
    res.status(500).json({
      error: 'Failed to unlock user',
      message: error.message
    });
  }
});

// PUT /api/admin/users/:id/toggle-status - Toggle user active/inactive status
router.put('/:id/toggle-status', requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔄 Toggling user status for ID: ${id}`, 'by:', req.user?.email || req.session?.user?.email);
    
    // Validate user ID
    if (!id || isNaN(parseInt(id))) {
      console.log(`❌ Invalid user ID provided: ${id}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID',
        message: 'User ID must be a valid number'
      });
    }
    
    // Check if user exists and get current status
    console.log(`🔍 Looking up user with ID: ${id}`);
    const userQuery = `SELECT id, email, is_active FROM orthodoxmetrics_db.users WHERE id = ?`;
    const userResult = await DatabaseService.queryPlatform(userQuery, [id]);
    const userData = userResult[0] || [];
    console.log(`📊 User query result:`, userData.length, 'users found');
    
    if (!userData.length) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: `No user found with ID: ${id}`
      });
    }
    
    const user = userData[0];
    console.log(`👤 Found user: ${user.email}, current is_active: ${user.is_active} (type: ${typeof user.is_active})`);
    
    // Simple toggle: if is_active is 1 or true, set to 0; otherwise set to 1
    const newStatus = user.is_active ? 0 : 1;
    console.log(`🔄 Toggling status: ${user.is_active} -> ${newStatus}`);
    
    // Update user status
    const updateQuery = `UPDATE orthodoxmetrics_db.users SET is_active = ? WHERE id = ?`;
    console.log(`📝 Executing update query with newStatus: ${newStatus}, id: ${id}`);
    const updateResult = await DatabaseService.queryPlatform(updateQuery, [newStatus, id]);
    console.log(`📊 Update result:`, updateResult[0]);
    
    if (updateResult[0].affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Update failed',
        message: 'User not found or no changes made'
      });
    }
    
    const statusText = newStatus ? 'activated' : 'deactivated';
    console.log(`✅ User ${statusText}: ${user.email} (${user.is_active} -> ${newStatus})`);
    
    res.json({
      success: true,
      message: `User ${statusText} successfully`,
      user: {
        id: parseInt(id),
        email: user.email,
        is_active: Boolean(newStatus)
      }
    });
    
  } catch (error) {
    console.error('❌ Error toggling user status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle user status',
      message: error.message
    });
  }
});

// PUT /api/admin/users/:id - Update user data
router.put('/:id', requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log(`🔧 Updating user ID: ${id}`, 'by:', req.user?.email);
    
    // Validate user ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID',
        message: 'User ID must be a valid number'
      });
    }
    
    // Check if user exists
    const userQuery = `SELECT id, email, role FROM orthodoxmetrics_db.users WHERE id = ?`;
    const userResult = await DatabaseService.queryPlatform(userQuery, [id]);
    const userData = userResult[0] || [];
    
    if (!userData.length) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: `No user found with ID: ${id}`
      });
    }
    
    const existingUser = userData[0];
    
    // Prepare update fields (only include provided fields)
    const allowedFields = ['first_name', 'last_name', 'email', 'role', 'church_id'];
    const updateFields = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined && updateData[field] !== '') {
        updateFields[field] = updateData[field];
      }
    });
    
    // If no valid fields to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update',
        message: 'Please provide at least one field to update'
      });
    }
    
    // Build dynamic UPDATE query
    const fieldNames = Object.keys(updateFields);
    const setClause = fieldNames.map(field => `${field} = ?`).join(', ');
    const values = fieldNames.map(field => updateFields[field]);
    values.push(id);
    
    const updateQuery = `
      UPDATE orthodoxmetrics_db.users 
      SET ${setClause}, updated_at = NOW()
      WHERE id = ?
    `;
    
    const updateResult = await DatabaseService.queryPlatform(updateQuery, values);
    
    if (updateResult[0].affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Update failed',
        message: 'User not found or no changes made'
      });
    }
    
    // Fetch updated user data
    const updatedUserQuery = `
      SELECT 
        u.id,
        u.email,
        u.full_name,
        u.role_id,
        u.is_active,
        u.church_id,
        u.created_at,
        u.updated_at,
        c.name as church_name
      FROM orthodoxmetrics_db.users u
      LEFT JOIN churches c ON u.church_id = c.id
      WHERE u.id = ?
    `;
    
    const updatedUserResult = await DatabaseService.queryPlatform(updatedUserQuery, [id]);
    const updatedUser = updatedUserResult[0][0];
    
    console.log(`✅ User updated successfully: ${existingUser.email}`);
    
    res.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
      changes: updateFields
    });
    
  } catch (error) {
    console.error('❌ Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user',
      message: error.message
    });
  }
});

module.exports = router;
