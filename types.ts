
export enum UserRole {
  SUPER_USER = 'SUPER_USER',
  ADMIN = 'ADMIN',
  EXECUTIVE = 'EXECUTIVE',
  MEMBER = 'MEMBER'
}

export enum WorkStatus {
  OFFICE = 'Office',
  WFH = 'WFH',
  LEAVE = 'Leave'
}

export enum TaskStatus {
  TODO = 'Todo',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done'
}

export enum TaskPriority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export interface Organization {
  id: string;
  name: string;
  details: string;
  adminIds: string[];
  logs: string[]; // Console format logs
}

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  role: UserRole;
  orgIds: string[]; // Multiple orgs possible for Admins
  teamId?: string;
  status: WorkStatus;
  mustChangePassword?: boolean;
}

export interface Team {
  id: string;
  name: string;
  orgId: string;
  leadId: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  teamId: string;
  orgId: string;
  deadline: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedToIds: string[];
  teamId: string;
  orgId: string;
  projectId?: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  orgId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  status: WorkStatus;
  hoursWorked: number;
}
