-- AlterTable
ALTER TABLE "Certification" ADD COLUMN "status" TEXT;

-- CreateTable
CREATE TABLE "VolunteerExperience" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VolunteerExperience_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "professionalStatement" TEXT NOT NULL,
    "resumeUrl" TEXT,
    "headshotUrl" TEXT,
    "yearsOfExperience" TEXT,
    "educationDegree" TEXT,
    "educationField" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Student" ("createdAt", "email", "fullName", "githubUrl", "id", "linkedinUrl", "professionalStatement", "resumeUrl", "updatedAt") SELECT "createdAt", "email", "fullName", "githubUrl", "id", "linkedinUrl", "professionalStatement", "resumeUrl", "updatedAt" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
