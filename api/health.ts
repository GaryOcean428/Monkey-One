export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  })
}
