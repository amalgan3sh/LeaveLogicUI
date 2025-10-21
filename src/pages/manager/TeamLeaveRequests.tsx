import { useState, useEffect } from 'react';
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
import { Eye, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { leaveRequestService, LeaveRequest, UpdateLeaveStatusDto } from '../../services/leaveRequestService';

export function TeamLeaveRequests() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [teamRequests, setTeamRequests] = useState<LeaveRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchTeamLeaveRequests();
  }, []);

  const fetchTeamLeaveRequests = async () => {
    try {
      setLoading(true);
      const data = await leaveRequestService.getTeamLeaveRequests();
      setTeamRequests(data);
    } catch (error) {
      console.error('Error fetching team leave requests:', error);
      toast.error('Failed to load team leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setRemarks(request.managerRemarks || '');
    setIsDialogOpen(true);
  };

  const handleApprove = async () => {
    if (selectedRequest) {
      try {
        setActionLoading(true);
        const updateDto: UpdateLeaveStatusDto = {
          status: 'approved',
          managerRemarks: remarks
        };
        
        await leaveRequestService.updateLeaveStatus(selectedRequest.id, updateDto);
        toast.success('Leave request approved');
        setIsDialogOpen(false);
        
        // Refresh the leave requests list
        fetchTeamLeaveRequests();
      } catch (error) {
        console.error('Error approving leave request:', error);
        toast.error('Failed to approve leave request');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleReject = async () => {
    if (selectedRequest) {
      if (!remarks) {
        toast.error('Please provide remarks for rejection');
        return;
      }
      
      try {
        setActionLoading(true);
        const updateDto: UpdateLeaveStatusDto = {
          status: 'rejected',
          managerRemarks: remarks
        };
        
        await leaveRequestService.updateLeaveStatus(selectedRequest.id, updateDto);
        toast.success('Leave request rejected');
        setIsDialogOpen(false);
        
        // Refresh the leave requests list
        fetchTeamLeaveRequests();
      } catch (error) {
        console.error('Error rejecting leave request:', error);
        toast.error('Failed to reject leave request');
      } finally {
        setActionLoading(false);
      }
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
      <div className="flex justify-between items-center">
        <div>
          <h1>Team Leave Requests</h1>
          <p className="text-muted-foreground">Review and manage your team's leave applications</p>
        </div>
        <button 
          onClick={fetchTeamLeaveRequests}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
          disabled={loading}
        >
          {loading ? 
            <Loader2 className="h-4 w-4 animate-spin" /> : 
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          }
          <span>{loading ? 'Loading...' : 'Refresh'}</span>
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Team Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
            </div>
          ) : teamRequests.length > 0 ? (
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
                    <TableCell>{request.leaveTypeName}</TableCell>
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
                  <p>{selectedRequest.leaveTypeName}</p>
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
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleReject}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleApprove}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </>
                  )}
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
