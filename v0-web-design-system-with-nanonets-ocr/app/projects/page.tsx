'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setProjects, addProject, removeProject } from '@/store/slices/sessionSlice';
import { logout } from '@/store/slices/authSlice';
import { clearAuth, getRefreshToken } from '@/lib/auth';
import { projectsAPI, authAPI } from '@/lib/api-client';
import type { BEProject } from '@/lib/types';
import {
  Plus, Layers, LogOut, Loader2, FolderOpen, Trash2,
  LayoutGrid, Clock, X, Sparkles
} from 'lucide-react';

export default function ProjectsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const { projects } = useAppSelector((s) => s.session);

  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [error, setError] = useState('');

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setIsLoading(true);
      const res = await projectsAPI.list();
      dispatch(setProjects(res.results));
    } catch (e: any) {
      setError(e.message || 'Không thể tải projects');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateProject() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const project = await projectsAPI.create({
        name: newName.trim(),
        description: newDesc.trim() || undefined,
      });
      dispatch(addProject(project));
      setShowCreate(false);
      setNewName('');
      setNewDesc('');
      router.push(`/projects/${project.id}`);
    } catch (e: any) {
      setError(e.message || 'Tạo project thất bại');
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteProject(projectId: string) {
    if (!confirm('Bạn có chắc chắn muốn xóa dự án này? Mọi màn hình và phiên bản thiết kế liên quan sẽ bị xóa vĩnh viễn.')) {
      return;
    }
    try {
      await projectsAPI.delete(projectId);
      dispatch(removeProject(projectId));
    } catch (e: any) {
      setError(e.message || 'Xóa dự án thất bại');
    }
  }

  async function handleLogout() {
    try {
      const refresh = getRefreshToken();
      if (refresh) await authAPI.logout(refresh);
    } catch {}
    clearAuth();
    dispatch(logout());
    router.replace('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">UIBuilder</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-white text-sm font-medium">
                {user?.first_name} {user?.last_name}
              </div>
              <div className="text-slate-400 text-xs">{user?.email}</div>
            </div>
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.first_name?.[0] || 'U'}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Page title + create button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Dự án của bạn</h1>
            <p className="text-slate-400 text-sm mt-1">{projects.length} dự án</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tạo dự án mới
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center justify-between">
            {error}
            <button onClick={() => setError('')} className="cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-4">
              <FolderOpen className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-white text-xl font-semibold mb-2">Chưa có dự án nào</h2>
            <p className="text-slate-400 text-sm mb-6">Tạo dự án đầu tiên để bắt đầu thiết kế</p>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:from-indigo-500 hover:to-violet-500 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Tạo dự án đầu tiên
            </button>
          </div>
        ) : (
          /* Projects grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => router.push(`/projects/${project.id}`)}
                onDelete={() => handleDeleteProject(project.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create project modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-semibold">Tạo dự án mới</h2>
              <button
                onClick={() => { setShowCreate(false); setNewName(''); setNewDesc(''); }}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tên dự án *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                  placeholder="VD: Website bán hàng"
                  autoFocus
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Mô tả (tuỳ chọn)</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Mô tả ngắn về dự án..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowCreate(false); setNewName(''); setNewDesc(''); }}
                className="flex-1 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                Huỷ
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newName.trim() || creating}
                className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2 hover:from-indigo-500 hover:to-violet-500 transition-all cursor-pointer"
              >
                {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang tạo...</> : 'Tạo dự án'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ProjectCardProps {
  project: BEProject;
  onClick: () => void;
  onDelete: () => void;
}

function ProjectCard({ project, onClick, onDelete }: ProjectCardProps) {
  return (
    <div
      className="group relative flex flex-col justify-between bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 hover:border-indigo-500/40 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10 min-h-[220px]"
    >
      <div onClick={onClick} className="cursor-pointer flex-1">
        {/* Thumbnail placeholder */}
        <div className="w-full h-28 bg-gradient-to-br from-indigo-600/20 to-violet-600/20 rounded-xl mb-4 flex items-center justify-center group-hover:from-indigo-600/30 group-hover:to-violet-600/30 transition-all">
          <LayoutGrid className="w-8 h-8 text-indigo-400/60" />
        </div>

        <h3 className="text-white font-semibold text-sm mb-1 truncate group-hover:text-indigo-300 transition-colors">
          {project.name}
        </h3>
        {project.description && (
          <p className="text-slate-400 text-xs line-clamp-2 h-8 overflow-hidden">{project.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 mt-4 border-t border-white/5 pt-3">
        <span className="flex items-center gap-1 cursor-pointer" onClick={onClick}>
          <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
          {project.screen_count ?? 0} {project.screen_count === 1 ? 'screen' : 'screens'}
        </span>
        
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {new Date(project.updated_at).toLocaleDateString('vi-VN')}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-all cursor-pointer"
            title="Xóa dự án"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
