import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
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
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
// import { leaveRequestService, LeaveRequest, UpdateLeaveStatusDto } from '../../services/leaveRequestService';
interface LeaveHistoryItem {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  leaveTypeId: number;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  rejectionReason?: string | null;
  appliedDate: string;
  actionDate?: string | null;
  actionBy?: number | null;
  actionByName?: string | null;
  comments?: string | null;
  isEmergency: boolean;
}

export function LeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<LeaveHistoryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchLeaveRequests();
    // eslint-disable-next-line
  }, []);

  const fetchLeaveRequests = async () => {
    setIsLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${API_BASE_URL}/api/Leaves`);
      if (!response.ok) {
        throw new Error('Failed to fetch leave requests');
      }
      const data: LeaveHistoryItem[] = await response.json();
      setLeaveRequests(data);
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
      toast.error('Failed to load leave requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRequest = (request: LeaveHistoryItem) => {
    setSelectedRequest(request);
    setRemarks(request.comments || request.rejectionReason || '');
    setIsDialogOpen(true);
  };

  // Approve/Reject actions are disabled as the new API does not support them here
  const handleApprove = () => {
    toast.info('Approve action is not available in this view.');
  };
  const handleReject = () => {
    toast.info('Reject action is not available in this view.');
  };

  const filteredRequests = leaveRequests.filter((req: LeaveHistoryItem) => {
    const matchesSearch =
      req.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.leaveTypeName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Leave Requests</h1>
        <p className="text-muted-foreground">View and manage all leave requests</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle>All Requests</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input-background"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-input-background">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>From Date</TableHead>
                <TableHead>To Date</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">Loading leave requests...</TableCell>
                </TableRow>
              ) : filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">No leave requests found</TableCell>
                </TableRow>
              ) : filteredRequests.map((request: LeaveHistoryItem) => (
                <TableRow key={request.id}>
                  <TableCell>{request.employeeName && request.employeeName.trim() ? request.employeeName : 'n/a'}</TableCell>
                  <TableCell>{request.employeeCode || '-'}</TableCell>
                  <TableCell>{request.leaveTypeName}</TableCell>
                  <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(request.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(request.appliedDate).toLocaleDateString()}</TableCell>
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
                  <p>{selectedRequest.employeeName && selectedRequest.employeeName.trim() ? selectedRequest.employeeName : 'n/a'}</p>
                </div>
                <div>
                  <Label>Employee Code</Label>
                  <p>{selectedRequest.employeeCode || '-'}</p>
                </div>
                <div>
                  <Label>Leave Type</Label>
                  <p>{selectedRequest.leaveTypeName}</p>
                </div>
                <div>
                  <Label>Applied On</Label>
                  <p>{new Date(selectedRequest.appliedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>From Date</Label>
                  <p>{new Date(selectedRequest.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>To Date</Label>
                  <p>{new Date(selectedRequest.endDate).toLocaleDateString()}</p>
                </div>
                <div className="col-span-2">
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div className="col-span-2">
                  <Label>Reason</Label>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedRequest.reason}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="remarks">Manager Remarks / Comments</Label>
                <Textarea
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add your remarks here..."
                  rows={3}
                  disabled={selectedRequest.status?.toLowerCase() !== 'pending'}
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
