import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '../../components/ui/switch';
import { Textarea } from '../../components/ui/textarea';
import { leaveTypeService, LeaveType, CreateLeaveTypeDto } from '../../services/leaveTypeService';

export function ManageLeaveTypes() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null);
  const [formData, setFormData] = useState<CreateLeaveTypeDto>({
    name: '',
    description: '',
    defaultDaysPerYear: 0,
    isPaid: true,
    requiresApproval: true,
    maxConsecutiveDays: 365,
  });

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    setIsLoading(true);
    try {
      const data = await leaveTypeService.getAllLeaveTypes();
      setLeaveTypes(data);
    } catch (error) {
      console.error('Failed to fetch leave types:', error);
      toast.error('Failed to load leave types');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (leaveType?: LeaveType) => {
    if (leaveType) {
      setEditingLeaveType(leaveType);
      setFormData({
        name: leaveType.name,
        description: leaveType.description,
        defaultDaysPerYear: leaveType.defaultDaysPerYear,
        isPaid: leaveType.isPaid,
        requiresApproval: leaveType.requiresApproval,
        maxConsecutiveDays: leaveType.maxConsecutiveDays,
      });
    } else {
      setEditingLeaveType(null);
      setFormData({
        name: '',
        description: '',
        defaultDaysPerYear: 0,
        isPaid: true,
        requiresApproval: true,
        maxConsecutiveDays: 365,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLeaveType) {
        await leaveTypeService.updateLeaveType(editingLeaveType.id, formData);
        toast.success('Leave type updated successfully');
      } else {
        await leaveTypeService.createLeaveType(formData);
        toast.success('Leave type added successfully');
      }
      setIsDialogOpen(false);
      fetchLeaveTypes(); // Refresh the data
    } catch (error) {
      console.error('Failed to save leave type:', error);
      toast.error(editingLeaveType ? 'Failed to update leave type' : 'Failed to add leave type');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this leave type?')) {
      try {
        await leaveTypeService.deleteLeaveType(id);
        toast.success('Leave type deleted successfully');
        fetchLeaveTypes(); // Refresh the data
      } catch (error) {
        console.error('Failed to delete leave type:', error);
        toast.error('Failed to delete leave type');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Manage Leave Types</h1>
          <p className="text-muted-foreground">Configure available leave types and their limits</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Leave Type
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Types</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Leave Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Default Days/Year</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Requires Approval</TableHead>
                <TableHead>Max Consecutive Days</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">Loading leave types...</TableCell>
                </TableRow>
              ) : leaveTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">No leave types found</TableCell>
                </TableRow>
              ) : (
                leaveTypes.map((leaveType: LeaveType) => (
                  <TableRow key={leaveType.id}>
                    <TableCell>{leaveType.name}</TableCell>
                    <TableCell>{leaveType.description}</TableCell>
                    <TableCell>{leaveType.defaultDaysPerYear} days</TableCell>
                    <TableCell>{leaveType.isPaid ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{leaveType.requiresApproval ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{leaveType.maxConsecutiveDays} days</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(leaveType)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(leaveType.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLeaveType ? 'Edit Leave Type' : 'Add New Leave Type'}
            </DialogTitle>
            <DialogDescription>
              {editingLeaveType
                ? 'Update leave type information'
                : 'Enter leave type details to add to the system'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Leave Type Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Casual Leave, Sick Leave"
                  required
                  className="bg-input-background"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Provide a brief description of this leave type"
                  required
                  className="bg-input-background"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultDaysPerYear">Default Days Per Year</Label>
                <Input
                  id="defaultDaysPerYear"
                  type="number"
                  value={formData.defaultDaysPerYear}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultDaysPerYear: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  required
                  className="bg-input-background"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="isPaid" className="cursor-pointer">Is Paid Leave</Label>
                <Switch
                  id="isPaid"
                  checked={formData.isPaid}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({ ...formData, isPaid: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="requiresApproval" className="cursor-pointer">Requires Approval</Label>
                <Switch
                  id="requiresApproval"
                  checked={formData.requiresApproval}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({ ...formData, requiresApproval: checked })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxConsecutiveDays">Maximum Consecutive Days</Label>
                <Input
                  id="maxConsecutiveDays"
                  type="number"
                  value={formData.maxConsecutiveDays}
                  onChange={(e) =>
                    setFormData({ ...formData, maxConsecutiveDays: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  required
                  className="bg-input-background"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingLeaveType ? 'Update' : 'Add'} Leave Type
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
