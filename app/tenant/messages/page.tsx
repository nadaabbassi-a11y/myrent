"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { MessageSquare, Send, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface Thread {
  id: string;
  updatedAt: string;
  application?: {
    listing: {
      id: string;
      title: string;
      price: number;
      city: string;
      area: string | null;
    };
  };
  listing?: {
    id: string;
    title: string;
    price: number;
    city: string;
    area: string | null;
  };
  messages: Message[];
  _count?: {
    messages: number;
  };
}

function MessagesPageContent() {
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useLanguageContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    } else if (user) {
      fetchThreads();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const threadId = searchParams.get("thread");
    if (threadId && threads.length > 0) {
      const thread = threads.find((t) => t.id === threadId);
      if (thread) {
        setSelectedThread(thread);
        // Marquer les messages comme lus quand on ouvre la conversation
        markMessagesAsRead(threadId);
      }
    }
  }, [searchParams, threads]);

  const markMessagesAsRead = async (threadId: string) => {
    try {
      await fetch(`/api/messages/${threadId}/read`, {
        method: "POST",
      });
      // Rafraîchir les threads pour mettre à jour les compteurs
      fetchThreads();
    } catch (err) {
      console.error("Erreur lors du marquage des messages comme lus:", err);
    }
  };

  const fetchThreads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/messages");

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur lors du chargement des messages");
      }

      const data = await response.json();
      setThreads(data.threads || []);

      // Si un thread est sélectionné dans l'URL, le charger
      const threadId = searchParams.get("thread");
      if (threadId && (data.threads || []).length > 0) {
        const thread = (data.threads || []).find((t: Thread) => t.id === threadId);
        if (thread) {
          setSelectedThread(thread);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des messages";
      setError(errorMessage);
      console.error("Erreur fetchThreads:", err);
      setThreads([]); // S'assurer que threads est toujours un tableau
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedThread || !newMessage.trim()) return;

    try {
      setIsSending(true);
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId: selectedThread.id,
          content: newMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du message");
      }

      const data = await response.json();
      
      // Ajouter le nouveau message au thread
      setSelectedThread({
        ...selectedThread,
        messages: [data.message, ...selectedThread.messages],
      });

      // Mettre à jour la liste des threads
      setThreads(
        threads.map((t) =>
          t.id === selectedThread.id
            ? { ...t, messages: [data.message, ...t.messages], updatedAt: new Date().toISOString() }
            : t
        )
      );

      setNewMessage("");
    } catch (err) {
      setError("Erreur lors de l'envoi du message");
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">{t("common.loading")}</div>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{t("messages.title")}</h1>
              <Link href="/listings">
                <Button variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  {t("dashboard.tenant.searchListing")}
                </Button>
              </Link>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Liste des conversations */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Conversations</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {threads.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        {t("messages.noConversations")}
                      </div>
                    ) : (
                      <div className="divide-y">
                        {threads.map((thread) => {
                          const unreadCount = thread._count?.messages || 0;
                          return (
                            <button
                              key={thread.id}
                              onClick={() => {
                                setSelectedThread(thread);
                                markMessagesAsRead(thread.id);
                              }}
                              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors relative ${
                                selectedThread?.id === thread.id ? "bg-violet-50" : ""
                              }`}
                            >
                              <div className="font-semibold text-sm mb-1 flex items-center justify-between">
                                <span className="flex-1 truncate">{(thread.application?.listing || thread.listing)?.title || "Sans titre"}</span>
                                {unreadCount > 0 && (
                                  <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] flex-shrink-0">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mb-2">
                                {(thread.application?.listing || thread.listing)?.city}
                                {(thread.application?.listing || thread.listing)?.area
                                  ? `, ${(thread.application?.listing || thread.listing)?.area}`
                                  : ""}
                              </div>
                              {thread.messages.length > 0 && (
                                <div className={`text-xs truncate ${unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                  {thread.messages[0].content}
                                </div>
                              )}
                              <div className="text-xs text-gray-400 mt-1">
                                {format(new Date(thread.updatedAt), "d MMM yyyy")}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Zone de messages */}
              <div className="lg:col-span-2">
                {selectedThread ? (
                  <Card className="h-[600px] flex flex-col">
                    <CardHeader className="border-b">
                      <CardTitle className="text-lg">
                        {(selectedThread.application?.listing || selectedThread.listing)?.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {(selectedThread.application?.listing || selectedThread.listing)?.city}
                        {(selectedThread.application?.listing || selectedThread.listing)?.area
                          ? `, ${(selectedThread.application?.listing || selectedThread.listing)?.area}`
                          : ""}
                      </p>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col p-0">
                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {selectedThread.messages.length === 0 ? (
                          <div className="text-center text-gray-500 py-8">
                            {t("messages.noMessages")}
                          </div>
                        ) : (
                          [...selectedThread.messages].reverse().map((message) => {
                            const isOwn = message.sender.id === user.id;
                            return (
                              <div
                                key={message.id}
                                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`max-w-[70%] rounded-lg p-3 ${
                                    isOwn
                                      ? "bg-violet-600 text-white"
                                      : "bg-gray-200 text-gray-900"
                                  }`}
                                >
                                  <div className="text-sm font-semibold mb-1">
                                    {message.sender.name || message.sender.email}
                                  </div>
                                  <div className="text-sm">{message.content}</div>
                                  <div
                                    className={`text-xs mt-1 ${
                                      isOwn ? "text-violet-100" : "text-gray-500"
                                    }`}
                                  >
                                    {format(new Date(message.createdAt), "HH:mm")}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Input pour nouveau message */}
                      <div className="border-t p-4">
                        <div className="flex gap-2">
                          <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={t("messages.typeMessage")}
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim() || isSending}
                            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-[600px] flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p>{t("messages.selectConversation")}</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">Chargement...</div>
          </div>
        </main>
      </>
    }>
      <MessagesPageContent />
    </Suspense>
  );
}

