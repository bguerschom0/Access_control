import { hikvisionSDK } from './sdk';

class AccessControlService {
  async controlDoor(controllerId, doorId, command) {
    const session = hikvisionSDK.sessions.get(controllerId);
    if (!session) throw new Error('No active session');

    try {
      await session.instance.put(`/ISAPI/AccessControl/DoorControl/${doorId}`, {
        doorControl: {
          cmd: command, // unlock, lock, alwaysOpen, alwaysClose
          operator: session.username
        }
      });
    } catch (error) {
      console.error('Door control failed:', error);
      throw error;
    }
  }

  async getDoorStatus(controllerId, doorId) {
    const session = hikvisionSDK.sessions.get(controllerId);
    if (!session) throw new Error('No active session');

    try {
      const response = await session.instance.get(
        `/ISAPI/AccessControl/DoorStatus/${doorId}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get door status:', error);
      throw error;
    }
  }

  async manageAccessRights(controllerId, userId, doorIds, schedule) {
    const session = hikvisionSDK.sessions.get(controllerId);
    if (!session) throw new Error('No active session');

    try {
      await session.instance.post('/ISAPI/AccessControl/PersonInfo/Record', {
        PersonInfo: {
          employeeNo: userId,
          doorRight: doorIds,
          schedulePlan: schedule
        }
      });
    } catch (error) {
      console.error('Failed to manage access rights:', error);
      throw error;
    }
  }

  async subscribeToEvents(controllerId) {
    const session = hikvisionSDK.sessions.get(controllerId);
    if (!session) throw new Error('No active session');

    try {
      const response = await session.instance.post('/ISAPI/Event/Subscribe', {
        eventTypes: [
          'doorStatus',
          'cardRead',
          'faceRecognition',
          'accessControl'
        ],
        heartbeatInterval: 30 // seconds
      });

      // Start heartbeat
      this.startEventHeartbeat(controllerId, response.data.subscriptionId);

      return response.data;
    } catch (error) {
      console.error('Event subscription failed:', error);
      throw error;
    }
  }

  startEventHeartbeat(controllerId, subscriptionId) {
    setInterval(async () => {
      const session = hikvisionSDK.sessions.get(controllerId);
      if (!session) return;

      try {
        await session.instance.post(`/ISAPI/Event/Heartbeat/${subscriptionId}`);
      } catch (error) {
        console.error('Heartbeat failed:', error);
        this.resubscribeToEvents(controllerId);
      }
    }, 25000); // Slightly less than the heartbeat interval
  }

  async resubscribeToEvents(controllerId) {
    try {
      await this.subscribeToEvents(controllerId);
    } catch (error) {
      console.error('Event resubscription failed:', error);
    }
  }
}

export const accessControlService = new AccessControlService();
