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
      // Create axios instance for this controller
      const instance = axios.create({
        baseURL: `http://${controller.ip_address}:${controller.port}`,
        headers: {
          ...this.createAuthHeader(controller.username, controller.password),
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      // Test connection with capabilities check
      const response = await instance.get('/ISAPI/System/capabilities');
      
      // Store the instance if successful
      this.controllers.set(controller.id, {
        instance,
        capabilities: response.data,
        lastChecked: new Date()
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize controller:', error);
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
        cpuUsage: response.data.cpuUsage,
        memoryUsage: response.data.memoryUsage,
        temperature: response.data.temperature,
        uptimeSeconds: response.data.uptimeSeconds
      };
    } catch (error) {
      console.error('Error getting device status:', error);
      throw error;
    }
  }

  async getAttendanceRecords(controllerId, startTime, endTime) {
    try {
      const controller = this.controllers.get(controllerId);
      if (!controller) throw new Error('Controller not initialized');

      const response = await controller.instance.post('/ISAPI/AccessControl/AcsEvent/search', {
        searchID: Date.now().toString(),
        searchResultPosition: 0,
        maxResults: 1000,
        timeRange: {
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString()
        },
        major: 0, // All events
        minor: 0, // All sub-types
        eventType: 'attendance' // Focus on attendance events
      });

      return this.processAttendanceRecords(response.data.AcsEvent);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      throw error;
    }
  }

  processAttendanceRecords(events) {
    return events.map(event => ({
      employeeId: event.employeeNo,
      employeeName: event.employeeName,
      eventTime: event.time,
      eventType: event.eventType,
      deviceName: event.deviceName,
      verifyMode: event.verifyMode, // Card, Face, Fingerprint, etc.
      status: this.getEventStatus(event)
    }));
  }

  getEventStatus(event) {
    // Map event codes to human-readable status
    const statusMap = {
      'normal': 'Success',
      'invalid_card': 'Failed - Invalid Card',
      'invalid_time': 'Failed - Wrong Time',
      'denied': 'Access Denied',
      // Add more mappings as needed
    };
    return statusMap[event.status] || event.status;
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
      console.error('Error validating credentials:', error);
      return false;
    }
  }
}

export const hikvisionService = new HikvisionService();
