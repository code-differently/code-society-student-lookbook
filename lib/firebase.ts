import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  DocumentData,
  QueryConstraint,
  Timestamp,
  getDoc
} from 'firebase/firestore'
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage'
import { db, storage } from '../firebase'

export interface Student {
  id?: string
  fullName: string
  email: string
  linkedinUrl?: string
  githubUrl?: string
  resumeUrl?: string
  headshotUrl?: string | null
  yearsOfExperience?: string | null
  educationDegree?: string[]
  educationField?: string | null
  technicalSkills: string[]
  certifications: Array<{ name: string; status?: string | null }>
  careerInterests: string[]
  workExperience: string[]
  createdAt: Date
}

export const studentsCollection = collection(db, 'students')

// Create a new student
export async function createStudent(studentData: Omit<Student, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Check if email already exists
    const emailQuery = query(studentsCollection, where('email', '==', studentData.email))
    const emailSnapshot = await getDocs(emailQuery)
    
    if (!emailSnapshot.empty) {
      return { success: false, error: 'A student with this email address has already submitted the form' }
    }

    // Clean data - remove undefined values and replace with null or omit them
    const cleanData: any = {}
    Object.keys(studentData).forEach(key => {
      const value = (studentData as any)[key]
      if (value !== undefined) {
        cleanData[key] = value
      }
    })

    const docRef = await addDoc(studentsCollection, {
      ...cleanData,
      createdAt: Timestamp.now()
    })
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error('Error creating student:', error)
    return { success: false, error: 'Error submitting form' }
  }
}

// Get students with filters
export async function getStudents(filters: any = {}): Promise<Student[]> {
  try {
    const constraints: QueryConstraint[] = []
    
    // Sorting
    if (filters.sortBy === 'oldest') {
      constraints.push(orderBy('createdAt', 'asc'))
    } else if (filters.sortBy === 'name-asc') {
      constraints.push(orderBy('fullName', 'asc'))
    } else if (filters.sortBy === 'name-desc') {
      constraints.push(orderBy('fullName', 'desc'))
    } else {
      constraints.push(orderBy('createdAt', 'desc'))
    }
    
    // Pagination
    if (filters.limit) {
      constraints.push(limit(parseInt(filters.limit)))
    }
    
    // Date range filters
    if (filters.dateFrom) {
      constraints.push(where('createdAt', '>=', Timestamp.fromDate(new Date(filters.dateFrom))))
    }
    
    if (filters.dateTo) {
      constraints.push(where('createdAt', '<=', Timestamp.fromDate(new Date(filters.dateTo))))
    }
    
    // Note: Firebase doesn't allow multiple != filters, so we'll handle these in client-side filtering
    // Resume and LinkedIn filters will be applied in applyClientSideFilters function
    
    // Years of experience filter
    if (filters.yearsOfExperience && filters.yearsOfExperience.length > 0) {
      const expArray = Array.isArray(filters.yearsOfExperience) 
        ? filters.yearsOfExperience 
        : filters.yearsOfExperience.split(',')
      constraints.push(where('yearsOfExperience', 'in', expArray))
    }
    
    // Education field filter
    if (filters.educationField) {
      // Note: Firestore doesn't support case-insensitive contains, so we'll need to implement this differently
      // For now, we'll do exact matches and filter client-side for partial matches
    }

    const q = query(studentsCollection, ...constraints)
    const querySnapshot = await getDocs(q)
    
    let students: Student[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      students.push({ 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      } as Student)
    })
    
    // Client-side filtering for complex queries that Firestore can't handle
    students = applyClientSideFilters(students, filters)
    
    return students
  } catch (error) {
    console.error('Error getting students:', error)
    throw error
  }
}

