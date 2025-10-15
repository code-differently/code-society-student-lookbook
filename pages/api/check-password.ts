import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }
  const { password } = req.body
  if (!password) {
    return res.status(400).json({ message: 'Password is required' })
  }
  try {
    const client = await clientPromise
    const db = client.db()
    const settings = await db.collection('settings').findOne({ key: 'submissionPassword' })
    if (!settings || !settings.hash) {
      return res.status(500).json({ message: 'Password not set' })
    }
    const isValid = await bcrypt.compare(password, settings.hash)
    if (isValid) {
      return res.status(200).json({ success: true })
    } else {
      return res.status(401).json({ message: 'Incorrect password' })
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}
