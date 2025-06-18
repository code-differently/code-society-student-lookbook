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
    const {
      search,
      skills,
      certifications,
      interests,
      workExperience,
      dateFrom,
      dateTo,
      sortBy = 'newest',
      hasResume,
      hasLinkedIn,
      // New advanced filters
      skillCombination = 'any',
      minSkills,
      maxSkills,
      hasAnyCertification,
      hasWorkExperience,
      profileCompleteness = 'any',
      skillLevel = 'any',
      certificationLevel = 'any',
      limit = '50',
      offset = '0'
    } = req.query

    const whereConditions: any = {}

    // Text search
    if (search) {
      whereConditions.OR = [
        { fullName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { professionalStatement: { contains: search as string, mode: 'insensitive' } },
      ]
    }

    // Skills filtering with combination logic
    if (skills && skills.length > 0) {
      const skillArray = Array.isArray(skills) ? skills : skills.split(',')
      
      if (skillCombination === 'all') {
        // Must have ALL selected skills
        whereConditions.technicalSkills = {
          every: {
            name: { in: skillArray }
          }
        }
      } else if (skillCombination === 'exact') {
        // Must have EXACTLY these skills (no more, no less)
        whereConditions.technicalSkills = {
          every: {
            name: { in: skillArray }
          }
        }
        // This is a simplified version - for exact match we'd need more complex logic
      } else {
        // Default: ANY of the selected skills
        whereConditions.technicalSkills = {
          some: {
            name: { in: skillArray }
          }
        }
      }
    }

    // Skill count filtering
    if (minSkills && parseInt(minSkills as string) > 0) {
      whereConditions.technicalSkills = {
        ...whereConditions.technicalSkills,
        _count: {
          gte: parseInt(minSkills as string)
        }
      }
    }

    if (maxSkills && parseInt(maxSkills as string) > 0) {
      whereConditions.technicalSkills = {
        ...whereConditions.technicalSkills,
        _count: {
          ...whereConditions.technicalSkills?._count,
          lte: parseInt(maxSkills as string)
        }
      }
    }

    // Certifications filtering
    if (certifications && certifications.length > 0) {
      const certArray = Array.isArray(certifications) ? certifications : certifications.split(',')
      whereConditions.certifications = {
        some: {
          name: { in: certArray }
        }
      }
    }

    // Has any certification filter
    if (hasAnyCertification === 'true') {
      whereConditions.certifications = {
        some: {}
      }
    }

    // Career interests filtering
    if (interests && interests.length > 0) {
      const interestArray = Array.isArray(interests) ? interests : interests.split(',')
      whereConditions.careerInterests = {
        some: {
          name: { in: interestArray }
        }
      }
    }

    // Work experience filtering
    if (workExperience && workExperience.length > 0) {
      const expArray = Array.isArray(workExperience) ? workExperience : workExperience.split(',')
      whereConditions.workExperience = {
        some: {
          name: { in: expArray }
        }
      }
    }

    // Has work experience filter
    if (hasWorkExperience === 'true') {
      whereConditions.workExperience = {
        some: {}
      }
    }

    // Date range filtering
    if (dateFrom) {
      whereConditions.createdAt = {
        ...whereConditions.createdAt,
        gte: new Date(dateFrom as string)
      }
    }

    if (dateTo) {
      whereConditions.createdAt = {
        ...whereConditions.createdAt,
        lte: new Date(dateTo as string)
      }
    }

    // Has Resume filter
    if (hasResume === 'true') {
      whereConditions.resumeUrl = { 
        not: {
          in: [null, '']
        }
      }
    }

    // Has LinkedIn filter
    if (hasLinkedIn === 'true') {
      whereConditions.linkedinUrl = { 
        not: {
          in: [null, '']
        }
      }
    }

    // Profile completeness filter
    if (profileCompleteness === 'complete') {
      whereConditions.AND = [
        { resumeUrl: { not: { in: [null, ''] } } },
        { linkedinUrl: { not: { in: [null, ''] } } },
        { githubUrl: { not: { in: [null, ''] } } },
        { professionalStatement: { not: '' } }
      ]
    } else if (profileCompleteness === 'partial') {
      whereConditions.OR = [
        { resumeUrl: { in: [null, ''] } },
        { linkedinUrl: { in: [null, ''] } },
        { githubUrl: { in: [null, ''] } },
        { professionalStatement: '' }
      ]
    }

    // Build orderBy based on sortBy parameter
    let orderBy: any = { createdAt: 'desc' }
    if (sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' }
    } else if (sortBy === 'name-asc') {
      orderBy = { fullName: 'asc' }
    } else if (sortBy === 'name-desc') {
      orderBy = { fullName: 'desc' }
    }

    const submissions = await prisma.student.findMany({
      where: whereConditions,
      include: {
        technicalSkills: true,
        certifications: true,
        careerInterests: true,
        workExperience: true,
      },
      orderBy,
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    })

    // Get total count for pagination
    const totalCount = await prisma.student.count({
      where: whereConditions,
    })

    return res.status(200).json({
      submissions,
      totalCount,
      hasMore: submissions.length === parseInt(limit as string)
    })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return res.status(500).json({ message: 'Error fetching submissions' })
  }
} 