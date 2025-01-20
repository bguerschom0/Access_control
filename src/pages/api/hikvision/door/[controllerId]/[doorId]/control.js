import { createHikvisionClient, handleHikvisionError } from '../../../../utils/hikvision';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { controllerId, doorId } = req.query;
    const { command } = req.body;
    const controllerData = req.headers; // In production, fetch from database

    const hikvisionClient = createHikvisionClient(controllerData);
    
    await hikvisionClient.put(`/ISAPI/AccessControl/Door/${doorId}/status`, {
      doorState: command
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Door control error:', error);
    return res.status(500).json(handleHikvisionError(error));
  }
}
