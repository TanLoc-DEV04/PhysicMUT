-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "solution" TEXT;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "department" TEXT;
