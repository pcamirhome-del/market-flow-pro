import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Save, Plus, Edit2, Trash2, Shield, User, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import { User as UserType } from '@/types';

const Settings: React.FC = () => {
  const { settings, updateSettings } = useData();
  const [appName, setAppName] = useState(settings.appName);
  const [profitMargin, setProfitMargin] = useState(settings.profitMargin.toString());
  const [lowStockThreshold, setLowStockThreshold] = useState(settings.lowStockThreshold.toString());
  const [sidebarLabels, setSidebarLabels] = useState(settings.sidebarLabels);
  
  // Users management
  const [users, setUsers] = useState<UserType[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [showPermissions, setShowPermissions] = useState<string | null>(null);
  
  // New user form
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newRole, setNewRole] = useState<'manager' | 'employee'>('employee');
  const [newPermissions, setNewPermissions] = useState<string[]>([]);

  useEffect(() => {
    const storedUsers = localStorage.getItem('marketpro_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
  }, []);

  const saveSettings = () => {
    updateSettings({
      appName,
      profitMargin: parseFloat(profitMargin) || 14,
      lowStockThreshold: parseInt(lowStockThreshold) || 10,
      sidebarLabels,
    });
    toast.success('تم حفظ الإعدادات بنجاح');
  };

  const handleAddUser = () => {
    if (!newUsername.trim() || !newPassword.trim() || !newName.trim()) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const existingUser = users.find(u => u.username === newUsername);
    if (existingUser) {
      toast.error('اسم المستخدم موجود مسبقاً');
      return;
    }

    const newUser: UserType = {
      id: Date.now().toString(),
      username: newUsername,
      password: newPassword,
      role: newRole,
      name: newName,
      phone: newPhone,
      address: newAddress,
      startDate: new Date().toISOString(),
      permissions: newPermissions,
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('marketpro_users', JSON.stringify(updatedUsers));
    
    toast.success('تم إضافة المستخدم بنجاح');
    resetForm();
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    const updatedUsers = users.map(u => 
      u.id === editingUser.id ? editingUser : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('marketpro_users', JSON.stringify(updatedUsers));
    
    toast.success('تم تحديث المستخدم بنجاح');
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user?.username === 'admin') {
      toast.error('لا يمكن حذف المدير الرئيسي');
      return;
    }

    const confirmed = window.confirm('هل تريد حذف هذا المستخدم؟');
    if (!confirmed) return;

    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('marketpro_users', JSON.stringify(updatedUsers));
    toast.success('تم حذف المستخدم بنجاح');
  };

  const handleUpdatePermissions = (userId: string, permissions: string[]) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, permissions } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('marketpro_users', JSON.stringify(updatedUsers));
    toast.success('تم تحديث الصلاحيات');
    setShowPermissions(null);
  };

  const resetForm = () => {
    setShowAddUser(false);
    setNewUsername('');
    setNewPassword('');
    setNewName('');
    setNewPhone('');
    setNewAddress('');
    setNewRole('employee');
    setNewPermissions([]);
  };

  const permissionsList = [
    { id: 'dailySales', label: 'المبيعات اليومية' },
    { id: 'createInvoice', label: 'إنشاء فاتورة' },
    { id: 'pendingOrders', label: 'الأوردارات المرحلة' },
    { id: 'priceLists', label: 'قوائم الأسعار' },
    { id: 'inventory', label: 'المخزون' },
    { id: 'salesRecord', label: 'سجل المبيعات' },
    { id: 'offerPrices', label: 'أسعار العروض' },
    { id: 'shelfPrices', label: 'سعر الشيلف' },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold gradient-text">{settings.sidebarLabels.settings}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General settings */}
        <div className="glass-card space-y-4">
          <h3 className="text-lg font-semibold border-b border-border/50 pb-2">الإعدادات العامة</h3>
          
          <div>
            <label className="text-sm text-muted-foreground block mb-1">اسم البرنامج</label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="glass-input"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground block mb-1">نسبة الربح (%)</label>
            <input
              type="number"
              value={profitMargin}
              onChange={(e) => setProfitMargin(e.target.value)}
              className="glass-input"
              step="0.1"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground block mb-1">حد التنبيه للمخزون</label>
            <input
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              className="glass-input"
            />
          </div>

          <button onClick={saveSettings} className="btn-primary w-full flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            حفظ الإعدادات
          </button>
        </div>

        {/* Sidebar labels */}
        <div className="glass-card space-y-4">
          <h3 className="text-lg font-semibold border-b border-border/50 pb-2">تعديل مسميات القوائم</h3>
          
          <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
            {Object.entries(sidebarLabels).map(([key, value]) => (
              <div key={key}>
                <label className="text-xs text-muted-foreground block mb-1">{key}</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setSidebarLabels({ ...sidebarLabels, [key]: e.target.value })}
                  className="glass-input text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Users management */}
      <div className="glass-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            إدارة المستخدمين
          </h3>
          <button
            onClick={() => setShowAddUser(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة مستخدم
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-glass">
            <thead>
              <tr>
                <th>اسم المستخدم</th>
                <th>الاسم</th>
                <th>الوظيفة</th>
                <th>تاريخ البدء</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td className="font-mono">{user.username}</td>
                  <td>{user.name}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'admin' ? 'bg-primary/20 text-primary' :
                      user.role === 'manager' ? 'bg-warning/20 text-warning' :
                      'bg-accent/20 text-accent'
                    }`}>
                      {user.role === 'admin' ? 'مدير' : user.role === 'manager' ? 'مشرف' : 'موظف'}
                    </span>
                  </td>
                  <td className="text-sm text-muted-foreground">
                    {new Date(user.startDate).toLocaleDateString('ar-EG')}
                  </td>
                  <td>
                    <div className="flex gap-1">
                      {user.username !== 'admin' && (
                        <>
                          <button
                            onClick={() => setShowPermissions(user.id)}
                            className="p-1.5 hover:bg-primary/20 rounded text-primary"
                            title="الصلاحيات"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-1.5 hover:bg-white/10 rounded"
                            title="تعديل"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1.5 hover:bg-destructive/20 text-destructive rounded"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add user modal */}
      {showAddUser && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">إضافة مستخدم جديد</h3>
              <button onClick={resetForm} className="p-2 hover:bg-white/10 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">اسم المستخدم *</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="glass-input"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">كلمة المرور *</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="glass-input"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">الاسم الكامل *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="glass-input"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">الوظيفة</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as 'manager' | 'employee')}
                    className="glass-input"
                  >
                    <option value="employee">موظف</option>
                    <option value="manager">مشرف</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">العنوان</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="glass-input"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={resetForm} className="btn-glass flex-1">إلغاء</button>
              <button onClick={handleAddUser} className="btn-primary flex-1">إضافة</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit user modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">تعديل المستخدم</h3>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-white/10 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">اسم المستخدم</label>
                <input
                  type="text"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="glass-input"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={editingUser.password}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="glass-input"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">الاسم الكامل</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="glass-input"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => setEditingUser(null)} className="btn-glass flex-1">إلغاء</button>
              <button onClick={handleUpdateUser} className="btn-primary flex-1">حفظ التعديلات</button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions modal */}
      {showPermissions && (
        <div className="modal-overlay" onClick={() => setShowPermissions(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">صلاحيات المستخدم</h3>
              <button onClick={() => setShowPermissions(null)} className="p-2 hover:bg-white/10 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {permissionsList.map(permission => {
                const user = users.find(u => u.id === showPermissions);
                const isChecked = user?.permissions.includes(permission.id) || false;
                
                return (
                  <label key={permission.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const user = users.find(u => u.id === showPermissions);
                        if (!user) return;
                        
                        const newPermissions = e.target.checked
                          ? [...user.permissions, permission.id]
                          : user.permissions.filter(p => p !== permission.id);
                        
                        handleUpdatePermissions(showPermissions, newPermissions);
                      }}
                      className="w-4 h-4 accent-primary"
                    />
                    <span>{permission.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground pt-4">
        مع تحيات المطور <span className="text-primary font-semibold">Amir Lamay</span>
      </div>
    </div>
  );
};

export default Settings;
