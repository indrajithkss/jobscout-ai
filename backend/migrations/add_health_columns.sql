-- Migration: Add Automation Health and Diagnostics Columns to scout_runs table
-- Execute this script in the Supabase SQL Editor (https://supabase.com) to update the table structure.

ALTER TABLE scout_runs 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'success',
ADD COLUMN IF NOT EXISTS scan_duration INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS source_breakdown JSONB DEFAULT '{}'::jsonb;
