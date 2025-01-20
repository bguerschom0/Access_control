import https from 'https';
import axios from 'axios';

export const createHikvisionClient = (controllerConfig) => {
  const { ip_address, port, username, password } = controllerConfig;

  return axios.create({
    baseURL: `https://${ip_address}:${port || 443}`,
    headers: {
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false // For self-signed certificates
    }),
    timeout: 5000
  });
};

export const handleHikvisionError = (error) => {
  if (error.response) {
    const status = error.response.status;
    switch (status) {
      case 401:
        return { success: false, message: 'Authentication failed' };
      case 404:
        return { success: false, message: 'Device endpoint not found' };
      case 500:
        return { success: false, message: 'Device internal error' };
      default:
        return { success: false, message: `Device error: ${status}` };
    }
  }
  if (error.code === 'ECONNREFUSED') {
    return { success: false, message: 'Connection refused - check device availability' };
  }
  if (error.code === 'ETIMEDOUT') {
    return { success: false, message: 'Connection timed out' };
  }
  return { success: false, message: error.message };
};
