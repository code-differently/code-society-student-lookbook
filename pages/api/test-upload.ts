import type { NextApiRequest, NextApiResponse } from 'next'
import * as formidable from 'formidable'
import type { Fields, Files } from 'formidable'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const form = new formidable.IncomingForm({
    maxFileSize: 10 * 1024 * 1024, // 10MB
  })

  form.parse(req, async (err: any, fields: Fields, files: Files) => {
    if (err) {
      console.error('Test upload error:', err)
      return res.status(400).json({ 
        success: false, 
        message: `Upload error: ${err.message}`,
        errorType: 'parse_error'
      })
    }

    console.log('=== UPLOAD DEBUG INFO ===')
    console.log('Files received:', Object.keys(files))
    console.log('Fields received:', Object.keys(fields))
    
    if (files.resume) {
      const resume = Array.isArray(files.resume) ? files.resume[0] : files.resume
      const sizeMB = (resume.size / (1024 * 1024)).toFixed(2)
      console.log('Resume file:', {
        name: resume.originalFilename,
        type: resume.mimetype,
        size: `${sizeMB} MB`,
        path: resume.filepath
      })
    }
    
    if (files.headshot) {
      const headshot = Array.isArray(files.headshot) ? files.headshot[0] : files.headshot
      const sizeMB = (headshot.size / (1024 * 1024)).toFixed(2)
      console.log('Headshot file:', {
        name: headshot.originalFilename,
        type: headshot.mimetype,
        size: `${sizeMB} MB`,
        path: headshot.filepath
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Upload test successful',
      files: Object.keys(files),
      fields: Object.keys(fields)
    })
  })
} 