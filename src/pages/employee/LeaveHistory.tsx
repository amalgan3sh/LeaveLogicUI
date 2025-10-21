import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
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
import { Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  leaveRequestService, 
  LeaveRequest 
} from '../../services/leaveRequestService';

export function LeaveHistory() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  
  useEffect(() => {
    if (user && user.id) {
      fetchLeaveRequests();
    }
  }, [user]);
  
  const fetchLeaveRequests = async () => {
    if (!user || !user.id) return;
    
    setIsLoading(true);
    try {
      const employeeId = parseInt(user.id);
      const leaveRequestsData = await leaveRequestService.getLeaveRequestsByEmployee(employeeId);
      setMyRequests(leaveRequestsData);
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
      toast.error('Failed to load leave history');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = myRequests.filter((req: LeaveRequest) => {
    const matchesSearch =
      req.leaveTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const calculateDays = (fromDate: string, toDate: string) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>My Leave History</h1>
        <p className="text-muted-foreground">View all your leave applications and their status</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-20">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Total Requests</p>
                <h2 className="mt-2">{myRequests.length}</h2>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Approved</p>
                <h2 className="mt-2 text-green-600 dark:text-green-400">
                  {myRequests.filter((req: LeaveRequest) => req.status === 'approved').length}
                </h2>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Pending</p>
                <h2 className="mt-2 text-orange-600 dark:text-orange-400">
                  {myRequests.filter((req: LeaveRequest) => req.status === 'pending').length}
                </h2>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Leave History Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle>Leave Applications</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search leaves..."
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
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>From Date</TableHead>
                  <TableHead>To Date</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Manager Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request: LeaveRequest) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.leaveTypeName}</TableCell>
                    <TableCell>{new Date(request.fromDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(request.toDate).toLocaleDateString()}</TableCell>
                    <TableCell>{calculateDays(request.fromDate, request.toDate)}</TableCell>
                    <TableCell>{new Date(request.appliedDate).toLocaleDateString()}</TableCell>
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
