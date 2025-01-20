import axios from 'axios';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  // Log the request method and body for debugging
  console.log('Request method:', req.method);
  console.log('Request body:', req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Only POST requests are accepted.' 
    });
  }

  try {
    const { ip_address, port, username, password } = req.body;

    // Create instance for the controller
    const instance = axios.create({
      baseURL: `http://${ip_address}:${port}`,
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    // Test connection
    console.log('Testing connection to:', `http://${ip_address}:${port}/ISAPI/System/status`);
    const response = await instance.get('/ISAPI/System/status');

    console.log('Connection successful:', response.data);
    return res.status(200).json({
      success: true,
      status: response.data
    });

  } catch (error) {
    console.error('Controller initialization error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize controller',
      details: error.response?.data || error.code
    });
  }
}
