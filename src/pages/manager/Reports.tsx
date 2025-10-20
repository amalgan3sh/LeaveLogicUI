import { useLeave } from '../../contexts/LeaveContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function ManagerReports() {
  const { leaveRequests, employees } = useLeave();
  const { user } = useAuth();

  // Filter team members and their requests
  const teamMembers = employees.filter((emp) => emp.managerId === user?.id);
  const teamRequests = leaveRequests.filter((req) =>
    teamMembers.some((member) => member.id === req.employeeId)
  );

  // Leave type distribution
  const leaveTypeData = teamRequests.reduce((acc: any[], req) => {
    const existing = acc.find((item) => item.type === req.leaveType);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ type: req.leaveType, count: 1 });
    }
    return acc;
  }, []);

  // Employee leave count
  const employeeLeaveData = teamMembers.map((member) => {
    const memberLeaves = teamRequests.filter(
      (req) => req.employeeId === member.id && req.status === 'approved'
    ).length;
    return {
      name: member.name,
      leaves: memberLeaves,
    };
  });

  const totalRequests = teamRequests.length;
  const approvedRequests = teamRequests.filter((req) => req.status === 'approved').length;
  const pendingRequests = teamRequests.filter((req) => req.status === 'pending').length;
  const rejectedRequests = teamRequests.filter((req) => req.status === 'rejected').length;

  return (
    <div className="space-y-6">
      <div>
        <h1>Team Reports</h1>
        <p className="text-muted-foreground">View your team's leave statistics and trends</p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Total Requests</p>
            <h2 className="mt-2">{totalRequests}</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Approved</p>
            <h2 className="mt-2 text-green-600 dark:text-green-400">{approvedRequests}</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Pending</p>
            <h2 className="mt-2 text-orange-600 dark:text-orange-400">{pendingRequests}</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Rejected</p>
            <h2 className="mt-2 text-red-600 dark:text-red-400">{rejectedRequests}</h2>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Leave Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leaveTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employee-wise Approved Leaves</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeeLeaveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="leaves" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
