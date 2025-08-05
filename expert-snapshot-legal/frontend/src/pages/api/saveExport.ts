import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Or bump it higher if needed
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename, fileData, metadata } = req.body;

    const buffer = Buffer.from(fileData); // assumes fileData is an array of numbers
    const filePath = path.join(process.cwd(), 'exports', filename);

    fs.writeFileSync(filePath, buffer);

    await prisma.exportLog.create({
      data: {
        filename,
        clientName: metadata.client,
        retainerType: metadata.template,
        timestamp: new Date(),
      },
    });

    res.status(200).json({ status: 'Saved', path: filePath });
  } catch (error) {
    console.error('❌ Export failed:', error);
    res.status(500).json({ error: 'Failed to save export' });
  }
}
