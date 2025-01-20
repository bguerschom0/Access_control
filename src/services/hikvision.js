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

  async initializeController(controller) {
    try {
      // Now connecting through our API routes
      const response = await axios.post('/api/hikvision/initialize', controller);
      
      if (response.data.success) {
        this.controllers.set(controller.id, {
          ...response.data.controller,
          lastChecked: new Date()
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize controller:', error);
      return false;
    }
  }

  async getDeviceStatus(controllerId) {
    try {
      // Check if we have the controller info
      const controller = this.controllers.get(controllerId);
      if (!controller) throw new Error('Controller not initialized');

      const response = await axios.get(`/api/hikvision/status/${controllerId}`);
      
      return {
        isOnline: response.data.success,
        ...response.data.status
      };
    } catch (error) {
      console.error('Error getting device status:', error);
      throw error;
    }
  }

  async validateCredentials(controller) {
    try {
      const response = await axios.post('/api/hikvision/validate', controller);
      return response.data.success;
    } catch (error) {
      console.error('Error validating credentials:', error);
      return false;
    }
  }
}

export const hikvisionService = new HikvisionService();
