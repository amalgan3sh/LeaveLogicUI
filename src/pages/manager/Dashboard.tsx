import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Clock, CheckCircle, CalendarDays, Loader2 } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { dashboardService, ManagerSummaryData, TeamMember } from '../../services/dashboardService';
import { LeaveRequest } from '../../services/leaveRequestService';
import { toast } from 'sonner';

export function ManagerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<ManagerSummaryData | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamRequests, setTeamRequests] = useState<LeaveRequest[]>([]);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch summary data from the new endpoint
      const summaryData = await dashboardService.getManagerSummary();
      
      // Update state with the summary data
      setDashboardData(summaryData);
      setTeamMembers(summaryData.teamMembers);
      
      // Convert pending requests to LeaveRequest type
      const pendingLeaveRequests = summaryData.pendingRequests.map(req => ({
        id: req.id,
        employeeId: req.employeeId,
        employeeName: req.employeeName,
        leaveTypeId: req.leaveTypeId,
        leaveTypeName: req.leaveTypeName,
        fromDate: req.fromDate,
        toDate: req.toDate,
        reason: req.reason,
        status: req.status as 'pending' | 'approved' | 'rejected',
        managerRemarks: req.managerRemarks,
        appliedDate: req.appliedDate,
        department: '' // This field is not in the API response, but required by the LeaveRequest type
      }));
      
      setTeamRequests(pendingLeaveRequests);
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };
  
  const stats = [
    {
      title: 'Team on Leave Today',
      value: loading ? '-' : dashboardData?.teamMembersOnLeaveToday || 0,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Pending Approvals',
      value: loading ? '-' : dashboardData?.pendingApprovals || 0,
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
    {
      title: 'Approved This Month',
      value: loading ? '-' : dashboardData?.approvedThisMonth || 0,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'My Leaves Taken',
      value: loading ? '-' : dashboardData?.myLeavesTaken || 0,
      icon: CalendarDays,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
  ];

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
          <h1>Manager Dashboard</h1>
          <p className="text-muted-foreground">Manage your team's leave requests</p>
        </div>
        <button 
          onClick={fetchDashboardData}
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
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">{stat.title}</p>
                    <h2 className="mt-2">
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/70" />
                      ) : (
                        stat.value
                      )}
                    </h2>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
            </div>
          ) : (
            <div className="space-y-2">
              {teamMembers.length > 0 ? (
                teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div>
                      <p>{member.fullName || `${member.firstName} ${member.lastName}`}</p>
                      <p className="text-muted-foreground">{member.email}</p>
                    </div>
                    <Badge variant="outline">{member.department}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No team members assigned</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Team Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Team Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
            </div>
          ) : teamRequests.filter((req) => req.status === 'pending').length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamRequests
                  .filter((req) => req.status === 'pending')
                  .map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.employeeName}</TableCell>
                      <TableCell>{request.leaveTypeName}</TableCell>
                      <TableCell>{request.fromDate}</TableCell>
                      <TableCell>{request.toDate}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No pending requests</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
