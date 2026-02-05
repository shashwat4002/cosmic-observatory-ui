import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Clock,
  Trophy,
  MessageSquare,
  FileText,
  Calendar,
  Bell
} from "lucide-react";
import { Notification } from "@/hooks/use-dashboard-data";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

type Props = {
  notifications: Notification[];
  isLoading: boolean;
};

const notificationIcons: Record<string, typeof Trophy> = {
  MILESTONE_COMPLETED: Trophy,
  MENTOR_FEEDBACK: MessageSquare,
  MATCH_REQUEST: Bell,
  COMMUNITY_REPLY: MessageSquare,
  RESOURCE_RECOMMENDATION: FileText,
  SYSTEM: Bell,
};

export const ActivityFeed = ({ notifications, isLoading }: Props) => {
  const recentNotifications = notifications.slice(0, 5);

  if (isLoading) {
    return (
      <Card className="glass border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-secondary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted/50 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-muted/50 rounded animate-pulse" />
                <div className="h-3 w-1/4 bg-muted/30 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (recentNotifications.length === 0) {
    return (
      <Card className="glass border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-secondary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/30 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No recent activity yet. Start working on your research to see updates here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-secondary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentNotifications.map((notification) => {
          const Icon = notificationIcons[notification.type] || Bell;
          const isUnread = !notification.readAt;
          
          return (
            <div 
              key={notification.id} 
              className={cn(
                "flex items-start gap-3 p-2 -mx-2 rounded-lg transition-colors",
                isUnread && "bg-primary/5"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg",
                isUnread ? "bg-primary/20" : "bg-muted/50"
              )}>
                <Icon className={cn(
                  "h-4 w-4",
                  isUnread ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm line-clamp-2",
                  isUnread ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
              </div>
              {isUnread && (
                <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
