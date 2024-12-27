import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Settings,
  DoorClosed,
  Clock,
  Wifi,
  HardDrive,
  Shield,
  Save
} from 'lucide-react';

const ControllerConfig = () => {
  const [activeTab, setActiveTab] = useState('network');

  const tabs = [
    { id: 'network', label: 'Network Settings', icon: Wifi },
    { id: 'access', label: 'Access Rules', icon: Shield },
    { id: 'doors', label: 'Door Configuration', icon: DoorClosed },
    { id: 'time', label: 'Time Settings', icon: Clock },
    { id: 'storage', label: 'Storage Management', icon: HardDrive },
  ];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Controller Configuration</h1>
            <p className="text-gray-500">Configure controller settings and parameters</p>
          </div>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        {/* Configuration Tabs */}
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-accent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Network Settings */}
        {activeTab === 'network' && (
          <Card>
            <CardHeader>
              <CardTitle>Network Configuration</CardTitle>
              <CardDescription>Configure network settings for the controller</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">IP Address</label>
                  <Input placeholder="192.168.1.100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subnet Mask</label>
                  <Input placeholder="255.255.255.0" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gateway</label>
                  <Input placeholder="192.168.1.1" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">DNS Server</label>
                  <Input placeholder="8.8.8.8" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Connection Mode</label>
                <Select defaultValue="dhcp">
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dhcp">DHCP</SelectItem>
                    <SelectItem value="static">Static IP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Access Rules */}
        {activeTab === 'access' && (
          <Card>
            <CardHeader>
              <CardTitle>Access Rules Configuration</CardTitle>
              <CardDescription>Configure access rules and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Access rules configuration content */}
            </CardContent>
          </Card>
        )}

        {/* Door Configuration */}
        {activeTab === 'doors' && (
          <Card>
            <CardHeader>
              <CardTitle>Door Configuration</CardTitle>
              <CardDescription>Configure door settings and behavior</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Door configuration content */}
            </CardContent>
          </Card>
        )}

        {/* Time Settings */}
        {activeTab === 'time' && (
          <Card>
            <CardHeader>
              <CardTitle>Time Settings</CardTitle>
              <CardDescription>Configure time and synchronization settings</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Time settings content */}
            </CardContent>
          </Card>
        )}

        {/* Storage Management */}
        {activeTab === 'storage' && (
          <Card>
            <CardHeader>
              <CardTitle>Storage Management</CardTitle>
              <CardDescription>Configure storage settings and cleanup policies</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Storage management content */}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ControllerConfig;
