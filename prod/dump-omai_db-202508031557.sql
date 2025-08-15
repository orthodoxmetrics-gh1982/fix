/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.7.2-MariaDB, for Win64 (AMD64)
--
-- Host: 192.168.1.240    Database: omai_db
-- ------------------------------------------------------
-- Server version	10.6.22-MariaDB-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `bigbook_ai_interactions`
--

DROP TABLE IF EXISTS `bigbook_ai_interactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bigbook_ai_interactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `interaction_type` enum('search','view','execute','edit','feedback','question') NOT NULL,
  `doc_id` varchar(255) DEFAULT NULL,
  `user_query` text DEFAULT NULL,
  `ai_response` text DEFAULT NULL,
  `user_feedback` enum('helpful','not_helpful','neutral') DEFAULT 'neutral',
  `context_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`context_data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `session_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_interaction_type` (`interaction_type`),
  KEY `idx_doc_id` (`doc_id`),
  KEY `idx_user_feedback` (`user_feedback`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_session_id` (`session_id`),
  CONSTRAINT `bigbook_ai_interactions_ibfk_1` FOREIGN KEY (`doc_id`) REFERENCES `bigbook_documents` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bigbook_ai_patterns`
--

DROP TABLE IF EXISTS `bigbook_ai_patterns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bigbook_ai_patterns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pattern_type` enum('script_pattern','error_pattern','solution_pattern','workflow_pattern','best_practice') NOT NULL,
  `pattern_name` varchar(200) NOT NULL,
  `pattern_description` text DEFAULT NULL,
  `pattern_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`pattern_data`)),
  `confidence_score` decimal(3,2) DEFAULT 0.00,
  `usage_count` int(11) DEFAULT 0,
  `success_rate` decimal(3,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_pattern_type` (`pattern_type`),
  KEY `idx_confidence_score` (`confidence_score`),
  KEY `idx_usage_count` (`usage_count`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bigbook_ai_recommendations`
--

DROP TABLE IF EXISTS `bigbook_ai_recommendations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bigbook_ai_recommendations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `doc_id` varchar(255) NOT NULL,
  `recommendation_type` enum('improvement','security','performance','maintenance','integration','deprecation') NOT NULL,
  `recommendation_text` text NOT NULL,
  `priority` enum('low','medium','high','critical') DEFAULT 'medium',
  `confidence_score` decimal(3,2) DEFAULT 0.00,
  `status` enum('pending','implemented','rejected','in_progress') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `implemented_at` timestamp NULL DEFAULT NULL,
  `implemented_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_doc_id` (`doc_id`),
  KEY `idx_recommendation_type` (`recommendation_type`),
  KEY `idx_priority` (`priority`),
  KEY `idx_status` (`status`),
  KEY `idx_confidence_score` (`confidence_score`),
  KEY `idx_recommendations_doc_status` (`doc_id`,`status`),
  CONSTRAINT `bigbook_ai_recommendations_ibfk_1` FOREIGN KEY (`doc_id`) REFERENCES `bigbook_documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `bigbook_ai_summary`
--

DROP TABLE IF EXISTS `bigbook_ai_summary`;
/*!50001 DROP VIEW IF EXISTS `bigbook_ai_summary`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `bigbook_ai_summary` AS SELECT
 1 AS `type`,
  1 AS `count`,
  1 AS `avg_confidence`,
  1 AS `total_usage` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `bigbook_categories`
--

DROP TABLE IF EXISTS `bigbook_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bigbook_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `color` varchar(7) DEFAULT '#007bff',
  `icon` varchar(50) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `bigbook_categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `bigbook_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bigbook_config`
--

DROP TABLE IF EXISTS `bigbook_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bigbook_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) NOT NULL,
  `config_value` text DEFAULT NULL,
  `config_type` enum('string','number','boolean','json','array') DEFAULT 'string',
  `description` text DEFAULT NULL,
  `is_system` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `config_key` (`config_key`),
  KEY `idx_config_key` (`config_key`),
  KEY `idx_is_system` (`is_system`)
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `bigbook_document_summary`
--

DROP TABLE IF EXISTS `bigbook_document_summary`;
/*!50001 DROP VIEW IF EXISTS `bigbook_document_summary`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `bigbook_document_summary` AS SELECT
 1 AS `id`,
  1 AS `title`,
  1 AS `file_path`,
  1 AS `file_type`,
  1 AS `category`,
  1 AS `status`,
  1 AS `priority`,
  1 AS `execution_count`,
  1 AS `last_executed`,
  1 AS `created_at`,
  1 AS `updated_at`,
  1 AS `reference_count`,
  1 AS `execution_count_recent`,
  1 AS `active_recommendations` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `bigbook_document_tags`
--

DROP TABLE IF EXISTS `bigbook_document_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bigbook_document_tags` (
  `doc_id` varchar(255) NOT NULL,
  `tag_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`doc_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `bigbook_document_tags_ibfk_1` FOREIGN KEY (`doc_id`) REFERENCES `bigbook_documents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bigbook_document_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `bigbook_tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bigbook_documents`
--

DROP TABLE IF EXISTS `bigbook_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bigbook_documents` (
  `id` varchar(255) NOT NULL,
  `title` varchar(500) NOT NULL,
  `content` longtext NOT NULL,
  `file_path` varchar(1000) NOT NULL,
  `file_type` enum('markdown','sql','javascript','typescript','bash','powershell','json','yaml','config','other') NOT NULL,
  `category` varchar(100) NOT NULL,
  `subcategory` varchar(100) DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `version` int(11) DEFAULT 1,
  `status` enum('active','deprecated','draft','archived') DEFAULT 'active',
  `priority` int(11) DEFAULT 5,
  `execution_count` int(11) DEFAULT 0,
  `last_executed` timestamp NULL DEFAULT NULL,
  `created_by` varchar(100) DEFAULT 'system',
  `modified_by` varchar(100) DEFAULT 'system',
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_file_type` (`file_type`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_updated_at` (`updated_at`),
  KEY `idx_file_path` (`file_path`(255)),
  KEY `idx_docs_category_status` (`category`,`status`),
  KEY `idx_docs_type_priority` (`file_type`,`priority`),
  FULLTEXT KEY `idx_content` (`title`,`content`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bigbook_executions`
--

DROP TABLE IF EXISTS `bigbook_executions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bigbook_executions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `doc_id` varchar(255) NOT NULL,
  `executed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `execution_type` enum('manual','scheduled','automated','test') NOT NULL,
  `status` enum('success','failed','partial','timeout') NOT NULL,
  `duration_ms` int(11) DEFAULT NULL,
  `output` longtext DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `executed_by` varchar(100) DEFAULT NULL,
  `environment` varchar(50) DEFAULT 'production',
  PRIMARY KEY (`id`),
  KEY `idx_doc_id` (`doc_id`),
  KEY `idx_executed_at` (`executed_at`),
  KEY `idx_status` (`status`),
  KEY `idx_execution_type` (`execution_type`),
  KEY `idx_executions_doc_status` (`doc_id`,`status`),
  CONSTRAINT `bigbook_executions_ibfk_1` FOREIGN KEY (`doc_id`) REFERENCES `bigbook_documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bigbook_relationships`
--

DROP TABLE IF EXISTS `bigbook_relationships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bigbook_relationships` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `source_doc_id` varchar(255) NOT NULL,
  `target_doc_id` varchar(255) NOT NULL,
  `relationship_type` enum('depends_on','references','imports','extends','similar_to','replaces','version_of') NOT NULL,
  `strength` decimal(3,2) DEFAULT 1.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_relationship` (`source_doc_id`,`target_doc_id`,`relationship_type`),
  KEY `target_doc_id` (`target_doc_id`),
  KEY `idx_relationship_type` (`relationship_type`),
  KEY `idx_strength` (`strength`),
  CONSTRAINT `bigbook_relationships_ibfk_1` FOREIGN KEY (`source_doc_id`) REFERENCES `bigbook_documents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bigbook_relationships_ibfk_2` FOREIGN KEY (`target_doc_id`) REFERENCES `bigbook_documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bigbook_search_history`
--

DROP TABLE IF EXISTS `bigbook_search_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bigbook_search_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `query_text` varchar(500) NOT NULL,
  `results_count` int(11) DEFAULT 0,
  `clicked_doc_id` varchar(255) DEFAULT NULL,
  `search_duration_ms` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `session_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_query_text` (`query_text`),
  KEY `idx_clicked_doc_id` (`clicked_doc_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_session_id` (`session_id`),
  CONSTRAINT `bigbook_search_history_ibfk_1` FOREIGN KEY (`clicked_doc_id`) REFERENCES `bigbook_documents` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bigbook_search_index`
--

DROP TABLE IF EXISTS `bigbook_search_index`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bigbook_search_index` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `doc_id` varchar(255) NOT NULL,
  `search_text` longtext NOT NULL,
  `keywords` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`keywords`)),
  `last_indexed` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_doc_index` (`doc_id`),
  KEY `idx_last_indexed` (`last_indexed`),
  FULLTEXT KEY `idx_search_text` (`search_text`),
  CONSTRAINT `bigbook_search_index_ibfk_1` FOREIGN KEY (`doc_id`) REFERENCES `bigbook_documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bigbook_tags`
--

DROP TABLE IF EXISTS `bigbook_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bigbook_tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `color` varchar(7) DEFAULT '#6c757d',
  `usage_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_usage_count` (`usage_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bigbook_timeline`
--

DROP TABLE IF EXISTS `bigbook_timeline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bigbook_timeline` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_type` enum('created','updated','executed','recommended','deprecated','archived','restored') NOT NULL,
  `doc_id` varchar(255) DEFAULT NULL,
  `event_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`event_data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_event_type` (`event_type`),
  KEY `idx_doc_id` (`doc_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_timeline_doc_type` (`doc_id`,`event_type`),
  CONSTRAINT `bigbook_timeline_ibfk_1` FOREIGN KEY (`doc_id`) REFERENCES `bigbook_documents` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bigbook_versions`
--

DROP TABLE IF EXISTS `bigbook_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bigbook_versions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `doc_id` varchar(255) NOT NULL,
  `version_number` int(11) NOT NULL,
  `content` longtext NOT NULL,
  `change_summary` text DEFAULT NULL,
  `changed_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_version` (`doc_id`,`version_number`),
  KEY `idx_doc_id` (`doc_id`),
  KEY `idx_version_number` (`version_number`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `bigbook_versions_ibfk_1` FOREIGN KEY (`doc_id`) REFERENCES `bigbook_documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bigbook_watchers`
--

DROP TABLE IF EXISTS `bigbook_watchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bigbook_watchers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `watch_path` varchar(1000) NOT NULL,
  `file_patterns` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`file_patterns`)),
  `exclude_patterns` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`exclude_patterns`)),
  `is_active` tinyint(1) DEFAULT 1,
  `last_scan` timestamp NULL DEFAULT NULL,
  `scan_interval_seconds` int(11) DEFAULT 300,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_watch_path` (`watch_path`(255)),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_last_scan` (`last_scan`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'omai_db'
--

--
-- Final view structure for view `bigbook_ai_summary`
--

/*!50001 DROP VIEW IF EXISTS `bigbook_ai_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `bigbook_ai_summary` AS select 'patterns' AS `type`,count(0) AS `count`,avg(`omai_db`.`bigbook_ai_patterns`.`confidence_score`) AS `avg_confidence`,sum(`omai_db`.`bigbook_ai_patterns`.`usage_count`) AS `total_usage` from `bigbook_ai_patterns` where `omai_db`.`bigbook_ai_patterns`.`is_active` = 1 union all select 'recommendations' AS `type`,count(0) AS `count`,avg(`omai_db`.`bigbook_ai_recommendations`.`confidence_score`) AS `avg_confidence`,count(case when `omai_db`.`bigbook_ai_recommendations`.`status` = 'implemented' then 1 end) AS `total_usage` from `bigbook_ai_recommendations` union all select 'interactions' AS `type`,count(0) AS `count`,avg(case when `omai_db`.`bigbook_ai_interactions`.`user_feedback` = 'helpful' then 1.0 when `omai_db`.`bigbook_ai_interactions`.`user_feedback` = 'not_helpful' then 0.0 else 0.5 end) AS `avg_confidence`,count(case when `omai_db`.`bigbook_ai_interactions`.`user_feedback` = 'helpful' then 1 end) AS `total_usage` from `bigbook_ai_interactions` where `omai_db`.`bigbook_ai_interactions`.`created_at` >= current_timestamp() - interval 30 day */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `bigbook_document_summary`
--

/*!50001 DROP VIEW IF EXISTS `bigbook_document_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `bigbook_document_summary` AS select `d`.`id` AS `id`,`d`.`title` AS `title`,`d`.`file_path` AS `file_path`,`d`.`file_type` AS `file_type`,`d`.`category` AS `category`,`d`.`status` AS `status`,`d`.`priority` AS `priority`,`d`.`execution_count` AS `execution_count`,`d`.`last_executed` AS `last_executed`,`d`.`created_at` AS `created_at`,`d`.`updated_at` AS `updated_at`,count(distinct `r`.`target_doc_id`) AS `reference_count`,count(distinct `e`.`id`) AS `execution_count_recent`,count(distinct `ar`.`id`) AS `active_recommendations` from (((`bigbook_documents` `d` left join `bigbook_relationships` `r` on(`d`.`id` = `r`.`source_doc_id`)) left join `bigbook_executions` `e` on(`d`.`id` = `e`.`doc_id` and `e`.`executed_at` >= current_timestamp() - interval 30 day)) left join `bigbook_ai_recommendations` `ar` on(`d`.`id` = `ar`.`doc_id` and `ar`.`status` = 'pending')) group by `d`.`id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-08-03 15:57:57
