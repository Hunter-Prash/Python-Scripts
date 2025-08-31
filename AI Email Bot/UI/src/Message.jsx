import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DOMPurify from "dompurify";

const Message = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { threads, id } = location.state || {};

  const [threadMails, setThreadMails] = useState([]);


  useEffect(() => {
    const loadThreadMails = () => {
      const allMails = JSON.parse(sessionStorage.getItem("allMails") || "[]");

      const filtered = allMails
        .filter((mail) => mail.threadId === threads)
        .sort((a, b) => (a.id === id ? -1 : 1));

      setThreadMails(filtered);
    };

    loadThreadMails();
    
  }, []);

  return (
    <div className="relative min-h-screen bg-white text-gray-900 font-sans p-8 flex flex-col items-center">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-8 right-8 z-20 px-4 py-1.5 rounded-lg bg-gray-100 border border-gray-300 text-sm text-gray-800 hover:bg-blue-100 hover:border-blue-400 transition-all duration-200"
      >
        ← Back
      </button>

      {/* Thread container */}
      <div className="w-full max-w-3xl flex flex-col gap-4 pt-16">
        {threadMails.length > 0 ? (
          threadMails.map((mail, index) => (
            <motion.div
              key={mail.id}
              className={`bg-gray-50 p-4 rounded-xl border border-gray-300 shadow-md hover:bg-gray-100 transition-colors
                ${index !== 0 ? "ml-6" : ""}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-blue-700">{mail.from}</span>
                <span className="text-gray-500 text-sm">{mail.date}</span>
              </div>

              {/* Subject */}
              <h3 className="font-semibold text-blue-800 mb-2">{mail.subject}</h3>

              {/* Email content */}
              <div
                className="text-gray-900 break-words whitespace-pre-wrap overflow-x-auto email-content"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(mail.html || mail.snippet, {
                    FORBID_ATTR: ["style"], // remove inline styles to enforce your theme
                  }),
                }}
              />
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500 text-center mt-4">No mails in this thread.</p>
        )}
      </div>
    </div>
  );
};

export default Message;
