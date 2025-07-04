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
}

const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir)
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

  form.parse(req, async (err: any, fields: Fields, files: Files) => {
    if (err) {
      return res.status(400).json({ success: false, message: 'File upload error' })
    }

    // Handle resume file
    const resumeFileRaw = files.resume
    const resumeFile = Array.isArray(resumeFileRaw) ? resumeFileRaw[0] : resumeFileRaw
    const resumeUrl = resumeFile ? `/uploads/${path.basename(resumeFile.filepath)}` : ''

    // Handle headshot file
    const headshotFileRaw = files.headshot
    const headshotFile = Array.isArray(headshotFileRaw) ? headshotFileRaw[0] : headshotFileRaw
    const headshotUrl = headshotFile ? `/uploads/${path.basename(headshotFile.filepath)}` : null

    try {
      const student = await prisma.student.create({
        data: {
          fullName: getFirstField(fields.fullName) ?? '',
          email: getFirstField(fields.email) ?? '',
          linkedinUrl: getFirstField(fields.linkedinUrl) ?? '',
          githubUrl: getFirstField(fields.githubUrl) ?? '',
          professionalStatement: getFirstField(fields.professionalStatement) ?? '',
          resumeUrl,
          headshotUrl,
          technicalSkills: {
            create: JSON.parse(getFirstField(fields.technicalSkills) ?? '[]').map((skill: string) => ({ name: skill })),
          },
          certifications: {
            create: JSON.parse(getFirstField(fields.certifications) ?? '[]').map((cert: string) => ({ name: cert })),
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
        })
      }

      return res.status(500).json({
        success: false,
        message: 'Error submitting form',
      })
    }
  })
} 