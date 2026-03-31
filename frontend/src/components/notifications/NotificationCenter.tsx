import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, BellRing, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
  id: string;
  type: 'match' | 'status' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const API = import.meta.env.VITE_API_URL;

const NotificationCenter = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setNotifications(await res.json());
    } catch {
      // non-critical — silent fail
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await fetch(`${API}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch { /* silent */ }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await fetch(`${API}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch { /* silent */ }
  };

  const removeNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await fetch(`${API}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch { /* silent */ }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'match':  return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'status': return <Info className="w-4 h-4 text-blue-600" />;
      case 'system': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:       return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <Popover open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (open) fetchNotifications(); }}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          {unreadCount > 0 ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2 px-4 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-7">
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
              {notifications.length > 0 ? (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? 'bg-blue-50' : ''}`}
                    onClick={() => !n.read && markAsRead(n.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-sm font-medium text-gray-900 leading-snug">{n.title}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 shrink-0 hover:bg-gray-200 rounded"
                            onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                          >
                            <X className="w-3 h-3 text-gray-400" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 leading-snug">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
