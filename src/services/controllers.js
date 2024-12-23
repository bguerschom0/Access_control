import axios from 'axios';

const API_URL = '/api/controllers';

export const controllersService = {
  // Get all controllers
  async getControllers() {
    const response = await axios.get(API_URL);
    return response.data;
  },

  // Add a new controller
  async addController(controller) {
    const response = await axios.post(API_URL, controller);
    return response.data;
  },

  // Remove a controller
  async removeController(id) {
    await axios.delete(`${API_URL}/${id}`);
  },

  // Update controller status
  async updateStatus(id, status) {
    await axios.put(`${API_URL}/${id}/status`, status);
  }
};
