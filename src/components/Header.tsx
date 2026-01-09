import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Menu, Bell, LogOut, Palette, User } from 'lucide-react';
import NotificationsPanel from './NotificationsPanel';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { settings, notifications } = useData();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="glass h-16 px-4 flex items-center justify-between sticky top-0 z-40">
      {/* Right side - Menu and App name */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold gradient-text hidden sm:block">{settings.appName}</h1>
          <div className="hidden md:flex items-center gap-2 text-muted-foreground">
            <User className="w-4 h-4" />
            <span className="text-sm">{user?.name}</span>
          </div>
        </div>
      </div>

      {/* Center - Date and Time */}
      <div className="hidden md:flex flex-col items-center">
        <div className="text-lg font-semibold text-primary">{formatTime(currentTime)}</div>
        <div className="text-xs text-muted-foreground">{formatDate(currentTime)}</div>
      </div>

      {/* Left side - Actions */}
      <div className="flex items-center gap-2">
        {/* Style button */}
        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <Palette className="w-5 h-5 text-muted-foreground hover:text-primary" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors relative"
          >
            <Bell className="w-5 h-5 text-muted-foreground hover:text-primary" />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
          
          {showNotifications && (
            <NotificationsPanel onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2 rounded-lg hover:bg-destructive/20 transition-colors group"
        >
          <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-destructive" />
        </button>
      </div>
    </header>
  );
};

export default Header;
