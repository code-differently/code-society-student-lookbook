import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'
import { ObjectId } from 'mongodb'
import { PDFDocument } from 'pdf-lib'

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

    // Filter out students without resumes
    const studentsWithResumes = students.filter(student => {
      if (!student.resumeData) return false
      if (typeof student.resumeData === 'string') {
        return student.resumeData.length > 0
      }
      if (student.resumeData.buffer && student.resumeData.buffer.length > 0) {
        return true
      }
      return false
    })

    if (studentsWithResumes.length === 0) {
      return res.status(404).json({ message: 'No students with resumes found' })
    }

    // Merge all PDFs into one
    const mergedPdf = await PDFDocument.create()
    for (const student of studentsWithResumes) {
      let pdfBuffer
      if (typeof student.resumeData === 'string') {
        pdfBuffer = Buffer.from(student.resumeData, 'base64')
      } else if (student.resumeData.buffer) {
        pdfBuffer = student.resumeData.buffer
      } else {
        continue
      }
      const pdfToMerge = await PDFDocument.load(pdfBuffer)
      const copiedPages = await mergedPdf.copyPages(pdfToMerge, pdfToMerge.getPageIndices())
      copiedPages.forEach((page) => mergedPdf.addPage(page))
    }
    const mergedPdfBytes = await mergedPdf.save()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="all-student-resumes.pdf"')
    res.status(200).send(Buffer.from(mergedPdfBytes))
  } catch (error) {
    console.error('Error exporting merged resumes:', error)
    return res.status(500).json({ message: 'Error exporting merged resumes' })
  }
}