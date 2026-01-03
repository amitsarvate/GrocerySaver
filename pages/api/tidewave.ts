import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== 'development') {
    res.status(404).end();
    return;
  }

  const { tidewaveHandler } = await import('tidewave/next-js/handler');
  const handler = await tidewaveHandler({
    allowRemoteAccess: process.env.TIDEWAVE_ALLOW_REMOTE_ACCESS === '1',
  });
  return handler(req, res);
}

export const config = {
  runtime: 'nodejs',
  api: {
    bodyParser: false,
  },
};
