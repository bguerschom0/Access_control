import express from 'express';
import { 
  getControllers, 
  addController, 
  removeController, 
  updateControllerStatus 
} from '../config/controllers.js';

const router = express.Router();

// Get all controllers
router.get('/controllers', (req, res) => {
  try {
    const controllers = getControllers();
    res.json(controllers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new controller
router.post('/controllers', async (req, res) => {
  try {
    const controller = await addController(req.body);
    res.json(controller);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a controller
router.delete('/controllers/:id', async (req, res) => {
  try {
    await removeController(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update controller status
router.put('/controllers/:id/status', async (req, res) => {
  try {
    await updateControllerStatus(req.params.id, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
