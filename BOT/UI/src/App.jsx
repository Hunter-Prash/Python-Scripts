import { useState } from "react";
import ChatWindow from "./ChatWindow";
import MessageInput from "./MessageInput";
import axios from "axios";

function App() {
  const [messages, setMessages] = useState([]);

  const handleSend = async (message) => {
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: message },
      { sender: "BOT", text: "..." }
    ]);


    try {

      const response = await axios.post("http://localhost:5000/chat", { message });


      setMessages((prev) => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1; // bot placeholder
        newMessages[lastIndex] = { sender: "BOT", text: response.data.reply };
        return newMessages;
      });
    } catch (err) {
      console.error(err);
      // Optionally update bot message to show error
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        newMessages[lastIndex] = { sender: "BOT", text: "Error: Failed to fetch response." };
        return newMessages;
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">AI Chatbot</h1>
      <div className="w-full max-w-5xl bg-gray-800 shadow-xl rounded-lg flex flex-col">
        <ChatWindow messages={messages} />
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
}

export default App;
