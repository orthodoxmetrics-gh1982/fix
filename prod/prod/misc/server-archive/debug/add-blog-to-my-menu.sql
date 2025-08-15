-- Add Blog to social menu for superadmin@orthodoxmetrics.com
-- This script will ensure the blog menu item exists and has proper permissions

-- 1. First, let's see what social menu items currently exist
SELECT 'Current social menu items:' as status;
SELECT id, menu_key, title, path, display_order 
FROM menu_items 
WHERE menu_key LIKE 'social%' 
ORDER BY display_order, id;

-- 2. Check if blog menu item exists
SELECT 'Checking for blog menu item:' as status;
SELECT COUNT(*) as blog_exists 
FROM menu_items 
WHERE menu_key = 'social.blog';

-- 3. Create blog menu item if it doesn't exist
INSERT IGNORE INTO menu_items (menu_key, title, path, icon, parent_id, display_order, description)
VALUES (
    'social.blog',
    'Blog', 
    '/social/blog',
    'IconArticle',
    (SELECT id FROM menu_items WHERE menu_key = 'social' LIMIT 1),
    1,
    'Community blog posts and articles'
);

-- 4. Get the blog menu item ID
SET @blog_menu_id = (SELECT id FROM menu_items WHERE menu_key = 'social.blog');

-- 5. Check current permissions for super_admin role
SELECT 'Current social permissions for super_admin:' as status;
SELECT mi.menu_key, mi.title, rmp.is_visible
FROM menu_items mi
LEFT JOIN role_menu_permissions rmp ON mi.id = rmp.menu_item_id AND rmp.role = 'super_admin'
WHERE mi.menu_key LIKE 'social%'
ORDER BY mi.display_order;

-- 6. Add blog permission for super_admin if it doesn't exist
INSERT IGNORE INTO role_menu_permissions (role, menu_item_id, is_visible)
VALUES ('super_admin', @blog_menu_id, TRUE);

-- 7. Make sure blog permission is enabled for super_admin
UPDATE role_menu_permissions 
SET is_visible = TRUE 
WHERE role = 'super_admin' AND menu_item_id = @blog_menu_id;

-- 8. Also enable for any other roles that have social access
INSERT IGNORE INTO role_menu_permissions (role, menu_item_id, is_visible)
SELECT DISTINCT rmp.role, @blog_menu_id, TRUE
FROM role_menu_permissions rmp
JOIN menu_items mi ON rmp.menu_item_id = mi.id
WHERE mi.menu_key LIKE 'social%' 
AND rmp.is_visible = TRUE 
AND rmp.role != 'super_admin';

-- 9. Final verification - show all social menu items with permissions
SELECT 'Final social menu state:' as status;
SELECT 
    mi.menu_key,
    mi.title,
    mi.path,
    mi.display_order,
    GROUP_CONCAT(
        CASE WHEN rmp.is_visible = TRUE 
        THEN rmp.role 
        ELSE NULL END
    ) as roles_with_access
FROM menu_items mi
LEFT JOIN role_menu_permissions rmp ON mi.id = rmp.menu_item_id
WHERE mi.menu_key LIKE 'social%'
GROUP BY mi.id, mi.menu_key, mi.title, mi.path, mi.display_order
ORDER BY mi.display_order, mi.id;

SELECT 'Blog menu fix complete! 🎉' as result; 