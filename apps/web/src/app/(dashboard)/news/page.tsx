'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Newspaper, Plus, Pencil, Trash2, Eye, EyeOff, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  type: string;
  isPublished: boolean;
  imageUrl?: string;
  regionId?: number;
  region?: { nameUz: string };
  createdAt: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('NEWS');

  const fetchNews = async () => {
    try {
      const { data } = await api.get('/news');
      setNews(data.data || []);
    } catch {
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/news/${editing.id}`, { title, content, type });
        toast.success('Yangilandi');
      } else {
        await api.post('/news', { title, content, type });
        toast.success('Qo\'shildi');
      }
      setShowForm(false);
      setEditing(null);
      setTitle('');
      setContent('');
      fetchNews();
    } catch {
      toast.error('Xatolik');
    }
  };

  const togglePublish = async (item: NewsItem) => {
    try {
      await api.put(`/news/${item.id}`, { isPublished: !item.isPublished });
      fetchNews();
    } catch {
      toast.error('Xatolik');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('O\'chirmoqchimisiz?')) return;
    try {
      await api.delete(`/news/${id}`);
      toast.success('O\'chirildi');
      fetchNews();
    } catch {
      toast.error('Xatolik');
    }
  };

  const typeLabels: Record<string, string> = {
    NEWS: 'Yangilik',
    ANNOUNCEMENT: 'E\'lon',
    GRANT: 'Grant/Tanlov',
    JOB: 'Ish o\'rni',
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Yuklanmoqda...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Yangiliklar va e&apos;lonlar</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setTitle(''); setContent(''); setType('NEWS'); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Qo'shish
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">{editing ? 'Tahrirlash' : 'Yangi yangilik'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sarlavha</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Turi</label>
                <select value={type} onChange={(e) => setType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matn</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Saqlash</button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">Bekor qilish</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.map((item) => (
          <div key={item.id} className="bg-white border rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                item.type === 'NEWS' ? 'bg-blue-100 text-blue-700' :
                item.type === 'GRANT' ? 'bg-green-100 text-green-700' :
                item.type === 'JOB' ? 'bg-purple-100 text-purple-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {typeLabels[item.type] || item.type}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => togglePublish(item)} className="p-1 text-gray-400 hover:text-blue-600 rounded">
                  {item.isPublished ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => { setEditing(item); setTitle(item.title); setContent(item.content); setType(item.type); setShowForm(true); }}
                  className="p-1 text-gray-400 hover:text-blue-600 rounded"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)}
                  className="p-1 text-gray-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-3 mb-3">{item.content}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              {item.createdAt ? format(new Date(item.createdAt), 'dd.MM.yyyy') : '-'}
              {!item.isPublished && <span className="ml-auto text-yellow-600 font-medium">Draft</span>}
            </div>
          </div>
        ))}
      </div>
      {news.length === 0 && <div className="text-center py-10 text-gray-400">Yangiliklar topilmadi</div>}
    </div>
  );
}
