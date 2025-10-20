import { Card, CardContent } from '../../components/ui/card';
import { useLeave } from '../../contexts/LeaveContext';
import { useAuth } from '../../contexts/AuthContext';
import { CalendarDays, Clock, CheckCircle, Calendar } from 'lucide-react';
import { Badge } from '../../components/ui/badge';

export function EmployeeDashboard() {
  const { leaveRequests, leaveTypes } = useLeave();
  const { user } = useAuth();

  const myRequests = leaveRequests.filter((req) => req.employeeId === user?.id);
  const approvedLeaves = myRequests.filter((req) => req.status === 'approved').length;
  const pendingRequests = myRequests.filter((req) => req.status === 'pending').length;
  
  // Calculate total leave balance (simplified - assuming 30 total days per year)
  const totalLeaveBalance = 30;
  const remainingBalance = totalLeaveBalance - approvedLeaves;

  const stats = [
    {
      title: 'Total Leaves Taken',
      value: approvedLeaves,
      icon: CalendarDays,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Pending Requests',
      value: pendingRequests,
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
    {
      title: 'Remaining Balance',
      value: remainingBalance,
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
        {stats.map((stat) => {
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
        })}
      </div>

      {/* Available Leave Types */}
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4">Available Leave Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaveTypes.map((type) => (
              <div
                key={type.id}
                className="p-4 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <p>{type.name}</p>
                <p className="text-muted-foreground">Maximum {type.maxDays} days</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Leave Requests */}
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4">Recent Leave Requests</h3>
          <div className="space-y-4">
            {myRequests.slice(0, 5).length > 0 ? (
              myRequests.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex-1">
                    <p>{request.leaveType}</p>
                    <p className="text-muted-foreground">
                      {request.fromDate} to {request.toDate}
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
