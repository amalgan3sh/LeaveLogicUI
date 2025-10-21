import { api } from './api';

export interface LeaveTypeDistribution {
  leaveTypeId: number;
  leaveTypeName: string;
  count: number;
}

export interface EmployeeLeaveCount {
  employeeId: number;
  employeeName: string;
  leaveCount: number;
}

export interface ManagerReportData {
  totalRequests: number;
  approvedRequests: number;
  pendingRequests: number;
  rejectedRequests: number;
  leaveTypeDistribution: LeaveTypeDistribution[];
  employeeLeaveCount: EmployeeLeaveCount[];
}

export const reportService = {
  getManagerReports: async (managerId: number): Promise<ManagerReportData> => {
    return await api.get(`/api/managers/${managerId}/reports`);
  },
  
  // You can add more report-related API methods here in the future
  getTeamLeaveTypeDistribution: async (managerId: number): Promise<LeaveTypeDistribution[]> => {
    return await api.get(`/api/managers/${managerId}/reports/leave-types`);
  },
  
  getTeamEmployeeLeaveCount: async (managerId: number): Promise<EmployeeLeaveCount[]> => {
    return await api.get(`/api/managers/${managerId}/reports/employee-leaves`);
  }
};