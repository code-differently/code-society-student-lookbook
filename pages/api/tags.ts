import { NextApiRequest, NextApiResponse } from 'next'
import { getStudents } from '../../lib/firebase'

interface TagsResponse {
  skills: string[]
  certifications: string[]
  interests: string[]
  workExperience: string[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TagsResponse | { message: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Get all students to extract unique tags
    const students = await getStudents()

    // Extract unique values from each category
    const skillsSet = new Set<string>()
    const certificationsSet = new Set<string>()
    const interestsSet = new Set<string>()
    const workExperienceSet = new Set<string>()

    students.forEach(student => {
      // Technical skills
      student.technicalSkills?.forEach(skill => skillsSet.add(skill))
      
      // Certifications
      student.certifications?.forEach(cert => {
        if (typeof cert === 'string') {
          certificationsSet.add(cert)
        } else if (cert.name) {
          certificationsSet.add(cert.name)
        }
      })
      
      // Career interests
      student.careerInterests?.forEach(interest => interestsSet.add(interest))
      
      // Work experience
      student.workExperience?.forEach(exp => workExperienceSet.add(exp))
    })

    const response: TagsResponse = {
      skills: Array.from(skillsSet).sort(),
      certifications: Array.from(certificationsSet).sort(),
      interests: Array.from(interestsSet).sort(),
      workExperience: Array.from(workExperienceSet).sort()
    }

    return res.status(200).json(response)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return res.status(500).json({ message: 'Error fetching tags' })
  }
} 