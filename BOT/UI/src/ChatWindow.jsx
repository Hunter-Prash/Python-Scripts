import React from "react";

const ChatWindow = ({ messages }) => {
  return (
    <div className="flex-1 p-4 overflow-y-auto h-96 bg-gray-700 rounded-t-lg">
      {messages && messages.map((msg, idx) => (
        <div
          key={idx}
          className={`max-w-[70%] p-3 rounded-xl my-1 break-words ${
            msg.sender === "user"
              ? "bg-blue-600 text-white self-end"
              : "bg-gray-600 text-gray-100 self-start"
          }`}
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
};

export default ChatWindow;
