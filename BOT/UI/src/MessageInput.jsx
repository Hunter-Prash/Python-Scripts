import React, { useState, useRef } from "react";

const MessageInput = ({ onSend }) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (message.trim() !== "") {
      onSend(message);
      setMessage("");
      if (textareaRef.current) textareaRef.current.style.height = "auto"; // reset
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);

    // Auto-grow textarea
    const el = textareaRef.current;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevent newline
      handleSend();
    }
  };

  return (
    <div className="flex items-end p-3 border-t border-gray-600 bg-gray-800 rounded-b-lg">
      {/* Textarea grows only */}
      <textarea
        ref={textareaRef}
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        rows={1}
        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
      />
      
      {/* Fixed size button */}
      <button
        className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex-shrink-0"
        onClick={handleSend}
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;
