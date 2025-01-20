import axios from 'axios';
import https from 'https';

const agent = new https.Agent({
  rejectUnauthorized: false
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { controllerId } = req.query;

  try {
    // You'll need to retrieve the controller credentials from your database here
    // For now, using request headers or query params for demonstration
    const { ip_address, port, username, password } = req.headers;

    const instance = axios.create({
      baseURL: `https://${ip_address}:${port}`,
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
      },
      httpsAgent: agent,
      timeout: 5000
    });

    const response = await instance.get('/ISAPI/System/status');

    return res.status(200).json({
      success: true,
      status: {
        cpuUsage: response.data.CPUUsage,
        memoryUsage: response.data.MemoryUsage,
        deviceTime: response.data.DeviceTime
      }
    });
  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
