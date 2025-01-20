import axios from 'axios';

class HikvisionService {
  constructor() {
    this.controllers = new Map();
  }

  async initializeController(controller) {
    try {
      console.log('Initializing controller:', controller);
      
      const response = await axios.post('/api/hikvision/initialize', {
        ip_address: controller.ip_address,
        port: controller.port || 80,
        username: controller.username,
        password: controller.password
      });

      console.log('Initialize response:', response.data);

      if (response.data.success) {
        this.controllers.set(controller.id, {
          ...controller,
          status: 'online',
          lastChecked: new Date()
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize controller:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      return false;
    }
  }

  async getDeviceStatus(controllerId) {
    try {
      const controller = this.controllers.get(controllerId);
      if (!controller) throw new Error('Controller not initialized');

      const response = await axios.get(`/api/hikvision/status/${controllerId}`, {
        headers: {
          ip_address: controller.ip_address,
          port: controller.port,
          username: controller.username,
          password: controller.password
        }
      });

      return response.data.success ? {
        isOnline: true,
        ...response.data.status
      } : {
        isOnline: false,
        error: response.data.message
      };
    } catch (error) {
      console.error('Error getting device status:', error);
      throw error;
    }
  }

  async validateCredentials(controller) {
    try {
      const response = await axios.post('/api/hikvision/validate', {
        ip_address: controller.ip_address,
        port: controller.port || 80,
        username: controller.username,
        password: controller.password
      });
      
      return response.data.success;
    } catch (error) {
      console.error('Error validating credentials:', error);
      return false;
    }
  }
}

export const hikvisionService = new HikvisionService();
