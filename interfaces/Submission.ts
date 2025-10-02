import { CertificationWithStatus } from "./StudentFormData"

interface DatabaseItem {
  id: string
  name: string
  studentId: string
  createdAt: string
}

interface DatabaseCertification extends DatabaseItem {
  status?: string | null
}

export interface Submission {
  id: string
  fullName: string
  email: string
  linkedinUrl: string
  githubUrl: string
  resume: File | null
  headshot: File | null
  technicalSkills: (string | DatabaseItem)[]
  certifications: (CertificationWithStatus | DatabaseCertification)[]
  careerInterests: (string | DatabaseItem)[]
  workExperience: (string | DatabaseItem)[]
  yearsOfExperience: string
  educationDegrees: DatabaseItem[]
  educationField: string
  createdAt: string
  headshotUrl?: string
  resumeUrl: string
}