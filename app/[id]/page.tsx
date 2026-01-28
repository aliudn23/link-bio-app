'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';

interface Link {
  id: string;
  title: string;
  url: string;
  order: number;
}

interface PublicUser {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
  darkMode?: boolean;
  themeColor?: string;
  links: Link[];
}

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = use(params);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      fetchPublicProfile();
    }
  }, [userId]);

  const fetchPublicProfile = async () => {
    try {
      const response = await fetch(`/api/public/${userId}`);

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setError('User not found');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const trackClick = async (linkId: string) => {
    try {
      await fetch(`/api/links/${linkId}/track`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  };

  const handleLinkClick = (link: Link) => {
    trackClick(link.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-6xl font-bold text-slate-800 mb-4">404</h1>
          <p className="text-lg text-slate-600 mb-2">Profile Not Found</p>
          <p className="text-sm text-slate-500">{error || 'This profile does not exist'}</p>
        </div>
      </div>
    );
  }

  const isDark = user.darkMode || false;
  const themeColor = user.themeColor || '#3B82F6';

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      <style jsx>{`
        .theme-gradient {
          background: linear-gradient(135deg, ${themeColor}E6 0%, ${themeColor}B3 100%);
        }
        .theme-link {
          transition: all 0.2s ease;
        }
        .theme-link:hover {
          box-shadow: 0 8px 30px ${themeColor}40;
          transform: translateY(-2px);
        }
        .theme-border:hover {
          border-color: ${themeColor};
        }
      `}</style>

      <div className="max-w-2xl mx-auto">
        {/* Profile Card */}
        <div className={`rounded-3xl shadow-2xl overflow-hidden mb-8 backdrop-blur-sm border transition-all ${
          isDark 
            ? 'bg-slate-800/80 border-slate-700/50' 
            : 'bg-white/90 border-slate-200/50'
        }`}>
          <div className="theme-gradient h-36 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>
          </div>
          <div className="relative px-6 pb-8">
            {/* Avatar */}
            <div className="flex justify-center -mt-20 mb-6">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-32 h-32 rounded-2xl border-4 shadow-2xl object-cover ring-4 ring-white/50"
                  style={{ borderColor: isDark ? '#1E293B' : 'white' }}
                />
              ) : (
                <div 
                  className="w-32 h-32 rounded-2xl border-4 shadow-2xl flex items-center justify-center theme-gradient ring-4 ring-white/50"
                  style={{ borderColor: isDark ? '#1E293B' : 'white' }}
                >
                  <span className="text-5xl font-bold text-white drop-shadow-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Name & Bio */}
            <div className="text-center">
              <h1 className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {user.name}
              </h1>
              {user.bio && (
                <p className={`text-base max-w-md mx-auto leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {user.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-4">
          {user.links.length === 0 ? (
            <div className={`text-center py-16 rounded-3xl shadow-lg backdrop-blur-sm border ${
              isDark 
                ? 'bg-slate-800/80 border-slate-700/50' 
                : 'bg-white/90 border-slate-200/50'
            }`}>
              <svg className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <p className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No links yet
              </p>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Check back soon!
              </p>
            </div>
          ) : (
            user.links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(link)}
                className={`block w-full rounded-2xl shadow-lg backdrop-blur-sm border theme-link theme-border ${
                  isDark 
                    ? 'bg-slate-800/80 border-slate-700/50 hover:bg-slate-750/80' 
                    : 'bg-white/90 border-slate-200/50 hover:bg-white'
                }`}
              >
                <div className="p-6 text-center">
                  <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {link.title}
                  </h3>
                  <div className={`flex items-center justify-center gap-2 text-sm ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span className="truncate max-w-xs">{new URL(link.url).hostname}</span>
                  </div>
                </div>
              </a>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className={`text-sm flex items-center justify-center gap-2 ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}>
            <span>Powered by</span>
            <span className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              LinkBio
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
