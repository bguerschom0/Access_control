import axios from 'axios';

const API_URL = '/api/controllers';

export const controllersService = {
  async getControllers() {
    try {
      const response = await axios.get(API_URL);
      // Ensure we always return an array
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching controllers:', error);
      return [];
    }
  },

  async addController(controller) {
    try {
      const response = await axios.post(API_URL, controller);
      return response.data;
    } catch (error) {
      console.error('Error adding controller:', error);
      throw error;
    }
  },

  async removeController(id) {
    try {
      await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
      console.error('Error removing controller:', error);
      throw error;
    }
  },

  async updateStatus(id, status) {
    try {
      await axios.put(`${API_URL}/${id}/status`, status);
    } catch (error) {
      console.error('Error updating controller status:', error);
      throw error;
    }
  }
};
