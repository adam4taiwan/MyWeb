-- ============================================================
-- NeonDB Update Script
-- 日期: 2026-03-07
-- 版本對應: Ecanapi Migration 20260307100701_AddBirthDataToUser
-- 目的: 在 AspNetUsers 新增命理生辰欄位（支援會員生辰資料儲存）
-- 執行時機: fly deploy 前，在 NeonDB 手動執行
-- ============================================================

ALTER TABLE "AspNetUsers"
    ADD COLUMN IF NOT EXISTS "BirthYear"   integer,
    ADD COLUMN IF NOT EXISTS "BirthMonth"  integer,
    ADD COLUMN IF NOT EXISTS "BirthDay"    integer,
    ADD COLUMN IF NOT EXISTS "BirthHour"   integer,
    ADD COLUMN IF NOT EXISTS "BirthMinute" integer,
    ADD COLUMN IF NOT EXISTS "BirthGender" integer,
    ADD COLUMN IF NOT EXISTS "DateType"    text,
    ADD COLUMN IF NOT EXISTS "ChartName"   text;

-- 記錄此 migration 已套用（讓 EF MigrationsHistory 與生產 schema 保持一致）
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260307100701_AddBirthDataToUser', '8.0.0')
ON CONFLICT DO NOTHING;
