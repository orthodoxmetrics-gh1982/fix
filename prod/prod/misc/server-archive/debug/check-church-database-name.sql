-- Debug script to check church database_name field
-- Run this to see what's stored in the database_name field

SELECT 
    id,
    name as church_name,
    database_name,
    LENGTH(database_name) as db_name_length,
    database_name IS NULL as is_null,
    database_name = '' as is_empty,
    CASE 
        WHEN database_name IS NULL THEN 'NULL'
        WHEN database_name = '' THEN 'EMPTY STRING'
        ELSE 'HAS VALUE'
    END as status
FROM orthodoxmetrics_db.churches 
WHERE id = 14;

-- Also check if the database actually exists
SELECT 
    SCHEMA_NAME 
FROM information_schema.SCHEMATA 
WHERE SCHEMA_NAME = 'ssppoc_records_db';

-- If the database exists, check its tables
SELECT 
    TABLE_NAME,
    TABLE_ROWS
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'ssppoc_records_db'
ORDER BY TABLE_NAME; 