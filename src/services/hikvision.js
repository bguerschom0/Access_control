// src/services/hikvision.js
import axios from 'axios';

class HikvisionService {
  constructor() {
    this.controllers = new Map();
  }

  createAuthHeader(username, password) {
    return {
      Authorization: `Basic ${btoa(`${username}:${password}`)}`
    };
  }

  async checkHttpsSupport(instance) {
    try {
      const response = await instance.get('/ISAPI/System/capabilities');
      // Look for HTTPS support in capabilities
      const supportsHttps = response.data?.isSupportHTTPS === true;
      return supportsHttps;
    } catch (error) {
      console.error('Error checking HTTPS support:', error);
      return false;
    }
  }

  async initializeController(controller) {
    try {
      // Try HTTPS first (port 443)
      try {
        const httpsInstance = axios.create({
          baseURL: `https://${controller.ip_address}:443`,
          headers: {
            ...this.createAuthHeader(controller.username, controller.password),
            'Content-Type': 'application/json',
          },
          timeout: 5000,
          httpsAgent: {
            rejectUnauthorized: false // Accept self-signed certificates
          }
        });

        // Test HTTPS connection
        const isHttpsSupported = await this.checkHttpsSupport(httpsInstance);
        
        if (isHttpsSupported) {
          this.controllers.set(controller.id, {
            instance: httpsInstance,
            protocol: 'https',
            port: 443
          });
          console.log('Successfully connected via HTTPS');
          return true;
        }
      } catch (error) {
        console.warn('HTTPS connection failed, falling back to HTTP');
      }

      // Try HTTP on specified port or default 80
      const httpInstance = axios.create({
        baseURL: `http://${controller.ip_address}:${controller.port || 80}`,
        headers: {
          ...this.createAuthHeader(controller.username, controller.password),
          'Content-Type': 'application/json',
        },
        timeout: 5000
      });

      // Test HTTP connection
      await httpInstance.get('/ISAPI/System/capabilities');
      
      this.controllers.set(controller.id, {
        instance: httpInstance,
        protocol: 'http',
        port: controller.port || 80
      });
      
      console.log('Successfully connected via HTTP');
      return true;

    } catch (error) {
      console.error('Failed to initialize controller:', error);
      throw new Error('Could not connect to controller. Please check credentials and network access.');
    }
  }

  async getDeviceCertificateInfo(controllerId) {
    try {
      const controller = this.controllers.get(controllerId);
      if (!controller) throw new Error('Controller not initialized');

      const response = await controller.instance.get('/ISAPI/Security/certificate?format=json');
      return response.data;
    } catch (error) {
      console.error('Error fetching certificate info:', error);
      throw error;
    }
  }

  async checkDeviceHttpsStatus(controllerId) {
    try {
      const controller = this.controllers.get(controllerId);
      if (!controller) throw new Error('Controller not initialized');

      const response = await controller.instance.get('/ISAPI/System/security?format=json');
      return {
        httpsEnabled: response.data?.httpsEnabled || false,
        currentProtocol: controller.protocol,
        port: controller.port
      };
    } catch (error) {
      console.error('Error checking HTTPS status:', error);
      throw error;
    }
  }

  async getDeviceStatus(controllerId) {
    try {
      const controller = this.controllers.get(controllerId);
      if (!controller) throw new Error('Controller not initialized');

      const response = await controller.instance.get('/ISAPI/System/status?format=json');
      
      return {
        isOnline: true,
        cpuUsage: response.data.cpuUsage,
        memoryUsage: response.data.memoryUsage,
        temperature: response.data.temperature,
        uptimeSeconds: response.data.uptimeSeconds,
        protocol: controller.protocol,
        port: controller.port
      };
    } catch (error) {
      throw new Error('Failed to get device status: ' + error.message);
    }
  }

  async validateCredentials(controller) {
    try {
      // Try HTTPS first
      try {
        const httpsInstance = axios.create({
          baseURL: `https://${controller.ip_address}:443`,
          headers: this.createAuthHeader(controller.username, controller.password),
          timeout: 5000,
          httpsAgent: {
            rejectUnauthorized: false
          }
        });
        
        const response = await httpsInstance.get('/ISAPI/System/capabilities');
        return { isValid: response.status === 200, protocol: 'https', port: 443 };
      } catch (error) {
        // Try HTTP if HTTPS fails
        const httpInstance = axios.create({
          baseURL: `http://${controller.ip_address}:${controller.port || 80}`,
          headers: this.createAuthHeader(controller.username, controller.password),
          timeout: 5000
        });
        
        const response = await httpInstance.get('/ISAPI/System/capabilities');
        return { isValid: response.status === 200, protocol: 'http', port: controller.port || 80 };
      }
    } catch (error) {
      return { isValid: false, error: error.message };
    }
  }

  // Optional: Method to force HTTPS upgrade if supported
  async upgradeToHttps(controllerId) {
    try {
      const controller = this.controllers.get(controllerId);
      if (!controller) throw new Error('Controller not initialized');

      // Check if HTTPS is supported
      const isHttpsSupported = await this.checkHttpsSupport(controller.instance);
      if (!isHttpsSupported) {
        throw new Error('HTTPS is not supported by this device');
      }

      // Enable HTTPS through the security settings
      await controller.instance.put('/ISAPI/System/security?format=json', {
        httpsEnabled: true
      });

      // Re-initialize the controller with HTTPS
      await this.initializeController({
        ...controller,
        port: 443
      });

      return true;
    } catch (error) {
      console.error('Error upgrading to HTTPS:', error);
      throw error;
    }
  }
}

export const hikvisionService = new HikvisionService();
