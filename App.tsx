
import React, { useState, useMemo } from 'react';
import { 
  Users, LayoutDashboard, CheckSquare, Clock, LogOut, 
  ShieldCheck, Activity, Key, Building,
  Trash, ArrowRight, ShieldAlert, Cpu, 
  Edit2, ChevronRight, RefreshCw, ShieldPlus, 
  Fingerprint, Save, XCircle, AlertCircle, UserPlus,
  Lock, UserCheck, Settings, Server, Calendar, Zap,
  BarChart3, PieChart as PieChartIcon, TrendingUp, UserMinus,
  RotateCcw, Copy, Check
} from 'lucide-react';
import { 
  ResponsiveContainer, Cell, PieChart, Pie, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { User, UserRole, Task, Team, WorkStatus, TaskStatus, TaskPriority, Organization, AttendanceRecord } from './types';
import { USERS, TEAMS, TASKS, ORGANIZATIONS, ATTENDANCE_RECORDS } from './mockData';

// --- Global UI Components ---

const Badge = ({ children, color }: { children?: React.ReactNode, color: string }) => (
  <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border-l-2 ${color} mono`}>
    {children}
  </span>
);

const getStatusColor = (status: string) => {
  switch (status) {
    case WorkStatus.OFFICE: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case WorkStatus.WFH: return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case WorkStatus.LEAVE: return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    case TaskStatus.DONE: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case TaskStatus.IN_PROGRESS: return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'Online': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'Offline': return 'bg-slate-500/10 text-slate-500 border-slate-700';
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
};

const Modal = ({ title, children, onConfirm, onCancel, confirmLabel = "Confirm_Signal" }: { title: string, children: any, onConfirm: any, onCancel: any, confirmLabel?: string }) => (
  <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[100] flex items-center justify-center p-6">
    <div className="w-full max-w-xl bg-slate-900 border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 animate-pulse"></div>
      <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-100 mb-8 mono flex items-center gap-3">
        <Activity size={20} className="text-violet-500" /> {title}
      </h3>
      <div className="space-y-5 mb-10 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar text-slate-100">{children}</div>
      <div className="flex gap-4">
        <button onClick={onConfirm} className="flex-2 bg-violet-600 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white mono hover:bg-violet-500 transition-all shadow-lg shadow-violet-950/20">{confirmLabel}</button>
        <button onClick={onCancel} className="flex-1 border border-slate-800 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mono hover:bg-slate-800 hover:text-slate-300 transition-all">Abort_Sequence</button>
      </div>
    </div>
  </div>
);

// --- Main App Logic ---

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isClockedIn, setIsClockedIn] = useState(false);
  
  const [otpMode, setOtpMode] = useState(false);
  const [targetUserForOtp, setTargetUserForOtp] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // UI state for generated credentials display
  const [otpDisplay, setOtpDisplay] = useState<{ otp: string, userName: string } | null>(null);
  
  const [allOrgs, setAllOrgs] = useState<Organization[]>(ORGANIZATIONS);
  const [allUsers, setAllUsers] = useState<User[]>(USERS);
  const [allTeams, setAllTeams] = useState<Team[]>(TEAMS);
  const [allTasks, setAllTasks] = useState<Task[]>(TASKS);
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>(ATTENDANCE_RECORDS);

  const [editModal, setEditModal] = useState<{ type: 'ORG' | 'USER' | 'TEAM' | 'TASK' | 'ADMIN_NODE', data: any } | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);

  // Derived Values
  const orgTasks = useMemo(() => allTasks.filter(t => t.orgId === activeOrgId), [activeOrgId, allTasks]);
  const orgUsers = useMemo(() => allUsers.filter(u => u.orgIds.includes(activeOrgId || '')), [activeOrgId, allUsers]);
  const orgTeams = useMemo(() => allTeams.filter(t => t.orgId === activeOrgId), [activeOrgId, allTeams]);
  const currentOrg = useMemo(() => allOrgs.find(o => o.id === activeOrgId), [activeOrgId, allOrgs]);
  const allAdmins = useMemo(() => allUsers.filter(u => u.role === UserRole.ADMIN), [allUsers]);

  // Executive Productivity Metrics
  const execReports = useMemo(() => {
    if (!activeOrgId) return null;
    const records = allAttendance.filter(a => a.orgId === activeOrgId);
    const officeHours = records.filter(a => a.status === WorkStatus.OFFICE).reduce((acc, r) => acc + r.hoursWorked, 0);
    const wfhHours = records.filter(a => a.status === WorkStatus.WFH).reduce((acc, r) => acc + r.hoursWorked, 0);
    const leaveNodes = records.filter(a => a.status === WorkStatus.LEAVE).length;

    const teamStats = orgTeams.map(team => {
      const teamTasks = orgTasks.filter(t => t.teamId === team.id);
      const completed = teamTasks.filter(t => t.status === TaskStatus.DONE).length;
      return {
        name: team.name,
        completed,
        total: teamTasks.length,
        efficiency: teamTasks.length ? Math.round((completed / teamTasks.length) * 100) : 0
      };
    });

    const userStats = orgUsers.map(u => {
      const userTasks = orgTasks.filter(t => t.assignedToIds.includes(u.id));
      const completed = userTasks.filter(t => t.status === TaskStatus.DONE).length;
      return { name: u.name, completed, total: userTasks.length };
    }).sort((a,b) => b.completed - a.completed).slice(0, 5);

    return { officeHours, wfhHours, leaveNodes, teamStats, userStats };
  }, [activeOrgId, allAttendance, orgTasks, orgTeams, orgUsers]);

  const superUserMetrics = useMemo(() => {
    return {
      totalOrgs: allOrgs.length,
      totalAdmins: allUsers.filter(u => u.role === UserRole.ADMIN).length,
      totalNodes: allUsers.length,
      orgStats: allOrgs.map(org => ({
        name: org.name,
        tasks: allTasks.filter(t => t.orgId === org.id).length,
        users: allUsers.filter(u => u.orgIds.includes(org.id)).length,
        admins: allUsers.filter(u => u.role === UserRole.ADMIN && u.orgIds.includes(org.id)).length
      }))
    };
  }, [allOrgs, allTasks, allUsers]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = allUsers.find(u => u.email.toLowerCase().trim() === loginEmail.toLowerCase().trim() && u.password === loginPass);
    if (user) {
      if (user.mustChangePassword) {
        setTargetUserForOtp(user);
        setOtpMode(true);
        return;
      }
      setCurrentUser(user);
      if (user.role === UserRole.SUPER_USER) {
        setActiveTab('super');
        setActiveOrgId(null);
      } else {
        setActiveOrgId(user.orgIds[0] || null);
        setActiveTab('dashboard');
      }
      setLoginError('');
    } else {
      setLoginError('AUTH_FAILURE');
    }
  };

  const finalizePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetUserForOtp) {
      const updatedUsers = allUsers.map(u => 
        u.id === targetUserForOtp.id 
          ? { ...u, password: newPassword, mustChangePassword: false } 
          : u
      );
      setAllUsers(updatedUsers);
      const updatedUser = updatedUsers.find(u => u.id === targetUserForOtp.id)!;
      setCurrentUser(updatedUser);
      setOtpMode(false);
      setTargetUserForOtp(null);
      setNewPassword('');
      if (updatedUser.role === UserRole.SUPER_USER) setActiveTab('super');
      else {
        setActiveOrgId(updatedUser.orgIds[0] || null);
        setActiveTab('dashboard');
      }
    }
  };

  const resetUserSecurityKey = (userId: string) => {
    const target = allUsers.find(u => u.id === userId);
    if (!target) return;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setAllUsers(allUsers.map(u => u.id === userId ? { ...u, password: otp, mustChangePassword: true } : u));
    setOtpDisplay({ otp, userName: target.name });
  };

  const updateMyStatus = (newStatus: WorkStatus) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, status: newStatus };
    setAllUsers(allUsers.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    
    if (newStatus !== WorkStatus.LEAVE) {
      setAllAttendance([{
        id: `att-${Date.now()}`,
        userId: currentUser.id,
        orgId: activeOrgId || currentUser.orgIds[0],
        date: new Date().toISOString().split('T')[0],
        clockIn: new Date().toISOString(),
        status: newStatus,
        hoursWorked: 8 
      }, ...allAttendance]);
    }
  };

  const saveEntity = () => {
    if (!editModal) return;
    const { type, data } = editModal;
    if (type === 'ADMIN_NODE') {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const newUser = { 
        ...data, 
        id: isAddMode ? `admin-${Date.now()}` : data.id, 
        name: `${data.firstName} ${data.lastName}`, 
        role: UserRole.ADMIN,
        mustChangePassword: isAddMode ? true : !!data.mustChangePassword,
        password: isAddMode ? otp : data.password
      };
      if (isAddMode) {
        setAllUsers([...allUsers, newUser]);
        setOtpDisplay({ otp, userName: newUser.name });
      } else {
        setAllUsers(allUsers.map(u => u.id === data.id ? newUser : u));
      }
    } else if (type === 'TEAM') {
      const newTeam = { ...data, id: isAddMode ? `team-${Date.now()}` : data.id };
      if (isAddMode) setAllTeams([...allTeams, newTeam]);
      else setAllTeams(allTeams.map(t => t.id === data.id ? newTeam : t));
    } else if (type === 'USER') {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const newUser = { 
        ...data, 
        id: isAddMode ? `user-${Date.now()}` : data.id, 
        name: `${data.firstName} ${data.lastName}`,
        mustChangePassword: isAddMode ? true : !!data.mustChangePassword,
        password: isAddMode ? otp : data.password
      };
      if (isAddMode) {
        setAllUsers([...allUsers, newUser]);
        setOtpDisplay({ otp, userName: newUser.name });
      } else {
        setAllUsers(allUsers.map(u => u.id === data.id ? newUser : u));
      }
    } else if (type === 'TASK') {
      const newTask = { ...data, id: isAddMode ? `task-${Date.now()}` : data.id };
      if (isAddMode) setAllTasks([...allTasks, newTask]);
      else setAllTasks(allTasks.map(t => t.id === data.id ? newTask : t));
    } else if (type === 'ORG') {
      const newOrg = { ...data, id: isAddMode ? `org-${Date.now()}` : data.id, logs: data.logs || ['[SYS] Initialized'] };
      if (isAddMode) setAllOrgs([...allOrgs, newOrg]);
      else setAllOrgs(allOrgs.map(o => o.id === data.id ? newOrg : o));
    }
    setEditModal(null);
  };

  const deleteEntity = (type: string, id: string) => {
    if (!confirm("Confirm termination?")) return;
    if (type === 'ORG') setAllOrgs(allOrgs.filter(o => o.id !== id));
    if (type === 'USER' || type === 'ADMIN_NODE') setAllUsers(allUsers.filter(u => u.id !== id));
    if (type === 'TEAM') setAllTeams(allTeams.filter(t => t.id !== id));
    if (type === 'TASK') setAllTasks(allTasks.filter(t => t.id !== id));
  };

  const navLinks = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.SUPER_USER) return [
      { id: 'super', label: 'MASTER_CONSOLE', icon: ShieldCheck },
      { id: 'entities', label: 'ENTITY_REGISTRY', icon: Building },
      { id: 'admin_node', label: 'ADMIN_NODES', icon: ShieldPlus }
    ];
    if (currentUser.role === UserRole.ADMIN) {
      const links = [
        { id: 'dashboard', label: 'CORE_FEED', icon: LayoutDashboard },
        { id: 'tasks', label: 'VECTOR_LIST', icon: CheckSquare },
        { id: 'attendance', label: 'PULSE_MONITOR', icon: Activity },
        { id: 'users', label: 'NODE_DIR', icon: Users },
        { id: 'teams', label: 'TEAM_FORGE', icon: Users }
      ];
      if (currentUser.orgIds?.length > 1) links.push({ id: 'select-org', label: 'ENTITY_SWAP', icon: RefreshCw });
      return links;
    }
    if (currentUser.role === UserRole.EXECUTIVE) return [
      { id: 'dashboard', label: 'CORP_INTEL', icon: LayoutDashboard },
      { id: 'attendance', label: 'GLOBAL_PULSE', icon: Activity }
    ];
    return [
      { id: 'dashboard', label: 'CORE_FEED', icon: LayoutDashboard },
      { id: 'tasks', label: 'VECTOR_LIST', icon: CheckSquare }
    ];
  }, [currentUser]);

  // Auth / OTP Gate UI
  if (otpMode) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-900 border border-violet-600 p-10 shadow-2xl text-center">
          <Fingerprint size={48} className="mx-auto text-violet-500 mb-6" />
          <h2 className="text-2xl font-black italic text-slate-100 mono uppercase mb-2">Key Rotation Required</h2>
          <form onSubmit={finalizePasswordReset} className="space-y-6">
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-4 text-slate-100 outline-none focus:border-violet-600 mono text-sm" placeholder="NEW_SECRET_KEY" required />
            <button type="submit" className="w-full bg-violet-600 py-4 text-xs font-black uppercase tracking-widest text-white mono hover:bg-violet-700 transition-all">Finalize Protocol</button>
          </form>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-10 shadow-2xl">
          <div className="text-center mb-10">
             <ShieldAlert size={40} className="mx-auto text-violet-400 mb-4" />
             <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-100 mono">Auth_Portal</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-4 text-slate-100 outline-none focus:border-violet-600 mono text-sm" placeholder="USER_ID" />
            <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-4 text-slate-100 outline-none focus:border-violet-600 mono text-sm" placeholder="SECRET_KEY" />
            <button type="submit" className="w-full bg-violet-600 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-violet-700 transition-all mono">Access_Grant</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-50">
      {/* Generated Credential Modal */}
      {otpDisplay && (
        <div className="fixed inset-0 bg-slate-950/98 z-[200] flex items-center justify-center p-6 backdrop-blur-xl">
           <div className="w-full max-w-lg bg-slate-900 border-2 border-violet-600 p-12 text-center relative overflow-hidden shadow-[0_0_100px_rgba(139,92,246,0.15)]">
              <div className="absolute top-0 left-0 w-full h-1 bg-violet-600"></div>
              <ShieldCheck size={56} className="mx-auto text-violet-500 mb-4 animate-pulse" />
              <h2 className="text-2xl font-black text-slate-100 mono uppercase italic tracking-tighter">Credentials Established</h2>
              <div className="bg-slate-950 border border-slate-800 p-8 my-8 relative group">
                 <p className="text-[8px] font-black text-slate-600 uppercase mono mb-4 tracking-[0.3em]">One_Time_Access_Key</p>
                 <div className="text-5xl font-black text-violet-400 mono tracking-[0.5em] select-all mb-2">{otpDisplay.otp}</div>
                 <button onClick={() => { navigator.clipboard.writeText(otpDisplay.otp) }} className="absolute top-4 right-4 text-slate-700 hover:text-violet-500 transition-colors"><Copy size={16} /></button>
              </div>
              <button onClick={() => setOtpDisplay(null)} className="w-full bg-violet-600 py-5 text-xs font-black uppercase tracking-[0.3em] text-white mono hover:bg-violet-700 transition-all shadow-xl">Clear_From_Buffer</button>
           </div>
        </div>
      )}

      {editModal && (
        <Modal 
          title={`${isAddMode ? 'Init' : 'Modify'}_${editModal.type}`} 
          onConfirm={saveEntity} 
          onCancel={() => setEditModal(null)}
        >
          {editModal.type === 'ORG' && (
            <div className="space-y-4">
              <input value={editModal.data.name || ''} onChange={e => setEditModal({...editModal, data: {...editModal.data, name: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 p-4 mono text-slate-100" placeholder="ENTITY_NAME" />
              <textarea value={editModal.data.details || ''} onChange={e => setEditModal({...editModal, data: {...editModal.data, details: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 p-4 mono text-slate-100 h-24" placeholder="DESCRIPTION / MISSION" />
            </div>
          )}
          {editModal.type === 'ADMIN_NODE' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input value={editModal.data.firstName || ''} onChange={e => setEditModal({...editModal, data: {...editModal.data, firstName: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 p-4 mono text-slate-100" placeholder="FIRST_NAME" />
                <input value={editModal.data.lastName || ''} onChange={e => setEditModal({...editModal, data: {...editModal.data, lastName: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 p-4 mono text-slate-100" placeholder="SURNAME" />
              </div>
              <input value={editModal.data.email || ''} onChange={e => setEditModal({...editModal, data: {...editModal.data, email: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 p-4 mono text-slate-100" placeholder="EMAIL" />
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase text-slate-500 mono">Organization_Mapping</p>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-4 border border-slate-800 overflow-y-auto max-h-40 custom-scrollbar">
                   {allOrgs.map(org => (
                     <label key={org.id} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={editModal.data.orgIds?.includes(org.id)}
                          onChange={(e) => {
                            const current = editModal.data.orgIds || [];
                            const updated = e.target.checked ? [...current, org.id] : current.filter((id: string) => id !== org.id);
                            setEditModal({...editModal, data: {...editModal.data, orgIds: updated}});
                          }}
                          className="w-4 h-4 accent-violet-600 bg-slate-900 border-slate-800"
                        />
                        <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-100 mono uppercase">{org.name}</span>
                     </label>
                   ))}
                </div>
              </div>
            </div>
          )}
          {editModal.type === 'USER' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input value={editModal.data.firstName || ''} onChange={e => setEditModal({...editModal, data: {...editModal.data, firstName: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 p-4 mono text-slate-100" placeholder="FIRST_NAME" />
                <input value={editModal.data.lastName || ''} onChange={e => setEditModal({...editModal, data: {...editModal.data, lastName: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 p-4 mono text-slate-100" placeholder="SURNAME" />
              </div>
              <input value={editModal.data.email || ''} onChange={e => setEditModal({...editModal, data: {...editModal.data, email: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 p-4 mono text-slate-100" placeholder="EMAIL" />
              <select value={editModal.data.role} onChange={e => setEditModal({...editModal, data: {...editModal.data, role: e.target.value as UserRole}})} className="w-full bg-slate-950 border border-slate-800 p-4 mono text-slate-100">
                <option value={UserRole.MEMBER}>MEMBER</option>
                <option value={UserRole.EXECUTIVE}>EXECUTIVE</option>
              </select>
            </div>
          )}
          {editModal.type === 'TEAM' && (
            <div className="space-y-4">
              <input value={editModal.data.name || ''} onChange={e => setEditModal({...editModal, data: {...editModal.data, name: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 p-4 mono text-slate-100" placeholder="NAME" />
              <select value={editModal.data.leadId} onChange={e => setEditModal({...editModal, data: {...editModal.data, leadId: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 p-4 mono text-slate-100">
                <option value="">SELECT_LEAD</option>
                {orgUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          )}
          {editModal.type === 'TASK' && (
            <div className="space-y-4">
              <input value={editModal.data.title || ''} onChange={e => setEditModal({...editModal, data: {...editModal.data, title: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 p-4 mono text-slate-100" placeholder="TASK_TITLE" />
              <div className="grid grid-cols-2 gap-4">
                <select value={editModal.data.priority} onChange={e => setEditModal({...editModal, data: {...editModal.data, priority: e.target.value as TaskPriority}})} className="w-full bg-slate-950 border border-slate-800 p-4 mono text-slate-100">
                  <option value={TaskPriority.LOW}>LOW</option>
                  <option value={TaskPriority.MEDIUM}>MEDIUM</option>
                  <option value={TaskPriority.HIGH}>HIGH</option>
                </select>
                <select value={editModal.data.status} onChange={e => setEditModal({...editModal, data: {...editModal.data, status: e.target.value as TaskStatus}})} className="w-full bg-slate-950 border border-slate-800 p-4 mono text-slate-100">
                  <option value={TaskStatus.TODO}>TODO</option>
                  <option value={TaskStatus.IN_PROGRESS}>IN_PROGRESS</option>
                  <option value={TaskStatus.DONE}>DONE</option>
                </select>
              </div>
            </div>
          )}
        </Modal>
      )}

      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full z-40 shadow-2xl">
        <div className="p-8 pb-12 flex items-center gap-3">
          <ShieldCheck size={24} className="text-violet-500" />
          <span className="text-xl font-black tracking-tighter uppercase italic mono text-slate-100">BizFlow_</span>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navLinks.map((link) => (
            <button key={link.id} onClick={() => setActiveTab(link.id)} className={`w-full flex items-center gap-4 px-6 py-4 transition-all border-l-4 ${activeTab === link.id ? 'bg-slate-950 border-violet-600 text-white font-black shadow-[inset_10px_0_15px_-5px_rgba(139,92,246,0.1)]' : 'border-transparent text-slate-600 hover:text-slate-300'}`}>
              <link.icon size={18} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] mono">{link.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6">
           {currentUser.role !== UserRole.SUPER_USER && (
             <div className="p-4 bg-slate-950 border border-slate-800 mb-6">
                <p className="text-[8px] font-black text-slate-700 uppercase mono mb-1">Status</p>
                <div className="flex gap-1">
                  <button onClick={() => updateMyStatus(WorkStatus.OFFICE)} className={`px-2 py-1 text-[8px] font-black mono ${currentUser.status === WorkStatus.OFFICE ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}>OFFICE</button>
                  <button onClick={() => updateMyStatus(WorkStatus.WFH)} className={`px-2 py-1 text-[8px] font-black mono ${currentUser.status === WorkStatus.WFH ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>WFH</button>
                  <button onClick={() => updateMyStatus(WorkStatus.LEAVE)} className={`px-2 py-1 text-[8px] font-black mono ${currentUser.status === WorkStatus.LEAVE ? 'bg-rose-600 text-white' : 'text-slate-600'}`}>LEAVE</button>
                </div>
             </div>
           )}
           <button onClick={() => setCurrentUser(null)} className="w-full py-4 border border-slate-800 text-slate-700 font-black uppercase text-[10px] mono flex items-center justify-center gap-2">
              <LogOut size={14} /> Kill_Session
           </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-12 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'super' && currentUser.role === UserRole.SUPER_USER && (
            <div className="space-y-10 animate-in fade-in duration-300">
               <h2 className="text-4xl font-black italic uppercase tracking-tighter">Master_Console</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-slate-900 border border-slate-800 p-10 group">
                    <Building className="text-violet-500 mb-6 group-hover:scale-110 transition-transform" size={32}/>
                    <p className="text-[10px] font-black text-slate-500 uppercase mono tracking-[0.2em]">Platform Entities</p>
                    <p className="text-5xl font-black text-slate-100 mono">{superUserMetrics.totalOrgs}</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-10 group">
                    <ShieldPlus className="text-emerald-500 mb-6 group-hover:scale-110 transition-transform" size={32}/>
                    <p className="text-[10px] font-black text-slate-500 uppercase mono tracking-[0.2em]">Global Admins</p>
                    <p className="text-5xl font-black text-slate-100 mono">{superUserMetrics.totalAdmins}</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-10 group">
                    <Cpu className="text-blue-500 mb-6 group-hover:scale-110 transition-transform" size={32}/>
                    <p className="text-[10px] font-black text-slate-500 uppercase mono tracking-[0.2em]">Network Nodes</p>
                    <p className="text-5xl font-black text-slate-100 mono">{superUserMetrics.totalNodes}</p>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
                 {superUserMetrics.orgStats.map(m => (
                   <div key={m.name} className="bg-slate-900 border border-slate-800 p-6">
                      <h4 className="text-xs font-black text-slate-100 mono uppercase italic mb-4 truncate">{m.name}</h4>
                      <div className="space-y-1 text-[9px] mono text-slate-600 uppercase">
                        <div className="flex justify-between"><span>Nodes:</span><span className="text-slate-300">{m.users}</span></div>
                        <div className="flex justify-between"><span>Admins:</span><span className="text-slate-300">{m.admins}</span></div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'entities' && currentUser.role === UserRole.SUPER_USER && (
            <div className="space-y-10 animate-in fade-in duration-300">
               <div className="flex justify-between items-end">
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter">Entity_Registry</h2>
                  <button onClick={() => { setIsAddMode(true); setEditModal({ type: 'ORG', data: { name: '', details: '', adminIds: [] } }); }} className="bg-violet-600 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white mono shadow-xl">Spawn Entity</button>
               </div>
               <div className="bg-slate-900 border border-slate-800 shadow-2xl overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-slate-950 text-[9px] font-black uppercase text-slate-600 tracking-[0.3em] mono border-b border-slate-800">
                     <tr><th className="px-10 py-6">Organization Identity</th><th className="px-10 py-6">Cluster Scale</th><th className="px-10 py-6 text-right">Ops</th></tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800/50">
                     {allOrgs.map(org => (
                       <tr key={org.id} className="hover:bg-slate-800/40 transition-colors">
                         <td className="px-10 py-8">
                            <p className="font-black text-slate-100 mono uppercase text-sm">{org.name}</p>
                            <p className="text-[9px] text-slate-600 mono max-w-xs truncate">{org.details}</p>
                         </td>
                         <td className="px-10 py-8">
                            <Badge color="text-violet-400 border-violet-800/30">{allUsers.filter(u=>u.orgIds.includes(org.id)).length} NODES</Badge>
                         </td>
                         <td className="px-10 py-8 text-right flex items-center justify-end gap-2">
                            <button onClick={() => { setIsAddMode(false); setEditModal({ type: 'ORG', data: org }); }} className="text-slate-600 hover:text-blue-500 p-2"><Edit2 size={16}/></button>
                            <button onClick={() => deleteEntity('ORG', org.id)} className="text-slate-600 hover:text-rose-500 p-2"><Trash size={16}/></button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {activeTab === 'admin_node' && currentUser.role === UserRole.SUPER_USER && (
            <div className="space-y-10 animate-in fade-in duration-300">
               <div className="flex justify-between items-end">
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter">Admin_Nodes</h2>
                  <button onClick={() => { setIsAddMode(true); setEditModal({ type: 'ADMIN_NODE', data: { firstName: '', lastName: '', email: '', orgIds: [] } }); }} className="bg-emerald-600 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white mono shadow-xl">Provision Admin</button>
               </div>
               <div className="bg-slate-900 border border-slate-800 shadow-2xl overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-slate-950 text-[9px] font-black uppercase text-slate-600 tracking-[0.3em] mono border-b border-slate-800">
                     <tr><th className="px-10 py-6">Operator Identity</th><th className="px-10 py-6">Mapped Entities</th><th className="px-10 py-6 text-right">Ops</th></tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800/50">
                     {allAdmins.map(admin => (
                       <tr key={admin.id} className="hover:bg-slate-800/40">
                         <td className="px-10 py-8">
                            <p className="font-black text-slate-200 mono uppercase text-sm">{admin.name}</p>
                            <p className="text-[9px] text-slate-600 mono">{admin.email}</p>
                         </td>
                         <td className="px-10 py-8">
                            <div className="flex flex-wrap gap-1">
                               {admin.orgIds?.map(id => <span key={id} className="text-[8px] font-bold bg-slate-950 px-2 py-1 text-slate-400 mono border border-slate-800 uppercase">{allOrgs.find(o => o.id === id)?.name}</span>)}
                            </div>
                         </td>
                         <td className="px-10 py-8 text-right flex items-center justify-end gap-2">
                            <button title="Reset Security Key" onClick={() => resetUserSecurityKey(admin.id)} className="text-slate-600 hover:text-violet-400 p-2 border border-transparent hover:border-violet-800 transition-all"><RotateCcw size={16}/></button>
                            <button onClick={() => { setIsAddMode(false); const names = admin.name.split(' '); setEditModal({ type: 'ADMIN_NODE', data: { ...admin, firstName: names[0], lastName: names.slice(1).join(' ') } }); }} className="text-slate-600 hover:text-blue-500 p-2"><Edit2 size={16}/></button>
                            <button onClick={() => deleteEntity('ADMIN_NODE', admin.id)} className="text-slate-600 hover:text-rose-500 p-2"><Trash size={16}/></button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {activeTab === 'dashboard' && currentUser.role !== UserRole.SUPER_USER && (
            <div className="space-y-10 animate-in fade-in duration-300">
               <h1 className="text-5xl font-black text-slate-100 tracking-tighter uppercase italic">{currentOrg?.name || 'Protocol_Core'}</h1>
               {currentUser.role === UserRole.EXECUTIVE ? (
                 <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="bg-slate-900 border border-slate-800 p-8 flex items-center gap-6">
                         <div className="p-4 bg-emerald-500/10 text-emerald-400"><TrendingUp /></div>
                         <div><p className="text-[9px] text-slate-600 font-bold uppercase mono">Office Hours</p><p className="text-3xl font-black text-slate-100 mono">{execReports?.officeHours}</p></div>
                       </div>
                       <div className="bg-slate-900 border border-slate-800 p-8 flex items-center gap-6">
                         <div className="p-4 bg-blue-500/10 text-blue-400"><Activity /></div>
                         <div><p className="text-[9px] text-slate-600 font-bold uppercase mono">WFH Hours</p><p className="text-3xl font-black text-slate-100 mono">{execReports?.wfhHours}</p></div>
                       </div>
                       <div className="bg-slate-900 border border-slate-800 p-8 flex items-center gap-6">
                         <div className="p-4 bg-rose-500/10 text-rose-400"><UserMinus /></div>
                         <div><p className="text-[9px] text-slate-600 font-bold uppercase mono">Leave Nodes</p><p className="text-3xl font-black text-slate-100 mono">{execReports?.leaveNodes}</p></div>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                       <div className="bg-slate-900 border border-slate-800 p-10">
                          <h3 className="text-lg font-black uppercase text-slate-200 mono mb-8 italic">Team Velocity</h3>
                          <div className="space-y-6">
                             {execReports?.teamStats.map(team => (
                               <div key={team.name} className="space-y-2">
                                  <div className="flex justify-between text-[10px] mono uppercase"><span className="text-slate-400">{team.name}</span><span className="text-slate-100">{team.efficiency}%</span></div>
                                  <div className="h-2 w-full bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
                                     <div className="h-full bg-violet-600 transition-all duration-1000" style={{ width: `${team.efficiency}%` }}></div>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>
                       <div className="bg-slate-900 border border-slate-800 p-10">
                          <h3 className="text-lg font-black uppercase text-slate-200 mono mb-8 italic">Top Operators</h3>
                          <div className="space-y-4">
                             {execReports?.userStats.map(u => (
                               <div key={u.name} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800">
                                  <span className="text-xs font-black text-slate-300 mono uppercase">{u.name}</span>
                                  <span className="text-[10px] font-black text-emerald-400 mono">{u.completed} DONE</span>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-800 border border-slate-800 shadow-2xl overflow-hidden rounded-sm">
                   <div className="bg-slate-900 p-8 group hover:bg-slate-950">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mono mb-2">Vectors Active</p>
                      <p className="text-4xl font-black text-slate-100 mono">{orgTasks.length}</p>
                   </div>
                   <div className="bg-slate-900 p-8 group hover:bg-slate-950">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mono mb-2">Cluster Units</p>
                      <p className="text-4xl font-black text-slate-100 mono">{orgTeams.length}</p>
                   </div>
                   <div className="bg-slate-900 p-8 group hover:bg-slate-950">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mono mb-2">My State</p>
                      <p className="text-4xl font-black text-emerald-500 mono">{currentUser.status}</p>
                   </div>
                 </div>
               )}
            </div>
          )}

          {activeTab === 'tasks' && currentUser.role !== UserRole.SUPER_USER && (
            <div className="bg-slate-900 border border-slate-800 shadow-2xl animate-in fade-in duration-300">
               <div className="p-8 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-100">Vector_List</h3>
                  <button onClick={() => { setIsAddMode(true); setEditModal({ type: 'TASK', data: { title: '', orgId: activeOrgId } }); }} className="bg-emerald-600 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white mono shadow-xl">Provision Vector</button>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-slate-950 text-[9px] font-black uppercase text-slate-600 tracking-[0.3em] mono border-b border-slate-800">
                     <tr><th className="px-10 py-6">Descriptor</th><th className="px-10 py-6">Priority</th><th className="px-10 py-6">Status</th><th className="px-10 py-6 text-right">Ops</th></tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800/50">
                     {orgTasks.map(t => (
                       <tr key={t.id} className="hover:bg-slate-800/40">
                         <td className="px-10 py-8 font-black text-slate-200 mono uppercase text-sm">{t.title}</td>
                         <td className="px-10 py-8 text-[10px] font-black text-slate-500 mono uppercase">{t.priority}</td>
                         <td className="px-10 py-8"><Badge color={getStatusColor(t.status)}>{t.status}</Badge></td>
                         <td className="px-10 py-8 text-right">
                            <button onClick={() => { setIsAddMode(false); setEditModal({ type: 'TASK', data: t }); }} className="text-slate-600 hover:text-blue-500 mr-2"><Edit2 size={16}/></button>
                            <button onClick={() => deleteEntity('TASK', t.id)} className="text-slate-600 hover:text-rose-500"><Trash size={16}/></button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {activeTab === 'teams' && currentUser.role === UserRole.ADMIN && (
             <div className="bg-slate-900 border border-slate-800 shadow-2xl animate-in fade-in duration-300">
                <div className="p-8 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                   <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-100">Team_Forge</h3>
                   <button onClick={() => { setIsAddMode(true); setEditModal({ type: 'TEAM', data: { name: '', orgId: activeOrgId || '' } }); }} className="bg-blue-600 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white mono shadow-xl">Initialize Cluster</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-800">
                    {orgTeams.map(t => (
                      <div key={t.id} className="bg-slate-900 p-10 group relative hover:bg-slate-950 transition-colors">
                         <div className="absolute top-4 right-4 flex gap-2">
                            <button onClick={() => { setIsAddMode(false); setEditModal({ type: 'TEAM', data: t }); }} className="text-blue-500 p-1 border border-transparent hover:border-blue-900"><Edit2 size={14}/></button>
                            <button onClick={() => deleteEntity('TEAM', t.id)} className="text-rose-500 p-1 border border-transparent hover:border-rose-900"><Trash size={14}/></button>
                         </div>
                         <h4 className="text-2xl font-black text-slate-100 mono uppercase italic mb-6">{t.name}</h4>
                         <div className="text-[10px] font-black text-slate-600 uppercase mono">Operator: {allUsers.find(u=>u.id===t.leadId)?.name || 'UNASSIGNED'}</div>
                      </div>
                    ))}
                </div>
             </div>
          )}

          {activeTab === 'select-org' && currentUser.role === UserRole.ADMIN && (
            <div className="space-y-8 animate-in fade-in duration-300">
               <header><h2 className="text-4xl font-black italic uppercase tracking-tighter">Access_Portal</h2></header>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-800 border border-slate-800 shadow-2xl">
                  {allOrgs.filter(o => currentUser.orgIds?.includes(o.id)).map(o => (
                    <button key={o.id} onClick={() => { setActiveOrgId(o.id); setActiveTab('dashboard'); }} className={`bg-slate-900 p-10 flex items-center justify-between transition-all group ${activeOrgId === o.id ? 'bg-slate-950 border-l-4 border-l-violet-600' : 'hover:bg-slate-950'}`}>
                      <p className="text-2xl font-black text-slate-100 uppercase italic">{o.name}</p>
                      <ArrowRight size={28} className="text-slate-800 group-hover:text-violet-600 transition-all" />
                    </button>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'attendance' && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.EXECUTIVE) && (
            <div className="space-y-10 animate-in fade-in duration-300">
               <header><h2 className="text-4xl font-black italic uppercase tracking-tighter">Pulse_Monitor</h2></header>
               <div className="bg-slate-900 border border-slate-800 shadow-2xl">
                 <table className="w-full text-left">
                   <thead className="bg-slate-950 text-[9px] font-black uppercase text-slate-600 tracking-[0.3em] mono border-b border-slate-800">
                     <tr><th className="px-10 py-6">Node Identifier</th><th className="px-10 py-6">State</th><th className="px-10 py-6 text-right">Metric</th></tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800/50">
                     {orgUsers.map(u => {
                        const totalHours = allAttendance.filter(a => a.userId === u.id).reduce((acc, r) => acc + r.hoursWorked, 0);
                        return (
                          <tr key={u.id} className="hover:bg-slate-800/40">
                            <td className="px-10 py-8 font-black text-slate-200 mono uppercase text-sm">{u.name}</td>
                            <td className="px-10 py-8"><Badge color={getStatusColor(u.status)}>{u.status}</Badge></td>
                            <td className="px-10 py-8 text-right font-black text-slate-300 mono">{totalHours.toFixed(1)} HRS</td>
                          </tr>
                        );
                     })}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {activeTab === 'users' && currentUser.role === UserRole.ADMIN && (
            <div className="bg-slate-900 border border-slate-800 shadow-2xl animate-in fade-in duration-300">
               <div className="p-8 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-100">Node_Registry</h3>
                  <button onClick={() => { setIsAddMode(true); setEditModal({ type: 'USER', data: { role: UserRole.MEMBER, status: WorkStatus.OFFICE, orgIds: [activeOrgId!] } }); }} className="bg-violet-600 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white mono shadow-xl">Provision Node</button>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-slate-950 text-[9px] font-black uppercase text-slate-600 mono border-b border-slate-800">
                     <tr><th className="px-10 py-6">Identity</th><th className="px-10 py-6">Tier</th><th className="px-10 py-6 text-right">Ops</th></tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800/50">
                     {orgUsers.map(u => (
                       <tr key={u.id} className="hover:bg-slate-800/40">
                         <td className="px-10 py-8 font-black text-slate-200 mono uppercase text-sm">{u.name}</td>
                         <td className="px-10 py-8 font-black text-slate-500 mono uppercase text-[10px]">{u.role}</td>
                         <td className="px-10 py-8 text-right flex items-center justify-end gap-2">
                            <button title="Reset Node Key" onClick={() => resetUserSecurityKey(u.id)} className="text-slate-600 hover:text-violet-400 p-2 border border-transparent hover:border-violet-800 transition-all"><RotateCcw size={16}/></button>
                            <button onClick={() => { setIsAddMode(false); const names = u.name.split(' '); setEditModal({ type: 'USER', data: { ...u, firstName: names[0], lastName: names.slice(1).join(' ') } }); }} className="text-slate-600 hover:text-blue-500 p-2"><Edit2 size={16}/></button>
                            <button onClick={() => deleteEntity('USER', u.id)} className="text-slate-600 hover:text-rose-500 p-2"><Trash size={16}/></button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
