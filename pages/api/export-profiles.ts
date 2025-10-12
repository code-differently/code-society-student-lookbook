import { NextApiRequest, NextApiResponse } from 'next'
import { getStudents } from '../../lib/firebase'

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
      .sort((a, b) => a.fullName.localeCompare(b.fullName))

    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found' })
    }

    // Generate HTML for printable profiles
    const htmlContent = generateProfilesHTML(students)

    res.setHeader('Content-Type', 'text/html')
    res.setHeader('Content-Disposition', 'attachment; filename="student-profiles.html"')
    res.status(200).send(htmlContent)

  } catch (error) {
    console.error('Error exporting profiles:', error)
    return res.status(500).json({ message: 'Error exporting profiles' })
  }
}

function generateProfilesHTML(students: any[]) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Profiles Export</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f8f9fa;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .profile-card {
            background: white;
            border-radius: 8px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            page-break-inside: avoid;
        }
        .profile-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            gap: 20px;
        }
        .headshot {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #e2e8f0;
        }
        .headshot-placeholder {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #718096;
            font-size: 14px;
            border: 3px solid #e2e8f0;
        }
        .profile-info h2 {
            margin: 0 0 10px 0;
            color: #2d3748;
            font-size: 24px;
        }
        .profile-info p {
            margin: 5px 0;
            color: #4a5568;
        }
        .section {
            margin: 20px 0;
        }
        .section h3 {
            color: #2d3748;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .tag {
            background: #3182ce;
            color: white;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 500;
        }
        .tag.certification {
            background: #38a169;
        }
        .tag.interest {
            background: #805ad5;
        }
        .tag.experience {
            background: #dd6b20;
        }
        .links {
            display: flex;
            gap: 15px;
            margin-top: 15px;
        }
        .link {
            color: #3182ce;
            text-decoration: none;
            font-weight: 500;
        }
        .link:hover {
            text-decoration: underline;
        }
        .statement {
            background: #f7fafc;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #3182ce;
            font-style: italic;
        }
        @media print {
            body { background: white; }
            .profile-card { box-shadow: none; border: 1px solid #e2e8f0; }
            .header { box-shadow: none; border: 1px solid #e2e8f0; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Student Profiles Export</h1>
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <p>Total Profiles: ${students.length}</p>
    </div>

    ${students.map(student => `
        <div class="profile-card">
            <div class="profile-header">
                ${student.headshotUrl 
                    ? `<img src="${student.headshotUrl}" alt="${student.fullName}" class="headshot">`
                    : `<div class="headshot-placeholder">No Photo</div>`
                }
                <div class="profile-info">
                    <h2>${student.fullName}</h2>
                    <p><strong>Email:</strong> ${student.email}</p>
                    <p><strong>Submitted:</strong> ${new Date(student.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            <div class="section">
                <h3>Education</h3>
                <p>${student.educationDegree || '—'}${student.educationField ? ` in ${student.educationField}` : ''}</p>
            </div>

            <div class="section">
                <h3>Years of Experience</h3>
                <p>${student.yearsOfExperience || '—'}</p>
            </div>

            <div class="section">
                <h3>Technical Skills (${student.technicalSkills.length})</h3>
                <div class="tags">
                    ${student.technicalSkills.map((skill : string) => `<span class="tag">${skill}</span>`).join('')}
                </div>
            </div>

            <div class="section">
                <h3>Certifications (${student.certifications.length})</h3>
                <div class="tags">
                    ${student.certifications.map((cert: { name: string, status?: string }) => `<span class="tag certification">${cert.name}${cert.status ? ` <span style='font-size:11px;font-weight:normal;'>(${cert.status})</span>` : ''}</span>`).join('')}
                </div>
            </div>

            <div class="section">
                <h3>Career Interests (${student.careerInterests.length})</h3>
                <div class="tags">
                    ${student.careerInterests.map((interest: string) => `<span class="tag interest">${interest}</span>`).join('')}
                </div>
            </div>

            <div class="section">
                <h3>Work Experience (${student.workExperience.length})</h3>
                <div class="tags">
                    ${student.workExperience.map((exp: string) => `<span class="tag experience">${exp}</span>`).join('')}
                </div>
            </div>

            <div class="section">
                <h3>Professional Links</h3>
                <div class="links">
                    ${student.linkedinUrl ? `<a href="${student.linkedinUrl}" class="link" target="_blank">LinkedIn Profile</a>` : ''}
                    ${student.githubUrl ? `<a href="${student.githubUrl}" class="link" target="_blank">GitHub Profile</a>` : ''}
                    ${student.resumeUrl ? `<a href="${student.resumeUrl}" class="link" target="_blank">Resume</a>` : ''}
                </div>
            </div>
        </div>
    `).join('')}
</body>
</html>
  `
} 