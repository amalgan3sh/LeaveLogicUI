import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface LeaveType {
  id: string;
  name: string;
  maxDays: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  joiningDate: string;
  managerId?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  managerRemarks?: string;
  appliedDate: string;
  department: string;
}

interface LeaveContextType {
  leaveTypes: LeaveType[];
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  addLeaveType: (leaveType: Omit<LeaveType, 'id'>) => void;
  updateLeaveType: (id: string, leaveType: Omit<LeaveType, 'id'>) => void;
  deleteLeaveType: (id: string) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, employee: Omit<Employee, 'id'>) => void;
  deleteEmployee: (id: string) => void;
  submitLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status'>) => void;
  updateLeaveStatus: (id: string, status: 'approved' | 'rejected', remarks?: string) => void;
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

const initialLeaveTypes: LeaveType[] = [
  { id: '1', name: 'Casual Leave', maxDays: 12 },
  { id: '2', name: 'Sick Leave', maxDays: 10 },
  { id: '3', name: 'Privilege Leave', maxDays: 15 },
  { id: '4', name: 'Maternity Leave', maxDays: 180 },
  { id: '5', name: 'Paternity Leave', maxDays: 15 },
];

const initialEmployees: Employee[] = [
  { id: '1', name: 'Admin User', email: 'admin@company.com', department: 'Administration', role: 'admin', joiningDate: '2020-01-15' },
  { id: '2', name: 'Manager User', email: 'manager@company.com', department: 'Engineering', role: 'manager', joiningDate: '2020-03-20' },
  { id: '3', name: 'Employee User', email: 'employee@company.com', department: 'Engineering', role: 'employee', joiningDate: '2021-06-10', managerId: '2' },
  { id: '4', name: 'John Doe', email: 'john@company.com', department: 'Engineering', role: 'employee', joiningDate: '2021-08-15', managerId: '2' },
  { id: '5', name: 'Jane Smith', email: 'jane@company.com', department: 'Engineering', role: 'employee', joiningDate: '2022-01-20', managerId: '2' },
  { id: '6', name: 'Robert Brown', email: 'robert@company.com', department: 'Marketing', role: 'employee', joiningDate: '2021-11-05' },
  { id: '7', name: 'Emily Davis', email: 'emily@company.com', department: 'Marketing', role: 'employee', joiningDate: '2022-03-12' },
  { id: '8', name: 'Michael Wilson', email: 'michael@company.com', department: 'Sales', role: 'employee', joiningDate: '2020-09-18' },
];

const initialLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    employeeId: '3',
    employeeName: 'Employee User',
    leaveType: 'Casual Leave',
    fromDate: '2025-10-25',
    toDate: '2025-10-27',
    reason: 'Personal work',
    status: 'pending',
    appliedDate: '2025-10-15',
    department: 'Engineering',
  },
  {
    id: '2',
    employeeId: '4',
    employeeName: 'John Doe',
    leaveType: 'Sick Leave',
    fromDate: '2025-10-20',
    toDate: '2025-10-22',
    reason: 'Medical checkup',
    status: 'approved',
    managerRemarks: 'Approved for medical reasons',
    appliedDate: '2025-10-12',
    department: 'Engineering',
  },
  {
    id: '3',
    employeeId: '5',
    employeeName: 'Jane Smith',
    leaveType: 'Privilege Leave',
    fromDate: '2025-11-01',
    toDate: '2025-11-05',
    reason: 'Vacation',
    status: 'pending',
    appliedDate: '2025-10-16',
    department: 'Engineering',
  },
  {
    id: '4',
    employeeId: '6',
    employeeName: 'Robert Brown',
    leaveType: 'Casual Leave',
    fromDate: '2025-10-18',
    toDate: '2025-10-19',
    reason: 'Family event',
    status: 'rejected',
    managerRemarks: 'Important project deadline',
    appliedDate: '2025-10-10',
    department: 'Marketing',
  },
  {
    id: '5',
    employeeId: '8',
    employeeName: 'Michael Wilson',
    leaveType: 'Sick Leave',
    fromDate: '2025-10-15',
    toDate: '2025-10-17',
    reason: 'Flu',
    status: 'approved',
    managerRemarks: 'Get well soon',
    appliedDate: '2025-10-14',
    department: 'Sales',
  },
];

export function LeaveProvider({ children }: { children: ReactNode }) {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    // Load from localStorage or use initial data
    const storedLeaveTypes = localStorage.getItem('leaveTypes');
    const storedEmployees = localStorage.getItem('employees');
    const storedLeaveRequests = localStorage.getItem('leaveRequests');

    setLeaveTypes(storedLeaveTypes ? JSON.parse(storedLeaveTypes) : initialLeaveTypes);
    setEmployees(storedEmployees ? JSON.parse(storedEmployees) : initialEmployees);
    setLeaveRequests(storedLeaveRequests ? JSON.parse(storedLeaveRequests) : initialLeaveRequests);
  }, []);

  useEffect(() => {
    if (leaveTypes.length > 0) {
      localStorage.setItem('leaveTypes', JSON.stringify(leaveTypes));
    }
  }, [leaveTypes]);

  useEffect(() => {
    if (employees.length > 0) {
      localStorage.setItem('employees', JSON.stringify(employees));
    }
  }, [employees]);

  useEffect(() => {
    if (leaveRequests.length > 0) {
      localStorage.setItem('leaveRequests', JSON.stringify(leaveRequests));
    }
  }, [leaveRequests]);

  const addLeaveType = (leaveType: Omit<LeaveType, 'id'>) => {
    const newLeaveType = { ...leaveType, id: Date.now().toString() };
    setLeaveTypes([...leaveTypes, newLeaveType]);
  };

  const updateLeaveType = (id: string, leaveType: Omit<LeaveType, 'id'>) => {
    setLeaveTypes(leaveTypes.map((lt) => (lt.id === id ? { ...leaveType, id } : lt)));
  };

  const deleteLeaveType = (id: string) => {
    setLeaveTypes(leaveTypes.filter((lt) => lt.id !== id));
  };

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee = { ...employee, id: Date.now().toString() };
    setEmployees([...employees, newEmployee]);
  };

  const updateEmployee = (id: string, employee: Omit<Employee, 'id'>) => {
    setEmployees(employees.map((emp) => (emp.id === id ? { ...employee, id } : emp)));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter((emp) => emp.id !== id));
  };

  const submitLeaveRequest = (request: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status'>) => {
    const newRequest: LeaveRequest = {
      ...request,
      id: Date.now().toString(),
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
    };
    setLeaveRequests([...leaveRequests, newRequest]);
  };

  const updateLeaveStatus = (id: string, status: 'approved' | 'rejected', remarks?: string) => {
    setLeaveRequests(
      leaveRequests.map((req) =>
        req.id === id ? { ...req, status, managerRemarks: remarks } : req
      )
    );
  };

  return (
    <LeaveContext.Provider
      value={{
        leaveTypes,
        employees,
        leaveRequests,
        addLeaveType,
        updateLeaveType,
        deleteLeaveType,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        submitLeaveRequest,
        updateLeaveStatus,
      }}
    >
      {children}
    </LeaveContext.Provider>
  );
}

export function useLeave() {
  const context = useContext(LeaveContext);
  if (context === undefined) {
    throw new Error('useLeave must be used within a LeaveProvider');
  }
  return context;
}
