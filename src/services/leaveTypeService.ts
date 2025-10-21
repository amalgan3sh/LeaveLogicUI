import { api } from './api';

export interface LeaveType {
  id: number;
  name: string;
  description: string;
  defaultDaysPerYear: number;
  isPaid: boolean;
  requiresApproval: boolean;
  maxConsecutiveDays: number;
  isActive: boolean;
}

export interface CreateLeaveTypeDto {
  name: string;
  description: string;
  defaultDaysPerYear: number;
  isPaid: boolean;
  requiresApproval: boolean;
  maxConsecutiveDays: number;
  isActive: boolean;
}

export const leaveTypeService = {
  getAllLeaveTypes: async (): Promise<LeaveType[]> => {
    try {
      console.log('Fetching leave types...');
      const response = await api.get('/api/LeaveTypes');
      console.log('Leave types response:', response);
      
      // Ensure we have an array of leave types
      if (Array.isArray(response)) {
        console.log('Response is already an array with', response.length, 'items');
        
        // Map each item to ensure it has the correct structure
        return response.map((item) => ({
          id: item.id,
          name: item.name || '',
          description: item.description || '',
          defaultDaysPerYear: item.defaultDaysPerYear || 0,
          isPaid: item.isPaid || false,
          requiresApproval: item.requiresApproval || false,
          maxConsecutiveDays: item.maxConsecutiveDays || 0,
          isActive: item.isActive || false
        }));
      } else if (response && typeof response === 'object') {
        console.log('Response is an object, attempting to extract values');
        // If it's an object, try to convert it to an array
        const array = Object.values(response) as LeaveType[];
        return array;
      }
      
      console.error('Unexpected response format:', response);
      return [];
    } catch (error) {
      console.error('Error fetching leave types:', error);
      throw error;
    }
  },
  
  createLeaveType: async (leaveType: CreateLeaveTypeDto): Promise<LeaveType> => {
    return await api.post('/api/LeaveTypes', leaveType);
  },
  
  updateLeaveType: async (id: number, leaveType: Partial<CreateLeaveTypeDto>): Promise<LeaveType> => {
    return await api.put(`/api/LeaveTypes/${id}`, leaveType);
  },
  
  deleteLeaveType: async (id: number): Promise<void> => {
    return await api.delete(`/api/LeaveTypes/${id}`);
  }
};