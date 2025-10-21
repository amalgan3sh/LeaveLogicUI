import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
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
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner@2.0.3';


export function Reports() {
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const data = await api.get('/api/Reports/employee-leaves');
        setReportData(data);
      } catch (error) {
        toast.error('Failed to fetch report data');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1>Employee Leave Report</h1>
        <p className="text-muted-foreground">Overview of leave usage and balances for all employees</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Leave Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Total Leaves Used</TableHead>
                  <TableHead>Total Leaves Available</TableHead>
                  <TableHead>Leave Balances</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((row) => (
                  <TableRow key={row.employeeId}>
                    <TableCell>{row.employeeName}</TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell>{row.totalLeavesUsed}</TableCell>
                    <TableCell>{row.totalLeavesAvailable}</TableCell>
                    <TableCell>
                      {row.leaveBalances && row.leaveBalances.length > 0 ? (
                        <ul className="list-disc ml-4">
                          {row.leaveBalances.map((bal: any, idx: number) => (
                            <li key={idx}>
                              {bal.leaveType}: {bal.balance}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted-foreground">No balances</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
