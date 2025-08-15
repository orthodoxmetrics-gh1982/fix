-- Update existing friend request notifications to include action buttons
USE orthodoxmetrics_db;

-- Update friend request notifications for recipients to include action buttons
UPDATE notifications n
JOIN notification_types nt ON nt.id = n.notification_type_id
SET n.data = JSON_SET(
    n.data,
    '$.actions', JSON_ARRAY(
        JSON_OBJECT('action', 'accept', 'label', 'Accept', 'style', 'primary'),
        JSON_OBJECT('action', 'decline', 'label', 'Decline', 'style', 'secondary')
    )
)
WHERE nt.name = 'friend_request' 
AND JSON_EXTRACT(n.data, '$.action_type') = 'friend_request_received'
AND JSON_EXTRACT(n.data, '$.action_taken') IS NULL;

-- Update friend request sent notifications to include unsend action
UPDATE notifications n
JOIN notification_types nt ON nt.id = n.notification_type_id
SET n.data = JSON_SET(
    n.data,
    '$.actions', JSON_ARRAY(
        JSON_OBJECT('action', 'unsend', 'label', 'Unsend Request', 'style', 'outline')
    )
)
WHERE nt.name = 'friend_request' 
AND JSON_EXTRACT(n.data, '$.action_type') = 'friend_request_sent'
AND JSON_EXTRACT(n.data, '$.action_taken') IS NULL;

-- Show updated notifications
SELECT 
    n.id,
    u.email as for_user,
    nt.name as type,
    n.title,
    n.message,
    n.is_read,
    JSON_PRETTY(n.data) as data,
    n.created_at
FROM notifications n
JOIN users u ON u.id = n.user_id
JOIN notification_types nt ON nt.id = n.notification_type_id
WHERE nt.name = 'friend_request'
ORDER BY n.created_at DESC; 