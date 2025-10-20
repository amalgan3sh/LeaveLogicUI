import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useLeave } from '../../contexts/LeaveContext';
import { Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function AdminDashboard() {
  const { employees, leaveRequests } = useLeave();

  const pendingRequests = leaveRequests.filter((req) => req.status === 'pending').length;
  const approvedRequests = leaveRequests.filter((req) => req.status === 'approved').length;
  const rejectedRequests = leaveRequests.filter((req) => req.status === 'rejected').length;

  const stats = [
    {
      title: 'Total Employees',
      value: employees.length,
      icon: Users,
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
      title: 'Approved Requests',
      value: approvedRequests,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Rejected Requests',
      value: rejectedRequests,
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
  ];

  // Department wise leave data
  const departmentData = employees.reduce((acc: any[], emp) => {
    const deptLeaves = leaveRequests.filter(
      (req) => req.department === emp.department && req.status === 'approved'
    ).length;
    const existing = acc.find((d) => d.department === emp.department);
    if (existing) {
      existing.leaves += deptLeaves;
    } else {
      acc.push({ department: emp.department, leaves: deptLeaves });
    }
    return acc;
  }, []);

  // Status distribution for pie chart
  const statusData = [
    { name: 'Approved', value: approvedRequests },
    { name: 'Pending', value: pendingRequests },
    { name: 'Rejected', value: rejectedRequests },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      <div>
        <h1>Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of leave management system</p>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Department-wise Leave Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="leaves" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave Request Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leave Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaveRequests.slice(0, 5).map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div className="flex-1">
                  <p>{request.employeeName}</p>
                  <p className="text-muted-foreground">
                    {request.leaveType} • {request.fromDate} to {request.toDate}
                  </p>
                </div>
                <div>
                  {request.status === 'pending' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                      Pending
                    </span>
                  )}
                  {request.status === 'approved' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      Approved
                    </span>
                  )}
                  {request.status === 'rejected' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
