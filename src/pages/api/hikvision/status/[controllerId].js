import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { ip_address, port, username, password } = req.headers;

    const instance = axios.create({
      baseURL: `http://${ip_address}:${port}`,
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    const response = await instance.get('/ISAPI/System/status');

    return res.status(200).json({
      success: true,
      status: response.data
    });
  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
