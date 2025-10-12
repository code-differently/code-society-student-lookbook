import { NextApiRequest, NextApiResponse } from 'next'
import { getStudents } from '../../lib/firebase'
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

    // Get all students and filter by IDs
    const allStudents = await getStudents()
    const students = allStudents
      .filter(student => studentIds.includes(student.id))
      .map(student => ({
        id: student.id,
        fullName: student.fullName,
        resumeUrl: student.resumeUrl,
        email: student.email
      }))
      .sort((a, b) => a.fullName.localeCompare(b.fullName))

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

    // Handle archive completion and errors
    const archivePromise = new Promise<void>((resolve, reject) => {
      output.on('close', () => {
        resolve()
      })
      
      archive.on('error', (err: Error) => {
        reject(err)
      })
    })

    archive.pipe(output)

    // Process each resume and collect promises
    const promises = studentsWithResumes.map(async (student) => {
      if (student.resumeUrl) {
        try {
          const fileName = `${student.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_resume.pdf`
          
          // Check if it's a Firebase URL (starts with https://)
          if (student.resumeUrl.startsWith('https://')) {
            // Download file from Firebase Storage
            console.log(`Downloading Firebase file for ${student.fullName}: ${student.resumeUrl}`)
            
            const response = await fetch(student.resumeUrl)
            if (response.ok && response.body) {
              const buffer = await response.arrayBuffer()
              archive.append(Buffer.from(buffer), { name: fileName })
              return { success: true, fileName }
            } else {
              console.log(`Failed to download Firebase file for ${student.fullName}`)
              return { success: false, fileName }
            }
          } else {
            // Handle local file paths
            const resumePath = path.join(process.cwd(), 'public', student.resumeUrl)
            
            if (fs.existsSync(resumePath)) {
              archive.file(resumePath, { name: fileName })
              return { success: true, fileName }
            } else {
              console.log(`Resume file not found for ${student.fullName}: ${resumePath}`)
              return { success: false, fileName }
            }
          }
        } catch (error) {
          console.error(`Error processing resume for ${student.fullName}:`, error)
          return { success: false, fileName: `${student.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_resume.pdf` }
        }
      }
      return { success: false, fileName: 'No resume' }
    })

    // Wait for all files to be processed
    const results = await Promise.all(promises)

    // Create a manifest file
    const manifest = studentsWithResumes.map((student, index) => ({
      name: student.fullName,
      email: student.email,
      resumeFile: results[index]?.success ? results[index].fileName : 'File not available'
    }))

    archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' })

    await archive.finalize()
    
    // Wait for the archive to complete
    await archivePromise

    // Send the zip file
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="student-resumes.zip"`)
    
    const fileStream = fs.createReadStream(zipPath)
    fileStream.pipe(res)
    
    // Clean up the temporary file after sending
    fileStream.on('end', () => {
      try {
        fs.unlinkSync(zipPath)
      } catch (cleanupError) {
        console.error('Error cleaning up zip file:', cleanupError)
      }
    })

  } catch (error) {
    console.error('Error exporting resumes:', error)
    return res.status(500).json({ message: 'Error exporting resumes' })
  }
} 