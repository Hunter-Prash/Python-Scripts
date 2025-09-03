import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DOMPurify from "dompurify";
import axios from "axios";

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

      console.log(filtered)
      setThreadMails(filtered);

    };

    loadThreadMails();

  }, []);


  const handleSummarization = async () => {
    let temp = [...threadMails]
    let textBlob = ""
    //make a text blob for each of the plaintext attr in each mail in the thread
    temp.forEach((i => {

      textBlob += `\n----- EMAIL START -----\nFrom: ${i.from}\nDate: ${i.date}\nSubject: ${i.subject}\nBody:\n${i.fullCleanText}\n----- EMAIL END -----\n`

    }))


    try {
      let response = await axios.post('http://localhost:5100/api/summarize', {
        payload: textBlob
      });

      console.log("Summary:", response.data.reply);
    } catch (err) {
      console.error("Error summarizing:", err.message);
    }

  }

  return (
    <div className="relative min-h-screen bg-white text-gray-900 font-sans p-8 flex flex-col items-center">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-8 right-8 z-20 px-4 py-1.5 rounded-lg bg-gray-100 border border-gray-300 text-sm text-gray-800 hover:bg-blue-100 hover:border-blue-400 transition-all duration-200"
      >
        ← Back
      </button>

      {/*Generate summary button*/}
      <button
        onClick={handleSummarization}
        className="absolute top-8 right-32 z-20 px-5 py-2 rounded-xl 
             bg-blue-600 text-white font-medium shadow-md 
             hover:bg-blue-700 hover:shadow-lg 
             active:bg-blue-800 active:scale-95 
             transition-all duration-200"
      >
        ✨ Generate Summary
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

              {/*Backend returns HTML string (mail.html).
              DOMpurify converts your HTML string into a temporary DOM tree in memory
              Walks through all elements and attributes.
              Removes anything unsafe (scripts, event handlers, dangerous URLs, etc.).
              Keeps the “safe” elements like <div>, <p>, <table>, <img> — especially those you allow with ALLOWED_ATTR or ADD_TAGS.
              Returns the cleaned HTML string.
              
              Also,Normally in React, you cannot just put a string of HTML inside JSX:
              <div>{mail.html}</div> .... this will render raw text, not HTML

              SO we need dangerouslySetInnerHTML to preserve the html structure while rendering
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(mail.html) }} />

              */}
              <div
                className="email-content"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(mail.html || mail.fullCleanText, {
                    ADD_TAGS: ['table', 'tr', 'td', 'tbody', 'thead'], // keep table layouts
                    KEEP_CONTENT: true, // don't remove important content
                    // optionally allow style if you trust it
                    ALLOWED_ATTR: ['src', 'href', 'width', 'height', 'colspan', 'rowspan', 'align', 'style'],
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
