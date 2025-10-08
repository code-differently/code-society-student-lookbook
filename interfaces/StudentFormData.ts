export interface CertificationWithStatus {
  name: string
  status?: string | null
}

export interface StudentFormData {
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
}