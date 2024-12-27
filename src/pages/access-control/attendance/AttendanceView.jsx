import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, RefreshCcw } from 'lucide-react';
import { hikvisionService } from '@/services/hikvision';

const AttendanceView = ({ controller }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      // Get today's attendance
      const startTime = new Date();
      startTime.setHours(0, 0, 0, 0);
      const endTime = new Date();
      endTime.setHours(23, 59, 59, 999);

      const data = await hikvisionService.getAttendanceRecords(
        controller.id,
        startTime,
        endTime
      );

      setRecords(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load attendance records',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (controller) {
      loadAttendance();
    }
  }, [controller]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Today's Attendance</CardTitle>
        <button
          onClick={loadAttendance}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {records.map((record, index) => (
            <div 
              key={`${record.employeeId}-${index}`}
              className="py-2 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{record.employeeName}</p>
                <p className="text-sm text-gray-500">ID: {record.employeeId}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">
                  {format(new Date(record.eventTime), 'HH:mm:ss')}
                </p>
                <p className={`text-xs ${
                  record.status === 'Success' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {record.status}
                </p>
              </div>
            </div>
          ))}
          {records.length === 0 && (
            <p className="py-4 text-center text-gray-500">
              No attendance records found for today
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceView;
