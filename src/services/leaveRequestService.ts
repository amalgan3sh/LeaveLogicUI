import { api } from './api';

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveTypeId: number;
  leaveTypeName: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  managerRemarks?: string;
  appliedDate: string;
  department: string;
}

export interface CreateLeaveRequestDto {
  employeeId: number;
  leaveTypeId: number;
  fromDate: string;
  toDate: string;
  reason: string;
}

export interface UpdateLeaveStatusDto {
  status: 'approved' | 'rejected';
  managerRemarks?: string;
}

export const leaveRequestService = {
  getAllLeaveRequests: async (): Promise<LeaveRequest[]> => {
    return await api.get('/api/leaverequests');
  },

  getLeaveRequestsByEmployee: async (employeeId: number): Promise<LeaveRequest[]> => {
    return await api.get(`/api/employees/${employeeId}/leaverequests`);
  },
  
  getLeaveRequestsByManager: async (managerId: number): Promise<LeaveRequest[]> => {
    return await api.get(`/api/managers/${managerId}/leaverequests`);
  },
  
  getLeaveRequestById: async (id: number): Promise<LeaveRequest> => {
    return await api.get(`/api/leaverequests/${id}`);
  },
  
  createLeaveRequest: async (leaveRequest: CreateLeaveRequestDto): Promise<LeaveRequest> => {
    return await api.post('/api/leaverequests', leaveRequest);
  },
  
  updateLeaveStatus: async (id: number, updateDto: UpdateLeaveStatusDto): Promise<LeaveRequest> => {
    return await api.put(`/api/leaverequests/${id}/status`, updateDto);
  },
  
  deleteLeaveRequest: async (id: number): Promise<void> => {
    return await api.delete(`/api/leaverequests/${id}`);
  }
};