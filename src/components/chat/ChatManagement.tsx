// src/components/chat/ChatManagement.tsx

import React, { useState, useEffect, useRef } from "react";
import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "firebase/auth";

// =================================================================================================
// TYPES
// =================================================================================================

type Theme = "light" | "dark";

interface ChatThread {
  id: string; // This is the patient's userId
  userName: string;
  userEmail: string;
  userId: string;
  lastMessageAt: Timestamp;
  createdAt: Timestamp;
  status: "active" | "archived";
  unreadCountStaff: number;
  unreadCountPatient: number;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderType: "patient" | "staff";
  timestamp: Timestamp;
  read: boolean;
}

// =================================================================================================
// MAIN COMPONENT
// =================================================================================================

interface ChatManagementProps {
  theme: Theme;
  user: User | null;
}

export const ChatManagement: React.FC<ChatManagementProps> = ({ theme, user }) => {
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isDark = theme === "dark";
  const cardClasses = isDark
    ? "bg-white/5 border-white/10"
    : "bg-white shadow-md border border-gray-200";
  const headingClasses = isDark ? "text-brand-yellow" : "text-brand-gold";
  const inputClasses = isDark
    ? "bg-gray-900 border-gray-700 text-white"
    : "bg-gray-100 border-gray-200 text-gray-800";
  const textMuted = isDark ? "text-gray-400" : "text-gray-500";

  // =================================================================================================
  // FETCH CHAT THREADS
  // =================================================================================================

  useEffect(() => {
    const chatsQuery = query(
      collection(db, "chats"),
      orderBy("lastMessageAt", "desc")
    );

    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const threads = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as ChatThread));
      
      setChatThreads(threads);
      setIsLoadingThreads(false);
    });

    return () => unsubscribe();
  }, []);

  // =================================================================================================
  // FETCH MESSAGES FOR SELECTED CHAT
  // =================================================================================================

  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }

    setIsLoadingMessages(true);

    const messagesQuery = query(
      collection(db, "chats", selectedChatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Message));
      
      setMessages(msgs);
      setIsLoadingMessages(false);
      
      // Auto-scroll to bottom when new messages arrive
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    // Mark messages as read by staff
    markMessagesAsRead(selectedChatId);

    return () => unsubscribe();
  }, [selectedChatId]);

  // =================================================================================================
  // MARK MESSAGES AS READ
  // =================================================================================================

  const markMessagesAsRead = async (chatId: string) => {
    try {
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        unreadCountStaff: 0,
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // =================================================================================================
  // SEND MESSAGE
  // =================================================================================================

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim() === "" || !selectedChatId || !user) return;

    const messageData = {
      text: newMessage.trim(),
      senderId: user.uid,
      senderType: "staff" as const,
      timestamp: serverTimestamp(),
      read: false,
    };

    try {
      // Add message to subcollection
      const messagesRef = collection(db, "chats", selectedChatId, "messages");
      await addDoc(messagesRef, messageData);

      // Update chat thread
      const chatRef = doc(db, "chats", selectedChatId);
      await updateDoc(chatRef, {
        lastMessageAt: serverTimestamp(),
        unreadCountPatient: (chatThreads.find(c => c.id === selectedChatId)?.unreadCountPatient || 0) + 1,
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    }
  };

  // =================================================================================================
  // FILTERED CHAT THREADS
  // =================================================================================================

  const filteredThreads = chatThreads.filter((thread) =>
    thread.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // =================================================================================================
  // SELECTED CHAT INFO
  // =================================================================================================

  const selectedChat = chatThreads.find((t) => t.id === selectedChatId);

  // =================================================================================================
  // FORMAT TIME
  // =================================================================================================

  const formatTime = (timestamp: Timestamp | null) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else if (diffInHours < 168) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatMessageTime = (timestamp: Timestamp | null) => {
    if (!timestamp) return "";
    return timestamp.toDate().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =================================================================================================
  // RENDER
  // =================================================================================================

  if (isLoadingThreads) {
    return (
      <div className="text-center text-gray-400 text-2xl animate-pulse">
        Loading chats...
      </div>
    );
  }

  return (
    <div className={`rounded-xl flex h-[80vh] ${cardClasses} overflow-hidden`}>
      {/* LEFT SIDEBAR - CHAT LIST */}
      <div
        className={`w-full md:w-1/3 border-r ${
          isDark ? "border-white/10" : "border-gray-200"
        } flex flex-col ${selectedChatId ? 'hidden md:flex' : 'flex'}`}
      >
        {/* Header */}
        <div className={`p-4 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}>
          <h2 className={`text-xl font-bold ${headingClasses} mb-3`}>
            Messages
          </h2>
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg ${inputClasses} focus:outline-none focus:ring-2 focus:ring-brand-yellow`}
            />
            <svg
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textMuted}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Chat Threads List */}
        <div className="flex-1 overflow-y-auto">
          {filteredThreads.length === 0 ? (
            <div className={`p-8 text-center ${textMuted}`}>
              {searchTerm ? "No chats found" : "No conversations yet"}
            </div>
          ) : (
            filteredThreads.map((thread) => (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setSelectedChatId(thread.id)}
                className={`p-4 cursor-pointer border-b transition-colors ${
                  isDark ? "border-white/10" : "border-gray-200"
                } ${
                  selectedChatId === thread.id
                    ? isDark
                      ? "bg-brand-yellow/10"
                      : "bg-brand-gold/10"
                    : isDark
                    ? "hover:bg-white/5"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {/* Avatar */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${
                          isDark ? "bg-brand-yellow/20" : "bg-brand-gold"
                        }`}
                      >
                        {thread.userName.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p
                            className={`font-semibold truncate ${
                              thread.unreadCountStaff > 0 ? "font-bold" : ""
                            }`}
                          >
                            {thread.userName}
                          </p>
                          <span className={`text-xs ${textMuted} ml-2 flex-shrink-0`}>
                            {formatTime(thread.lastMessageAt)}
                          </span>
                        </div>
                        
                        <p className={`text-sm ${textMuted} truncate`}>
                          {thread.userEmail}
                        </p>
                        
                        {thread.unreadCountStaff > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-5 h-5 rounded-full bg-brand-yellow flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-900">
                                {thread.unreadCountStaff}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-brand-yellow">
                              New messages
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL - MESSAGES */}
      <div className={`flex-1 flex flex-col ${selectedChatId ? 'flex' : 'hidden md:flex'}`}>
        {selectedChatId && selectedChat ? (
          <>
            {/* Chat Header */}
            <div
              className={`p-4 border-b ${
                isDark ? "border-white/10" : "border-gray-200"
              } flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                {/* Back button for mobile */}
                <button
                  onClick={() => setSelectedChatId(null)}
                  className="md:hidden mr-2"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    isDark ? "bg-brand-yellow/20" : "bg-brand-gold"
                  }`}
                >
                  {selectedChat.userName.charAt(0).toUpperCase()}
                </div>
                
                <div>
                  <p className="font-bold">{selectedChat.userName}</p>
                  <p className={`text-sm ${textMuted}`}>
                    {selectedChat.userEmail}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedChat.status === "active"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-gray-500/20 text-gray-400"
                }`}
              >
                {selectedChat.status}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-opacity-5">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-yellow"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className={textMuted}>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isStaff = msg.senderType === "staff";
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${
                          isStaff ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                            isStaff
                              ? isDark
                                ? "bg-brand-yellow text-gray-900"
                                : "bg-brand-gold text-white"
                              : isDark
                              ? "bg-gray-700 text-white"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          <p className="break-words">{msg.text}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isStaff
                                ? "text-gray-700"
                                : isDark
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            {formatMessageTime(msg.timestamp)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className={`p-4 border-t ${
                isDark ? "border-white/10" : "border-gray-200"
              }`}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className={`flex-1 px-4 py-3 rounded-lg ${inputClasses} focus:outline-none focus:ring-2 focus:ring-brand-yellow`}
                />
                <button
                  type="submit"
                  disabled={newMessage.trim() === ""}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    isDark
                      ? "bg-brand-yellow text-gray-900 hover:bg-brand-yellow/90"
                      : "bg-brand-gold text-white hover:bg-brand-gold/90"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg
                className={`mx-auto h-24 w-24 ${textMuted}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className={`mt-4 text-lg ${textMuted}`}>
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatManagement;