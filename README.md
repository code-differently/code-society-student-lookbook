# Code Society Student LookBook

A modern web application for students to showcase their skills, experience, and professional profiles. Built with Next.js, TypeScript, Chakra UI, and Firebase.

## Features

- Student profile submission form with resume and headshot upload
- Admin panel to view, filter, and export student submissions
- Resume and headshot storage (local or Firebase Storage)
- Bulk export of resumes as a ZIP file
- Search and filter by skills, certifications, education, and more
- Responsive, accessible UI

## Tech Stack

- [Next.js](https://nextjs.org/) (React framework)
- [TypeScript](https://www.typescriptlang.org/)
- [Chakra UI](https://chakra-ui.com/) (UI components)
- [Firebase](https://firebase.google.com/) (Firestore & Storage)
- [Formidable](https://www.npmjs.com/package/formidable) (file uploads)

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
 git clone https://github.com/RiceViz/code-society-student-lookbook.git
 cd code-society-student-lookbook

# Install dependencies
 npm install
# or
yarn install
```

### Environment Variables

Create a `.env.local` file in the root directory and add your Firebase config:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Running the App

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

## Usage

- **Students:** Fill out the form and upload your resume and headshot.
- **Admins:** Go to `/submissions` to view, filter, and export student data.
- **Resume Export:** Select students and click "Export Resumes" to download a ZIP file of resumes.

## File Storage
- By default, files are stored in `public/uploads/` locally.
- To use Firebase Storage, enable it in your Firebase Console and uncomment the relevant code in `pages/api/submit.ts`.

## Project Structure

```
components/         # React components
filters/            # Filter options for form fields
interfaces/         # TypeScript interfaces
lib/                # Firebase and utility functions
pages/              # Next.js pages and API routes
public/uploads/     # Uploaded resumes and headshots
```

## Questions? Ask:

- [@RiceViz](https://github.com/RiceViz)