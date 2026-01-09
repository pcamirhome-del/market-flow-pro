import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Bell, Package, AlertTriangle, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface NotificationsPanelProps {
  onClose: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ onClose }) => {
  const { notifications, markNotificationRead } = useData();

  const getIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'order':
        return <Package className="w-5 h-5 text-primary" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="absolute top-full left-0 mt-2 w-80 glass-card max-h-96 overflow-y-auto scrollbar-thin animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">الإشعارات</h3>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>لا توجد إشعارات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.slice(0, 10).map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg transition-colors cursor-pointer
                ${notification.read ? 'bg-white/5' : 'bg-primary/10 hover:bg-primary/20'}`}
              onClick={() => markNotificationRead(notification.id)}
            >
              <div className="flex items-start gap-3">
                {getIcon(notification.type)}
                <div className="flex-1">
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                  {notification.companyName && (
                    <p className="text-xs text-primary mt-1">شركة: {notification.companyName}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(notification.createdAt), 'dd MMMM yyyy - hh:mm a', { locale: ar })}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
