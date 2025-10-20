import { useState } from 'react';
import { useLeave } from '../../contexts/LeaveContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function Reports() {
  const { leaveRequests, employees, leaveTypes } = useLeave();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [department, setDepartment] = useState('all');
  const [leaveType, setLeaveType] = useState('all');

  const departments = [...new Set(employees.map((emp) => emp.department))];

  const filteredRequests = leaveRequests.filter((req) => {
    const matchesDateRange =
      (!fromDate || req.fromDate >= fromDate) &&
      (!toDate || req.toDate <= toDate);
    const matchesDepartment = department === 'all' || req.department === department;
    const matchesLeaveType = leaveType === 'all' || req.leaveType === leaveType;
    return matchesDateRange && matchesDepartment && matchesLeaveType;
  });

  const totalLeaves = filteredRequests.length;
  const approvedLeaves = filteredRequests.filter((req) => req.status === 'approved').length;
  const rejectedLeaves = filteredRequests.filter((req) => req.status === 'rejected').length;
  const pendingLeaves = filteredRequests.filter((req) => req.status === 'pending').length;

  const handleExportCSV = () => {
    const headers = ['Employee Name', 'Department', 'Leave Type', 'From Date', 'To Date', 'Status', 'Applied Date'];
    const rows = filteredRequests.map((req) => [
      req.employeeName,
      req.department,
      req.leaveType,
      req.fromDate,
      req.toDate,
      req.status,
      req.appliedDate,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leave-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Report exported successfully');
  };

  const handleExportPDF = () => {
    toast.info('PDF export feature would be implemented here');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Reports</h1>
        <p className="text-muted-foreground">Generate and export leave reports</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromDate">From Date</Label>
              <Input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-input-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toDate">To Date</Label>
              <Input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-input-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="bg-input-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leaveType">Leave Type</Label>
              <Select value={leaveType} onValueChange={setLeaveType}>
                <SelectTrigger className="bg-input-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leave Types</SelectItem>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Total Requests</p>
            <h2 className="mt-2">{totalLeaves}</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Approved</p>
            <h2 className="mt-2 text-green-600 dark:text-green-400">{approvedLeaves}</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Rejected</p>
            <h2 className="mt-2 text-red-600 dark:text-red-400">{rejectedLeaves}</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Pending</p>
            <h2 className="mt-2 text-orange-600 dark:text-orange-400">{pendingLeaves}</h2>
          </CardContent>
        </Card>
      </div>

      {/* Report Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leave Report</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={handleExportPDF}>
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>From Date</TableHead>
                <TableHead>To Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.employeeName}</TableCell>
                  <TableCell>{request.department}</TableCell>
                  <TableCell>{request.leaveType}</TableCell>
                  <TableCell>{request.fromDate}</TableCell>
                  <TableCell>{request.toDate}</TableCell>
                  <TableCell>
                    <span className="capitalize">{request.status}</span>
                  </TableCell>
                  <TableCell>{request.appliedDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
