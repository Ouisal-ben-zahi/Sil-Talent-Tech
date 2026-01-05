-- ============================================
-- Script pour lister toutes les tables dans Supabase
-- ============================================
-- 
-- Utilisez ce script pour voir toutes les tables existantes
-- avant d'exécuter activate-rls-other-tables.sql
-- ============================================

-- Lister toutes les tables dans le schéma public
SELECT 
  table_name,
  table_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = information_schema.tables.table_name 
      AND rowsecurity = true
    ) THEN 'RLS Activé'
    ELSE 'RLS Désactivé'
  END as rls_status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Lister les tables dans auth (système Supabase)
SELECT 
  table_name,
  'Table système Supabase' as type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'auth' 
      AND tablename = information_schema.tables.table_name 
      AND rowsecurity = true
    ) THEN 'RLS Activé'
    ELSE 'RLS Désactivé'
  END as rls_status
FROM information_schema.tables
WHERE table_schema = 'auth'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Lister les tables dans storage (système Supabase)
SELECT 
  table_name,
  'Table système Storage' as type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'storage' 
      AND tablename = information_schema.tables.table_name 
      AND rowsecurity = true
    ) THEN 'RLS Activé'
    ELSE 'RLS Désactivé'
  END as rls_status
FROM information_schema.tables
WHERE table_schema = 'storage'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Vue d'ensemble complète
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ RLS Activé'
    ELSE '❌ RLS Désactivé'
  END as rls_status
FROM pg_tables
WHERE schemaname IN ('public', 'auth', 'storage')
ORDER BY 
  CASE schemaname
    WHEN 'public' THEN 1
    WHEN 'auth' THEN 2
    WHEN 'storage' THEN 3
  END,
  tablename;
