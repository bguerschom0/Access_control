import { hikvisionSDK } from './sdk';

class EventMonitoringService {
  constructor() {
    this.eventHandlers = new Map();
    this.subscriptions = new Map();
  }

  async startMonitoring(controllerId, eventTypes = ['all']) {
    const session = hikvisionSDK.sessions.get(controllerId);
    if (!session) throw new Error('No active session');

    try {
      // Subscribe to events
      const response = await session.instance.post('/ISAPI/Event/Subscribe', {
        eventTypes,
        metadata: {
          format: 'json',
          encryption: session.capabilities?.isSupportEncryption ? 'enabled' : 'disabled'
        }
      });

      // Store subscription
      this.subscriptions.set(controllerId, {
        id: response.data.subscriptionId,
        types: eventTypes,
        lastEvent: new Date()
      });

      // Start polling for events
      this.startEventPolling(controllerId);

      return response.data.subscriptionId;
    } catch (error) {
      console.error('Failed to start event monitoring:', error);
      throw error;
    }
  }

  startEventPolling(controllerId) {
    const pollInterval = setInterval(async () => {
      try {
        await this.pollEvents(controllerId);
      } catch (error) {
        console.error('Event polling failed:', error);
        clearInterval(pollInterval);
        this.resubscribe(controllerId);
      }
    }, 1000); // Poll every second

    return () => clearInterval(pollInterval);
  }

  async pollEvents(controllerId) {
    const session = hikvisionSDK.sessions.get(controllerId);
    const subscription = this.subscriptions.get(controllerId);
    if (!session || !subscription) return;

    try {
      const response = await session.instance.get(
        `/ISAPI/Event/Poll/${subscription.id}`
      );

      if (response.data.events?.length > 0) {
        subscription.lastEvent = new Date();
        this.subscriptions.set(controllerId, subscription);

        // Process events
        response.data.events.forEach(event => {
          this.processEvent(controllerId, event);
        });
      }
    } catch (error) {
      throw error;
    }
  }

  processEvent(controllerId, event) {
    const handlers = this.eventHandlers.get(controllerId) || {};
    const eventType = event.type;

    if (handlers[eventType]) {
      handlers[eventType].forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Event handler error:', error);
        }
      });
    }

    // Also trigger 'all' event handlers
    if (handlers['all']) {
      handlers['all'].forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Event handler error:', error);
        }
      });
    }
  }

  addEventListener(controllerId, eventType, handler) {
    const handlers = this.eventHandlers.get(controllerId) || {};
    handlers[eventType] = handlers[eventType] || [];
    handlers[eventType].push(handler);
    this.eventHandlers.set(controllerId, handlers);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(controllerId) || {};
      handlers[eventType] = handlers[eventType]?.filter(h => h !== handler) || [];
      this.eventHandlers.set(controllerId, handlers);
    };
  }

  async resubscribe(controllerId) {
    const subscription = this.subscriptions.get(controllerId);
    if (!subscription) return;

    try {
      await this.startMonitoring(controllerId, subscription.types);
    } catch (error) {
      console.error('Event resubscription failed:', error);
    }
  }
}

export const eventMonitoringService = new EventMonitoringService();
