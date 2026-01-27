"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

interface Notifications {
  messages: number;
  visitRequests: number;
  applications: number;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notifications>({
    messages: 0,
    visitRequests: 0,
    applications: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    let interval: NodeJS.Timeout | null = null;

    const fetchNotifications = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch("/api/notifications", {
          cache: "no-store",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || { messages: 0, visitRequests: 0, applications: 0 });
        }
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Erreur lors de la récupération des notifications:", error);
        }
        // En cas d'erreur, définir des notifications par défaut
        setNotifications({ messages: 0, visitRequests: 0, applications: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Rafraîchir les notifications toutes les 30 secondes
    interval = setInterval(fetchNotifications, 30000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [user]);

  return { notifications, isLoading };
}

