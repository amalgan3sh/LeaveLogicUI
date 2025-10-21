import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  leaveTypeService, 
  LeaveType 
} from '../../services/leaveTypeService';
import {
  leaveRequestService, 
  CreateLeaveRequestDto 
} from '../../services/leaveRequestService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';

export function ApplyLeave() {
  const { user } = useAuth();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    leaveTypeId: 0,
    leaveTypeName: '',
    fromDate: '',
    toDate: '',
    reason: '',
  });

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching leave types from backend...');
      const data = await leaveTypeService.getAllLeaveTypes();
      console.log('Fetched leave types:', data);
      setLeaveTypes(data);
    } catch (error) {
      console.error('Failed to fetch leave types:', error);
      toast.error('Failed to load leave types');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Prepare payload as per manager's MyLeaves.tsx
      const toISOStringOrEmpty = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toISOString();
      };
      const startDate = toISOStringOrEmpty(formData.fromDate);
      const endDate = toISOStringOrEmpty(formData.toDate);
      const leaveRequest = {
        leaveTypeId: formData.leaveTypeId,
        startDate,
        endDate,
        reason: formData.reason,
        isEmergency: false // You can add an emergency checkbox if needed
      };
      await leaveRequestService.applyLeave(leaveRequest);
      toast.success('Leave request submitted successfully');
      setShowConfirmation(false);
      setFormData({
        leaveTypeId: 0,
        leaveTypeName: '',
        fromDate: '',
        toDate: '',
        reason: '',
      });
    } catch (error: any) {
      console.error('Failed to submit leave request:', error);
      const errorMessage = error?.message || 'Failed to submit leave request';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDays = () => {
    if (formData.fromDate && formData.toDate) {
      const from = new Date(formData.fromDate);
      const to = new Date(formData.toDate);
      const diffTime = Math.abs(to.getTime() - from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Apply for Leave</h1>
        <p className="text-muted-foreground">Submit a new leave request</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leave Application Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Leave Application Form</CardTitle>
            <CardDescription>Fill in the details below to apply for leave</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type *</Label>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading leave types...</p>
                  </div>
                ) : (
                  <Select
                    value={formData.leaveTypeId.toString()}
                    onValueChange={(value: string) => {
                      const selectedType = leaveTypes.find(type => type.id.toString() === value);
                      setFormData({ 
                        ...formData, 
                        leaveTypeId: parseInt(value),
                        leaveTypeName: selectedType ? selectedType.name : ''
                      });
                    }}
                  >
                    <SelectTrigger className="bg-input-background">
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((type: LeaveType) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name} (Max: {type.defaultDaysPerYear} days)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromDate">From Date *</Label>
                  <Input
                    id="fromDate"
                    type="date"
                    value={formData.fromDate}
                    onChange={(e) =>
                      setFormData({ ...formData, fromDate: e.target.value })
                    }
                    className="bg-input-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="toDate">To Date *</Label>
                  <Input
                    id="toDate"
                    type="date"
                    value={formData.toDate}
                    onChange={(e) =>
                      setFormData({ ...formData, toDate: e.target.value })
                    }
                    className="bg-input-background"
                  />
                </div>
              </div>

              {calculateDays() > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-blue-900 dark:text-blue-200">
                    Total Days: <strong>{calculateDays()}</strong>
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Leave *</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  placeholder="Please provide a detailed reason for your leave request..."
                  rows={5}
                  className="bg-input-background"
                />
              </div>

              <Button type="submit" className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Submit Leave Request
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Application Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4>Before Applying:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                <li>Check your leave balance</li>
                <li>Plan your leave in advance</li>
                <li>Inform your team members</li>
                <li>Complete pending work</li>
              </ul>
            </div>
            <div>
              <h4>Important Notes:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                <li>Apply at least 3 days in advance</li>
                <li>Provide valid reasons</li>
                <li>Wait for manager approval</li>
                <li>Check status regularly</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Leave Application</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Please review your leave request:</p>
                <div className="p-4 bg-muted rounded-lg space-y-2 mt-4">
                  <p><strong>Leave Type:</strong> {formData.leaveTypeName}</p>
                  <p><strong>From:</strong> {new Date(formData.fromDate).toLocaleDateString()}</p>
                  <p><strong>To:</strong> {new Date(formData.toDate).toLocaleDateString()}</p>
                  <p><strong>Duration:</strong> {calculateDays()} day(s)</p>
                  <p><strong>Reason:</strong> {formData.reason}</p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Confirm & Submit'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
