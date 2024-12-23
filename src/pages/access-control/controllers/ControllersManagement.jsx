import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Settings,
  Power,
  Signal,
  RefreshCcw,
  AlertTriangle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

import { getControllers, addController, removeController } from '@/config/controllers';
import { hikvisionService } from '@/services/hikvision';

const ControllersManagement = () => {
  const { toast } = useToast();
  const [controllers, setControllers] = useState(() => getControllers());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    ip_address: '',
    port: '80',
    username: '',
    password: '',
    location: ''
  });

  const handleAddController = async (e) => {
    e.preventDefault();
    
    try {
      // Test connection
      const isValid = await hikvisionService.validateCredentials(formData);
      if (!isValid) {
        toast({
          title: 'Connection Failed',
          description: 'Could not connect to the controller. Please check credentials.',
          variant: 'destructive'
        });
        return;
      }

      // Add to configuration
      const newController = await addController(formData);
      setControllers(prev => [newController, ...prev]);
      setShowAddDialog(false);
      setFormData({
        name: '',
        ip_address: '',
        port: '80',
        username: '',
        password: '',
        location: ''
      });

      toast({
        title: 'Success',
        description: 'Controller added successfully'
      });

      // Initialize controller
      await hikvisionService.initializeController(newController);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add controller',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteController = async (id) => {
    try {
      await removeController(id);
      setControllers(prev => prev.filter(c => c.id !== id));
      toast({
        title: 'Success',
        description: 'Controller removed successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove controller',
        variant: 'destructive'
      });
    }
  };

const checkStatus = async (controller) => {
  try {
    await hikvisionService.initializeController(controller);
    const status = await hikvisionService.getDeviceStatus(controller.id);
    
    await updateControllerStatus(controller.id, {
      status: 'online',
      cpuUsage: status.cpuUsage,
      memoryUsage: status.memoryUsage
    });

    // Update local state
    setControllers(getControllers());

    toast({
      title: 'Status Updated',
      description: `${controller.name} is online`,
    });
  } catch (error) {
    await updateControllerStatus(controller.id, {
      status: 'offline'
    });

    // Update local state
    setControllers(getControllers());

    toast({
      title: 'Status Check Failed',
      description: `${controller.name} is offline`,
      variant: 'destructive'
    });
  }
};

  // Add these functions to ControllersManagement.jsx

const handleExportConfig = () => {
  try {
    const configData = exportControllers();
    const blob = new Blob([configData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hik-controllers-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    toast({
      title: 'Export Failed',
      description: 'Failed to export controllers configuration',
      variant: 'destructive'
    });
  }
};

const handleImportConfig = async (event) => {
  try {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        await importControllers(e.target.result);
        setControllers(getControllers());
        toast({
          title: 'Import Successful',
          description: 'Controllers configuration imported successfully'
        });
      } catch (error) {
        toast({
          title: 'Import Failed',
          description: 'Invalid configuration file',
          variant: 'destructive'
        });
      }
    };
    reader.readAsText(file);
  } catch (error) {
    toast({
      title: 'Import Failed',
      description: 'Failed to import controllers configuration',
      variant: 'destructive'
    });
  }
};

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">HIKVision Controllers</h1>
            <p className="text-gray-500">Manage your access control devices</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Controller
          </Button>
        </div>

        {/* Warning if no controllers */}
        {controllers.length === 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>No Controllers Found</AlertTitle>
            <AlertDescription>
              Add your first HIKVision controller to get started.
            </AlertDescription>
          </Alert>
        )}

        {/* Controllers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {controllers.map((controller) => (
            <Card key={controller.id}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-medium">
                      {controller.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{controller.location}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        controller.status === 'online'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {controller.status === 'online' ? (
                        <Signal className="w-3 h-3 mr-1" />
                      ) : (
                        <Power className="w-3 h-3 mr-1" />
                      )}
                      {controller.status}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => checkStatus(controller)}
                    >
                      <RefreshCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">IP Address:</span>
                    <span className="font-medium">{controller.ip_address}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Port:</span>
                    <span className="font-medium">{controller.port}</span>
                  </div>
                  {controller.status === 'online' && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">CPU Usage:</span>
                        <span className="font-medium">{controller.cpuUsage}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Memory Usage:</span>
                        <span className="font-medium">{controller.memoryUsage}%</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last Online:</span>
                    <span className="font-medium">
                      {controller.last_online 
                        ? new Date(controller.last_online).toLocaleString()
                        : 'Never'}
                    </span>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {}}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteController(controller.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Controller Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Controller</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddController} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Controller Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Main Entrance Controller"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ip_address">IP Address</Label>
                <Input
                  id="ip_address"
                  value={formData.ip_address}
                  onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                  placeholder="192.168.1.100"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                  placeholder="80"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="admin"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Building A, Floor 1"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Controller</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Toaster />
      </div>
    </div>
  );
};

export default ControllersManagement;
