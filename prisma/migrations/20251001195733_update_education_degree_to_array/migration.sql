/*
  Warnings:

  - You are about to drop the column `educationDegree` on the `Student` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "EducationDegree" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EducationDegree_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "resumeUrl" TEXT,
    "headshotUrl" TEXT,
    "yearsOfExperience" TEXT,
    "educationField" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Student" ("createdAt", "educationField", "email", "fullName", "githubUrl", "headshotUrl", "id", "linkedinUrl", "resumeUrl", "updatedAt", "yearsOfExperience") SELECT "createdAt", "educationField", "email", "fullName", "githubUrl", "headshotUrl", "id", "linkedinUrl", "resumeUrl", "updatedAt", "yearsOfExperience" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
