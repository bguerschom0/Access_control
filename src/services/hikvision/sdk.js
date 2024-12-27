import axios from 'axios';

class HikvisionSDK {
  constructor() {
    this.sessions = new Map();
  }

  // Authentication Methods
  createBasicAuth(username, password) {
    return { Authorization: `Basic ${btoa(`${username}:${password}`)}` };
  }

  createDigestAuth(username, password, realm, nonce) {
    // Implement digest authentication
    // This would be used when basic auth fails and server returns WWW-Authenticate header
    const ha1 = CryptoJS.MD5(`${username}:${realm}:${password}`).toString();
    const ha2 = CryptoJS.MD5('GET:/').toString();
    const response = CryptoJS.MD5(`${ha1}:${nonce}:${ha2}`).toString();
    return { Authorization: `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="/", response="${response}"` };
  }

  async createSecureInstance(controller) {
    const instance = axios.create({
      baseURL: `https://${controller.ip_address}:${controller.port || 443}`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false, // For self-signed certificates
        secureProtocol: 'TLSv1_2_method' // Force TLS 1.2
      }),
      timeout: 5000
    });

    // Add auth interceptor
    instance.interceptors.request.use(async (config) => {
      const session = this.sessions.get(controller.id);
      if (session?.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      } else {
        config.headers = {
          ...config.headers,
          ...this.createBasicAuth(controller.username, controller.password)
        };
      }
      return config;
    });

    // Add response interceptor for handling auth challenges
    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const wwwAuth = error.response.headers['www-authenticate'];
          if (wwwAuth?.includes('Digest')) {
            // Switch to digest auth if needed
            const digestParams = this.parseDigestAuth(wwwAuth);
            const digestHeaders = this.createDigestAuth(
              controller.username,
              controller.password,
              digestParams.realm,
              digestParams.nonce
            );
            error.config.headers = { ...error.config.headers, ...digestHeaders };
            return instance(error.config);
          } else {
            // Try to relogin
            await this.login(controller);
            return instance(error.config);
          }
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }

  async login(controller) {
    try {
      const instance = await this.createSecureInstance(controller);
      
      // Try NET_DVR_Login_V40 equivalent
      const loginResponse = await instance.post('/ISAPI/Security/token', {
        username: controller.username,
        password: controller.password
      });

      if (loginResponse.data.token) {
        this.sessions.set(controller.id, {
          token: loginResponse.data.token,
          lastRenewal: new Date(),
          instance
        });
        
        // Start session renewal timer
        this.startSessionRenewal(controller.id);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async reLogin(controllerId) {
    try {
      const session = this.sessions.get(controllerId);
      if (!session) throw new Error('No session found');

      // Clear existing session
      this.sessions.delete(controllerId);
      
      // Attempt relogin
      const success = await this.login(session.controller);
      return success;
    } catch (error) {
      console.error('Relogin failed:', error);
      throw error;
    }
  }

  startSessionRenewal(controllerId) {
    // Renew session every 20 minutes
    setInterval(async () => {
      try {
        const session = this.sessions.get(controllerId);
        if (!session) return;

        await session.instance.post('/ISAPI/Security/token/renew', {
          token: session.token
        });
        
        session.lastRenewal = new Date();
        this.sessions.set(controllerId, session);
      } catch (error) {
        console.error('Session renewal failed:', error);
        this.reLogin(controllerId);
      }
    }, 20 * 60 * 1000);
  }

  parseDigestAuth(wwwAuth) {
    // Parse WWW-Authenticate header for digest auth
    const parts = wwwAuth.split(',').map(part => part.trim());
    const params = {};
    parts.forEach(part => {
      const [key, value] = part.split('=');
      params[key] = value.replace(/"/g, '');
    });
    return params;
  }
}

export const hikvisionSDK = new HikvisionSDK();
