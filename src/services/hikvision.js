import axios from 'axios';

class HikvisionService {
  constructor() {
    this.controllers = new Map(); // Store controller instances
  }

  createAuthHeader(username, password) {
    return {
      Authorization: `Basic ${btoa(`${username}:${password}`)}`
    };
  }

  async initializeController(controller) {
    try {
      const instance = axios.create({
        baseURL: `http://${controller.ip_address}:${controller.port}`,
        headers: this.createAuthHeader(controller.username, controller.password),
        timeout: 5000
      });

      // Test connection and get capabilities
      const capabilities = await this.getDeviceCapabilities(instance);
      
      // Store the instance with its capabilities
      this.controllers.set(controller.id, {
        instance,
        capabilities
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize controller:', error);
      return false;
    }
  }

  async getDeviceCapabilities(instance) {
    try {
      const response = await instance.get('/ISAPI/System/capabilities?format=json');
      return response.data;
    } catch (error) {
      console.error('Error fetching capabilities:', error);
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
        uptimeSeconds: response.data.uptimeSeconds
      };
    } catch (error) {
      throw error;
    }
  }

  async validateCredentials(controller) {
    try {
      const instance = axios.create({
        baseURL: `http://${controller.ip_address}:${controller.port}`,
        headers: this.createAuthHeader(controller.username, controller.password),
        timeout: 5000
      });

      const response = await instance.get('/ISAPI/System/capabilities');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async subscribeToEvents(controllerId, eventTypes = ['All']) {
    try {
      const controller = this.controllers.get(controllerId);
      if (!controller) throw new Error('Controller not initialized');

      const response = await controller.instance.post(
        '/ISAPI/Event/notification/subscribe?format=json',
        {
          eventTypes
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error subscribing to events:', error);
      throw error;
    }
  }

  async getEventHistory(controllerId, options = {}) {
    try {
      const controller = this.controllers.get(controllerId);
      if (!controller) throw new Error('Controller not initialized');

      const { start = 0, count = 50, startTime, endTime } = options;

      const params = new URLSearchParams({
        format: 'json',
        start: start.toString(),
        count: count.toString()
      });

      if (startTime) params.append('startTime', startTime);
      if (endTime) params.append('endTime', endTime);

      const response = await controller.instance.get(
        `/ISAPI/Event/notification/logs?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching event history:', error);
      throw error;
    }
  }

  // Add methods for access control
  async grantAccess(controllerId, doorNo, personId) {
    try {
      const controller = this.controllers.get(controllerId);
      if (!controller) throw new Error('Controller not initialized');

      const response = await controller.instance.put(`/ISAPI/AccessControl/RemoteControl/door/${doorNo}`, {
        remoteControlDoor: {
          cmd: "open"
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error granting access:', error);
      throw error;
    }
  }

  async getDoorStatus(controllerId, doorNo) {
    try {
      const controller = this.controllers.get(controllerId);
      if (!controller) throw new Error('Controller not initialized');

      const response = await controller.instance.get(`/ISAPI/AccessControl/Door/${doorNo}/status`);
      return response.data;
    } catch (error) {
      console.error('Error getting door status:', error);
      throw error;
    }
  }
}

export const hikvisionService = new HikvisionService();
