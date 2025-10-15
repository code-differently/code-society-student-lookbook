import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'

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

    // Build MongoDB query
    const query: any = {}
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    if (skills) {
      const skillArray = Array.isArray(skills) ? skills : String(skills).split(',')
      query.technicalSkills = { $in: skillArray }
    }
    if (certifications) {
      const certArray = Array.isArray(certifications) ? certifications : String(certifications).split(',')
      query['certifications.name'] = { $in: certArray }
    }
    if (interests) {
      const interestArray = Array.isArray(interests) ? interests : String(interests).split(',')
      query.careerInterests = { $in: interestArray }
    }
    if (workExperience) {
      const expArray = Array.isArray(workExperience) ? workExperience : String(workExperience).split(',')
      query.workExperience = { $in: expArray }
    }
    if (hasResume === 'true') {
      query.resumeUrl = { $ne: '' }
    }
    if (hasLinkedIn === 'true') {
      query.linkedinUrl = { $ne: '' }
    }
    if (yearsOfExperience) {
      const expArray = Array.isArray(yearsOfExperience) ? yearsOfExperience : String(yearsOfExperience).split(',')
      query.yearsOfExperience = { $in: expArray }
    }
    if (educationDegrees) {
      const degreeArray = Array.isArray(educationDegrees) ? educationDegrees : String(educationDegrees).split(',')
      query.educationDegree = { $in: degreeArray }
    }
    if (educationField) {
      query.educationField = { $regex: educationField, $options: 'i' }
    }
    // Add more filters as needed

    // Sorting
    let sort: any = { createdAt: -1 }
    if (sortBy === 'oldest') sort = { createdAt: 1 }
    if (sortBy === 'name-asc') sort = { fullName: 1 }
    if (sortBy === 'name-desc') sort = { fullName: -1 }

    const client = await clientPromise
    const db = client.db()
    const studentsCol = db.collection('students')

    const skip = parseInt(offset as string)
    const lim = parseInt(limit as string)

    const totalCount = await studentsCol.countDocuments(query)
    const submissionsRaw = await studentsCol
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(lim)
      .toArray()

    // Map _id to id for frontend compatibility and add headshotUrl if headshotData exists
    const submissions = submissionsRaw.map((doc) => ({
      ...doc,
      id: doc._id.toString(),
      headshotUrl: doc.headshotData ? `/api/serve-file?studentId=${doc._id.toString()}&type=headshot` : undefined,
    }))

    return res.status(200).json({
      submissions,
      totalCount,
      hasMore: skip + lim < totalCount
    })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return res.status(500).json({ message: 'Error fetching submissions' })
  }
}