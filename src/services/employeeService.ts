import { api } from './api';

export interface Employee {
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

export interface CreateEmployeeDto {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  department: string;
  designation: string;
  dateOfJoining: string;
  managerId?: number;
  role: string;
}

export const employeeService = {
  getAllEmployees: async (): Promise<Employee[]> => {
    return await api.get('/api/employees');
  },
  
  createEmployee: async (employee: CreateEmployeeDto): Promise<Employee> => {
    return await api.post('/api/employees', employee);
  },
  
  updateEmployee: async (id: number, employee: Partial<CreateEmployeeDto>): Promise<Employee> => {
    return await api.put(`/api/employees/${id}`, employee);
  },
  
  deleteEmployee: async (id: number): Promise<void> => {
    return await api.delete(`/api/employees/${id}`);
  }
};