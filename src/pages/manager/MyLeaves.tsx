import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
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
import { Calendar, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { leaveTypeService, LeaveType } from '../../services/leaveTypeService';
import { leaveRequestService, LeaveRequest, ApplyLeaveDto } from '../../services/leaveRequestService';
import { userService } from '../../services/userService';

export function MyLeaves() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    leaveType: '',
    fromDate: '',
    toDate: '',
    reason: '',
    isEmergency: false,
  });

  // Fetch leave types, user profile, and leave requests when component mounts
  useEffect(() => {
    if (user) {
      console.log('User changed, fetching data...');
      fetchData();
    }
  }, [user]);
  
  // Log whenever leaveTypes state changes
  useEffect(() => {
    console.log('leaveTypes state updated:', leaveTypes);
    console.log('leaveTypes is array?', Array.isArray(leaveTypes));
    console.log('leaveTypes prototype:', Object.getPrototypeOf(leaveTypes));
    
    // Force log each item individually
    if (leaveTypes && leaveTypes.length > 0) {
      leaveTypes.forEach((item, index) => {
        console.log(`Leave type ${index}:`, item);
      });
    }
  }, [leaveTypes]);
  
  const fetchData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Convert user.id to number for API calls
      const employeeId = Number(user.id);
      
      console.log('Starting API calls...');
      
      // DIRECT API CALL for testing - bypassing the service layer
      const leaveTypesResponse = await fetch('http://localhost:5255/api/LeaveTypes');
      const directLeaveTypesData = await leaveTypesResponse.json();
      console.log('DIRECT leave types fetch:', directLeaveTypesData);
      
      // Set directly from the API response
      setLeaveTypes(directLeaveTypesData);
      
      // Now proceed with regular API calls for other data
      const [leaveRequestsData, profile] = await Promise.all([
        leaveRequestService.getLeaveRequestsByEmployee(employeeId),
        userService.getProfile()
      ]);
      
      console.log('Leave requests fetched:', leaveRequestsData);
      
      setMyRequests(leaveRequestsData);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.leaveType || !formData.fromDate || !formData.toDate || !formData.reason) {
      toast.error('Please fill all fields');
      return;
    }

    // Parse dates for validation
    const fromDate = new Date(formData.fromDate);
    const toDate = new Date(formData.toDate);
    const today = new Date();
    
    // Ensure end date is after start date
    if (fromDate > toDate) {
      toast.error('End date must be after start date');
      return;
    }
    
    // Check if the leave is being applied with enough notice (unless emergency)
    if (!formData.isEmergency) {
      const twoDaysFromNow = new Date();
      twoDaysFromNow.setDate(today.getDate() + 2);
      
      if (fromDate < twoDaysFromNow) {
        toast.error('Regular leaves must be applied at least 2 days in advance. Mark as emergency if needed urgently.');
        return;
      }
    }
    
    // Check for weekend dates (Saturday = 6, Sunday = 0)
    const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
    
    // Create array of all dates in the range
    let currentDate = new Date(fromDate);
    const allDates = [];
    while (currentDate <= toDate) {
      if (!isWeekend(currentDate)) {
        allDates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    try {
      setSubmitting(true);
      
      // Find the selected leave type to get its ID
      const selectedLeaveType = leaveTypes.find(type => type.name === formData.leaveType);
      
      if (!selectedLeaveType) {
        toast.error('Invalid leave type selected');
        return;
      }
      
      // Validate leave length (excluding weekends)
      if (allDates.length > selectedLeaveType.maxConsecutiveDays) {
        toast.error(`You can only take up to ${selectedLeaveType.maxConsecutiveDays} consecutive working days for ${selectedLeaveType.name}`);
        setSubmitting(false);
        return;
      }
      
      // Format dates in yyyy-MM-dd format which is what the API expects
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const startDate = formatDate(fromDate);
      const endDate = formatDate(toDate);
      
      const leaveRequestData: ApplyLeaveDto = {
        leaveTypeId: selectedLeaveType.id,
        startDate: startDate,
        endDate: endDate,
        reason: formData.reason,
        isEmergency: formData.isEmergency,
        employeeId: Number(user?.id) // Include employeeId which might be required by the API
      };
      // Debug output to console
      console.log('Submitting leave request with data:', JSON.stringify(leaveRequestData, null, 2));
      
      // Submit the leave request using the new API endpoint
      await leaveRequestService.applyLeave(leaveRequestData);
      
      toast.success('Leave request submitted successfully');
      
      // Reset form
      setFormData({
        leaveType: '',
        fromDate: '',
        toDate: '',
        reason: '',
        isEmergency: false,
      });
      
      // Refresh leave requests
      if (user?.id) {
        const updatedRequests = await leaveRequestService.getLeaveRequestsByEmployee(Number(user.id));
        setMyRequests(updatedRequests);
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      
      // Extract error message from response
      const errorMessage = error instanceof Error 
        ? error.message.includes('-') 
          ? error.message.split('-')[1].trim()
          : error.message
        : 'Unknown error';
      
      // Handle common errors with more specific messages
      if (errorMessage.toLowerCase().includes('overlapping leaves')) {
        toast.error('You already have a leave request that overlaps with these dates');
      } else if (errorMessage.toLowerCase().includes('leave balance')) {
        toast.error(`You don't have enough leave balance for ${formData.leaveType}`);
      } else if (errorMessage.toLowerCase().includes('dates')) {
        toast.error('The dates you selected are invalid. Please check and try again');
      } else {
        toast.error(`Failed to submit leave request: ${errorMessage}`);
      }
      
      // Show visual feedback about which dates are available
      toast.info('Try selecting different dates or a different leave type');
    } finally {
      setSubmitting(false);
    }
  };

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
          <h1>My Leaves</h1>
          <p className="text-muted-foreground">Apply for leave and view your leave history</p>
        </div>
        <Button 
          variant="outline"
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          )}
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </Button>
        <Button 
          variant="outline"
          onClick={() => {
            console.log('Setting hardcoded leave types for testing');
            const testLeaveTypes = [
              {
                "id": 1,
                "name": "Optional leave",
                "description": "optional",
                "defaultDaysPerYear": 12,
                "isPaid": true,
                "requiresApproval": true,
                "maxConsecutiveDays": 3,
                "isActive": true
              },
              {
                "id": 2,
                "name": "Sick",
                "description": "sick leave",
                "defaultDaysPerYear": 4,
                "isPaid": false,
                "requiresApproval": false,
                "maxConsecutiveDays": 4,
                "isActive": true
              },
              {
                "id": 3,
                "name": "Vacation",
                "description": "vacation",
                "defaultDaysPerYear": 12,
                "isPaid": true,
                "requiresApproval": true,
                "maxConsecutiveDays": 12,
                "isActive": true
              }
            ];
            setLeaveTypes(testLeaveTypes);
          }}
          className="flex items-center gap-2 ml-2"
        >
          Test Data
        </Button>
        <Button 
          variant="outline"
          onClick={async () => {
            try {
              toast.info("Testing direct API call to apply leave...");
              // Test with a variety of payload formats
              const testPayload = {
                leaveTypeId: 1,
                startDate: "2025-10-25",
                endDate: "2025-10-27",
                reason: "Testing API",
                isEmergency: false,
                // Try additional fields that might be required
                employeeId: Number(user?.id),
              };
              
              console.log("Testing direct API call with payload:", testPayload);
              const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/Leaves`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(testPayload),
              });
              
              const responseText = await response.text();
              console.log(`API Response Status: ${response.status}`);
              console.log(`API Response Text: ${responseText}`);
              
              if (response.ok) {
                toast.success("Test API call succeeded!");
              } else {
                toast.error(`Test API call failed: ${response.status} - ${responseText}`);
              }
            } catch (error) {
              console.error("Test API call error:", error);
              toast.error(`Test API call error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }}
          className="flex items-center gap-2 ml-2"
        >
          Test API
        </Button>
      </div>

      {/* Apply for Leave */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Apply for Leave
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leaveType">Leave Type</Label>
                  {/* Debug info shows up in UI for debugging */}
                  <div className="mb-2 p-2 border border-dashed border-gray-300 rounded">
                    <p className="text-xs text-gray-500">Loaded {leaveTypes.length} leave types</p>
                    {leaveTypes.length > 0 && (
                      <p className="text-xs text-gray-500">
                        Types: {leaveTypes.map(t => t.name).join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Clean native select */}
                  <select
                    className="w-full px-3 py-2 rounded-md border text-sm bg-input-background"
                    value={formData.leaveType}
                    onChange={(e) => {
                      console.log('Selected value:', e.target.value);
                      setFormData({ ...formData, leaveType: e.target.value });
                    }}
                    disabled={submitting}
                  >
                    <option value="">Select leave type</option>
                    {leaveTypes.map((type) => (
                      <option key={type.id} value={type.name}>
                        {type.name} ({type.defaultDaysPerYear} days)
                      </option>
                    ))}
                  </select>

                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromDate">From Date</Label>
                  <Input
                    id="fromDate"
                    type="date"
                    value={formData.fromDate}
                    onChange={(e) =>
                      setFormData({ ...formData, fromDate: e.target.value })
                    }
                    className="bg-input-background"
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="toDate">To Date</Label>
                  <Input
                    id="toDate"
                    type="date"
                    value={formData.toDate}
                    onChange={(e) =>
                      setFormData({ ...formData, toDate: e.target.value })
                    }
                    className="bg-input-background"
                    disabled={submitting}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  placeholder="Enter reason for leave..."
                  rows={3}
                  className="bg-input-background"
                  disabled={submitting}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isEmergency"
                  checked={formData.isEmergency}
                  onCheckedChange={(checked: boolean | 'indeterminate') =>
                    setFormData({ ...formData, isEmergency: checked === true })
                  }
                  disabled={submitting}
                />
                <Label htmlFor="isEmergency" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Emergency Leave
                </Label>
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Submit Leave Request
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Leave History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>My Leave History</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchData} 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
              )}
              <span className="ml-2">Refresh</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
            </div>
          ) : myRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>From Date</TableHead>
                  <TableHead>To Date</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.leaveTypeName}</TableCell>
                    <TableCell>{request.fromDate}</TableCell>
                    <TableCell>{request.toDate}</TableCell>
                    <TableCell>{request.appliedDate}</TableCell>
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
