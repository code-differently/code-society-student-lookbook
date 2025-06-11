/*
  Warnings:

  - You are about to drop the column `availableForWork` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `shortBio` on the `Student` table. All the data in the column will be lost.
  - Added the required column `professionalStatement` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- Create a new table with the updated schema
CREATE TABLE "Student_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "professionalStatement" TEXT NOT NULL,
    "resumeUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Copy data from the old table to the new table
INSERT INTO "Student_new" ("id", "fullName", "email", "linkedinUrl", "githubUrl", "professionalStatement", "resumeUrl", "createdAt", "updatedAt")
SELECT "id", "fullName", "email", "linkedinUrl", "githubUrl", "shortBio", "resumeUrl", "createdAt", "updatedAt"
FROM "Student";

-- Drop the old table
DROP TABLE "Student";

-- Rename the new table to the original name
ALTER TABLE "Student_new" RENAME TO "Student";

-- Recreate the unique index
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");
