export const HIKVISION_CONFIG = {
  DEFAULT_PORTS: {
    HTTP: 80,
    HTTPS: 443,
    RTSP: 554
  },
  AUTH_TYPES: {
    BASIC: 'basic',
    DIGEST: 'digest'
  },
  ENDPOINTS: {
    STATUS: '/ISAPI/System/status',
    CAPABILITIES: '/ISAPI/System/capabilities',
    DEVICE_INFO: '/ISAPI/System/deviceInfo',
    SECURITY: '/ISAPI/Security/deviceCertificate',
    IP_FILTER: '/ISAPI/System/Network/ipFilter'
  },
  // Add more configuration as needed
};