// Apply client-side filters for complex queries
function applyClientSideFilters(students: Student[], filters: any): Student[] {
  let filtered = [...students]
  
  // Text search
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filtered = filtered.filter(student => 
      student.fullName.toLowerCase().includes(searchTerm) ||
      student.email.toLowerCase().includes(searchTerm)
    )
  }
  
  // Skills filtering
  if (filters.skills && filters.skills.length > 0) {
    const skillArray = Array.isArray(filters.skills) ? filters.skills : filters.skills.split(',')
    
    if (filters.skillCombination === 'all') {
      // Must have ALL selected skills
      filtered = filtered.filter(student => 
        skillArray.every((skill: string) => student.technicalSkills.includes(skill))
      )
    } else {
      // Default: ANY of the selected skills
      filtered = filtered.filter(student => 
        skillArray.some((skill: string) => student.technicalSkills.includes(skill))
      )
    }
  }
  
  // Certifications filtering
  if (filters.certifications && filters.certifications.length > 0) {
    const certArray = Array.isArray(filters.certifications) ? filters.certifications : filters.certifications.split(',')
    filtered = filtered.filter(student => 
      certArray.some((cert: string) => student.certifications.some(c => c.name === cert))
    )
  }
  
  // Has any certification filter
  if (filters.hasAnyCertification === 'true') {
    filtered = filtered.filter(student => student.certifications.length > 0)
  }
  
  // Career interests filtering
  if (filters.interests && filters.interests.length > 0) {
    const interestArray = Array.isArray(filters.interests) ? filters.interests : filters.interests.split(',')
    filtered = filtered.filter(student => 
      interestArray.some((interest: string) => student.careerInterests.includes(interest))
    )
  }
  
  // Work experience filtering
  if (filters.workExperience && filters.workExperience.length > 0) {
    const expArray = Array.isArray(filters.workExperience) ? filters.workExperience : filters.workExperience.split(',')
    filtered = filtered.filter(student => 
      expArray.some((exp: string) => student.workExperience.includes(exp))
    )
  }
  
  // Has work experience filter
  if (filters.hasWorkExperience === 'true') {
    filtered = filtered.filter(student => student.workExperience.length > 0)
  }
  
  // Resume filter (client-side since Firebase doesn't allow multiple != filters)
  if (filters.hasResume === 'true') {
    filtered = filtered.filter(student => 
      student.resumeUrl && student.resumeUrl.trim() !== ''
    )
  }
  
  // LinkedIn filter (client-side)
  if (filters.hasLinkedIn === 'true') {
    filtered = filtered.filter(student => 
      student.linkedinUrl && student.linkedinUrl.trim() !== ''
    )
  }
  
  // Education degrees filtering
  if (filters.educationDegrees && filters.educationDegrees.length > 0) {
    const degreeArray = Array.isArray(filters.educationDegrees) ? filters.educationDegrees : filters.educationDegrees.split(',')
    filtered = filtered.filter(student => 
      student.educationDegree && degreeArray.some((degree: string) => student.educationDegree?.includes(degree))
    )
  }
  
  // Education field filtering (case-insensitive contains)
  if (filters.educationField) {
    const fieldTerm = filters.educationField.toLowerCase()
    filtered = filtered.filter(student => 
      student.educationField?.toLowerCase().includes(fieldTerm)
    )
  }
  
  // Profile completeness filter
  if (filters.profileCompleteness === 'complete') {
    filtered = filtered.filter(student => 
      student.resumeUrl && student.resumeUrl !== '' &&
      student.linkedinUrl && student.linkedinUrl !== '' &&
      student.githubUrl && student.githubUrl !== ''
    )
  } else if (filters.profileCompleteness === 'partial') {
    filtered = filtered.filter(student => 
      !student.resumeUrl || student.resumeUrl === '' ||
      !student.linkedinUrl || student.linkedinUrl === '' ||
      !student.githubUrl || student.githubUrl === ''
    )
  }
  
  // Skill count filtering
  if (filters.minSkills && parseInt(filters.minSkills) > 0) {
    filtered = filtered.filter(student => student.technicalSkills.length >= parseInt(filters.minSkills))
  }
  
  if (filters.maxSkills && parseInt(filters.maxSkills) > 0) {
    filtered = filtered.filter(student => student.technicalSkills.length <= parseInt(filters.maxSkills))
  }
  
  return filtered
}

// Get student count with filters
export async function getStudentCount(filters: any = {}): Promise<number> {
  // For now, we'll get all students and count them
  // In production, you might want to implement a more efficient counting system
  const students = await getStudents(filters)
  return students.length
}

// Upload file to Firebase Storage
export async function uploadFile(file: any, folder: string): Promise<string> {
  try {
    const fileName = `${Date.now()}_${file.originalFilename || file.name || 'file'}`
    const storageRef = ref(storage, `${folder}/${fileName}`)
    
    // Read file from filesystem and create buffer
    const fs = await import('fs')
    const fileBuffer = fs.readFileSync(file.filepath)
    
    await uploadBytes(storageRef, fileBuffer)
    const downloadURL = await getDownloadURL(storageRef)
    
    return downloadURL
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

// Upload file from file system (for existing files)
export async function uploadFileFromPath(filePath: string, folder: string): Promise<string> {
  try {
    const fs = await import('fs')
    const path = await import('path')
    
    const fileName = `${Date.now()}_${path.basename(filePath)}`
    const storageRef = ref(storage, `${folder}/${fileName}`)
    
    const fileBuffer = fs.readFileSync(filePath)
    const blob = new Blob([fileBuffer])
    
    await uploadBytes(storageRef, blob)
    const downloadURL = await getDownloadURL(storageRef)
    
    return downloadURL
  } catch (error) {
    console.error('Error uploading file from path:', error)
    throw error
  }
}

// Delete file from Firebase Storage
export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    const fileRef = ref(storage, fileUrl)
    await deleteObject(fileRef)
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}
