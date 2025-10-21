import { api } from './api';

export interface LeaveBalance {
  leaveTypeId: number;
  leaveTypeName: string;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
}

export interface EmployeeDashboardData {
  totalLeavesTaken: number;
  pendingRequests: number;
  leaveBalances: LeaveBalance[];
}

export interface TeamMember {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  department: string;
  designation: string;
  dateOfJoining: string;
  managerId: number;
  managerName: string | null;
  role: string;
  isActive: boolean;
}

export interface PendingRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveTypeId: number;
  leaveTypeName: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: string;
  managerRemarks?: string;
  appliedDate: string;
}

export interface ManagerSummaryData {
  teamMembersOnLeaveToday: number;
  pendingApprovals: number;
  approvedThisMonth: number;
  myLeavesTaken: number;
  teamMembers: TeamMember[];
  pendingRequests: PendingRequest[];
}

export const dashboardService = {
  getEmployeeDashboardData: async (employeeId: number): Promise<EmployeeDashboardData> => {
    return await api.get(`/api/employees/${employeeId}/dashboard`);
  },

  getManagerDashboardData: async (managerId: number): Promise<any> => {
    return await api.get(`/api/managers/${managerId}/dashboard`);
  },
  
  getManagerSummary: async (): Promise<ManagerSummaryData> => {
    return await api.get('/summary');
  },

  getAdminDashboardData: async (): Promise<any> => {
    return await api.get('/api/admin/dashboard');
  }
};