import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Plus, Trash2, CheckCircle, Circle, LogOut, 
  LayoutGrid, Clock, Check, Calendar, Search, 
  Filter, MoreVertical, Settings, User as UserIcon,
  Zap, ArrowRight, X, Edit2, AlertCircle, Moon, Sun
} from 'lucide-react';

const DashboardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, tasks, schedule, settings
  const [taskFilter, setTaskFilter] = useState('all'); // all, pending, completed
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [toast, setToast] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');

  const { user, logout, updateUser } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch (err) {
      showToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      if (editingTask) {
        const { data } = await api.put(`/tasks/${editingTask.id}`, { title, description, dueDate, priority });
        setTasks(tasks.map(t => t.id === editingTask.id ? data : t));
        showToast('Task updated successfully');
      } else {
        const { data } = await api.post('/tasks', { title, description, dueDate, priority });
        setTasks([data, ...tasks]);
        showToast('Task added successfully');
      }
      closeModal();
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  const toggleTaskStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    try {
      await api.put(`/tasks/${id}`, { status: newStatus });
      setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
      showToast(newStatus === 'completed' ? 'Task marked as completed' : 'Task moved to pending');
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task permanently?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
      showToast('Task deleted successfully');
    } catch (err) {
      showToast('Failed to delete task', 'error');
    }
  };

  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setDescription(task.description || '');
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      setPriority(task.priority || 'medium');
    } else {
      setEditingTask(null);
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('medium');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
  };

  const priorityBadge = (p) => {
    const map = {
      high: 'bg-red-50 text-red-600 border-red-100',
      medium: 'bg-yellow-50 text-yellow-600 border-yellow-100',
      low: 'bg-green-50 text-green-600 border-green-100',
    };
    return `text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${map[p] || map.medium}`;
  };

  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'pending') return t.status === 'pending';
    if (taskFilter === 'completed') return t.status === 'completed';
    return true;
  });

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div style={{minHeight: '100vh', display: 'flex', background: 'var(--bg-page)', color: 'var(--text-primary)', transition: 'all 0.3s ease'}}>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-50 px-6 py-4 rounded-xl shadow-notion flex items-center gap-3 animate-slide-up ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside style={{width: '256px', borderRight: '1px solid var(--border-color)', position: 'fixed', top: 0, left: 0, bottom: 0, background: 'var(--bg-sidebar)', zIndex: 40, display: 'none'}} className="lg:!block">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-primary-600 p-1.5 rounded-lg">
            <Zap className="text-white w-5 h-5 fill-white" />
          </div>
          <span style={{color: 'var(--text-primary)'}} className="text-xl font-bold tracking-tight">TaskFlow</span>
        </div>

        <nav className="px-4 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${activeTab === 'dashboard' ? 'bg-primary-600 text-white shadow-sm' : 'hover:bg-primary-50'}`}
            style={{color: activeTab === 'dashboard' ? 'white' : 'var(--text-secondary)'}}
          >
            <LayoutGrid className="w-4 h-4" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${activeTab === 'tasks' ? 'bg-primary-600 text-white shadow-sm' : 'hover:bg-primary-50'}`}
            style={{color: activeTab === 'tasks' ? 'white' : 'var(--text-secondary)'}}
          >
            <CheckCircle className="w-4 h-4" /> My Tasks
          </button>
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${activeTab === 'schedule' ? 'bg-primary-600 text-white shadow-sm' : 'hover:bg-primary-50'}`}
            style={{color: activeTab === 'schedule' ? 'white' : 'var(--text-secondary)'}}
          >
            <Calendar className="w-4 h-4" /> Schedule
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${activeTab === 'settings' ? 'bg-primary-600 text-white shadow-sm' : 'hover:bg-primary-50'}`}
            style={{color: activeTab === 'settings' ? 'white' : 'var(--text-secondary)'}}
          >
            <Settings className="w-4 h-4" /> Settings
          </button>
        </nav>

        {/* User Info & Logout */}
        <div className="px-4 mt-6">
          <div style={{borderTop: '1px solid var(--border-color)'}} className="pt-4 space-y-3">
            <div className="flex items-center gap-3 px-4">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs uppercase">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <p style={{color: 'var(--text-primary)'}} className="text-xs font-bold">{user?.name}</p>
                <p style={{color: 'var(--text-muted)'}} className="text-[10px]">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen relative">
        <header style={{borderBottom: '1px solid var(--border-color)', background: 'var(--bg-header)', backdropFilter: 'blur(12px)'}} className="h-16 px-8 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-4 text-sm font-medium" style={{color: 'var(--text-muted)'}}>
            <span>Workspace</span>
            <ArrowRight className="w-3 h-3" />
            <span style={{color: 'var(--text-primary)'}} className="capitalize">{activeTab}</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              style={{color: 'var(--text-muted)', border: '1px solid var(--border-color)', background: 'var(--bg-card)'}}
              className="p-2 rounded-lg hover:text-primary-600 transition-all"
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => openModal()}
              className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-3 h-3" /> New Task
            </button>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto w-full animate-slide-up">
          
          {/* DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <>
              <h1 style={{color: 'var(--text-primary)'}} className="text-2xl font-black mb-2">Good Day, {user?.name.split(' ')[0]} 👋</h1>
              <p style={{color: 'var(--text-muted)'}} className="mb-8 font-medium">Here's what's happening in your projects today.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <div className="notion-card p-6">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{color: 'var(--text-muted)'}}>Total Tasks</p>
                  <p className="text-3xl font-black" style={{color: 'var(--text-primary)'}}>{tasks.length}</p>
                </div>
                <div className="notion-card p-6 border-l-4 border-l-green-500">
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Completed</p>
                  <p className="text-3xl font-black" style={{color: 'var(--text-primary)'}}>{completedCount}</p>
                </div>
                <div className="notion-card p-6 border-l-4 border-l-yellow-500">
                  <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-1">Pending</p>
                  <p className="text-3xl font-black" style={{color: 'var(--text-primary)'}}>{pendingCount}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold" style={{color: 'var(--text-primary)'}}>Recent Tasks</h2>
                <button onClick={() => setActiveTab('tasks')} className="text-primary-600 text-xs font-bold hover:underline">View All</button>
              </div>
              <div className="space-y-2">
                {tasks.slice(0, 5).map(task => (
                  <div key={task.id} className="notion-card p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <button onClick={() => toggleTaskStatus(task.id, task.status)} className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${task.status === 'completed' ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-200'}`}>
                        {task.status === 'completed' && <Check className="w-3 h-3" />}
                      </button>
                      <span className={`text-sm font-semibold ${task.status === 'completed' ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{task.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* TASKS VIEW */}
          {activeTab === 'tasks' && (
            <>
              <div className="flex items-center justify-between mb-8">
                <h1 style={{color: 'var(--text-primary)'}} className="text-2xl font-black">My Tasks</h1>
                <div className="flex items-center p-1 rounded-lg" style={{background: 'var(--bg-card)', border: '1px solid var(--border-color)'}}>
                  {['all', 'pending', 'completed'].map(f => (
                    <button 
                      key={f}
                      onClick={() => setTaskFilter(f)}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all capitalize ${taskFilter === f ? 'bg-primary-600 text-white shadow-sm' : ''}`}
                      style={{color: taskFilter === f ? 'white' : 'var(--text-muted)'}}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredTasks.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                    <p className="text-slate-400 font-medium">No tasks found in this category.</p>
                  </div>
                ) : (
                  filteredTasks.map(task => (
                    <div key={task.id} className="notion-card p-5 flex items-center justify-between group">
                      <div className="flex items-center gap-4 flex-1">
                        <button 
                          onClick={() => toggleTaskStatus(task.id, task.status)} 
                          className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${task.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-100 hover:border-primary-400'}`}
                        >
                          {task.status === 'completed' && <Check className="w-4 h-4 stroke-[3px]" />}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className={`font-bold text-sm ${task.status === 'completed' ? 'text-slate-300 line-through' : 'text-slate-800'}`}>{task.title}</h3>
                            {task.priority && <span className={priorityBadge(task.priority)}>{task.priority}</span>}
                          </div>
                          {task.description && <p className="text-xs text-slate-400">{task.description}</p>}
                          {task.dueDate && <p className="text-[10px] text-slate-300 mt-1 font-semibold">Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openModal(task)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => deleteTask(task.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 'schedule' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-black text-slate-900">Schedule</h1>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  <Calendar className="w-3 h-3" />
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>

              {tasks.filter(t => t.dueDate).length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                  <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">No scheduled tasks</h3>
                  <p className="text-slate-400 text-sm font-medium">Add a due date to your tasks to see them here.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Grouping tasks by date */}
                  {Object.entries(
                    tasks.filter(t => t.dueDate).reduce((groups, task) => {
                      const date = new Date(task.dueDate).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      });
                      if (!groups[date]) groups[date] = [];
                      groups[date].push(task);
                      return groups;
                    }, {})
                  ).map(([date, dateTasks]) => (
                    <div key={date} className="relative pl-6 border-l-2 border-gray-100 pb-2">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-primary-500 shadow-sm"></div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">{date}</h3>
                      <div className="space-y-3 ml-2">
                        {dateTasks.map(task => (
                          <div key={task.id} className="notion-card p-4 flex items-center justify-between group hover:border-primary-200">
                            <div className="flex items-center gap-4 flex-1">
                              <button 
                                onClick={() => toggleTaskStatus(task.id, task.status)} 
                                className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${task.status === 'completed' ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-200'}`}
                              >
                                {task.status === 'completed' && <Check className="w-3 h-3" />}
                              </button>
                              <span className={`text-sm font-bold ${task.status === 'completed' ? 'line-through' : ''}`} style={{color: task.status === 'completed' ? 'var(--text-faint)' : 'var(--text-primary)'}}>{task.title}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS VIEW */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl animate-fade-in">
              <h1 style={{color: 'var(--text-primary)'}} className="text-2xl font-black mb-8">Settings</h1>
              
              <div className="space-y-8">
                <section>
                  <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Profile Information</h2>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const name = formData.get('profileName');
                    const email = formData.get('profileEmail');
                    try {
                      const { data } = await api.put('/auth/profile', { name, email });
                      updateUser(data);
                      showToast('Profile updated successfully');
                    } catch (err) {
                      showToast(err.response?.data?.message || 'Update failed', 'error');
                    }
                  }} className="notion-card p-6 space-y-4">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl uppercase">
                        {user?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-400">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500">Display Name</label>
                      <input 
                        type="text" 
                        name="profileName"
                        defaultValue={user?.name} 
                        className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-semibold outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-600 transition-all" 
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500">Email Address</label>
                      <input 
                        type="email" 
                        name="profileEmail"
                        defaultValue={user?.email} 
                        className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-semibold outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-600 transition-all" 
                      />
                    </div>
                    <button type="submit" className="mt-2 px-6 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-lg hover:bg-primary-700 shadow-lg shadow-primary-100 transition-all">
                      Save Changes
                    </button>
                  </form>
                </section>

                <section>
                  <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Workspace Preferences</h2>
                  <div className="notion-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Email Notifications</p>
                        <p className="text-xs text-slate-500 mt-0.5">Receive daily task reminders.</p>
                      </div>
                      <div className="w-10 h-6 bg-primary-600 rounded-full flex items-center px-1"><div className="w-4 h-4 bg-white rounded-full ml-auto"></div></div>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Real-time Updates</p>
                        <p className="text-xs text-slate-500 mt-0.5">Sync changes instantly across devices.</p>
                      </div>
                      <div className="w-10 h-6 bg-primary-600 rounded-full flex items-center px-1"><div className="w-4 h-4 bg-white rounded-full ml-auto"></div></div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MODAL SYSTEM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in" style={{background: darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(15,23,42,0.4)'}}>
          <div style={{background: 'var(--bg-card)', border: '1px solid var(--border-color)'}} className="w-full max-w-md rounded-[28px] shadow-notion overflow-hidden relative">
            <button onClick={closeModal} style={{color: 'var(--text-muted)'}} className="absolute top-6 right-6 hover:opacity-70 transition-colors"><X className="w-5 h-5" /></button>
            <div className="p-8">
              <div className="bg-primary-50 w-12 h-12 rounded-xl flex items-center justify-center text-primary-600 mb-6">
                {editingTask ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
              </div>
              <h2 style={{color: 'var(--text-primary)'}} className="text-xl font-black mb-2">{editingTask ? 'Edit Task' : 'New Task'}</h2>
              <p style={{color: 'var(--text-muted)'}} className="text-sm font-medium mb-8">{editingTask ? 'Modify the details of your task.' : 'Add a new item to your productivity backlog.'}</p>
              
              <form onSubmit={handleSubmitTask} className="space-y-5">
                <div className="space-y-1.5">
                  <label style={{color: 'var(--text-muted)'}} className="text-xs font-black uppercase ml-1">Title</label>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Task name" 
                    style={{background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)'}}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-primary-50 focus:border-primary-600 outline-none transition-all font-bold"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label style={{color: 'var(--text-muted)'}} className="text-xs font-black uppercase ml-1">Description</label>
                  <textarea 
                    placeholder="Brief description..." 
                    style={{background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)'}}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-primary-50 focus:border-primary-600 outline-none transition-all h-24 resize-none font-medium"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label style={{color: 'var(--text-muted)'}} className="text-xs font-black uppercase ml-1">Due Date</label>
                  <input 
                    type="date" 
                    style={{background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)'}}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-primary-50 focus:border-primary-600 outline-none transition-all font-bold"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">Priority</label>
                  <div className="flex gap-2">
                    {['low', 'medium', 'high'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`flex-1 py-2 rounded-lg text-xs font-black capitalize transition-all border ${
                          priority === p
                            ? p === 'high' ? 'bg-red-50 text-red-600 border-red-200' : p === 'medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-green-50 text-green-600 border-green-200'
                            : 'bg-gray-50 text-slate-400 border-gray-100 hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={closeModal} className="flex-1 py-3.5 rounded-xl font-bold text-sm text-slate-500 bg-gray-50 hover:bg-gray-100 transition-all">Cancel</button>
                  <button type="submit" className="flex-[2] py-3.5 rounded-xl font-black text-sm text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-100 transition-all">
                    {editingTask ? 'Save Changes' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
