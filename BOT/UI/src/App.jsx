import { useState } from 'react'
import './App.css'
import ChatWindow from './ChatWindow'
import MessageInput from './MessageInput'

function App() {
  

  return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">AI Chatbot</h1>
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg flex flex-col">
        <ChatWindow messages={messages} />
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  )
}

export default App
