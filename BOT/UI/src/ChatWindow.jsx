import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChatWindow = ({ messages }) => {
  
  
  return (
    <div className="flex-1 p-4 overflow-y-auto h-96 bg-gray-700 rounded-t-lg">
      {messages &&
        messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex my-1 ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-xl break-words prose prose-invert ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-600 text-gray-100"
              }`}
            >
              {msg.sender === "BOT" ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.text}
                </ReactMarkdown>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
    </div>
  );
};

export default ChatWindow;
