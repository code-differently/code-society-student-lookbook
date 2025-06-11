import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const submissions = await prisma.student.findMany({
      include: {
        technicalSkills: true,
        certifications: true,
        careerInterests: true,
        workExperience: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return res.status(200).json(submissions)
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return res.status(500).json({ message: 'Error fetching submissions' })
  }
} 