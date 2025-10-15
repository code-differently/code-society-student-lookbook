import { CertificationWithStatus } from "./StudentFormData"

export interface Submission {
  id: string
  fullName: string
  email: string
  linkedinUrl: string
  githubUrl: string
  resume: File | null
  headshot: File | null
  technicalSkills: string[]
  certifications: CertificationWithStatus[]
  careerInterests: string[]
  workExperience: string[]
  yearsOfExperience: string
  educationDegree: string[]
  educationField: string
  createdAt: Date
  headshotUrl?: string
  resumeUrl: string
}