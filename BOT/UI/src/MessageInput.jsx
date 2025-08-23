import React, { useState } from "react";

const MessageInput = ({ onSend }) => {
  const [message, setMessage] = useState("");

  const handleClick = () => {
    if (message.trim() !== "") {
      onSend(message); 
      setMessage("");    
    }
  };

  return (
    <div className="flex p-3 border-t border-gray-600 bg-gray-800 rounded-b-lg">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        onClick={handleClick}
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;
