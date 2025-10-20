import { useState } from 'react';
import { useLeave } from '../../contexts/LeaveContext';
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
import { Calendar } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
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
  const { leaveTypes, submitLeaveRequest, employees } = useLeave();
  const { user } = useAuth();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: '',
    fromDate: '',
    toDate: '',
    reason: '',
  });

  const employee = employees.find((emp) => emp.id === user?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.leaveType || !formData.fromDate || !formData.toDate || !formData.reason) {
      toast.error('Please fill all fields');
      return;
    }

    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      toast.error('End date must be after start date');
      return;
    }

    setShowConfirmation(true);
  };

  const confirmSubmit = () => {
    submitLeaveRequest({
      employeeId: user?.id || '',
      employeeName: user?.name || '',
      leaveType: formData.leaveType,
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      reason: formData.reason,
      department: employee?.department || '',
    });

    toast.success('Leave request submitted successfully');
    setShowConfirmation(false);
    setFormData({
      leaveType: '',
      fromDate: '',
      toDate: '',
      reason: '',
    });
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
                <Select
                  value={formData.leaveType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, leaveType: value })
                  }
                >
                  <SelectTrigger className="bg-input-background">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name} (Max: {type.maxDays} days)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <p><strong>Leave Type:</strong> {formData.leaveType}</p>
                  <p><strong>From:</strong> {formData.fromDate}</p>
                  <p><strong>To:</strong> {formData.toDate}</p>
                  <p><strong>Duration:</strong> {calculateDays()} day(s)</p>
                  <p><strong>Reason:</strong> {formData.reason}</p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit}>
              Confirm & Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
