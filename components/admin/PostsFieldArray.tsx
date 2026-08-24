'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { adminApi } from '@/features/admin/api';
import PostQualificationCascade from './PostQualificationCascade';

export interface PostDraft {
  id?: string;
  title: string;
  vacancies: string;
  qualificationCategorySlug: string;
  qualificationId: string;
  branchIds: string[];
  minAge: string;
  maxAge: string;
  payScale: string;
  employmentType: string;
  roleId: string;
}

interface RoleOption { id: string; name: string; }

interface PostsFieldArrayProps {
  posts: PostDraft[];
  onChange: (posts: PostDraft[]) => void;
}

const EMPLOYMENT_TYPES = [
  { value: 'PERMANENT', label: 'Permanent' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'APPRENTICE', label: 'Apprentice' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'TEMPORARY', label: 'Temporary' },
  { value: 'DEPUTATION', label: 'Deputation' },
];

export const emptyPost: PostDraft = {
  title: '', vacancies: '', qualificationCategorySlug: '', qualificationId: '', branchIds: [],
  minAge: '18', maxAge: '21', payScale: '', employmentType: 'PERMANENT', roleId: '',
};

export default function PostsFieldArray({ posts, onChange }: PostsFieldArrayProps) {
  const [roles, setRoles] = useState<RoleOption[]>([]);

  useEffect(() => {
    adminApi.list<RoleOption>('roles').then(setRoles).catch(() => {});
  }, []);

  const updatePost = (index: number, key: keyof PostDraft, value: any) => {
    const next = [...posts];
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  };

  const updatePostFields = (index: number, updates: Partial<PostDraft>) => {
    const next = [...posts];
    next[index] = { ...next[index], ...updates };
    onChange(next);
  };

  const addPost = () => onChange([...posts, { ...emptyPost }]);
  const removePost = (index: number) => onChange(posts.filter((_, i) => i !== index));

  return (
    <div className="md:col-span-2 border-t border-neutral-100 pt-5 mt-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-neutral-900">Posts</p>
        <Button type="button" variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addPost}>
          Add Post
        </Button>
      </div>

      {posts.length === 0 && (
        <p className="text-xs text-neutral-400 mb-3">No posts added yet. Click "Add Post" to add one.</p>
      )}

      <div className="space-y-4">
        {posts.map((post, index) => (
          <div key={index} className="border border-neutral-200 rounded-lg p-4 relative">
            <button
              type="button"
              onClick={() => removePost(index)}
              className="absolute top-3 right-3 text-neutral-400 hover:text-danger"
            >
              <Trash2 size={14} />
            </button>

            <div className="grid md:grid-cols-2 gap-3 pr-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-neutral-600 mb-1">Post Title</label>
                <input
                  type="text"
                  value={post.title}
                  onChange={(e) => updatePost(index, 'title', e.target.value)}
                  placeholder="e.g. Junior Engineer (Civil)"
                  className="w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Vacancies</label>
                <input
                  type="number"
                  value={post.vacancies}
                  onChange={(e) => updatePost(index, 'vacancies', e.target.value)}
                  className="w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Employee Role</label>
                <select
                  value={post.roleId}
                  onChange={(e) => updatePost(index, 'roleId', e.target.value)}
                  className="w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
                >
                  <option value="">Select...</option>
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Employment Type</label>
                <select
                  value={post.employmentType}
                  onChange={(e) => updatePost(index, 'employmentType', e.target.value)}
                  className="w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
                >
                  {EMPLOYMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <PostQualificationCascade
                qualificationCategorySlug={post.qualificationCategorySlug}
                qualificationId={post.qualificationId}
                branchIds={post.branchIds}
                onCascadeChange={(updates) => updatePostFields(index, updates)}
              />

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Pay Scale</label>
                <input
                  type="text"
                  value={post.payScale}
                  onChange={(e) => updatePost(index, 'payScale', e.target.value)}
                  placeholder="e.g. Level 6"
                  className="w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Min Age</label>
                  <input
                    type="number"
                    value={post.minAge}
                    onChange={(e) => updatePost(index, 'minAge', e.target.value)}
                    className="w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Max Age</label>
                  <input
                    type="number"
                    value={post.maxAge}
                    onChange={(e) => updatePost(index, 'maxAge', e.target.value)}
                    className="w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
