import { NextApiRequest, NextApiResponse } from 'next'
import { getStudents, getStudentCount } from '../../lib/firebase'

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
      // Education filters
      yearsOfExperience,
      educationDegrees,
      educationField,
      limit = '50',
      offset = '0'
    } = req.query

    // Build filters object for Firebase
    const filters = {
      search,
      skills,
      certifications,
      interests,
      workExperience,
      dateFrom,
      dateTo,
      sortBy,
      hasResume,
      hasLinkedIn,
      skillCombination,
      minSkills,
      maxSkills,
      hasAnyCertification,
      hasWorkExperience,
      profileCompleteness,
      skillLevel,
      certificationLevel,
      yearsOfExperience,
      educationDegrees,
      educationField,
      limit,
      offset
    }

    // Get students from Firebase
    const submissions = await getStudents(filters)

    // Apply pagination (since Firebase filtering is done client-side)
    const startIndex = parseInt(offset as string)
    const endIndex = startIndex + parseInt(limit as string)
    const paginatedSubmissions = submissions.slice(startIndex, endIndex)

    // Get total count
    const totalCount = submissions.length

    return res.status(200).json({
      submissions: paginatedSubmissions,
      totalCount,
      hasMore: endIndex < totalCount
    })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return res.status(500).json({ message: 'Error fetching submissions' })
  }
} 