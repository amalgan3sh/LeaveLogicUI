import { useState } from 'react';
import { useLeave } from '../../contexts/LeaveContext';
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
import { toast } from 'sonner@2.0.3';
import type { LeaveType } from '../../contexts/LeaveContext';

export function ManageLeaveTypes() {
  const { leaveTypes, addLeaveType, updateLeaveType, deleteLeaveType } = useLeave();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    maxDays: 0,
  });

  const handleOpenDialog = (leaveType?: LeaveType) => {
    if (leaveType) {
      setEditingLeaveType(leaveType);
      setFormData({
        name: leaveType.name,
        maxDays: leaveType.maxDays,
      });
    } else {
      setEditingLeaveType(null);
      setFormData({
        name: '',
        maxDays: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLeaveType) {
      updateLeaveType(editingLeaveType.id, formData);
      toast.success('Leave type updated successfully');
    } else {
      addLeaveType(formData);
      toast.success('Leave type added successfully');
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this leave type?')) {
      deleteLeaveType(id);
      toast.success('Leave type deleted successfully');
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
                <TableHead>Maximum Days</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveTypes.map((leaveType) => (
                <TableRow key={leaveType.id}>
                  <TableCell>{leaveType.name}</TableCell>
                  <TableCell>{leaveType.maxDays} days</TableCell>
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
              ))}
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
                <Label htmlFor="maxDays">Maximum Days</Label>
                <Input
                  id="maxDays"
                  type="number"
                  value={formData.maxDays}
                  onChange={(e) =>
                    setFormData({ ...formData, maxDays: parseInt(e.target.value) || 0 })
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
