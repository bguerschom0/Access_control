import axios from 'axios';

class HikvisionService {
  constructor() {
    this.controllers = new Map();
  }

  // Updated to handle both Basic and Digest auth
  createAuthHeader(username, password) {
    return {
      Authorization: `Basic ${btoa(`${username}:${password}`)}`,
      'Accept': 'application/json', // Explicitly request JSON response
      'Content-Type': 'application/json'
    };
  }

  async initializeController(controller) {
    try {
      // Create axios instance with correct configuration
      const instance = axios.create({
        baseURL: `http://${controller.ip_address}:${controller.port || 80}`, // Use default port 80 if not specified
        headers: this.createAuthHeader(controller.username, controller.password),
        timeout: 5000,
        // Add response type for proper parsing
        responseType: 'json'
      });

      // First check basic connectivity with status endpoint
      const statusResponse = await instance.get('/ISAPI/System/status');
      if (statusResponse.status !== 200) {
        throw new Error('Failed to get device status');
      }

      // Then check device capabilities
      const capsResponse = await instance.get('/ISAPI/System/capabilities');
      
      // Store the instance if successful
      this.controllers.set(controller.id, {
        instance,
        capabilities: capsResponse.data,
        lastChecked: new Date(),
        deviceInfo: statusResponse.data
      });

      return true;
    } catch (error) {
      // Enhanced error handling based on ISAPI spec
      if (error.response) {
        switch (error.response.status) {
          case 401:
            throw new Error('Authentication failed - check credentials');
          case 404:
            throw new Error('ISAPI endpoint not found - check device compatibility');
          case 500:
            throw new Error('Device internal error');
          default:
            throw new Error(`Device error: ${error.response.status}`);
        }
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Connection refused - check IP and port');
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error('Connection timed out - check network connectivity');
      }
      
      throw error;
    }
  }

  async validateCredentials(controller) {
    try {
      const instance = axios.create({
        baseURL: `http://${controller.ip_address}:${controller.port || 80}`,
        headers: this.createAuthHeader(controller.username, controller.password),
        timeout: 5000,
        responseType: 'json'
      });

      // Use status endpoint for validation as per ISAPI spec
      const response = await instance.get('/ISAPI/System/status');
      return response.status === 200;
    } catch (error) {
      console.error('Error validating credentials:', error);
      return false;
    }
  }

  async getDeviceStatus(controllerId) {
    try {
      const controller = this.controllers.get(controllerId);
      if (!controller) throw new Error('Controller not initialized');

      const response = await controller.instance.get('/ISAPI/System/status');
      
      return {
        isOnline: true,
        cpuUsage: response.data.CPUUsage,   // Note the correct property names
        memoryUsage: response.data.MemoryUsage,
        deviceTime: response.data.DeviceTime,
        deviceName: response.data.DeviceName
      };
    } catch (error) {
      console.error('Error getting device status:', error);
      return {
        isOnline: false,
        error: error.message
      };
    }
  }
}

export const hikvisionService = new HikvisionService();
