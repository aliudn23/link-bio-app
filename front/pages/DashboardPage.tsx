'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Input } from '../components/Input';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Link {
  id: string;
  title: string;
  url: string;
  active: boolean;
  order: number;
  clicks?: number;
}

interface Analytics {
  totalClicks: number;
  links: any[];
  recentClicks: any[];
}

function SortableLinkItem({ link, onEdit, onDelete, onToggle }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-3 p-4 rounded-xl border transition-all duration-200 ${
        isDragging 
          ? 'bg-blue-50 border-blue-200 shadow-lg scale-105' 
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 hover:bg-slate-100 rounded-lg transition-colors group"
      >
        <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-800 truncate">{link.title}</h4>
        <p className="text-sm text-slate-500 truncate">{link.url}</p>
        {link.clicks !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
            </svg>
            <span className="text-xs text-blue-600 font-medium">{link.clicks} views</span>
          </div>
        )}
      </div>

      <span
        className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
          link.active
            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            : 'bg-slate-100 text-slate-600 border border-slate-200'
        }`}
      >
        {link.active ? 'Live' : 'Hidden'}
      </span>

      <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onToggle(link)}
          className="border-slate-200 hover:border-slate-300 text-slate-700"
        >
          {link.active ? 'Hide' : 'Show'}
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onEdit(link)}
          className="border-blue-200 hover:border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDelete(link.id)}
          className="border-red-200 hover:border-red-300 text-red-600 hover:bg-red-50"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [links, setLinks] = useState<Link[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [showAddLink, setShowAddLink] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [profile, setProfile] = useState({ 
    name: '', 
    bio: '', 
    avatar: '',
    darkMode: false,
    themeColor: '#3B82F6'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    console.log('DashboardPage - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        darkMode: (user as any).darkMode || false,
        themeColor: (user as any).themeColor || '#3B82F6'
      });
      fetchLinks();
      fetchAnalytics();
    }
  }, [user]);

  const fetchLinks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/links', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLinks(data.links || []);
      }
    } catch (error) {
      console.error('Failed to fetch links:', error);
    } finally {
      setIsLoadingLinks(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex(link => link.id === active.id);
      const newIndex = links.findIndex(link => link.id === over.id);

      const newLinks = arrayMove(links, oldIndex, newIndex);
      setLinks(newLinks);

      const reorderedLinks = newLinks.map((link, i) => ({
        id: link.id,
        order: i
      }));

      try {
        const token = localStorage.getItem('token');
        await fetch('/api/links/reorder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ links: reorderedLinks })
        });
      } catch (error) {
        console.error('Failed to reorder links:', error);
        fetchLinks();
      }
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newLink.title || !newLink.url) {
      setError('Title and URL are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newLink)
      });

      if (response.ok) {
        setSuccess('Link added successfully!');
        setNewLink({ title: '', url: '' });
        setShowAddLink(false);
        fetchLinks();
        fetchAnalytics();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add link');
      }
    } catch (error) {
      setError('Failed to add link');
    }
  };

  const handleUpdateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;

    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/links/${editingLink.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editingLink.title,
          url: editingLink.url
        })
      });

      if (response.ok) {
        setSuccess('Link updated successfully!');
        setEditingLink(null);
        fetchLinks();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update link');
      }
    } catch (error) {
      setError('Failed to update link');
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/links/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess('Link deleted successfully!');
        fetchLinks();
        fetchAnalytics();
      } else {
        setError('Failed to delete link');
      }
    } catch (error) {
      setError('Failed to delete link');
    }
  };

  const handleToggleActive = async (link: Link) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/links/${link.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: !link.active })
      });

      if (response.ok) {
        fetchLinks();
      }
    } catch (error) {
      setError('Failed to toggle link');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        setSuccess('Profile updated successfully!');
        setShowEditProfile(false);
        window.location.reload();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const themeColor = profile.themeColor || '#3B82F6';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      profile.darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      <style jsx global>{`
        :root {
          --theme-color: ${themeColor};
        }
      `}</style>

      <header className={`backdrop-blur-sm border-b sticky top-0 z-10 transition-colors ${
        profile.darkMode 
          ? 'bg-slate-800/80 border-slate-700/50' 
          : 'bg-white/80 border-slate-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h1 className={`text-xl font-bold ${profile.darkMode ? 'text-white' : 'text-slate-800'}`}>
                Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href={`/${user.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  profile.darkMode 
                    ? 'text-blue-400 hover:bg-slate-700' 
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
                title="View Public Profile"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="hidden sm:inline">View Profile</span>
              </a>
              <span className={`text-sm hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                profile.darkMode 
                  ? 'text-slate-300 bg-slate-700/50' 
                  : 'text-slate-700 bg-slate-100'
              }`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
                {user.name}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className={profile.darkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300'}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 px-5 py-4 rounded-xl flex items-start gap-3 shadow-sm">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-5 py-4 rounded-xl flex items-start gap-3 shadow-sm">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{success}</span>
            </div>
          )}

          {/* Analytics Section */}
          {analytics && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className={`border-none shadow-lg transition-all hover:shadow-xl ${
                profile.darkMode 
                  ? 'bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm' 
                  : 'bg-gradient-to-br from-blue-50 to-blue-100/50'
              }`}>
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      profile.darkMode ? 'bg-blue-500/20' : 'bg-blue-500/10'
                    }`}>
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${profile.darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                        Total Views
                      </p>
                      <p className={`text-3xl font-bold ${profile.darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {analytics.totalClicks.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className={`border-none shadow-lg transition-all hover:shadow-xl ${
                profile.darkMode 
                  ? 'bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm' 
                  : 'bg-gradient-to-br from-purple-50 to-purple-100/50'
              }`}>
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      profile.darkMode ? 'bg-purple-500/20' : 'bg-purple-500/10'
                    }`}>
                      <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                      </svg>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${profile.darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                        Total Links
                      </p>
                      <p className={`text-3xl font-bold ${profile.darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {links.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className={`border-none shadow-lg transition-all hover:shadow-xl ${
                profile.darkMode 
                  ? 'bg-gradient-to-br from-emerald-900/40 to-emerald-800/40 backdrop-blur-sm' 
                  : 'bg-gradient-to-br from-emerald-50 to-emerald-100/50'
              }`}>
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      profile.darkMode ? 'bg-emerald-500/20' : 'bg-emerald-500/10'
                    }`}>
                      <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${profile.darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                        Active Links
                      </p>
                      <p className={`text-3xl font-bold ${profile.darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {links.filter(l => l.active).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className={`border-none shadow-lg ${
                profile.darkMode 
                  ? 'bg-slate-800/50 backdrop-blur-sm' 
                  : 'bg-white'
              }`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${profile.darkMode ? 'text-white' : 'text-slate-800'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!showEditProfile ? (
                    <div className="space-y-4">
                      {user.avatar && (
                        <div className="flex justify-center">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-24 h-24 rounded-full object-cover"
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <p className={`text-sm ${profile.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <strong>Name:</strong> {user.name}
                        </p>
                        <p className={`text-sm ${profile.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <strong>Email:</strong> {user.email}
                        </p>
                        {user.bio && (
                          <p className={`text-sm ${profile.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <strong>Bio:</strong> {user.bio}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 pt-2">
                          <span className={`text-sm ${profile.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <strong>Dark Mode:</strong>
                          </span>
                          <span className={`text-sm ${profile.darkMode ? 'text-green-400' : 'text-gray-600'}`}>
                            {profile.darkMode ? 'On' : 'Off'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${profile.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <strong>Theme Color:</strong>
                          </span>
                          <div
                            className="w-6 h-6 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: themeColor }}
                          ></div>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowEditProfile(true)}
                        size="sm"
                        variant="outline"
                        fullWidth
                      >
                        Edit Settings
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <Input
                        label="Name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        fullWidth
                      />
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${profile.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Bio
                        </label>
                        <textarea
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            profile.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                          }`}
                          rows={3}
                        />
                      </div>
                      <Input
                        label="Avatar URL"
                        value={profile.avatar}
                        onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                        fullWidth
                      />
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${profile.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Theme Color
                        </label>
                        <input
                          type="color"
                          value={profile.themeColor}
                          onChange={(e) => setProfile({ ...profile, themeColor: e.target.value })}
                          className="w-full h-10 rounded cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="darkMode"
                          checked={profile.darkMode}
                          onChange={(e) => setProfile({ ...profile, darkMode: e.target.checked })}
                          className="w-4 h-4 rounded"
                        />
                        <label htmlFor="darkMode" className={`text-sm ${profile.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Enable Dark Mode
                        </label>
                      </div>
                      <div className="flex space-x-2">
                        <Button type="submit" size="sm" fullWidth>
                          Save
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setShowEditProfile(false)}
                          size="sm"
                          variant="outline"
                          fullWidth
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className={profile.darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className={profile.darkMode ? 'text-white' : ''}>
                      My Links ({links.length})
                    </CardTitle>
                    <Button size="sm" onClick={() => setShowAddLink(!showAddLink)}>
                      {showAddLink ? 'Cancel' : '+ Add Link'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {showAddLink && (
                    <form onSubmit={handleAddLink} className={`mb-6 p-4 rounded-lg ${profile.darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h3 className={`font-medium mb-4 ${profile.darkMode ? 'text-white' : ''}`}>Add New Link</h3>
                      <div className="space-y-4">
                        <Input
                          label="Title"
                          value={newLink.title}
                          onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                          placeholder="My Website"
                          fullWidth
                        />
                        <Input
                          label="URL"
                          value={newLink.url}
                          onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                          placeholder="https://example.com"
                          fullWidth
                        />
                        <Button type="submit" size="sm">
                          Add Link
                        </Button>
                      </div>
                    </form>
                  )}

                  {editingLink && (
                    <form onSubmit={handleUpdateLink} className={`mb-6 p-4 rounded-lg ${profile.darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h3 className={`font-medium mb-4 ${profile.darkMode ? 'text-white' : ''}`}>Edit Link</h3>
                      <div className="space-y-4">
                        <Input
                          label="Title"
                          value={editingLink.title}
                          onChange={(e) =>
                            setEditingLink({ ...editingLink, title: e.target.value })
                          }
                          fullWidth
                        />
                        <Input
                          label="URL"
                          value={editingLink.url}
                          onChange={(e) =>
                            setEditingLink({ ...editingLink, url: e.target.value })
                          }
                          fullWidth
                        />
                        <div className="flex space-x-2">
                          <Button type="submit" size="sm">
                            Update
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setEditingLink(null)}
                            size="sm"
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </form>
                  )}

                  {isLoadingLinks ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : links.length === 0 ? (
                    <div className={`text-center py-8 ${profile.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No links yet. Click "Add Link" to get started!
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={links.map(link => link.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3">
                          {links.map((link) => (
                            <SortableLinkItem
                              key={link.id}
                              link={link}
                              onEdit={setEditingLink}
                              onDelete={handleDeleteLink}
                              onToggle={handleToggleActive}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
