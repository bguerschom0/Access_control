export const HIKVISION_CONFIG = {
  API_ENDPOINTS: {
    // Core endpoints as per documentation
    GET_DEVICES: "ISAPI/Bumblebee/DeviceResource/V1/LogicalResource/Elements",
    DEVICE_STATUS: "ISAPI/Bumblebee/DeviceResource/V1/PhysicalResource/OverView",
    DOOR_CONTROL: "ISAPI/Bumblebee/ACSPlugin/V1/AccessControl/Door/Status"
  },
  DEVICE_TYPES: {
    DOOR: 1002,
    FLOOR: 1011,
    ELEVATOR: 1012,
    CARD_READER: 1013,
    INFO_SCREEN: 1026
  }
};
