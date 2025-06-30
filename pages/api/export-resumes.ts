import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'
import fs from 'fs'
import path from 'path'
import archiver from 'archiver'

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

    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds }
      },
      select: {
        id: true,
        fullName: true,
        resumeUrl: true,
        email: true
      },
      orderBy: { fullName: 'asc' }
    })

    // Filter out students without resumes
    const studentsWithResumes = students.filter(student => student.resumeUrl && student.resumeUrl.trim() !== '')

    if (studentsWithResumes.length === 0) {
      return res.status(404).json({ message: 'No students with resumes found' })
    }

    // Create a temporary directory for the zip file
    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const zipPath = path.join(tempDir, `resumes-${Date.now()}.zip`)
    const output = fs.createWriteStream(zipPath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    output.on('close', () => {
      // Send the zip file
      res.setHeader('Content-Type', 'application/zip')
      res.setHeader('Content-Disposition', `attachment; filename="student-resumes.zip"`)
      res.setHeader('Content-Length', archive.pointer())
      
      const fileStream = fs.createReadStream(zipPath)
      fileStream.pipe(res)
      
      // Clean up the temporary file after sending
      fileStream.on('end', () => {
        fs.unlinkSync(zipPath)
      })
    })

    archive.on('error', (err: Error) => {
      throw err
    })

    archive.pipe(output)

    // Add each resume to the zip
    for (const student of studentsWithResumes) {
      if (student.resumeUrl) {
        const resumePath = path.join(process.cwd(), 'public', student.resumeUrl)
        
        if (fs.existsSync(resumePath)) {
          // Get file extension
          const ext = path.extname(student.resumeUrl)
          const fileName = `${student.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_resume${ext}`
          
          archive.file(resumePath, { name: fileName })
        }
      }
    }

    // Create a manifest file
    const manifest = studentsWithResumes.map(student => ({
      name: student.fullName,
      email: student.email,
      resumeFile: student.resumeUrl ? `${student.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_resume${path.extname(student.resumeUrl)}` : 'No resume'
    }))

    archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' })

    await archive.finalize()

  } catch (error) {
    console.error('Error exporting resumes:', error)
    return res.status(500).json({ message: 'Error exporting resumes' })
  }
} 