import { api } from './api';

export interface UserProfile {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  department: string;
  designation: string;
  dateOfJoining: string;
  managerId?: number;
  role: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  // Get the current user's profile
  getProfile: async (): Promise<UserProfile> => {
    return await api.get('/api/users/profile');
  },
  
  // Update the current user's profile
  updateProfile: async (profile: Partial<UserProfile>): Promise<UserProfile> => {
    return await api.put('/api/users/profile', profile);
  },
  
  // Change the current user's password
  changePassword: async (passwordData: ChangePasswordDto): Promise<void> => {
    return await api.post('/api/users/change-password', passwordData);
  }
};