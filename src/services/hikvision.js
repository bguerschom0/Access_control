import axios from 'axios';
import { HIKVISION_CONFIG } from '../config/hikvision';

class HikvisionService {
  constructor() {
    this.connections = new Map();
    this.retryAttempts = 3;
  }

  async initializeController(controller) {
    try {
      // Use proper endpoint from documentation
      const response = await axios.post('/api/hikvision/initialize', {
        DeviceInfo: {
          deviceId: controller.id,
          deviceName: controller.name,
          deviceType: HIKVISION_CONFIG.DEVICE_TYPES.DOOR,
          ipAddress: controller.ip_address,
          port: controller.port || 80,
          protocol: 'HTTP',
          username: controller.username,
          password: controller.password
        }
      });

      if (response.data.success) {
        // Store connection info
        this.connections.set(controller.id, {
          ...controller,
          status: 'online',
          lastChecked: new Date(),
          deviceInfo: response.data.deviceInfo
        });

        // Start monitoring the device
        this.startMonitoring(controller.id);
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
      const controller = this.connections.get(controllerId);
      if (!controller) throw new Error('Controller not initialized');

      const response = await axios.get(`/api/hikvision/status/${controllerId}`, {
        headers: {
          deviceInfo: JSON.stringify({
            ipAddress: controller.ip_address,
            port: controller.port,
            username: controller.username,
            password: controller.password
          })
        }
      });

      return {
        isOnline: response.data.success,
        ...response.data.status
      };
    } catch (error) {
      console.error('Error getting device status:', error);
      throw error;
    }
  }

  startMonitoring(controllerId) {
    const statusInterval = setInterval(async () => {
      try {
        const status = await this.getDeviceStatus(controllerId);
        this.handleStatusUpdate(controllerId, status);
      } catch (error) {
        this.handleStatusError(controllerId, error);
      }
    }, 30000); // Check every 30 seconds

    // Store interval reference
    const connection = this.connections.get(controllerId);
    if (connection) {
      connection.statusInterval = statusInterval;
    }
  }

  handleStatusUpdate(controllerId, status) {
    const connection = this.connections.get(controllerId);
    if (connection) {
      connection.status = status.isOnline ? 'online' : 'offline';
      connection.lastChecked = new Date();
      this.connections.set(controllerId, connection);
    }
  }

  handleStatusError(controllerId, error) {
    console.error(`Status error for controller ${controllerId}:`, error);
    const connection = this.connections.get(controllerId);
    if (connection) {
      connection.status = 'error';
      connection.lastError = error.message;
      this.connections.set(controllerId, connection);
    }
  }

  cleanup(controllerId) {
    const connection = this.connections.get(controllerId);
    if (connection?.statusInterval) {
      clearInterval(connection.statusInterval);
    }
    this.connections.delete(controllerId);
  }
}

export const hikvisionService = new HikvisionService();
