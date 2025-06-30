import type { NextApiRequest, NextApiResponse } from 'next'
import * as formidable from 'formidable'
import type { File, Fields, Files, Part } from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

type ResponseData = {
  success: boolean
  message: string
  headshotUrl?: string
}

const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'headshots')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Helper to get the first value from a field
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
    maxFileSize: 5 * 1024 * 1024, // 5MB
    filter: (part: Part) => {
      // Allow only image files
      return part.mimetype?.startsWith('image/') || false
    },
  })

  form.parse(req, async (err: any, fields: Fields, files: Files) => {
    if (err) {
      return res.status(400).json({ success: false, message: 'File upload error' })
    }

    // Handle file
    const headshotFileRaw = files.headshot
    const headshotFile = Array.isArray(headshotFileRaw) ? headshotFileRaw[0] : headshotFileRaw

    if (!headshotFile) {
      return res.status(400).json({ success: false, message: 'No headshot file provided' })
    }

    try {
      const headshotUrl = `/uploads/headshots/${path.basename(headshotFile.filepath)}`
      
      return res.status(200).json({
        success: true,
        message: 'Headshot uploaded successfully',
        headshotUrl
      })
    } catch (error: any) {
      console.error('Error uploading headshot:', error)
      return res.status(500).json({
        success: false,
        message: 'Error uploading headshot',
      })
    }
  })
} 