import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'
import * as formidable from 'formidable'
import type { File, Fields, Files, Part } from 'formidable'
import * as fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
  },
}

// Helper to get the first value from a field (handles string | string[] | undefined)
function getFirstField<T>(field: T | T[] | undefined): T | undefined {
  if (Array.isArray(field)) return field[0]
  return field
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const form = new formidable.IncomingForm({
    maxFileSize: 10 * 1024 * 1024, // 10MB
    keepExtensions: true,
    filter: (part: Part) => {
      // Allow PDFs for resumes and images for headshots
      if (part.name === 'resume') {
        return part.mimetype === 'application/pdf'
      }
      if (part.name === 'headshot') {
        return part.mimetype?.startsWith('image/') || false
      }
      return false
    },
  })

  form.parse(req, async (err: any, fields: Fields, files: Files) => {
    if (err) {
      console.error('Formidable parse error:', err)
      let errorMessage = `File upload error: ${err.message}`
      let errorField = 'general'
      
      if (err.message.includes('maxFileSize')) {
        errorMessage = 'File size exceeds 10MB limit. Please choose smaller files.'
        errorField = 'file_size'
      } else if (err.message.includes('parse')) {
        errorMessage = 'Invalid file format. Please check your file types.'
        errorField = 'file_format'
      }
      
      return res.status(400).json({ 
        success: false, 
        message: errorMessage,
        errorType: 'parse_error',
        errorField: errorField
      })
    }

    // Handle resume file
    const resumeFileRaw = files.resume
    const resumeFile = Array.isArray(resumeFileRaw) ? resumeFileRaw[0] : resumeFileRaw
    let resumeData = null
    let resumeMimeType = null
    if (resumeFile) {
      resumeData = await fs.promises.readFile(resumeFile.filepath)
      resumeMimeType = resumeFile.mimetype
      // Remove temp file
      await fs.promises.unlink(resumeFile.filepath)
    }

    // Handle headshot file
    const headshotFileRaw = files.headshot
    const headshotFile = Array.isArray(headshotFileRaw) ? headshotFileRaw[0] : headshotFileRaw
    let headshotData = null
    let headshotMimeType = null
    if (headshotFile) {
      headshotData = await fs.promises.readFile(headshotFile.filepath)
      headshotMimeType = headshotFile.mimetype
      // Remove temp file
      await fs.promises.unlink(headshotFile.filepath)
    }

    try {
      // MongoDB logic for student creation
      const studentData = {
        fullName: getFirstField(fields.fullName) ?? '',
        email: getFirstField(fields.email) ?? '',
        linkedinUrl: getFirstField(fields.linkedinUrl) ?? '',
        githubUrl: getFirstField(fields.githubUrl) ?? '',
        resumeData,
        resumeMimeType,
        headshotData,
        headshotMimeType,
        yearsOfExperience: getFirstField(fields.yearsOfExperience) ?? null,
        yearsOfTechExperience: getFirstField(fields.yearsOfTechExperience) ?? null,
        educationField: getFirstField(fields.educationField) ?? null,
        educationDegree: JSON.parse(getFirstField(fields.educationDegree) ?? '[]'),
        technicalSkills: JSON.parse(getFirstField(fields.technicalSkills) ?? '[]'),
        certifications: JSON.parse(getFirstField(fields.certifications) ?? '[]').map((cert: any) =>
          typeof cert === 'string'
            ? { name: cert, status: null }
            : { name: cert.name, status: cert.status ?? null }
        ),
        careerInterests: JSON.parse(getFirstField(fields.careerInterests) ?? '[]'),
        workExperience: JSON.parse(getFirstField(fields.workExperience) ?? '[]'),
        createdAt: new Date(),
      }

      // Duplicate email check
      const client = await clientPromise
      const db = client.db()
      const existing = await db.collection('students').findOne({ email: studentData.email })
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'A student with this email address has already submitted the form',
          errorType: 'duplicate_email'
        })
      }

      await db.collection('students').insertOne(studentData)

      return res.status(200).json({
        success: true,
        message: 'Form submitted successfully',
        redirectUrl: '/thank-you'
      })
    } catch (error: any) {
      console.error('Error submitting form:', error)

      // Check for JSON parsing errors
      if (error instanceof SyntaxError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid form data format',
          errorType: 'json_parse_error',
          details: error.message
        })
      }

      return res.status(500).json({
        success: false,
        message: 'Error submitting form',
        errorType: 'database_error',
        details: error.message
      })
    }
  })
}