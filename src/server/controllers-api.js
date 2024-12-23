import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const CONTROLLERS_FILE = path.join(process.cwd(), 'src', 'data', 'controllers.json');

// Ensure controllers.json exists
const initializeControllersFile = () => {
  if (!fs.existsSync(CONTROLLERS_FILE)) {
    fs.writeFileSync(CONTROLLERS_FILE, JSON.stringify({ controllers: [] }, null, 2));
  }
};

// Read controllers from file
const readControllers = () => {
  try {
    const data = fs.readFileSync(CONTROLLERS_FILE, 'utf8');
    return JSON.parse(data).controllers;
  } catch (error) {
    console.error('Error reading controllers:', error);
    return [];
  }
};

// Write controllers to file
const writeControllers = (controllers) => {
  try {
    fs.writeFileSync(CONTROLLERS_FILE, JSON.stringify({ controllers }, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing controllers:', error);
    return false;
  }
};

// Initialize file on startup
initializeControllersFile();

// Get all controllers
router.get('/', (req, res) => {
  try {
    const controllers = readControllers();
    res.json(controllers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get controllers' });
  }
});

// Add new controller
router.post('/', (req, res) => {
  try {
    const controllers = readControllers();
    const newController = {
      id: `controller_${Date.now()}`,
      ...req.body,
      status: 'offline',
      last_online: null,
      created_at: new Date().toISOString()
    };

    controllers.unshift(newController);
    writeControllers(controllers);
    res.json(newController);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add controller' });
  }
});

// Delete controller
router.delete('/:id', (req, res) => {
  try {
    const controllers = readControllers();
    const updatedControllers = controllers.filter(c => c.id !== req.params.id);
    writeControllers(updatedControllers);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete controller' });
  }
});

// Update controller status
router.put('/:id/status', (req, res) => {
  try {
    const controllers = readControllers();
    const updatedControllers = controllers.map(c => {
      if (c.id === req.params.id) {
        return {
          ...c,
          ...req.body,
          last_online: req.body.status === 'online' ? new Date().toISOString() : c.last_online
        };
      }
      return c;
    });
    writeControllers(updatedControllers);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update controller status' });
  }
});

export default router;
