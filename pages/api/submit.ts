import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'
import * as formidable from 'formidable'
import type { File, Fields, Files, Part } from 'formidable'
import * as fs from 'fs'
import * as path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

type ResponseData = {
  success: boolean
  message: string
  redirectUrl?: string
  errorType?: string
  receivedType?: string
  details?: string
  errorField?: string
}

const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
const headshotsDir = path.join(uploadsDir, 'headshots')
const resumesDir = path.join(uploadsDir, 'resumes')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir)
}
if (!fs.existsSync(headshotsDir)) {
  fs.mkdirSync(headshotsDir, { recursive: true })
}
if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir, { recursive: true })
}

// Helper to get the first value from a field (handles string | string[] | undefined)
function getFirstField<T>(field: T | T[] | undefined): T | undefined {
  if (Array.isArray(field)) return field[0]
  return field
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const form = new formidable.IncomingForm({
    uploadDir: uploadsDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
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

  // Custom file naming to put files in correct subdirectories
  form.on('fileBegin', (name, file) => {
    if (name === 'headshot') {
      file.filepath = path.join(headshotsDir, file.newFilename || file.originalFilename || 'headshot')
    } else if (name === 'resume') {
      file.filepath = path.join(resumesDir, file.newFilename || file.originalFilename || 'resume')
    }
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

    console.log('Files received:', Object.keys(files))
    console.log('Fields received:', Object.keys(fields))

    // Handle resume file with detailed logging
    const resumeFileRaw = files.resume
    console.log('Resume file raw:', resumeFileRaw)
    
    if (resumeFileRaw && !Array.isArray(resumeFileRaw) && (resumeFileRaw as File).mimetype !== 'application/pdf') {
      console.error('Resume file type error:', (resumeFileRaw as File).mimetype)
      return res.status(400).json({
        success: false,
        message: 'Resume must be a PDF file. Please upload a PDF document.',
        errorType: 'resume_file_type',
        errorField: 'resume',
        receivedType: (resumeFileRaw as File).mimetype || undefined
      })
    }
    
    const resumeFile = Array.isArray(resumeFileRaw) ? resumeFileRaw[0] : resumeFileRaw
    const resumeUrl = resumeFile ? `/uploads/resumes/${path.basename(resumeFile.filepath)}` : ''
    console.log('Resume URL:', resumeUrl)

    // Handle headshot file with detailed logging
    const headshotFileRaw = files.headshot
    console.log('Headshot file raw:', headshotFileRaw)
    
    if (headshotFileRaw && !Array.isArray(headshotFileRaw) && !(headshotFileRaw as File).mimetype?.startsWith('image/')) {
      console.error('Headshot file type error:', (headshotFileRaw as File).mimetype)
      return res.status(400).json({
        success: false,
        message: 'Headshot must be an image file (JPG, PNG, etc.). Please upload a photo.',
        errorType: 'headshot_file_type',
        errorField: 'headshot',
        receivedType: (headshotFileRaw as File).mimetype || undefined
      })
    }
    
    const headshotFile = Array.isArray(headshotFileRaw) ? headshotFileRaw[0] : headshotFileRaw
    const headshotUrl = headshotFile ? `/uploads/headshots/${path.basename(headshotFile.filepath)}?t=${Date.now()}` : null
    console.log('Headshot URL:', headshotUrl)

    try {
      const student = await prisma.student.create({
        data: {
          fullName: getFirstField(fields.fullName) ?? '',
          email: getFirstField(fields.email) ?? '',
          linkedinUrl: getFirstField(fields.linkedinUrl) ?? '',
          githubUrl: getFirstField(fields.githubUrl) ?? '',
          resumeUrl,
          headshotUrl,
          yearsOfExperience: getFirstField(fields.yearsOfExperience) ?? null,
          educationField: getFirstField(fields.educationField) ?? null,
          educationDegrees: {
            create: JSON.parse(getFirstField(fields.educationDegree) ?? '[]').map((degree: string) => ({ name: degree })),
          },
          technicalSkills: {
            create: JSON.parse(getFirstField(fields.technicalSkills) ?? '[]').map((skill: string) => ({ name: skill })),
          },
          certifications: {
            create: JSON.parse(getFirstField(fields.certifications) ?? '[]').map((cert: any) =>
              typeof cert === 'string'
                ? { name: cert, status: null }
                : { name: cert.name, status: cert.status ?? null }
            ),
          },
          careerInterests: {
            create: JSON.parse(getFirstField(fields.careerInterests) ?? '[]').map((interest: string) => ({ name: interest })),
          },
          workExperience: {
            create: JSON.parse(getFirstField(fields.workExperience) ?? '[]').map((exp: string) => ({ name: exp })),
          },
        },
      })

      return res.status(200).json({
        success: true,
        message: 'Form submitted successfully',
        redirectUrl: '/thank-you'
      })
    } catch (error: any) {
      console.error('Error submitting form:', error)
      
      // Check for duplicate email error
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return res.status(400).json({
          success: false,
          message: 'A student with this email address has already submitted the form',
          errorType: 'duplicate_email'
        })
      }

      // Check for validation errors
      if (error.code === 'P2000') {
        return res.status(400).json({
          success: false,
          message: 'Data validation error - please check your input',
          errorType: 'validation_error',
          details: error.message
        })
      }

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