import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { reportService, ManagerReportData, LeaveTypeDistribution, EmployeeLeaveCount } from '../../services/reportService';
import { leaveRequestService } from '../../services/leaveRequestService';
import { employeeService, Employee } from '../../services/employeeService';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ManagerReports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ManagerReportData | null>(null);
  const [leaveTypeData, setLeaveTypeData] = useState<any[]>([]);
  const [employeeLeaveData, setEmployeeLeaveData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchReportData();
    }
  }, [user]);

  const fetchReportData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Convert user.id to number for API calls
      const managerId = Number(user.id);
      
      // Fetch report data from API
      const data = await reportService.getManagerReports(managerId);
      setReportData(data);
      
      // Transform data for charts
      const transformedLeaveTypeData = data.leaveTypeDistribution.map(item => ({
        type: item.leaveTypeName,
        count: item.count
      }));
      
      const transformedEmployeeLeaveData = data.employeeLeaveCount.map(item => ({
        name: item.employeeName,
        leaves: item.leaveCount
      }));
      
      setLeaveTypeData(transformedLeaveTypeData);
      setEmployeeLeaveData(transformedEmployeeLeaveData);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
      
      // Set default empty values in case of error
      setReportData({
        totalRequests: 0,
        approvedRequests: 0,
        pendingRequests: 0,
        rejectedRequests: 0,
        leaveTypeDistribution: [],
        employeeLeaveCount: []
      });
      
      setLeaveTypeData([]);
      setEmployeeLeaveData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Team Reports</h1>
          <p className="text-muted-foreground">View your team's leave statistics and trends</p>
        </div>
        <button 
          onClick={fetchReportData}
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

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Total Requests</p>
            <h2 className="mt-2">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : reportData?.totalRequests || 0}
            </h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Approved</p>
            <h2 className="mt-2 text-green-600 dark:text-green-400">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : reportData?.approvedRequests || 0}
            </h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Pending</p>
            <h2 className="mt-2 text-orange-600 dark:text-orange-400">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : reportData?.pendingRequests || 0}
            </h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Rejected</p>
            <h2 className="mt-2 text-red-600 dark:text-red-400">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : reportData?.rejectedRequests || 0}
            </h2>
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
            {loading ? (
              <div className="flex justify-center items-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
              </div>
            ) : leaveTypeData.length > 0 ? (
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
            ) : (
              <div className="flex justify-center items-center h-[300px]">
                <p className="text-muted-foreground">No leave type data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employee-wise Approved Leaves</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
              </div>
            ) : employeeLeaveData.length > 0 ? (
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
            ) : (
              <div className="flex justify-center items-center h-[300px]">
                <p className="text-muted-foreground">No employee leave data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
