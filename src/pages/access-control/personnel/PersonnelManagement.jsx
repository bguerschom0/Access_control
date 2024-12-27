import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  UserPlus,
  Trash2,
  Edit,
  Download,
  Upload,
  Search,
  UserX,
  RefreshCcw
} from 'lucide-react';
import { hikvisionService } from '@/services/hikvision';

const PersonnelManagement = () => {
  const { toast } = useToast();
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    department: '',
    cardNumber: '',
    validFrom: '',
    validTo: '',
    doorAccess: []
  });

  const loadPersonnel = async () => {
    try {
      setLoading(true);
      const data = await hikvisionService.getPersonnel();
      setPersonnel(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load personnel data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPersonnel();
  }, []);

  const handleAddPerson = async (e) => {
    e.preventDefault();
    try {
      await hikvisionService.addPerson(formData);
      loadPersonnel();
      setShowAddDialog(false);
      toast({
        title: 'Success',
        description: 'Person added successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDeletePerson = async (employeeId) => {
    try {
      await hikvisionService.deletePerson(employeeId);
      loadPersonnel();
      toast({
        title: 'Success',
        description: 'Person deleted successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleImportPersonnel = async (file) => {
    try {
      await hikvisionService.importPersonnel(file);
      loadPersonnel();
      toast({
        title: 'Success',
        description: 'Personnel imported successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
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
            <h1 className="text-2xl font-bold">Personnel Management</h1>
            <p className="text-gray-500">Manage personnel data in controllers</p>
          </div>
          <div className="space-x-2">
            <Button onClick={() => setShowAddDialog(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Person
            </Button>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input 
                  placeholder="Search by name or ID" 
                  className="w-full"
                  startIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <Button variant="outline">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Sync with Controller
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Personnel List */}
        <Card>
          <CardHeader>
            <CardTitle>Personnel List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Employee ID</th>
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Department</th>
                    <th className="text-left py-3 px-4">Card Number</th>
                    <th className="text-left py-3 px-4">Valid Period</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {personnel.map((person) => (
                    <tr key={person.employeeId} className="border-b">
                      <td className="py-3 px-4">{person.employeeId}</td>
                      <td className="py-3 px-4">{person.name}</td>
                      <td className="py-3 px-4">{person.department}</td>
                      <td className="py-3 px-4">{person.cardNumber}</td>
                      <td className="py-3 px-4">
                        {new Date(person.validFrom).toLocaleDateString()} - {new Date(person.validTo).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeletePerson(person.employeeId)}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Add Person Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Person</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPerson} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Employee ID</label>
                <Input
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Card Number</label>
                <Input
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valid From</label>
                  <Input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valid To</label>
                  <Input
                    type="date"
                    value={formData.validTo}
                    onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Person</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PersonnelManagement;
