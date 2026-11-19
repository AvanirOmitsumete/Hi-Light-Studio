import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { ADMIN_STATION_LINKS, ROLE_DEFAULT_ROUTE, STUDIO_INFO } from '../constants/studio';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  queueCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, queueCount = 0 }) => {
  const { user, logout } = useAuth();
  const stations = user?.role === 'admin' ? ADMIN_STATION_LINKS
    : ADMIN_STATION_LINKS.filter((station) => user && station.id === ROLE_DEFAULT_ROUTE[user.role]);

  const handleSignOut = () => {
    logout();
    onSelectTab('login');
  };

  const handleMastheadClick = () => {
    if (!user) {
      onSelectTab('register');
      return;
    }
    onSelectTab(ROLE_DEFAULT_ROUTE[user.role] || 'register');
  };

  return (
    <header
      role="banner"
      className="theme-night no-print relative bg-obsidian text-white sticky top-0 z-40 shadow-[0_10px_30px_-18px_rgb(212_175_55/0.45)]"
    >
      <div aria-hidden="true" className="gold-rule absolute inset-x-0 bottom-0" />
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Studio Masthead Identity */}
          <button
            type="button"
            onClick={handleMastheadClick}
            className="flex min-w-0 items-center gap-2 sm:gap-3.5 text-left group focus:outline-none cursor-pointer"
          >
            <img
              src="/logo/hi-light-gold.jpg"
              alt={STUDIO_INFO.shortCode}
              className="h-12 w-auto shrink-0 mix-blend-lighten transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <div className="hidden min-[420px]:block border-l border-gold/25 pl-3">
              <div className="flex items-center gap-2.5">
                <span className="font-display font-semibold text-sm sm:text-base tracking-[0.18em] uppercase text-foil">
                  Hi-Light Studio
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest text-neutral-500 border-l border-neutral-800 pl-2.5">
                  {STUDIO_INFO.shortAddress}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 tracking-wider uppercase">
                <span className="w-1.5 h-1.5 bg-gold inline-block animate-status-pulse" />
                <span>LAN System Online</span>
                {queueCount > 0 && user && (
                  <span className="text-gold font-bold">• {queueCount} Active in Queue</span>
                )}
              </div>
            </div>
          </button>

          {/* Right Side: Minimal Staff Session or Single Login Trigger */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user && (
              <div className="flex items-center gap-2 sm:gap-3">
                {stations.length > 0 && (
                  <nav aria-label="Staff stations" className="hidden lg:flex items-center border border-neutral-800 bg-obsidian-2">
                    {stations.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => onSelectTab(st.id)}
                        className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors cursor-pointer ${currentTab === st.id
                            ? 'bg-gold text-on-gold'
                            : 'text-neutral-400 hover:text-white'
                          }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </nav>
                )}

                <div className="flex items-center gap-2.5 border border-neutral-800 bg-obsidian-2 px-3 py-1.5">
                  <div className="text-right">
                    <div className="max-w-[27vw] sm:max-w-40 truncate text-xs font-bold text-white leading-none">{user.name}</div>
                    <div className="text-[9px] font-mono font-bold text-gold uppercase tracking-widest mt-1">
                      ROLE // {user.role}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    title="Sign out"
                    className="btn-tactile ml-1 px-2.5 py-1.5 bg-obsidian hover:bg-panel text-neutral-300 hover:text-ink border border-neutral-700 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span className="hidden sm:inline">Exit</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Admin Station Bar */}
        {stations.length > 0 && (
          <nav aria-label="Staff stations" className="grid grid-cols-3 sm:flex lg:hidden border-t border-neutral-800 bg-obsidian-2 py-1.5 gap-1">
            {stations.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => onSelectTab(st.id)}
                className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors ${
                  currentTab === st.id ? 'bg-gold text-on-gold' : 'text-neutral-400'
                }`}
              >
                {st.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};
