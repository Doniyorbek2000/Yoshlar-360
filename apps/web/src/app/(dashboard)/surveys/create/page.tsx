'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';

const questionTypes = [
  { value: 'TEXT', label: 'Matn' },
  { value: 'SINGLE_CHOICE', label: 'Bitta tanlov' },
  { value: 'MULTIPLE_CHOICE', label: 'Ko\'p tanlov' },
  { value: 'RATING', label: 'Baho (1-5)' },
  { value: 'NUMBER', label: 'Raqam' },
];

interface Question {
  text: string;
  type: string;
  required: boolean;
  options: string[];
  order: number;
}

export default function CreateSurveyPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { text: '', type: 'TEXT', required: true, options: [], order: 1 },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, {
      text: '', type: 'TEXT', required: false, options: [], order: questions.length + 1,
    }]);
  };

  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx).map((q, i) => ({ ...q, order: i + 1 })));
  };

  const updateQuestion = (idx: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    (updated[idx] as any)[field] = value;
    if (field === 'type' && !['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(value)) {
      updated[idx].options = [];
    }
    if (field === 'type' && ['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(value) && updated[idx].options.length === 0) {
      updated[idx].options = ['', ''];
    }
    setQuestions(updated);
  };

  const addOption = (qIdx: number) => {
    const updated = [...questions];
    updated[qIdx].options.push('');
    setQuestions(updated);
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    const updated = [...questions];
    if (updated[qIdx].options.length <= 2) return;
    updated[qIdx].options = updated[qIdx].options.filter((_, i) => i !== oIdx);
    setQuestions(updated);
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('So\'rovnoma nomini kiriting');
      return;
    }
    const hasEmptyQ = questions.some(q => !q.text.trim());
    if (hasEmptyQ) {
      toast.error('Barcha savollarni to\'ldiring');
      return;
    }
    const hasEmptyOpts = questions.some(q =>
      ['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(q.type) && q.options.some(o => !o.trim())
    );
    if (hasEmptyOpts) {
      toast.error('Barcha variantlarni to\'ldiring');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/surveys', {
        title: title.trim(),
        description: description.trim(),
        ...(startDate && { startsAt: new Date(startDate).toISOString() }),
        ...(endDate && { endsAt: new Date(endDate).toISOString() }),
        questions: questions.map(q => ({
          text: q.text.trim(),
          type: q.type,
          isRequired: q.required,
          orderIndex: q.order,
          ...(q.options.length > 0 && { options: q.options.map(o => o.trim()) }),
        })),
      });
      toast.success('So\'rovnoma yaratildi');
      router.push('/surveys');
    } catch {
      toast.error('So\'rovnoma yaratishda xatolik');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Yangi so'rovnoma</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomi *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
              placeholder="So'rovnoma nomi"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              placeholder="So'rovnoma maqsadi va ko'rsatmalar..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Boshlanish sanasi</label>
              <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tugash sanasi</label>
              <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Savollar</h2>
            <button type="button" onClick={addQuestion}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100">
              <Plus className="w-4 h-4" /> Savol qo'shish
            </button>
          </div>

          {questions.map((q, qIdx) => (
            <div key={qIdx} className="bg-white border rounded-lg p-5 space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
                  {qIdx + 1}
                </span>
                <div className="flex-1 space-y-3">
                  <input type="text" value={q.text} onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)}
                    placeholder="Savol matnini kiriting..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />

                  <div className="flex flex-wrap items-center gap-3">
                    <select value={q.type} onChange={(e) => updateQuestion(qIdx, 'type', e.target.value)}
                      className="px-3 py-1.5 border rounded-lg text-sm">
                      {questionTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input type="checkbox" checked={q.required} onChange={(e) => updateQuestion(qIdx, 'required', e.target.checked)}
                        className="rounded border-gray-300" />
                      Majburiy
                    </label>
                  </div>

                  {['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(q.type) && (
                    <div className="space-y-2 pl-4 border-l-2 border-blue-200">
                      <p className="text-xs text-gray-500 font-medium">Variantlar:</p>
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-5">{oIdx + 1}.</span>
                          <input type="text" value={opt} onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                            placeholder={`Variant ${oIdx + 1}`}
                            className="flex-1 border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                          <button type="button" onClick={() => removeOption(qIdx, oIdx)}
                            className="p-1 text-gray-400 hover:text-red-500" title="O'chirish">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addOption(qIdx)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                        + Variant qo'shish
                      </button>
                    </div>
                  )}
                </div>

                <button type="button" onClick={() => removeQuestion(qIdx)}
                  className="p-1.5 text-gray-400 hover:text-red-500 shrink-0" title="Savolni o'chirish">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting}
            className="bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
            {submitting ? 'Yaratilmoqda...' : 'Yaratish'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="bg-gray-200 text-gray-700 px-8 py-2.5 rounded-lg hover:bg-gray-300 font-medium">
            Bekor qilish
          </button>
        </div>
      </form>
    </div>
  );
}
