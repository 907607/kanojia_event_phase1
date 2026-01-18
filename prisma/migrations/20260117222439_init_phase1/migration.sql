/*
  Warnings:

  - You are about to drop the column `venue` on the `Exhibition` table. All the data in the column will be lost.
  - The `status` column on the `Exhibition` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `ExhibitionOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Salesman` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SALESMAN');

-- CreateEnum
CREATE TYPE "ExhibitionStatus" AS ENUM ('PLANNING', 'LIVE', 'CLOSED');

-- DropForeignKey
ALTER TABLE "ExhibitionOrder" DROP CONSTRAINT "ExhibitionOrder_exhibitionId_fkey";

-- DropForeignKey
ALTER TABLE "ExhibitionOrder" DROP CONSTRAINT "ExhibitionOrder_salesmanId_fkey";

-- DropForeignKey
ALTER TABLE "Salesman" DROP CONSTRAINT "Salesman_exhibitionId_fkey";

-- AlterTable
ALTER TABLE "Exhibition" DROP COLUMN "venue",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "endDate" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ExhibitionStatus" NOT NULL DEFAULT 'PLANNING';

-- DropTable
DROP TABLE "ExhibitionOrder";

-- DropTable
DROP TABLE "Salesman";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'SALESMAN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedExhibitionId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "exhibitionId" TEXT NOT NULL,
    "salesmanId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerAddress" TEXT,
    "productSnapshotId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productSku" TEXT NOT NULL,
    "productPrice" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentRef" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_assignedExhibitionId_fkey" FOREIGN KEY ("assignedExhibitionId") REFERENCES "Exhibition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_exhibitionId_fkey" FOREIGN KEY ("exhibitionId") REFERENCES "Exhibition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_salesmanId_fkey" FOREIGN KEY ("salesmanId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
