import axios from 'axios';
import { HIKVISION_CONFIG } from '../../../config/hikvision';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { DeviceInfo } = req.body;

    // Create instance for the controller
    const instance = axios.create({
      baseURL: `http://${DeviceInfo.ipAddress}:${DeviceInfo.port}`,
      headers: {
        Authorization: `Basic ${Buffer.from(`${DeviceInfo.username}:${DeviceInfo.password}`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    // Get device status using proper endpoint
    const statusResponse = await instance.get(HIKVISION_CONFIG.API_ENDPOINTS.DEVICE_STATUS);
    
    // Get device info
    const deviceResponse = await instance.get(HIKVISION_CONFIG.API_ENDPOINTS.GET_DEVICES);

    return res.status(200).json({
      success: true,
      deviceInfo: deviceResponse.data,
      status: statusResponse.data
    });

  } catch (error) {
    console.error('Controller initialization error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
