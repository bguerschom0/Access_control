import { useState, useEffect } from 'react';
import { format, subMonths, startOfDay, endOfDay } from 'date-fns';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/components/ui/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Loader2, 
  Download,
  Calendar as CalendarIcon,
  Filter,
  X
} from 'lucide-react';
import { hikvisionService } from '@/services/hikvision';

const AttendanceView = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({
    startDate: subMonths(new Date(), 3), // Default to last 3 months
    endDate: new Date(),
    department: 'all',
    employeeId: '',
    searchTerm: ''
  });

  // Mock departments (replace with actual data)
  const departments = [
    { id: 'all', name: 'All Departments' },
    { id: 'it', name: 'IT Department' },
    { id: 'hr', name: 'HR Department' },
    { id: 'finance', name: 'Finance' },
  ];

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const data = await hikvisionService.getAttendanceRecords(
        filters.startDate,
        filters.endDate
      );

      // Apply filters
      let filteredData = data;
      
      if (filters.department !== 'all') {
        filteredData = filteredData.filter(r => r.department === filters.department);
      }
      
      if (filters.employeeId) {
        filteredData = filteredData.filter(r => 
          r.employeeId.toLowerCase().includes(filters.employeeId.toLowerCase())
        );
      }
      
      if (filters.searchTerm) {
        filteredData = filteredData.filter(r => 
          r.employeeName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          r.employeeId.toLowerCase().includes(filters.searchTerm.toLowerCase())
        );
      }

      setRecords(filteredData);
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

  // Load data when filters change
  useEffect(() => {
    loadAttendance();
  }, [filters]);

  const handleExport = () => {
    const csv = [
      ['Date', 'Employee ID', 'Employee Name', 'Department', 'Time', 'Status'].join(','),
      ...records.map(record => [
        format(new Date(record.eventTime), 'yyyy-MM-dd'),
        record.employeeId,
        record.employeeName,
        record.department,
        format(new Date(record.eventTime), 'HH:mm:ss'),
        record.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${format(filters.startDate, 'yyyy-MM-dd')}_to_${format(filters.endDate, 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setFilters({
      startDate: subMonths(new Date(), 3),
      endDate: new Date(),
      department: 'all',
      employeeId: '',
      searchTerm: ''
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
            <p className="text-gray-500">
              View and manage attendance records
            </p>
          </div>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={resetFilters}
            >
              <X className="w-4 h-4 mr-2" />
              Reset Filters
            </Button>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Date Range */}
              <div>
                <label className="text-sm font-medium">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(filters.startDate, 'PP')} - {format(filters.endDate, 'PP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{
                        from: filters.startDate,
                        to: filters.endDate
                      }}
                      onSelect={(range) => {
                        if (range?.from && range?.to) {
                          setFilters(prev => ({
                            ...prev,
                            startDate: startOfDay(range.from),
                            endDate: endOfDay(range.to)
                          }));
                        }
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Department Filter */}
              <div>
                <label className="text-sm font-medium">Department</label>
                <Select
                  value={filters.department}
                  onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, department: value }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Employee ID Filter */}
              <div>
                <label className="text-sm font-medium">Employee ID</label>
                <Input
                  type="text"
                  placeholder="Search by ID"
                  value={filters.employeeId}
                  onChange={(e) => 
                    setFilters(prev => ({ ...prev, employeeId: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>

              {/* Search */}
              <div>
                <label className="text-sm font-medium">Search</label>
                <Input
                  type="text"
                  placeholder="Search by name"
                  value={filters.searchTerm}
                  onChange={(e) => 
                    setFilters(prev => ({ ...prev, searchTerm: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left">Date & Time</th>
                    <th className="py-3 px-4 text-left">Employee ID</th>
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-left">Department</th>
                    <th className="py-3 px-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : records.length > 0 ? (
                    records.map((record, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4">
                          {format(new Date(record.eventTime), 'yyyy-MM-dd HH:mm:ss')}
                        </td>
                        <td className="py-3 px-4">{record.employeeId}</td>
                        <td className="py-3 px-4">{record.employeeName}</td>
                        <td className="py-3 px-4">{record.department}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            record.status === 'Success' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-500">
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceView;
