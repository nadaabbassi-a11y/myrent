"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { MessageSquare, Send, Home, CheckCircle2, MapPin, DollarSign } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      
      // Scroll to bottom after sending
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError("Erreur lors de l'envoi du message");
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (selectedThread) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [selectedThread?.messages]);

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

  const listing = selectedThread?.application?.listing || selectedThread?.listing;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-neutral-900">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-light text-neutral-900 mb-2 tracking-tight">{t("messages.title")}</h1>
                  <p className="text-neutral-500 text-base font-light">Communiquez avec les propriétaires</p>
                </div>
              </div>
              <Link href="/listings">
                <Button className="h-12 px-8 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-light shadow-lg hover:shadow-xl transition-all text-base">
                  <Home className="h-5 w-5 mr-2" />
                  {t("dashboard.tenant.searchListing")}
                </Button>
              </Link>
            </div>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700"
            >
              {error}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-220px)]">
            {/* Liste des conversations */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <Card className="h-full flex flex-col border-neutral-200/50 shadow-xl backdrop-blur-sm bg-white/80 rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-neutral-200/50 bg-gradient-to-br from-white to-neutral-50/50 pb-6 pt-6 px-6">
                  <CardTitle className="text-2xl font-light text-neutral-900 tracking-tight">Conversations</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-y-auto">
                  {threads.length === 0 ? (
                    <div className="p-12 text-center text-neutral-500">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <MessageSquare className="h-16 w-16 mx-auto mb-6 text-neutral-300" />
                        <p className="text-base font-light">{t("messages.noConversations")}</p>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-100/50">
                      <AnimatePresence>
                        {threads.map((thread, index) => {
                          const unreadCount = thread._count?.messages || 0;
                          const isSelected = selectedThread?.id === thread.id;
                          const threadListing = thread.application?.listing || thread.listing;
                          
                          return (
                            <motion.button
                              key={thread.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                              onClick={() => {
                                setSelectedThread(thread);
                                markMessagesAsRead(thread.id);
                              }}
                              className={`w-full p-6 text-left transition-all duration-300 relative group ${
                                isSelected 
                                  ? "bg-gradient-to-r from-neutral-900 to-neutral-800 text-white shadow-lg" 
                                  : "hover:bg-gradient-to-r hover:from-neutral-50 hover:to-white"
                              }`}
                              whileHover={{ scale: isSelected ? 1 : 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {isSelected && (
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 to-neutral-800/90"
                                  layoutId="selectedThread"
                                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                              )}
                              <div className="flex items-start gap-4 relative z-10">
                                <motion.div 
                                  className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-light shadow-lg ${
                                    isSelected 
                                      ? "bg-white/20 backdrop-blur-sm text-white ring-2 ring-white/30" 
                                      : "bg-gradient-to-br from-neutral-100 to-neutral-200 text-neutral-600 group-hover:from-neutral-200 group-hover:to-neutral-300"
                                  }`}
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                  transition={{ type: "spring", stiffness: 400 }}
                                >
                                  {threadListing?.title?.charAt(0).toUpperCase() || "?"}
                                </motion.div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-3 mb-2">
                                    <h3 className={`font-light text-base truncate ${
                                      isSelected ? "text-white" : "text-neutral-900"
                                    }`}>
                                      {threadListing?.title || "Sans titre"}
                                    </h3>
                                    {unreadCount > 0 && (
                                      <motion.span 
                                        className={`text-sm font-medium rounded-full h-7 w-7 flex items-center justify-center flex-shrink-0 shadow-lg ${
                                          isSelected 
                                            ? "bg-white text-neutral-900" 
                                            : "bg-gradient-to-br from-red-500 to-red-600 text-white"
                                        }`}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 500 }}
                                      >
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                      </motion.span>
                                    )}
                                  </div>
                                  <div className={`text-sm mb-3 flex items-center gap-2 font-light ${
                                    isSelected ? "text-neutral-300" : "text-neutral-500"
                                  }`}>
                                    <MapPin className="h-4 w-4" />
                                    {threadListing?.city}
                                    {threadListing?.area ? `, ${threadListing.area}` : ""}
                                  </div>
                                  {thread.messages.length > 0 && (
                                    <p className={`text-sm truncate mb-3 leading-relaxed ${
                                      isSelected 
                                        ? "text-neutral-200" 
                                        : unreadCount > 0 
                                          ? "font-medium text-neutral-900" 
                                          : "text-neutral-600"
                                    }`}>
                                      {thread.messages[0].content}
                                    </p>
                                  )}
                                  <div className={`text-sm flex items-center gap-3 font-light ${
                                    isSelected ? "text-neutral-400" : "text-neutral-400"
                                  }`}>
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>Visite approuvée</span>
                                    <span className="ml-auto">
                                      {format(new Date(thread.updatedAt), "d MMM yyyy")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Zone de messages */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              {selectedThread ? (
                <Card className="h-full flex flex-col border-neutral-200/50 shadow-xl backdrop-blur-sm bg-white/80 rounded-3xl overflow-hidden">
                  <CardHeader className="border-b border-neutral-200/50 bg-gradient-to-br from-white via-white to-neutral-50/30 pb-6 pt-6 px-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-2xl font-light text-neutral-900 mb-3 tracking-tight">
                          {listing?.title}
                        </CardTitle>
                        <div className="flex items-center gap-6 text-base text-neutral-600 font-light">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100/50 backdrop-blur-sm">
                            <MapPin className="h-5 w-5" />
                            <span>{listing?.city}{listing?.area ? `, ${listing.area}` : ""}</span>
                          </div>
                          {listing?.price && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100/50 backdrop-blur-sm">
                              <DollarSign className="h-5 w-5" />
                              <span>{listing.price.toLocaleString('fr-CA')} $/mois</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-0 bg-gradient-to-b from-neutral-50/50 to-white">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6">
                      <AnimatePresence>
                        {selectedThread.messages.length === 0 ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center text-neutral-500 py-16"
                          >
                            <MessageSquare className="h-16 w-16 mx-auto mb-6 text-neutral-300" />
                            <p className="text-base font-light">{t("messages.noMessages")}</p>
                          </motion.div>
                        ) : (
                          [...selectedThread.messages].reverse().map((message, index) => {
                            const isOwn = message.sender.id === user.id;
                            return (
                              <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ 
                                  delay: index * 0.03,
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 25
                                }}
                                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                              >
                                <div className="flex items-end gap-3 max-w-[80%]">
                                  {!isOwn && (
                                    <motion.div 
                                      className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center text-base font-light text-neutral-600 flex-shrink-0 shadow-lg ring-2 ring-white/50"
                                      whileHover={{ scale: 1.1, rotate: 5 }}
                                      transition={{ type: "spring", stiffness: 400 }}
                                    >
                                      {message.sender.name?.charAt(0).toUpperCase() || message.sender.email.charAt(0).toUpperCase()}
                                    </motion.div>
                                  )}
                                  <motion.div 
                                    className={`rounded-3xl px-5 py-4 shadow-lg backdrop-blur-sm ${
                                      isOwn
                                        ? "bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-br-md ring-1 ring-neutral-700/50"
                                        : "bg-white/90 text-neutral-900 rounded-bl-md border border-neutral-200/50 ring-1 ring-white/50"
                                    }`}
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                  >
                                    {!isOwn && (
                                      <div className={`text-sm font-medium mb-2 ${
                                        isOwn ? "text-white/80" : "text-neutral-600"
                                      }`}>
                                        {message.sender.name || message.sender.email}
                                      </div>
                                    )}
                                    <div className={`text-base leading-relaxed ${
                                      isOwn ? "text-white" : "text-neutral-900"
                                    }`}>
                                      {message.content}
                                    </div>
                                    <div className={`text-sm mt-2 font-light ${
                                      isOwn ? "text-white/60" : "text-neutral-400"
                                    }`}>
                                      {format(new Date(message.createdAt), "HH:mm")}
                                    </div>
                                  </motion.div>
                                  {isOwn && (
                                    <motion.div 
                                      className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center text-base font-light text-white flex-shrink-0 shadow-lg ring-2 ring-white/50"
                                      whileHover={{ scale: 1.1, rotate: -5 }}
                                      transition={{ type: "spring", stiffness: 400 }}
                                    >
                                      {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                                    </motion.div>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })
                        )}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input pour nouveau message */}
                    <div className="border-t border-neutral-200/50 bg-gradient-to-br from-white/90 to-neutral-50/50 backdrop-blur-sm p-6">
                      <div className="flex gap-4">
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
                          className="h-14 rounded-2xl border-2 border-neutral-200/50 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-400/20 transition-all text-base font-light bg-white/80 backdrop-blur-sm shadow-sm"
                        />
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim() || isSending}
                            className="h-14 px-8 bg-gradient-to-br from-neutral-900 to-neutral-800 hover:from-neutral-800 hover:to-neutral-700 text-white rounded-2xl font-light shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ring-1 ring-neutral-700/50"
                          >
                            {isSending ? (
                              <span className="animate-spin text-lg">⏳</span>
                            ) : (
                              <Send className="h-5 w-5" />
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center border-neutral-200/50 shadow-xl backdrop-blur-sm bg-white/80 rounded-3xl">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="text-center text-neutral-500"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      <MessageSquare className="h-24 w-24 mx-auto mb-8 text-neutral-300" />
                    </motion.div>
                    <p className="text-xl font-light mb-3 tracking-tight">{t("messages.selectConversation")}</p>
                    <p className="text-base text-neutral-400 font-light">Sélectionnez une conversation pour commencer</p>
                  </motion.div>
                </Card>
              )}
            </motion.div>
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

