// Initial controllers list (can be empty)
let controllers = [
  // Example controller format:
  // {
  //   id: "controller1",
  //   name: "Main Entrance",
  //   ip_address: "192.168.1.100",
  //   port: "80",
  //   username: "admin",
  //   password: "****",
  //   location: "Building A",
  //   status: "offline",
  //   last_online: null
  // }
];

// Load saved controllers from localStorage on initialization
try {
  const savedControllers = localStorage.getItem('hik_controllers');
  if (savedControllers) {
    controllers = JSON.parse(savedControllers);
  }
} catch (error) {
  console.error('Error loading saved controllers:', error);
}

// Get all controllers
export const getControllers = () => {
  return controllers;
};

// Add a new controller
export const addController = async (newController) => {
  try {
    const controllerData = {
      id: `controller_${Date.now()}`,
      ...newController,
      status: 'offline',
      last_online: null
    };

    // Add to memory
    controllers.unshift(controllerData);

    // Save to localStorage
    localStorage.setItem('hik_controllers', JSON.stringify(controllers));

    return controllerData;
  } catch (error) {
    console.error('Error adding controller:', error);
    throw error;
  }
};

// Remove a controller
export const removeController = async (controllerId) => {
  try {
    // Remove from memory
    controllers = controllers.filter(c => c.id !== controllerId);

    // Save to localStorage
    localStorage.setItem('hik_controllers', JSON.stringify(controllers));

    return true;
  } catch (error) {
    console.error('Error removing controller:', error);
    throw error;
  }
};

// Update a controller's status
export const updateControllerStatus = async (controllerId, status) => {
  try {
    controllers = controllers.map(c => {
      if (c.id === controllerId) {
        return {
          ...c,
          ...status,
          last_online: status.status === 'online' ? new Date().toISOString() : c.last_online
        };
      }
      return c;
    });

    // Save to localStorage
    localStorage.setItem('hik_controllers', JSON.stringify(controllers));

    return true;
  } catch (error) {
    console.error('Error updating controller status:', error);
    throw error;
  }
};

// Get controller by ID
export const getControllerById = (controllerId) => {
  return controllers.find(c => c.id === controllerId);
};

// Export controllers data (for backup)
export const exportControllers = () => {
  return JSON.stringify(controllers, null, 2);
};

// Import controllers data (from backup)
export const importControllers = (controllersData) => {
  try {
    const parsed = JSON.parse(controllersData);
    controllers = parsed;
    localStorage.setItem('hik_controllers', JSON.stringify(controllers));
    return true;
  } catch (error) {
    console.error('Error importing controllers:', error);
    throw error;
  }
};
