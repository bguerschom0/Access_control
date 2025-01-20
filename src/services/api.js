import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Hikvision API endpoints
const hikvisionAPI = {
  // Controller management
  initializeController: async (controllerData) => {
    try {
      const response = await api.post('/hikvision/initialize', controllerData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to initialize controller');
    }
  },

  validateCredentials: async (controllerData) => {
    try {
      const response = await api.post('/hikvision/validate', controllerData);
      return response.data.success;
    } catch (error) {
      return false;
    }
  },

  getControllerStatus: async (controllerId, credentials) => {
    try {
      const response = await api.get(`/hikvision/status/${controllerId}`, {
        headers: credentials // Pass controller credentials in headers
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get controller status');
    }
  },

  // Door control
  controlDoor: async (controllerId, doorId, command) => {
    try {
      const response = await api.post(`/hikvision/door/${controllerId}/${doorId}/control`, {
        command
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to control door');
    }
  },

  // Attendance records
  getAttendanceRecords: async (controllerId, startTime, endTime) => {
    try {
      const response = await api.get(`/hikvision/attendance/${controllerId}`, {
        params: {
          startTime,
          endTime
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get attendance records');
    }
  },

  // Card management
  getCards: async (controllerId) => {
    try {
      const response = await api.get(`/hikvision/cards/${controllerId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get cards');
    }
  },

  addCard: async (controllerId, cardData) => {
    try {
      const response = await api.post(`/hikvision/cards/${controllerId}`, cardData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add card');
    }
  },

  deleteCard: async (controllerId, cardId) => {
    try {
      const response = await api.delete(`/hikvision/cards/${controllerId}/${cardId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete card');
    }
  },

  // Controller configuration
  updateControllerConfig: async (controllerId, config) => {
    try {
      const response = await api.put(`/hikvision/config/${controllerId}`, config);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update configuration');
    }
  },

  getControllerConfig: async (controllerId) => {
    try {
      const response = await api.get(`/hikvision/config/${controllerId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get configuration');
    }
  },

  // Error handling helper
  handleError: (error) => {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || 'Server error occurred';
      const status = error.response.status;
      return { message, status };
    } else if (error.request) {
      // Request made but no response
      return { message: 'No response from server', status: 0 };
    } else {
      // Request setup error
      return { message: error.message, status: -1 };
    }
  }
};

// Export the API object
export default {
  hikvision: hikvisionAPI,
  // You can add more API modules here
  // users: usersAPI,
  // settings: settingsAPI,
  // etc.
};
