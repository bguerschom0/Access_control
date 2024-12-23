// Function to decrypt passwords (implement your encryption method)
const decryptPassword = (encryptedPassword) => {
  // Implement decryption logic
  return encryptedPassword;
};

// Get controllers from environment
export const getControllers = () => {
  try {
    const controllersStr = import.meta.env.VITE_CONTROLLERS;
    const passwordsStr = import.meta.env.VITE_CONTROLLER_PASSWORDS;

    const controllers = JSON.parse(controllersStr || '[]');
    const passwords = JSON.parse(passwordsStr || '{}');

    // Merge passwords with controller data
    return controllers.map(controller => ({
      ...controller,
      password: decryptPassword(passwords[controller.id])
    }));
  } catch (error) {
    console.error('Error parsing controllers configuration:', error);
    return [];
  }
};

// Add a new controller
export const addController = async (newController) => {
  try {
    // Read current configuration
    const currentControllers = getControllers();
    const currentPasswords = JSON.parse(import.meta.env.VITE_CONTROLLER_PASSWORDS || '{}');

    // Add new controller
    const controllerId = `controller${Date.now()}`;
    const controllerData = {
      id: controllerId,
      name: newController.name,
      ip_address: newController.ip_address,
      port: newController.port,
      username: newController.username,
      location: newController.location
    };

    // Update passwords separately
    currentPasswords[controllerId] = newController.password; // Implement encryption

    // You would typically update your .env file here
    // For development, we'll use localStorage as a temporary storage
    localStorage.setItem('VITE_CONTROLLERS', JSON.stringify([...currentControllers, controllerData]));
    localStorage.setItem('VITE_CONTROLLER_PASSWORDS', JSON.stringify(currentPasswords));

    return { ...controllerData, password: newController.password };
  } catch (error) {
    console.error('Error adding controller:', error);
    throw error;
  }
};

// Remove a controller
export const removeController = async (controllerId) => {
  try {
    const currentControllers = getControllers();
    const currentPasswords = JSON.parse(import.meta.env.VITE_CONTROLLER_PASSWORDS || '{}');

    // Filter out the controller
    const updatedControllers = currentControllers.filter(c => c.id !== controllerId);
    delete currentPasswords[controllerId];

    // Update storage
    localStorage.setItem('VITE_CONTROLLERS', JSON.stringify(updatedControllers));
    localStorage.setItem('VITE_CONTROLLER_PASSWORDS', JSON.stringify(currentPasswords));

    return true;
  } catch (error) {
    console.error('Error removing controller:', error);
    throw error;
  }
};

// Get controller by ID with password
export const getControllerById = (controllerId) => {
  const controllers = getControllers();
  return controllers.find(c => c.id === controllerId);
};
