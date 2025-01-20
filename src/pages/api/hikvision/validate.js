import { createHikvisionClient, handleHikvisionError } from '../utils/hikvision';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const controllerData = req.body;
    const hikvisionClient = createHikvisionClient(controllerData);
    
    // Try to get device status
    await hikvisionClient.get('/ISAPI/System/status');

    return res.status(200).json({ success: true });
  } catch (error) {
    // Don't expose detailed error for validation
    return res.status(200).json({ success: false });
  }
}
