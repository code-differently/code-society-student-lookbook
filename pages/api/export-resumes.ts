import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'
import archiver from 'archiver'
import { ObjectId } from 'mongodb'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { studentIds } = req.body

    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ message: 'Student IDs array is required' })
    }

    // Convert string IDs to ObjectId, filter out any invalid/null
    const objectIds = studentIds
      .map((id: string) => {
        try {
          return new ObjectId(id)
        } catch {
          return undefined
        }
      })
      .filter((id): id is ObjectId => !!id)

    const client = await clientPromise
    const db = client.db()
    const students = await db.collection('students')
      .find({ _id: { $in: objectIds } })
      .sort({ fullName: 1 })
      .toArray()

    // Filter out students without resumes (handle MongoDB Binary and string)
    const studentsWithResumes = students.filter(student => {
      if (!student.resumeData) return false
      if (typeof student.resumeData === 'string') {
        return student.resumeData.length > 0
      }
      // MongoDB Binary type
      if (student.resumeData.buffer && student.resumeData.buffer.length > 0) {
        return true
      }
      return false
    })

    if (studentsWithResumes.length === 0) {
      return res.status(404).json({ message: 'No students with resumes found' })
    }

    // Set up the zip archive to stream directly to the response
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="student-resumes.zip"`)
    const archive = archiver('zip', { zlib: { level: 9 } })
    archive.pipe(res)

    // Process each resume and collect manifest info
    const manifest = []
    for (const student of studentsWithResumes) {
      try {
        const fileName = `${student.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_resume.pdf`
        // If resumeData is base64, convert to Buffer; if Binary, use .buffer
        let buffer
        if (typeof student.resumeData === 'string') {
          buffer = Buffer.from(student.resumeData, 'base64')
        } else if (student.resumeData.buffer) {
          buffer = student.resumeData.buffer // MongoDB Binary
        } else {
          throw new Error('Invalid resumeData format')
        }
        archive.append(buffer, { name: fileName })
        manifest.push({
          name: student.fullName,
          email: student.email,
          resumeFile: fileName
        })
      } catch (error) {
        console.error(`Error processing resume for ${student.fullName}:`, error)
        manifest.push({
          name: student.fullName,
          email: student.email,
          resumeFile: 'File not available'
        })
      }
    }

    // Add manifest file
    archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' })

    await archive.finalize()
    // No need to clean up temp files since everything is streamed
  } catch (error) {
    console.error('Error exporting resumes:', error)
    return res.status(500).json({ message: 'Error exporting resumes' })
  }
}