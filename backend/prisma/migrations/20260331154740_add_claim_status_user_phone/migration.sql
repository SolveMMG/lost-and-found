-- AlterTable
ALTER TABLE "Claim" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT;
