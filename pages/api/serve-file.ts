import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { studentId, type } = req.query

    if (!studentId || typeof studentId !== 'string' || !type || typeof type !== 'string') {
      return res.status(400).json({ message: 'studentId and type are required' })
    }
    if (type !== 'resume' && type !== 'headshot') {
      return res.status(400).json({ message: 'Invalid type. Must be resume or headshot.' })
    }

    const client = await clientPromise
    const db = client.db()
    // Try both id and _id
    let student = await db.collection('students').findOne({ id: studentId })
    if (!student) {
      // Try _id as ObjectId
      try {
        student = await db.collection('students').findOne({ _id: new ObjectId(studentId) })
      } catch {}
    }
    if (!student) {
      return res.status(404).json({ message: 'Student not found' })
    }

    let fileData, mimeType, fileName
    if (type === 'resume') {
      fileData = student.resumeData
      mimeType = student.resumeMimeType || 'application/pdf'
      fileName = `${student.fullName?.replace(/[^a-zA-Z0-9]/g, '_') || 'resume'}.pdf`
    } else {
      fileData = student.headshotData
      mimeType = student.headshotMimeType || 'image/jpeg'
      fileName = `${student.fullName?.replace(/[^a-zA-Z0-9]/g, '_') || 'headshot'}.jpg`
    }

    // Debug logging for headshot and resume serving
    if (!fileData) {
      return res.status(404).json({ message: 'File not found' })
    }

    let buffer: Buffer
    if (typeof fileData === 'string') {
      buffer = Buffer.from(fileData, 'base64')
    } else if (fileData.buffer) {
      buffer = fileData.buffer // MongoDB Binary
    } else if (Buffer.isBuffer(fileData)) {
      buffer = fileData
    } else {
      return res.status(500).json({ message: 'Invalid file data format' })
    }

    res.setHeader('Content-Type', mimeType)
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`)
    res.send(buffer)
  } catch (error) {
    console.error('Error serving file:', error)
    return res.status(500).json({ message: 'Error serving file' })
  }
}
