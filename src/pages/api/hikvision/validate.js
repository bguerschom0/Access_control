import axios from 'axios';
import https from 'https';

const agent = new https.Agent({
  rejectUnauthorized: false
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { ip_address, port, username, password } = req.body;

    const instance = axios.create({
      baseURL: `https://${ip_address}:${port}`,
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
      },
      httpsAgent: agent,
      timeout: 5000
    });

    await instance.get('/ISAPI/System/status');

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Validation error:', error);
    return res.status(200).json({ success: false });
  }
}
