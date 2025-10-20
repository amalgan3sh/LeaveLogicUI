import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useLeave } from '../../contexts/LeaveContext';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Clock, CheckCircle, CalendarDays } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

export function ManagerDashboard() {
  const { leaveRequests, employees } = useLeave();
  const { user } = useAuth();

  // Filter team members and their requests
  const teamMembers = employees.filter((emp) => emp.managerId === user?.id);
  const teamRequests = leaveRequests.filter((req) =>
    teamMembers.some((member) => member.id === req.employeeId)
  );

  const pendingApprovals = teamRequests.filter((req) => req.status === 'pending').length;
  const approvedThisMonth = teamRequests.filter((req) => {
    const requestDate = new Date(req.appliedDate);
    const now = new Date();
    return (
      req.status === 'approved' &&
      requestDate.getMonth() === now.getMonth() &&
      requestDate.getFullYear() === now.getFullYear()
    );
  }).length;

  // Members on leave today
  const today = new Date().toISOString().split('T')[0];
  const onLeaveToday = teamRequests.filter((req) => {
    return (
      req.status === 'approved' &&
      req.fromDate <= today &&
      req.toDate >= today
    );
  }).length;

  // My leave stats
  const myRequests = leaveRequests.filter((req) => req.employeeId === user?.id);
  const myPendingRequests = myRequests.filter((req) => req.status === 'pending').length;
  const myApprovedLeaves = myRequests.filter((req) => req.status === 'approved').length;

  const stats = [
    {
      title: 'Team on Leave Today',
      value: onLeaveToday,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Pending Approvals',
      value: pendingApprovals,
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
    {
      title: 'Approved This Month',
      value: approvedThisMonth,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'My Leaves Taken',
      value: myApprovedLeaves,
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
      <div>
        <h1>Manager Dashboard</h1>
        <p className="text-muted-foreground">Manage your team's leave requests</p>
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

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {teamMembers.length > 0 ? (
              teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div>
                    <p>{member.name}</p>
                    <p className="text-muted-foreground">{member.email}</p>
                  </div>
                  <Badge variant="outline">{member.department}</Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No team members assigned</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Team Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Team Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {teamRequests.filter((req) => req.status === 'pending').length > 0 ? (
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
                      <TableCell>{request.leaveType}</TableCell>
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
