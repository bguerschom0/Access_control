import { createHikvisionClient, handleHikvisionError } from '../utils/hikvision';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const controllerData = req.body;
    const hikvisionClient = createHikvisionClient(controllerData);

    // Test basic connectivity
    const statusResponse = await hikvisionClient.get('/ISAPI/System/status');
    
    // Get device capabilities
    const capabilitiesResponse = await hikvisionClient.get('/ISAPI/System/capabilities');
    
    // Get device info
    const deviceInfoResponse = await hikvisionClient.get('/ISAPI/System/deviceInfo');

    return res.status(200).json({
      success: true,
      controller: {
        ...controllerData,
        status: 'online',
        deviceInfo: deviceInfoResponse.data,
        capabilities: capabilitiesResponse.data,
        systemStatus: statusResponse.data
      }
    });
  } catch (error) {
    console.error('Controller initialization error:', error);
    return res.status(500).json(handleHikvisionError(error));
  }
}
