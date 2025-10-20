import { useState } from 'react';
import { useLeave } from '../../contexts/LeaveContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { LeaveRequest } from '../../contexts/LeaveContext';

export function TeamLeaveRequests() {
  const { leaveRequests, updateLeaveStatus, employees } = useLeave();
  const { user } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [remarks, setRemarks] = useState('');

  // Filter team members and their requests
  const teamMembers = employees.filter((emp) => emp.managerId === user?.id);
  const teamRequests = leaveRequests.filter((req) =>
    teamMembers.some((member) => member.id === req.employeeId)
  );

  const handleViewRequest = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setRemarks(request.managerRemarks || '');
    setIsDialogOpen(true);
  };

  const handleApprove = () => {
    if (selectedRequest) {
      updateLeaveStatus(selectedRequest.id, 'approved', remarks);
      toast.success('Leave request approved');
      setIsDialogOpen(false);
    }
  };

  const handleReject = () => {
    if (selectedRequest) {
      if (!remarks) {
        toast.error('Please provide remarks for rejection');
        return;
      }
      updateLeaveStatus(selectedRequest.id, 'rejected', remarks);
      toast.success('Leave request rejected');
      setIsDialogOpen(false);
    }
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
        <h1>Team Leave Requests</h1>
        <p className="text-muted-foreground">Review and manage your team's leave applications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Team Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {teamRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>From Date</TableHead>
                  <TableHead>To Date</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.employeeName}</TableCell>
                    <TableCell>{request.leaveType}</TableCell>
                    <TableCell>{request.fromDate}</TableCell>
                    <TableCell>{request.toDate}</TableCell>
                    <TableCell>{request.appliedDate}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewRequest(request)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No team leave requests found</p>
          )}
        </CardContent>
      </Card>

      {/* View/Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>Review and take action on this leave request</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Employee Name</Label>
                  <p>{selectedRequest.employeeName}</p>
                </div>
                <div>
                  <Label>Leave Type</Label>
                  <p>{selectedRequest.leaveType}</p>
                </div>
                <div>
                  <Label>From Date</Label>
                  <p>{selectedRequest.fromDate}</p>
                </div>
                <div>
                  <Label>To Date</Label>
                  <p>{selectedRequest.toDate}</p>
                </div>
                <div>
                  <Label>Applied On</Label>
                  <p>{selectedRequest.appliedDate}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div className="col-span-2">
                  <Label>Reason</Label>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedRequest.reason}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="remarks">Manager Remarks</Label>
                <Textarea
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add your remarks here..."
                  rows={3}
                  disabled={selectedRequest.status !== 'pending'}
                  className="bg-input-background"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedRequest?.status === 'pending' ? (
              <>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleReject}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button onClick={handleApprove}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
