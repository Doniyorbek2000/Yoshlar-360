'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { roleLabels } from '@/lib/utils';
import api from '@/lib/api';
import { Settings, Shield, Bell, Database, Key, Save, RefreshCw, Globe, Users, Sliders } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Yoshlar 360',
    siteDescription: "Yoshlar bilan ishlash platformasi",
    defaultLanguage: 'uz',
    timezone: 'Asia/Tashkent',
    maintenanceMode: false,
  });

  const [kpiFormulas, setKpiFormulas] = useState({
    appealsWeight: 30,
    tasksWeight: 25,
    youthWeight: 25,
    problemsWeight: 20,
    minScore: 0,
    maxScore: 100,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    telegramEnabled: true,
    pushEnabled: false,
    newAppealNotify: true,
    taskDeadlineNotify: true,
    kpiReportNotify: true,
    systemAlertNotify: true,
    dailyDigest: false,
    weeklyReport: true,
  });

  const [permissions, setPermissions] = useState<Record<string, string[]>>({
    SUPER_ADMIN: ['all'],
    REPUBLIC_ADMIN: ['dashboard', 'youth', 'appeals', 'tasks', 'problems', 'reports', 'kpi', 'users', 'regions', 'districts', 'mahallas', 'news', 'events', 'surveys', 'notifications', 'audit-logs', 'settings', 'imports', 'analytics'],
    REGION_ADMIN: ['dashboard', 'youth', 'appeals', 'tasks', 'problems', 'reports', 'kpi', 'news', 'events', 'surveys', 'notifications'],
    DISTRICT_ADMIN: ['dashboard', 'youth', 'appeals', 'tasks', 'problems', 'reports', 'surveys', 'notifications'],
    MAHALLA_LEADER: ['dashboard', 'youth', 'appeals', 'tasks', 'notifications'],
    YOUTH: ['dashboard', 'appeals', 'notifications'],
    MODERATOR: ['dashboard', 'youth', 'appeals', 'tasks', 'problems', 'news', 'events', 'notifications'],
  });

  useEffect(() => {
    api.get('/settings').then(res => {
      const s = res.data.data;
      if (s?.general) setGeneralSettings(prev => ({ ...prev, ...s.general }));
      if (s?.kpiFormulas) setKpiFormulas(prev => ({ ...prev, ...s.kpiFormulas }));
      if (s?.notifications) setNotificationSettings(prev => ({ ...prev, ...s.notifications }));
      if (s?.permissions) setPermissions(prev => ({ ...prev, ...s.permissions }));
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', {
        general: generalSettings,
        kpiFormulas,
        notifications: notificationSettings,
        permissions,
      });
      toast.success('Sozlamalar saqlandi');
    } catch {
      toast.error('Saqlashda xatolik');
    }
    setSaving(false);
  };

  const tabs = [
    { key: 'general', label: 'Umumiy', icon: Settings },
    { key: 'kpi', label: 'KPI formulalari', icon: Sliders },
    { key: 'permissions', label: 'Ruxsatlar', icon: Shield },
    { key: 'notifications', label: 'Bildirishnomalar', icon: Bell },
  ];

  const allModules = ['dashboard', 'youth', 'appeals', 'tasks', 'problems', 'reports', 'kpi', 'users', 'regions', 'districts', 'mahallas', 'news', 'events', 'surveys', 'notifications', 'audit-logs', 'settings', 'imports', 'analytics'];
  const moduleLabels: Record<string, string> = {
    dashboard: 'Boshqaruv paneli', youth: 'Yoshlar', appeals: 'Murojaatlar', tasks: 'Vazifalar',
    problems: 'Muammolar', reports: 'Hisobotlar', kpi: 'KPI', users: 'Foydalanuvchilar',
    regions: 'Viloyatlar', districts: 'Tumanlar', mahallas: 'Mahallalar', news: 'Yangiliklar',
    events: 'Tadbirlar', surveys: 'So\'rovnomalar', notifications: 'Bildirishnomalar', 'audit-logs': 'Audit log',
    settings: 'Sozlamalar', imports: 'Import', analytics: 'Analitika',
  };

  const togglePermission = (role: string, module: string) => {
    if (role === 'SUPER_ADMIN') return;
    setPermissions(prev => {
      const current = prev[role] || [];
      if (current.includes(module)) {
        return { ...prev, [role]: current.filter(m => m !== module) };
      }
      return { ...prev, [role]: [...current, module] };
    });
  };

  const totalWeight = kpiFormulas.appealsWeight + kpiFormulas.tasksWeight + kpiFormulas.youthWeight + kpiFormulas.problemsWeight;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sozlamalar</h1>
          <p className="text-sm text-gray-500 mt-1">Tizim konfiguratsiyasi</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Saqlash
        </button>
      </div>

      <div className="flex gap-6">
        <div className="w-56 shrink-0">
          <nav className="space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.key ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                  <Icon className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 bg-white rounded-lg border p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Globe className="w-5 h-5" /> Umumiy sozlamalar
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tizim nomi</label>
                  <input type="text" value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings(p => ({ ...p, siteName: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Til</label>
                  <select value={generalSettings.defaultLanguage}
                    onChange={(e) => setGeneralSettings(p => ({ ...p, defaultLanguage: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="uz">O'zbekcha</option>
                    <option value="ru">Русский</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vaqt zonasi</label>
                  <select value={generalSettings.timezone}
                    onChange={(e) => setGeneralSettings(p => ({ ...p, timezone: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="Asia/Tashkent">Asia/Tashkent (UTC+5)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
                  <textarea value={generalSettings.siteDescription}
                    onChange={(e) => setGeneralSettings(p => ({ ...p, siteDescription: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`relative w-10 h-5 rounded-full transition-colors ${generalSettings.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'}`}
                      onClick={() => setGeneralSettings(p => ({ ...p, maintenanceMode: !p.maintenanceMode }))}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${generalSettings.maintenanceMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Texnik ishlar rejimi</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'kpi' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Sliders className="w-5 h-5" /> KPI formulalari
              </h2>
              <p className="text-sm text-gray-500">Har bir ko'rsatkichning umumiy ballga ta'sirini belgilang. Jami: {totalWeight}% {totalWeight !== 100 && <span className="text-red-500">(100% bo'lishi kerak!)</span>}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Murojaatlar vaznligi (%)</label>
                  <input type="number" min={0} max={100} value={kpiFormulas.appealsWeight}
                    onChange={(e) => setKpiFormulas(p => ({ ...p, appealsWeight: +e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                  <div className="mt-1 h-2 bg-gray-200 rounded-full"><div className="h-2 bg-blue-500 rounded-full" style={{ width: `${kpiFormulas.appealsWeight}%` }} /></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vazifalar vaznligi (%)</label>
                  <input type="number" min={0} max={100} value={kpiFormulas.tasksWeight}
                    onChange={(e) => setKpiFormulas(p => ({ ...p, tasksWeight: +e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                  <div className="mt-1 h-2 bg-gray-200 rounded-full"><div className="h-2 bg-green-500 rounded-full" style={{ width: `${kpiFormulas.tasksWeight}%` }} /></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Yoshlar jalb qilish vaznligi (%)</label>
                  <input type="number" min={0} max={100} value={kpiFormulas.youthWeight}
                    onChange={(e) => setKpiFormulas(p => ({ ...p, youthWeight: +e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                  <div className="mt-1 h-2 bg-gray-200 rounded-full"><div className="h-2 bg-purple-500 rounded-full" style={{ width: `${kpiFormulas.youthWeight}%` }} /></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Muammolar hal qilish vaznligi (%)</label>
                  <input type="number" min={0} max={100} value={kpiFormulas.problemsWeight}
                    onChange={(e) => setKpiFormulas(p => ({ ...p, problemsWeight: +e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                  <div className="mt-1 h-2 bg-gray-200 rounded-full"><div className="h-2 bg-orange-500 rounded-full" style={{ width: `${kpiFormulas.problemsWeight}%` }} /></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimal ball</label>
                  <input type="number" min={0} value={kpiFormulas.minScore}
                    onChange={(e) => setKpiFormulas(p => ({ ...p, minScore: +e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maksimal ball</label>
                  <input type="number" min={0} value={kpiFormulas.maxScore}
                    onChange={(e) => setKpiFormulas(p => ({ ...p, maxScore: +e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5" /> Rol ruxsatlari
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Modul</th>
                      {Object.keys(permissions).filter(r => r !== 'SUPER_ADMIN').map(role => (
                        <th key={role} className="px-2 py-2 text-center font-medium text-gray-500 text-xs">
                          {roleLabels[role] || role}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {allModules.map(mod => (
                      <tr key={mod} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-700">{moduleLabels[mod]}</td>
                        {Object.keys(permissions).filter(r => r !== 'SUPER_ADMIN').map(role => (
                          <td key={role} className="px-2 py-2 text-center">
                            <input type="checkbox"
                              checked={(permissions[role] || []).includes(mod)}
                              onChange={() => togglePermission(role, mod)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5" /> Bildirishnoma sozlamalari
              </h2>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Kanallar</h3>
                {[
                  { key: 'emailEnabled', label: 'Email bildirishnomalar' },
                  { key: 'telegramEnabled', label: 'Telegram bildirishnomalar' },
                  { key: 'pushEnabled', label: 'Push bildirishnomalar' },
                ].map(item => (
                  <label key={item.key} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-700">{item.label}</span>
                    <div className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors ${
                      notificationSettings[item.key as keyof typeof notificationSettings] ? 'bg-blue-500' : 'bg-gray-300'
                    }`} onClick={() => setNotificationSettings(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        notificationSettings[item.key as keyof typeof notificationSettings] ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </div>
                  </label>
                ))}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Hodisalar</h3>
                  {[
                    { key: 'newAppealNotify', label: 'Yangi murojaat' },
                    { key: 'taskDeadlineNotify', label: 'Vazifa muddati yaqinlashganda' },
                    { key: 'kpiReportNotify', label: 'KPI hisoboti tayyor' },
                    { key: 'systemAlertNotify', label: 'Tizim ogohlantirishlari' },
                  ].map(item => (
                    <label key={item.key} className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-700">{item.label}</span>
                      <div className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors ${
                        notificationSettings[item.key as keyof typeof notificationSettings] ? 'bg-blue-500' : 'bg-gray-300'
                      }`} onClick={() => setNotificationSettings(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          notificationSettings[item.key as keyof typeof notificationSettings] ? 'translate-x-5' : 'translate-x-0.5'
                        }`} />
                      </div>
                    </label>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Jadval</h3>
                  {[
                    { key: 'dailyDigest', label: 'Kunlik xulosa' },
                    { key: 'weeklyReport', label: 'Haftalik hisobot' },
                  ].map(item => (
                    <label key={item.key} className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-700">{item.label}</span>
                      <div className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors ${
                        notificationSettings[item.key as keyof typeof notificationSettings] ? 'bg-blue-500' : 'bg-gray-300'
                      }`} onClick={() => setNotificationSettings(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          notificationSettings[item.key as keyof typeof notificationSettings] ? 'translate-x-5' : 'translate-x-0.5'
                        }`} />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
