import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const logs = await prisma.exportLog.findMany({
      orderBy: { timestamp: 'desc' },
    });
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
}
