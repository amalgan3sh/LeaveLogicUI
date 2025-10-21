import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { CalendarDays, Clock, Calendar, Loader2 } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { 
  leaveRequestService,
  LeaveRequest 
} from '../../services/leaveRequestService';
import { 
  leaveTypeService, 
  LeaveType 
} from '../../services/leaveTypeService';
import {
  dashboardService,
  EmployeeDashboardData,
  LeaveBalance
} from '../../services/dashboardService';

export function EmployeeDashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dashboardData, setDashboardData] = useState<EmployeeDashboardData | null>(null);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    if (user && user.id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user || !user.id) return;
    
    setIsLoading(true);
    try {
      // Fetch dashboard data
      const employeeId = parseInt(user.id);
      const dashboardData = await dashboardService.getEmployeeDashboardData(employeeId);
      setDashboardData(dashboardData);
      
      // Fetch leave types
      const leaveTypesData = await leaveTypeService.getAllLeaveTypes();
      setLeaveTypes(leaveTypesData);
      
      // Fetch recent leave requests
      const leaveRequestsData = await leaveRequestService.getLeaveRequestsByEmployee(employeeId);
      setMyRequests(leaveRequestsData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const totalApprovedLeaves = dashboardData?.totalLeavesTaken || 0;
  const pendingRequestsCount = dashboardData?.pendingRequests || 0;
  
  // Calculate total leave balance from all leave types
  const totalRemainingBalance = dashboardData?.leaveBalances.reduce(
    (total, balance) => total + balance.remainingDays, 0
  ) || 0;

  const stats = [
    {
      title: 'Total Leaves Taken',
      value: totalApprovedLeaves,
      icon: CalendarDays,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Pending Requests',
      value: pendingRequestsCount,
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
    {
      title: 'Remaining Balance',
      value: totalRemainingBalance,
      icon: Calendar,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
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
      <div>
        <h1>Employee Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats Cards */}
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
          stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground">{stat.title}</p>
                      <h2 className="mt-2">{stat.value}</h2>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Available Leave Types & Balances */}
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4">Leave Balances</h3>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : dashboardData && dashboardData.leaveBalances.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.leaveBalances.map((balance: LeaveBalance) => (
                <div
                  key={balance.leaveTypeId}
                  className="p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <p className="font-medium">{balance.leaveTypeName}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      <span className="inline-block w-24">Total:</span> {balance.totalDays} days
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="inline-block w-24">Used:</span> {balance.usedDays} days
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="inline-block w-24">Pending:</span> {balance.pendingDays} days
                    </p>
                    <p className="text-sm font-medium">
                      <span className="inline-block w-24">Remaining:</span> {balance.remainingDays} days
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No leave balances available</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Leave Requests */}
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4">Recent Leave Requests</h3>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : myRequests.length > 0 ? (
              myRequests.slice(0, 5).map((request: LeaveRequest) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex-1">
                    <p>{request.leaveTypeName}</p>
                    <p className="text-muted-foreground">
                      {new Date(request.fromDate).toLocaleDateString()} to {new Date(request.toDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>{getStatusBadge(request.status)}</div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No leave requests yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
