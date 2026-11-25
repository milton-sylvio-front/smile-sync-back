DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'brandName'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'clinicName'
  ) THEN
    ALTER TABLE "users" RENAME COLUMN "brandName" TO "clinicName";
  ELSE
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "clinicName" TEXT;
  END IF;
END $$;

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "birthDate" DATE,
  ADD COLUMN IF NOT EXISTS "document" TEXT,
  ADD COLUMN IF NOT EXISTS "phone" TEXT;
