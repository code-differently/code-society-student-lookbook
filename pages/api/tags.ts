import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

interface TagsResponse {
  skills: string[]
  certifications: string[]
  interests: string[]
  workExperience: string[]
}

interface TagItem {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TagsResponse | { message: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Get all unique tags from each category
    const [skills, certifications, interests, workExperience] = await Promise.all([
      prisma.technicalSkill.findMany({
        select: { name: true },
        distinct: ['name'],
        orderBy: { name: 'asc' }
      }),
      prisma.certification.findMany({
        select: { name: true },
        distinct: ['name'],
        orderBy: { name: 'asc' }
      }),
      prisma.careerInterest.findMany({
        select: { name: true },
        distinct: ['name'],
        orderBy: { name: 'asc' }
      }),
      prisma.workExperience.findMany({
        select: { name: true },
        distinct: ['name'],
        orderBy: { name: 'asc' }
      })
    ])

    const response: TagsResponse = {
      skills: skills.map((s: TagItem) => s.name),
      certifications: certifications.map((c: TagItem) => c.name),
      interests: interests.map((i: TagItem) => i.name),
      workExperience: workExperience.map((w: TagItem) => w.name)
    }

    return res.status(200).json(response)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return res.status(500).json({ message: 'Error fetching tags' })
  }
} 