import { useState } from 'react';
import { useLeave } from '../../contexts/LeaveContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
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
import { Calendar, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function MyLeaves() {
  const { leaveTypes, leaveRequests, submitLeaveRequest, employees } = useLeave();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    leaveType: '',
    fromDate: '',
    toDate: '',
    reason: '',
  });

  const myRequests = leaveRequests.filter((req) => req.employeeId === user?.id);
  const employee = employees.find((emp) => emp.id === user?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.leaveType || !formData.fromDate || !formData.toDate || !formData.reason) {
      toast.error('Please fill all fields');
      return;
    }

    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      toast.error('End date must be after start date');
      return;
    }

    submitLeaveRequest({
      employeeId: user?.id || '',
      employeeName: user?.name || '',
      leaveType: formData.leaveType,
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      reason: formData.reason,
      department: employee?.department || '',
    });

    toast.success('Leave request submitted successfully');
    setFormData({
      leaveType: '',
      fromDate: '',
      toDate: '',
      reason: '',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>My Leaves</h1>
        <p className="text-muted-foreground">Apply for leave and view your leave history</p>
      </div>

      {/* Apply for Leave */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Apply for Leave
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type</Label>
                <Select
                  value={formData.leaveType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, leaveType: value })
                  }
                >
                  <SelectTrigger className="bg-input-background">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name} ({type.maxDays} days)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromDate">From Date</Label>
                <Input
                  id="fromDate"
                  type="date"
                  value={formData.fromDate}
                  onChange={(e) =>
                    setFormData({ ...formData, fromDate: e.target.value })
                  }
                  className="bg-input-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="toDate">To Date</Label>
                <Input
                  id="toDate"
                  type="date"
                  value={formData.toDate}
                  onChange={(e) =>
                    setFormData({ ...formData, toDate: e.target.value })
                  }
                  className="bg-input-background"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Enter reason for leave..."
                rows={3}
                className="bg-input-background"
              />
            </div>
            <Button type="submit">
              <Calendar className="w-4 h-4 mr-2" />
              Submit Leave Request
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Leave History */}
      <Card>
        <CardHeader>
          <CardTitle>My Leave History</CardTitle>
        </CardHeader>
        <CardContent>
          {myRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>From Date</TableHead>
                  <TableHead>To Date</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.leaveType}</TableCell>
                    <TableCell>{request.fromDate}</TableCell>
                    <TableCell>{request.toDate}</TableCell>
                    <TableCell>{request.appliedDate}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{request.managerRemarks || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No leave requests found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
