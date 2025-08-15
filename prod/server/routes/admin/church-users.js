// server/routes/admin/church-users.js - Church-Specific User Management Routes
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { promisePool } = require('../../config/db');
const { requireAuth, requireRole } = require('../../middleware/auth');

// Middleware for admin access
const requireAdmin = requireRole(['admin', 'super_admin']);

/**
 * Standardized API response helper
 */
function apiResponse(success, data = null, error = null, meta = null) {
    const response = { success };
    if (data) response.data = data;
    if (error) response.error = error;
    if (meta) response.meta = meta;
    return response;
}

/**
 * Validates church access and existence
 */
async function validateChurchAccess(churchId) {
    const [churches] = await promisePool.query(
        'SELECT id, name FROM churches WHERE id = ? AND is_active = 1',
        [churchId]
    );
    
    if (churches.length === 0) {
        throw new Error('Church not found or inactive');
    }
    
    return churches[0];
}

/**
 * Validates user assignment to church
 */
async function validateUserChurchAssignment(userId, churchId) {
    const [assignments] = await promisePool.query(
        'SELECT u.id, u.email FROM orthodoxmetrics_db.users u JOIN church_users cu ON u.id = cu.user_id WHERE u.id = ? AND cu.church_id = ?',
        [userId, churchId]
    );
    
    if (assignments.length === 0) {
        throw new Error('User not found or not assigned to this church');
    }
    
    return assignments[0];
}

// GET /api/admin/church-users/:churchId - Get users for a specific church
router.get('/:churchId', requireAuth, requireAdmin, async (req, res) => {
    try {
        const churchId = parseInt(req.params.churchId);
        console.log('👥 Getting users for church ID:', churchId);

        // Validate church exists
        await validateChurchAccess(churchId);

        // Get users assigned to this church via junction table
        const [users] = await promisePool.query(`
            SELECT 
                u.id, 
                u.email, 
                u.first_name, 
                u.last_name, 
                u.role as system_role, 
                u.is_active, 
                u.last_login, 
                u.created_at, 
                u.updated_at,
                cu.role as church_role
            FROM church_users cu
            JOIN orthodoxmetrics_db.users u ON cu.user_id = u.id
            WHERE cu.church_id = ?
            ORDER BY u.created_at DESC
        `, [churchId]);

        res.json(apiResponse(true, { 
            users,
            church_id: churchId,
            total_users: users.length 
        }));

    } catch (error) {
        console.error('❌ Error getting church users:', error);
        res.status(error.message.includes('not found') ? 404 : 500).json(
            apiResponse(false, null, error.message)
        );
    }
});

