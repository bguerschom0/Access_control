import { useState } from 'react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Power,
  Signal,
  RefreshCcw,
  Clock
} from 'lucide-react';
import AttendanceView from '@/pages/access-control/attendance/AttendanceView';

const ControllerCard = ({ 
  controller, 
  onRefresh,
  onViewAttendance 
}) => {
  const [showAttendance, setShowAttendance] = useState(false);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
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
              onClick={() => onRefresh(controller)}
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
          
          {/* Attendance Section */}
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowAttendance(!showAttendance)}
            >
              <Clock className="w-4 h-4 mr-2" />
              {showAttendance ? 'Hide Attendance' : 'Show Attendance'}
            </Button>
            
            {showAttendance && (
              <div className="mt-4">
                <AttendanceView controller={controller} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ControllerCard;
