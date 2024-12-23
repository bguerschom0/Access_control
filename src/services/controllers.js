import { supabase } from '@/config/supabase';

export const controllersService = {
  async getControllers() {
    try {
      const { data, error } = await supabase
        .from('controllers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting controllers:', error);
      throw error;
    }
  },

  async addController(controller) {
    try {
      const { data, error } = await supabase
        .from('controllers')
        .insert([{
          name: controller.name,
          ip_address: controller.ip_address,
          port: controller.port,
          username: controller.username,
          password: controller.password,
          location: controller.location,
          status: 'offline'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding controller:', error);
      throw error;
    }
  },

  async removeController(id) {
    try {
      const { error } = await supabase
        .from('controllers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing controller:', error);
      throw error;
    }
  },

  async updateStatus(id, status) {
    try {
      const { error } = await supabase
        .from('controllers')
        .update({
          status: status.status,
          cpu_usage: status.cpuUsage,
          memory_usage: status.memoryUsage,
          last_online: status.status === 'online' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating controller status:', error);
      throw error;
    }
  }
};
