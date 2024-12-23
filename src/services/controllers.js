import axios from 'axios';

const API_URL = '/api/controllers';

export const controllersService = {
  async getControllers() {
    const response = await axios.get(API_URL);
    return response.data;
  },

  async addController(controller) {
    const response = await axios.post(API_URL, controller);
    return response.data;
  },

  async removeController(id) {
    await axios.delete(`${API_URL}/${id}`);
  },

  async updateStatus(id, status) {
    await axios.put(`${API_URL}/${id}/status`, status);
  }
};
