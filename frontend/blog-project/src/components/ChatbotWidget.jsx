import React, { useState, useRef, useEffect, memo } from "react";
import { User, Send, ChevronLeft, MessageSquareText } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import botAvatar from "../assets/bot.png";
import thinkingDots from "../assets/loading.png";

const AI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent";
const API_KEY = "";
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
      {/* Conditionally render the avatar based on sender and state */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center p-1 bg-white shadow-sm">
          <img
            src={botAvatar}
            alt="AI Avatar"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Conditionally render loading image or message text */}
      {isThinking ? (
        <div className="flex items-center justify-center p-2">
          {/* Removed background and made the image larger as requested */}
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
          <p className="font-sans text-sm">{message.text}</p>
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
    {
      sender: "ai",
      text: "Hello! I'm Bloggy, your AI writing assistant. Need help writing your first post?",
      isThinking: false,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestionPrompts = [
    "Would you like to schedule this post or publish now?",
    "Would you like blog title suggestions?",
    "Want to add an image with alt text?",
    "Do you want me to check your blog for clarity and tone?",
  ];

  // Effect to scroll to the bottom of the chat window
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatbotOpen]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim() || isLoading) return;

    // Add user's message
    const newUserMessage = { sender: "user", text: textToSend };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    setInputMessage("");
    setIsLoading(true);

    // Add thinking message
    const thinkingMessage = { sender: "ai", text: "", isThinking: true };
    setMessages((prevMessages) => [...prevMessages, thinkingMessage]);

    // Simulate network delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      // Build chat history for API call
      const chatHistory = [...messages, newUserMessage].map((m) => ({
        role: m.sender === "ai" ? "model" : "user",
        parts: [{ text: m.text }],
      }));

      const payload = { contents: chatHistory };

      const response = await fetch(AI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      // Remove thinking message
      setMessages((prevMessages) => prevMessages.filter((m) => !m.isThinking));

      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        const text = result.candidates[0].content.parts[0].text;
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "ai", text, isThinking: false },
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: "ai",
            text: "I'm sorry, I couldn't generate a response. Please try again.",
            isThinking: false,
          },
        ]);
      }
    } catch (error) {
      console.error("API call failed:", error);
      // Remove thinking message and show error
      setMessages((prevMessages) => prevMessages.filter((m) => !m.isThinking));
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: "ai",
          text: "A network error occurred. Please try again.",
          isThinking: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans">
      {!isChatbotOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
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
            transition={{ duration: 0.3 }}
            className="fixed bottom-3 right-3 z-50 w-[95vw] max-w-md h-[92vh] md:h-[92vh] md:w-96 md:bottom-6 md:right-6 bg-gray-50 md:rounded-2xl md:shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white shadow-sm">
              <button
                onClick={() => setIsChatbotOpen(false)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="flex-1 text-center flex items-center justify-center">
                <img src={botAvatar} alt="AI Avatar" className="w-8 h-8 mr-2" />
                <h1 className="text-xl font-bold text-gray-800">Ask Bloggy</h1>
              </div>
              <div className="w-6" />
            </div>

            {/* Messages container with a fixed scrollbar */}
            <div className="flex-1 p-4 overflow-y-scroll space-y-4 scroll-smooth">
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            <div className="p-4 bg-gray-100 border-t border-gray-200 space-y-2">
              <h3 className="text-center text-sm font-semibold text-gray-500">
                Suggestion prompts
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {suggestionPrompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-3 bg-blue-800 text-white text-xs font-medium rounded-lg hover:bg-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputMessage);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 p-3 rounded-full bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="p-3 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-colors"
                  disabled={isLoading}
                >
                  <Send size={24} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatbotWidget;
