import { api } from './api';

export interface LeaveType {
  id: number;
  name: string;
  description: string;
  defaultDaysPerYear: number;
  isPaid: boolean;
  requiresApproval: boolean;
  maxConsecutiveDays: number;
}

export interface CreateLeaveTypeDto {
  name: string;
  description: string;
  defaultDaysPerYear: number;
  isPaid: boolean;
  requiresApproval: boolean;
  maxConsecutiveDays: number;
}

export const leaveTypeService = {
  getAllLeaveTypes: async (): Promise<LeaveType[]> => {
    return await api.get('/api/leavetypes');
  },
  
  createLeaveType: async (leaveType: CreateLeaveTypeDto): Promise<LeaveType> => {
    return await api.post('/api/leavetypes', leaveType);
  },
  
  updateLeaveType: async (id: number, leaveType: Partial<CreateLeaveTypeDto>): Promise<LeaveType> => {
    return await api.put(`/api/leavetypes/${id}`, leaveType);
  },
  
  deleteLeaveType: async (id: number): Promise<void> => {
    return await api.delete(`/api/leavetypes/${id}`);
  }
};