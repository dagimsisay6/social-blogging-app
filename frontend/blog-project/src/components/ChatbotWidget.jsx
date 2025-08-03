import React, { useState, useRef, useEffect, memo } from "react";
import { User, Send, ChevronLeft, MessageSquareText, Search, BookText, PenSquare, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import botAvatar from "../assets/bot.png";
import thinkingDots from "../assets/loading.png";

// --- CONFIGURATION ---
// This should point to YOUR single, smart AI backend endpoint.
const AI_API_URL = "http://localhost:8000/api/v1/invoke"; // Example: Use your actual Render/Railway URL

const ChatMessage = memo(({ message }) => {
  const isUser = message.sender === "user";
  const isThinking = message.isThinking;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 p-2 rounded-2xl ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center p-1 bg-white shadow-sm">
          <img src={botAvatar} alt="AI Avatar" className="w-full h-full object-cover" />
        </div>
      )}
      {isThinking ? (
        <div className="flex items-center justify-center p-2">
          <img src={thinkingDots} alt="Thinking..." className="h-8 w-auto" />
        </div>
      ) : (
        <div
          className={`p-4 rounded-xl max-w-sm lg:max-w-md ${
            isUser
              ? "bg-gray-600 text-white shadow-md rounded-br-none"
              : "bg-blue-600 text-white shadow-md rounded-bl-none"
          }`}
        >
          {/* Using dangerouslySetInnerHTML to render Markdown from the backend */}
          <div
            className="font-sans text-sm prose prose-invert"
            dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br />') }}
          />
        </div>
      )}
      {isUser && (
        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center p-1 bg-white shadow-sm">
          <User size={20} className="text-gray-500" />
        </div>
      )}
    </motion.div>
  );
});

const ChatbotWidget = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hello! I'm your AI assistant. Use the tools below or ask me a question about the blog." },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null); // To manage session state
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleActionClick = (command) => {
    setInputMessage(command + ": ");
    inputRef.current?.focus();
  };

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim() || isLoading) return;

    // --- FRONTEND MESSAGE HANDLING ---
    const newUserMessage = { sender: "user", text: textToSend };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage("");
    setIsLoading(true);
    setMessages((prev) => [...prev, { sender: "ai", text: "", isThinking: true }]);

    // --- BACKEND EXPECTATION: PARSE THE MESSAGE TO DEFINE ACTION ---
    let action = "chat";
    let payload = { question: textToSend };

    const commandMatch = textToSend.match(/^([A-Z_]+):\s*(.*)/);
    if (commandMatch) {
      const command = commandMatch[1].toUpperCase();
      const content = commandMatch[2];
      
      switch (command) {
        case "TRENDS":
          action = "discover_trends";
          payload = { topic: content };
          break;
        case "WRITE_FROM_TREND":
          action = "trend_based_write";
          payload = { topic: content };
          break;
        case "SUMMARIZE":
          action = "summarize";
          payload = { content_to_summarize: content };
          break;
        case "EDIT":
          action = "edit";
          // A simple split for demo purposes. A better UI might have two fields.
          const [goal, ...draftParts] = content.split('DRAFT:');
          payload = { editing_goal: goal.trim(), draft_content: (draftParts.join('DRAFT:') || '').trim() };
          break;
        default:
          action = "chat";
          payload = { question: textToSend };
      }
    }
    
    // --- API CALL ---
    try {
      const response = await fetch(AI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          payload,
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Update conversation ID if it's the first message
      if (result.conversation_id && !conversationId) {
        setConversationId(result.conversation_id);
      }

      setMessages((prev) => prev.filter((m) => !m.isThinking));
      setMessages((prev) => [...prev, { sender: "ai", text: result.response }]);

    } catch (error) {
      console.error("API call failed:", error);
      setMessages((prev) => prev.filter((m) => !m.isThinking));
      setMessages((prev) => [...prev, { sender: "ai", text: "Sorry, I ran into an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Action buttons definition
  const actionButtons = [
    { label: "Find Trends", command: "TRENDS", icon: <Search size={16}/> },
    { label: "Summarize Text", command: "SUMMARIZE", icon: <BookText size={16}/> },
    { label: "Edit Draft", command: "EDIT", icon: <PenSquare size={16}/> },
    { label: "Write From Trend", command: "WRITE_FROM_TREND", icon: <Sparkles size={16}/> },
  ];

  return (
    <>
      {!isChatbotOpen && (
        <motion.button
          onClick={() => setIsChatbotOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <MessageSquareText size={28} />
        </motion.button>
      )}

      <AnimatePresence>
        {isChatbotOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-3 right-3 z-50 w-[95vw] max-w-md h-[92vh] md:h-[92vh] md:w-96 md:bottom-6 md:right-6 bg-gray-50 md:rounded-2xl md:shadow-2xl flex flex-col font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white shadow-sm">
              <button onClick={() => setIsChatbotOpen(false)} className="text-gray-600"><ChevronLeft size={24} /></button>
              <h1 className="text-xl font-bold text-gray-800">AI Assistant</h1>
              <div className="w-6" />
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 scroll-smooth">{messages.map((msg, i) => <ChatMessage key={i} message={msg} />)}<div ref={messagesEndRef} /></div>

            {/* Quick Actions */}
            <div className="p-3 bg-gray-100 border-t border-gray-200">
                <p className="text-center text-xs font-semibold text-gray-500 mb-2">QUICK ACTIONS</p>
                <div className="grid grid-cols-2 gap-2">
                    {actionButtons.map(({label, command, icon}) => (
                         <button key={command} onClick={() => handleActionClick(command)} className="flex items-center justify-center gap-2 p-2 bg-white text-blue-800 text-xs font-medium rounded-lg hover:bg-blue-50 transition-colors border border-gray-200">
                            {icon} {label}
                         </button>
                    ))}
                </div>
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputMessage); }} className="flex items-center gap-2">
                <input ref={inputRef} type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="Ask a question or use an action..." className="flex-1 p-3 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isLoading} />
                <button type="submit" className="p-3 bg-blue-600 text-white rounded-full shadow-md" disabled={isLoading}><Send size={24} /></button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;