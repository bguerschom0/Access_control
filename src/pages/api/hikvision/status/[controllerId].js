import { createHikvisionClient, handleHikvisionError } from '../../utils/hikvision';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { controllerId } = req.query;
    // In production, you'd fetch controller details from your database
    const controllerData = req.headers;
    
    const hikvisionClient = createHikvisionClient(controllerData);
    const response = await hikvisionClient.get('/ISAPI/System/status');

    return res.status(200).json({
      success: true,
      status: {
        cpuUsage: response.data.CPUUsage,
        memoryUsage: response.data.MemoryUsage,
        deviceTime: response.data.DeviceTime,
        deviceName: response.data.DeviceName
      }
    });
  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json(handleHikvisionError(error));
  }
}
