-- Fix Notifications System for Friend Requests (Version 3)
-- Simple version that works with MariaDB

USE orthodoxmetrics_db;

-- Add sender_id column if it doesn't exist
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS sender_id INT NULL;

-- Add index for sender_id
ALTER TABLE notifications 
ADD INDEX IF NOT EXISTS idx_sender_id (sender_id);

-- Create notification_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS notification_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category ENUM('user', 'system', 'admin') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    default_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default notification types
INSERT IGNORE INTO notification_types (name, description, category) VALUES
('friend_request', 'Friend request notifications', 'user'),
('friend_accepted', 'Friend request accepted notifications', 'user'),
('chat_message', 'Chat message notifications', 'user'),
('blog_comment', 'Blog comment notifications', 'user'),
('blog_like', 'Blog like notifications', 'user'),
('mention', 'User mention notifications', 'user'),
('system', 'System notifications', 'system');

-- Show current structure after modifications
DESCRIBE notifications;

-- Create notifications for existing friend requests (for recipients)
INSERT INTO notifications (user_id, notification_type_id, title, message, data, sender_id, created_at)
SELECT 
    f.addressee_id,
    (SELECT id FROM notification_types WHERE name = 'friend_request'),
    'New Friend Request',
    CONCAT(u1.first_name, ' ', u1.last_name, ' sent you a friend request'),
    JSON_OBJECT(
        'request_id', f.id,
        'requester_id', f.requester_id,
        'action_type', 'friend_request_received'
    ),
    f.requester_id,
    f.requested_at
FROM friendships f
JOIN users u1 ON u1.id = f.requester_id
JOIN users u2 ON u2.id = f.addressee_id
WHERE f.status = 'pending'
AND NOT EXISTS (
    SELECT 1 FROM notifications n 
    WHERE n.user_id = f.addressee_id 
    AND JSON_EXTRACT(n.data, '$.requester_id') = f.requester_id
    AND n.notification_type_id = (SELECT id FROM notification_types WHERE name = 'friend_request')
    AND JSON_EXTRACT(n.data, '$.action_type') = 'friend_request_received'
);

-- Create activity records for senders (the person who sent the friend request)
INSERT INTO notifications (user_id, notification_type_id, title, message, data, is_read, created_at)
SELECT 
    f.requester_id,
    (SELECT id FROM notification_types WHERE name = 'friend_request'),
    'Friend Request Sent',
    CONCAT('Sent friend request to ', u2.first_name, ' ', u2.last_name),
    JSON_OBJECT(
        'request_id', f.id,
        'target_user_id', f.addressee_id,
        'target_email', u2.email,
        'action_type', 'friend_request_sent'
    ),
    1, -- Mark as read since it's an activity record
    f.requested_at
FROM friendships f
JOIN users u1 ON u1.id = f.requester_id
JOIN users u2 ON u2.id = f.addressee_id
WHERE f.status = 'pending'
AND NOT EXISTS (
    SELECT 1 FROM notifications n 
    WHERE n.user_id = f.requester_id 
    AND n.notification_type_id = (SELECT id FROM notification_types WHERE name = 'friend_request')
    AND JSON_EXTRACT(n.data, '$.target_user_id') = f.addressee_id
    AND JSON_EXTRACT(n.data, '$.action_type') = 'friend_request_sent'
);

-- Show results
SELECT 'Notifications created' as status, COUNT(*) as count FROM notifications;
SELECT 'Friend requests processed' as info, COUNT(*) as pending_requests FROM friendships WHERE status = 'pending';

-- Show sample notifications
SELECT 
    n.id,
    u.email as for_user,
    COALESCE(nt.name, 'legacy') as type,
    n.title,
    n.message,
    n.is_read,
    n.created_at
FROM notifications n
JOIN users u ON u.id = n.user_id
LEFT JOIN notification_types nt ON nt.id = n.notification_type_id
WHERE (nt.name = 'friend_request' OR n.title LIKE '%friend%')
ORDER BY n.created_at DESC
LIMIT 10; 