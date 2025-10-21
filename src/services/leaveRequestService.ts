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

export interface ApplyLeaveDto {
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason: string;
  isEmergency: boolean;
  employeeId?: number; // Added as optional in case API requires it
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
  
  getTeamLeaveRequests: async (): Promise<LeaveRequest[]> => {
    return await api.get('/api/ManagerDashboard/team-leave-requests');
  },
  
  getLeaveRequestById: async (id: number): Promise<LeaveRequest> => {
    return await api.get(`/api/leaverequests/${id}`);
  },
  
  createLeaveRequest: async (leaveRequest: CreateLeaveRequestDto): Promise<LeaveRequest> => {
    return await api.post('/api/leaverequests', leaveRequest);
  },
  
  applyLeave: async (leaveRequest: ApplyLeaveDto): Promise<LeaveRequest> => {
    try {
      // Add some additional logging
      console.log('Applying leave with request:', leaveRequest);
      
      // Make the request
      const result = await api.post('/api/Leaves', leaveRequest);
      return result;
    } catch (error) {
      console.error('Error in applyLeave service:', error);
      
      // Check for common API errors and provide better messages
      if (error instanceof Error) {
        if (error.message.includes('400')) {
          throw new Error('The leave request was invalid. Check dates and try again.');
        }
      }
      throw error;
    }
  },
  
  updateLeaveStatus: async (id: number, updateDto: UpdateLeaveStatusDto): Promise<LeaveRequest> => {
    return await api.put(`/api/leaverequests/${id}/status`, updateDto);
  },
  
  deleteLeaveRequest: async (id: number): Promise<void> => {
    return await api.delete(`/api/leaverequests/${id}`);
  }
};