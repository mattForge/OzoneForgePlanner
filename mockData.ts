
import { User, Organization, Team, Task, UserRole, WorkStatus, TaskStatus, TaskPriority, Project, AttendanceRecord } from './types';

export const ORGANIZATIONS: Organization[] = [
  { 
    id: 'org-1', 
    name: 'ForgeAcademy', 
    details: 'Advanced Technology Training Center', 
    adminIds: ['admin-1'], 
    logs: ['[SYS] Kernel Initialized', '[AUTH] Admin logged in', '[DATA] Sync complete', '[USER] Mike added to registry'] 
  },
  { 
    id: 'org-2', 
    name: 'Ozone', 
    details: 'Atmospheric Solutions Corp', 
    adminIds: ['admin-1', 'admin-2'], 
    logs: ['[SYS] Pressure sensors active', '[CRON] Nightly backup finished'] 
  },
];

export const USERS: User[] = [
  { id: 'super-1', name: 'Matt C', email: 'matt.c@forgeacademy.co.za', password: 'password', role: UserRole.SUPER_USER, orgIds: [], status: WorkStatus.OFFICE },
  { id: 'admin-1', name: 'Forge Admin', email: 'admin@example.com', password: 'password', role: UserRole.ADMIN, orgIds: ['org-1', 'org-2'], status: WorkStatus.OFFICE },
  { id: 'admin-2', name: 'Ozone Admin', email: 'admin2@example.com', password: 'password', role: UserRole.ADMIN, orgIds: ['org-2'], status: WorkStatus.OFFICE },
  { id: 'user-3', name: 'Charlie Member', email: 'charlie@example.com', password: 'password', role: UserRole.MEMBER, orgIds: ['org-1'], teamId: 'team-1', status: WorkStatus.OFFICE },
  { id: 'user-4', name: 'Diana Member', email: 'diana@example.com', password: 'password', role: UserRole.MEMBER, orgIds: ['org-2'], teamId: 'team-2', status: WorkStatus.WFH },
  { id: 'user-5', name: 'Mike', email: 'mike@example.com', password: 'password', role: UserRole.MEMBER, orgIds: ['org-1'], teamId: 'team-1', status: WorkStatus.OFFICE },
];

export const TEAMS: Team[] = [
  { id: 'team-1', name: 'Forge Dev', orgId: 'org-1', leadId: 'user-3' },
  { id: 'team-2', name: 'Ozone Research', orgId: 'org-2', leadId: 'user-4' },
];

export const PROJECTS: Project[] = [
  { id: 'proj-1', name: 'AI Pilot', description: 'Internal testing', teamId: 'team-1', orgId: 'org-1', deadline: '2024-07-01' },
  { id: 'proj-2', name: 'Sky Net', description: 'Monitoring platform', teamId: 'team-2', orgId: 'org-2', deadline: '2024-08-15' },
];

export const TASKS: Task[] = [
  { id: 'task-1', title: 'Init Vector', description: 'Database setup', assignedToIds: ['user-3', 'user-5'], teamId: 'team-1', orgId: 'org-1', dueDate: '2024-06-15', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH },
  { id: 'task-2', title: 'Atmosphere Check', description: 'Sensor verify', assignedToIds: ['user-4'], teamId: 'team-2', orgId: 'org-2', dueDate: '2024-06-10', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM },
  { id: 'task-3', title: 'Frontend Polish', description: 'Final UI fixes', assignedToIds: ['user-3'], teamId: 'team-1', orgId: 'org-1', dueDate: '2024-06-20', status: TaskStatus.DONE, priority: TaskPriority.MEDIUM },
];

export const ATTENDANCE_RECORDS: AttendanceRecord[] = [
  { id: 'att-1', userId: 'user-3', orgId: 'org-1', date: '2024-06-10', clockIn: '2024-06-10T09:00:00Z', status: WorkStatus.OFFICE, hoursWorked: 8 },
  { id: 'att-2', userId: 'user-4', orgId: 'org-2', date: '2024-06-10', clockIn: '2024-06-10T09:30:00Z', status: WorkStatus.WFH, hoursWorked: 7.5 },
  { id: 'att-3', userId: 'user-5', orgId: 'org-1', date: '2024-06-10', clockIn: '2024-06-10T10:00:00Z', status: WorkStatus.OFFICE, hoursWorked: 6 },
  { id: 'att-4', userId: 'user-3', orgId: 'org-1', date: '2024-06-11', clockIn: '2024-06-11T09:00:00Z', status: WorkStatus.LEAVE, hoursWorked: 0 },
];
