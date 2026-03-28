-- Add new normalized coupon fields
ALTER TABLE `Coupon`
  ADD COLUMN `discount` DOUBLE NULL,
  ADD COLUMN `discountUnit` VARCHAR(191) NULL,
  ADD COLUMN `usageLimit` INTEGER NULL,
  ADD COLUMN `minOrderValue` DOUBLE NULL,
  ADD COLUMN `maxValue` DOUBLE NULL;

-- Backfill from legacy fields
UPDATE `Coupon`
SET
  `discount` = `amount`,
  `discountUnit` = CASE
    WHEN `type` = 'percentage' THEN 'percent'
    ELSE 'amount'
  END,
  `usageLimit` = `quantity`
WHERE
  `discount` IS NULL
  OR `discountUnit` IS NULL
  OR `usageLimit` IS NULL;

-- Remove legacy fields after data migration
ALTER TABLE `Coupon`
  DROP COLUMN `customerGroup`,
  DROP COLUMN `quantity`,
  DROP COLUMN `usesPerCustomer`,
  DROP COLUMN `priority`,
  DROP COLUMN `actions`,
  DROP COLUMN `type`,
  DROP COLUMN `isUnlimited`;
