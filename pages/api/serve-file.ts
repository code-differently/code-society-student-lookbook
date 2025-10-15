import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { fileUrl } = req.query

    if (!fileUrl || typeof fileUrl !== 'string') {
      return res.status(400).json({ message: 'File URL is required' })
    }

    // Only handle local file paths (Firebase URLs no longer supported)
    const filePath = path.join(process.cwd(), 'public', fileUrl)
    // Security check - make sure the file is within the uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!filePath.startsWith(uploadsDir)) {
      return res.status(403).json({ message: 'Access denied' })
    }
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath)
      const fileStream = fs.createReadStream(filePath)
      // Determine content type based on file extension
      const ext = path.extname(filePath).toLowerCase()
      let contentType = 'application/octet-stream'
      if (ext === '.pdf') {
        contentType = 'application/pdf'
      } else if (ext === '.jpg' || ext === '.jpeg') {
        contentType = 'image/jpeg'
      } else if (ext === '.png') {
        contentType = 'image/png'
      } else if (ext === '.gif') {
        contentType = 'image/gif'
      }
      // Set appropriate headers
      res.setHeader('Content-Type', contentType)
      res.setHeader('Content-Length', stat.size)
      res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`)
      // Pipe the file to the response
      fileStream.pipe(res)
    } else {
      return res.status(404).json({ message: 'File not found' })
    }
  } catch (error) {
    console.error('Error serving file:', error)
    return res.status(500).json({ message: 'Error serving file' })
  }
}
