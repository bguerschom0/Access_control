import fs from 'fs';
import path from 'path';

const CONTROLLERS_FILE = path.join(process.cwd(), 'src', 'data', 'controllers.json');

// Read controllers from JSON file
const readControllersFile = () => {
  try {
    const data = fs.readFileSync(CONTROLLERS_FILE, 'utf8');
    return JSON.parse(data).controllers;
  } catch (error) {
    console.error('Error reading controllers file:', error);
    return [];
  }
};

// Write controllers to JSON file
const writeControllersFile = (controllers) => {
  try {
    fs.writeFileSync(
      CONTROLLERS_FILE,
      JSON.stringify({ controllers }, null, 2),
      'utf8'
    );
    return true;
  } catch (error) {
    console.error('Error writing controllers file:', error);
    return false;
  }
};

// Get all controllers
export const getControllers = () => {
  return readControllersFile();
};

// Add a new controller
export const addController = async (newController) => {
  try {
    const controllers = readControllersFile();
    const controllerData = {
      id: `controller_${Date.now()}`,
      ...newController,
      status: 'offline',
      last_online: null,
      created_at: new Date().toISOString()
    };

    controllers.unshift(controllerData);
    writeControllersFile(controllers);

    return controllerData;
  } catch (error) {
    console.error('Error adding controller:', error);
    throw error;
  }
};

// Remove a controller
export const removeController = async (controllerId) => {
  try {
    const controllers = readControllersFile();
    const updatedControllers = controllers.filter(c => c.id !== controllerId);
    writeControllersFile(updatedControllers);
    return true;
  } catch (error) {
    console.error('Error removing controller:', error);
    throw error;
  }
};

// Update a controller's status
export const updateControllerStatus = async (controllerId, status) => {
  try {
    const controllers = readControllersFile();
    const updatedControllers = controllers.map(c => {
      if (c.id === controllerId) {
        return {
          ...c,
          ...status,
          last_online: status.status === 'online' ? new Date().toISOString() : c.last_online
        };
      }
      return c;
    });

    writeControllersFile(updatedControllers);
    return true;
  } catch (error) {
    console.error('Error updating controller status:', error);
    throw error;
  }
};

// Get controller by ID
export const getControllerById = (controllerId) => {
  const controllers = readControllersFile();
  return controllers.find(c => c.id === controllerId);
};

// Backup controllers to a specific file
export const backupControllers = (filePath) => {
  try {
    const controllers = readControllersFile();
    fs.writeFileSync(filePath, JSON.stringify({ controllers }, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error creating backup:', error);
    throw error;
  }
};

// Restore controllers from a backup file
export const restoreFromBackup = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const { controllers } = JSON.parse(data);
    writeControllersFile(controllers);
    return true;
  } catch (error) {
    console.error('Error restoring from backup:', error);
    throw error;
  }
};
