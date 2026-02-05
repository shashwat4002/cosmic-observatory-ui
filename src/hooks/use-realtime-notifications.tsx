import { useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket, connectSocket, disconnectSocket } from "@/lib/socket";
import { useCurrentUser } from "./use-auth";

export type Notification = {
  id: string;
  type: string;
  message: string;
  payload?: Record<string, unknown>;
  createdAt: string;
  readAt?: string | null;
};

export const useRealtimeNotifications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data } = useCurrentUser();

  const handleNotification = useCallback(
    (notification: Notification) => {
      queryClient.setQueryData(
        ["notifications"],
        (existing: { notifications: Notification[] } | undefined | null) => {
          if (!existing) {
            return { notifications: [notification] };
          }
          return {
            notifications: [notification, ...existing.notifications],
          };
        }
      );

      toast({
        title: "New Notification",
        description: notification.message,
      });
    },
    [queryClient, toast]
  );

  useEffect(() => {
    // Only connect socket if user is authenticated
    if (!data?.user) return;

    connectSocket();
    const socket = getSocket();

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
      disconnectSocket();
    };
  }, [data?.user, handleNotification]);
};

