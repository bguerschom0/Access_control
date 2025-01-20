import axios from 'axios';
import CryptoJS from 'crypto-js'; // For AES encryption

class HikvisionService {
  constructor() {
    this.controllers = new Map();
  }

  // Enhanced authentication with support for both Basic and Digest
  createAuthHeader(username, password, digestParams = null) {
    if (digestParams) {
      // Implement Digest Authentication
      const { realm, nonce, qop, uri } = digestParams;
      const ha1 = CryptoJS.MD5(`${username}:${realm}:${password}`).toString();
      const ha2 = CryptoJS.MD5(`POST:${uri}`).toString();
      const nc = '00000001';
      const cnonce = CryptoJS.MD5(Date.now().toString()).toString().substr(0, 8);
      
      const response = CryptoJS.MD5(
        `${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`
      ).toString();

      return {
        Authorization: `Digest username="${username}",realm="${realm}",nonce="${nonce}",uri="${uri}",response="${response}",qop=${qop},nc=${nc},cnonce="${cnonce}"`
      };
    }

    // Default to Basic Auth
    return {
      Authorization: `Basic ${btoa(`${username}:${password}`)}`
    };
  }

  // Encrypt sensitive data using AES
  encryptCredentials(data) {
    const key = CryptoJS.enc.Utf8.parse(process.env.NEXT_PUBLIC_ENCRYPTION_KEY);
    const iv = CryptoJS.enc.Utf8.parse(process.env.NEXT_PUBLIC_ENCRYPTION_IV);
    
    return CryptoJS.AES.encrypt(JSON.stringify(data), key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }).toString();
  }

  async initializeController(controller) {
    try {
      // Create axios instance with proper configuration
      const instance = axios.create({
        baseURL: `https://${controller.ip_address}:${controller.port || 443}`,
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false // For self-signed certificates
        })
      });

      // First try Basic Auth
      instance.defaults.headers.common = this.createAuthHeader(
        controller.username,
        controller.password
      );

      try {
        // Test connection with status check
        const statusResponse = await instance.get('/ISAPI/System/status');
        
        // If successful, store controller info
        this.controllers.set(controller.id, {
          instance,
          status: statusResponse.data,
          lastChecked: new Date(),
          authType: 'basic'
        });

        // Setup periodic heartbeat
        this.setupHeartbeat(controller.id);
        
        return true;
      } catch (error) {
        if (error.response?.status === 401 && error.response?.headers['www-authenticate']?.includes('Digest')) {
          // Switch to Digest Auth if needed
          const digestParams = this.parseDigestChallenge(error.response.headers['www-authenticate']);
          instance.defaults.headers.common = this.createAuthHeader(
            controller.username,
            controller.password,
            digestParams
          );
          
          // Retry with Digest Auth
          const statusResponse = await instance.get('/ISAPI/System/status');
          this.controllers.set(controller.id, {
            instance,
            status: statusResponse.data,
            lastChecked: new Date(),
            authType: 'digest'
          });
          
          return true;
        }
        throw error;
      }
    } catch (error) {
      console.error('Failed to initialize controller:', error);
      return false;
    }
  }

  // Parse Digest authentication challenge
  parseDigestChallenge(header) {
    const parts = header.split(',').map(part => part.trim());
    const params = {};
    parts.forEach(part => {
      const [key, value] = part.split('=');
      params[key] = value.replace(/"/g, '');
    });
    return params;
  }

  // Setup periodic heartbeat
  setupHeartbeat(controllerId) {
    const interval = setInterval(async () => {
      try {
        await this.getDeviceStatus(controllerId);
      } catch (error) {
        console.error(`Heartbeat failed for controller ${controllerId}:`, error);
        // Handle disconnection
        clearInterval(interval);
        this.controllers.delete(controllerId);
      }
    }, 30000); // Every 30 seconds

    // Store interval reference
    const controller = this.controllers.get(controllerId);
    controller.heartbeatInterval = interval;
  }

  // Clean up controller resources
  cleanupController(controllerId) {
    const controller = this.controllers.get(controllerId);
    if (controller?.heartbeatInterval) {
      clearInterval(controller.heartbeatInterval);
    }
    this.controllers.delete(controllerId);
  }

  // Your existing methods with enhanced error handling...
  async getDeviceStatus(controllerId) { /* ... */ }
  async validateCredentials(controller) { /* ... */ }
}

export const hikvisionService = new HikvisionService();
