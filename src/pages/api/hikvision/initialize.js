import axios from 'axios';
import https from 'https';

const agent = new https.Agent({
  rejectUnauthorized: false // Allow self-signed certificates
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { ip_address, port, username, password } = req.body;

    // Create instance for the controller
    const instance = axios.create({
      baseURL: `https://${ip_address}:${port}`,
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      httpsAgent: agent,
      timeout: 5000
    });

    // Test connection
    const response = await instance.get('/ISAPI/System/status');

    return res.status(200).json({
      success: true,
      controller: {
        ip_address,
        port,
        status: 'online',
        capabilities: response.data
      }
    });
  } catch (error) {
    console.error('Controller initialization error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
