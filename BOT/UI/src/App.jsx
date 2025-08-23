import { useState } from 'react'
import ChatWindow from './ChatWindow'
import MessageInput from './MessageInput'

{/*
  
  const messages = [
  { sender: "user", text: "Hello!" },
  { sender: "bot", text: "Hi! How can I help you?" },
  { sender: "user", text: "Explain AI in a few words." },
  { sender: "bot", text: "AI is machines learning patterns to perform tasks." }
];
*/}

function App() {
  const [messages, setMessages] = useState([])
  
  const handleSend = async(message) => {
    
    const temp=[...messages]
    temp.push({sender:'user',text:message})
  

    //recive res(axios.get with payload as mssg)
    const response='hiii'
    temp.push({sender:'BOT',text:response})
    setMessages(temp)
  }

  return (
<div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
  <h1 className="text-3xl font-bold mb-4">AI Chatbot</h1>
  {/* wider container → max-w-2xl */}
  <div className="w-full max-w-2xl bg-gray-800 shadow-xl rounded-lg flex flex-col">
    <ChatWindow messages={messages} />
    <MessageInput onSend={handleSend} />
  </div>
</div>

  )
}

export default App