// POST /api/admin/church-users/:churchId - Add new user to church
router.post('/:churchId', requireAuth, requireAdmin, async (req, res) => {
    try {
        const churchId = parseInt(req.params.churchId);
        const { email, first_name, last_name, role, is_active = true, phone, landing_page, password } = req.body;
        
        console.log('👤 Adding new user to church ID:', churchId);

        // Validate required fields
        if (!email || !first_name || !last_name || !role || !password) {
            return res.status(400).json(
                apiResponse(false, null, 'Missing required fields: email, first_name, last_name, role, password')
            );
        }

        // Validate church exists
        await validateChurchAccess(churchId);

        // Check if user already exists
        const [existingUsers] = await promisePool.query(
            'SELECT id FROM orthodoxmetrics_db.users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json(
                apiResponse(false, null, 'User with this email already exists in the system')
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into orthodoxmetrics_db.users
        const [result] = await promisePool.query(`
            INSERT INTO orthodoxmetrics_db.users 
            (email, first_name, last_name, phone, role, is_active, landing_page, password_hash, church_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [email, first_name, last_name, phone, role, is_active, landing_page, hashedPassword, churchId]);

        const newUserId = result.insertId;

        // Assign user to church via church_users junction table
        await promisePool.query(
            'INSERT INTO church_users (church_id, user_id, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE role = VALUES(role)',
            [churchId, newUserId, role]
        );

        console.log(`✅ User created and assigned to church ${churchId}`);

        res.status(201).json(apiResponse(true, {
            user_id: newUserId,
            message: 'User created and assigned to church successfully'
        }));

    } catch (error) {
        console.error('❌ Error adding user to church:', error);
        res.status(error.message.includes('not found') ? 404 : 500).json(
            apiResponse(false, null, error.message)
        );
    }
});

// PUT /api/admin/church-users/:churchId/:userId - Update church user
router.put('/:churchId/:userId', requireAuth, requireAdmin, async (req, res) => {
    try {
        const churchId = parseInt(req.params.churchId);
        const userId = parseInt(req.params.userId);
        const { email, first_name, last_name, role, is_active, phone, landing_page, password } = req.body;
        
        console.log('👤 Updating user ID:', userId, 'in church ID:', churchId);

        // Validate church exists
        await validateChurchAccess(churchId);

        // Validate user exists in system
        const [existingUsers] = await promisePool.query(
            'SELECT id FROM orthodoxmetrics_db.users WHERE id = ?',
            [userId]
        );

        if (existingUsers.length === 0) {
            return res.status(404).json(
                apiResponse(false, null, 'User not found')
            );
        }

        // Prepare update query for orthodoxmetrics_db.users
        let updateFields = [];
        let updateValues = [];

        if (email) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }
        if (first_name) {
            updateFields.push('first_name = ?');
            updateValues.push(first_name);
        }
        if (last_name) {
            updateFields.push('last_name = ?');
            updateValues.push(last_name);
        }
        if (role) {
            updateFields.push('role = ?');
            updateValues.push(role);
        }
        if (typeof is_active === 'boolean') {
            updateFields.push('is_active = ?');
            updateValues.push(is_active);
        }
        if (phone) {
            updateFields.push('phone = ?');
            updateValues.push(phone);
        }
        if (landing_page) {
            updateFields.push('landing_page = ?');
            updateValues.push(landing_page);
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push('password_hash = ?');
            updateValues.push(hashedPassword);
        }

        if (updateFields.length === 0) {
            return res.status(400).json(
                apiResponse(false, null, 'No valid fields provided for update')
            );
        }

        updateFields.push('updated_at = NOW()');
        updateValues.push(userId);

        // Update user in orthodoxmetrics_db.users
        await promisePool.query(`
            UPDATE orthodoxmetrics_db.users SET ${updateFields.join(', ')} WHERE id = ?
        `, updateValues);

        // Update church role if provided
        if (role) {
            await promisePool.query(
                'UPDATE church_users SET role = ? WHERE church_id = ? AND user_id = ?',
                [role, churchId, userId]
            );
        }

        res.json(apiResponse(true, {
            message: 'User updated successfully',
            user_id: userId
        }));

    } catch (error) {
        console.error('❌ Error updating church user:', error);
        res.status(error.message.includes('not found') ? 404 : 500).json(
            apiResponse(false, null, error.message)
        );
    }
});

// POST /api/admin/church-users/:churchId/:userId/reset-password - Reset user password
router.post('/:churchId/:userId/reset-password', requireAuth, requireAdmin, async (req, res) => {
    try {
        const churchId = parseInt(req.params.churchId);
        const userId = parseInt(req.params.userId);
        
        console.log('🔑 Resetting password for user ID:', userId, 'in church ID:', churchId);

        // Validate church exists
        await validateChurchAccess(churchId);

        // Validate user assignment to church
        await validateUserChurchAssignment(userId, churchId);

        // Generate new password
        const newPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password in orthodoxmetrics_db.users
        await promisePool.query(
            'UPDATE orthodoxmetrics_db.users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [hashedPassword, userId]
        );

        res.json(apiResponse(true, {
            message: 'Password reset successfully',
            new_password: newPassword
        }));

    } catch (error) {
        console.error('❌ Error resetting password:', error);
        res.status(error.message.includes('not found') ? 404 : 500).json(
            apiResponse(false, null, error.message)
        );
    }
});

// POST /api/admin/church-users/:churchId/:userId/lock - Lock user account
router.post('/:churchId/:userId/lock', requireAuth, requireAdmin, async (req, res) => {
    try {
        const churchId = parseInt(req.params.churchId);
        const userId = parseInt(req.params.userId);

        console.log('🔒 Locking user ID:', userId, 'in church ID:', churchId);

        // Validate church exists
        await validateChurchAccess(churchId);

        // Validate user assignment to church
        await validateUserChurchAssignment(userId, churchId);

        // Lock user account in orthodoxmetrics_db.users
        await promisePool.query(
            'UPDATE orthodoxmetrics_db.users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [userId]
        );

        res.json(apiResponse(true, {
            message: 'User account locked successfully'
        }));

    } catch (error) {
        console.error('❌ Error locking user:', error);
        res.status(error.message.includes('not found') ? 404 : 500).json(
            apiResponse(false, null, error.message)
        );
    }
});

// POST /api/admin/church-users/:churchId/:userId/unlock - Unlock user account
router.post('/:churchId/:userId/unlock', requireAuth, requireAdmin, async (req, res) => {
    try {
        const churchId = parseInt(req.params.churchId);
        const userId = parseInt(req.params.userId);

        console.log('🔓 Unlocking user ID:', userId, 'in church ID:', churchId);

        // Validate church exists
        await validateChurchAccess(churchId);

        // Validate user assignment to church
        await validateUserChurchAssignment(userId, churchId);

        // Unlock user account in orthodoxmetrics_db.users
        await promisePool.query(
            'UPDATE orthodoxmetrics_db.users SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [userId]
        );

        res.json(apiResponse(true, {
            message: 'User account unlocked successfully'
        }));

    } catch (error) {
        console.error('❌ Error unlocking user:', error);
        res.status(error.message.includes('not found') ? 404 : 500).json(
            apiResponse(false, null, error.message)
        );
    }
});

module.exports = router; 