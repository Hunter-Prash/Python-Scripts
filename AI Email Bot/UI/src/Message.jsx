import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DOMPurify from "dompurify";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


const Message = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { threads, id } = location.state || {};

  const [threadMails, setThreadMails] = useState([]);
  const [generated, setIsGenerated] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [loading,setLoading]=useState(false)

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

  const handleSummarization = async () => {
    let temp = [...threadMails];
    let textBlob = "";

    // Combine all emails into a single text blob
    temp.forEach((i) => {
      textBlob += `\n----- EMAIL START -----\nFrom: ${i.from}\nDate: ${i.date}\nSubject: ${i.subject}\nBody:\n${i.fullCleanText}\n----- EMAIL END -----\n`;
    });

    try {
      setLoading(true)
      let response = await axios.post("http://localhost:5100/api/summarize", {
        payload: textBlob,
      });

      setIsGenerated(true);
      setGeneratedContent(response.data.reply);
    } catch (err) {
      console.error("Error summarizing:", err.message);
    }
    finally{
      setLoading(false)
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-gray-900 font-sans p-8 flex flex-col items-center overflow-hidden">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-8 right-8 z-20 px-4 py-1.5 rounded-lg bg-gray-100 border border-gray-300 text-sm text-gray-800 hover:bg-blue-100 hover:border-blue-400 transition-all duration-200"
      >
        ← Back
      </button>

      {/* Generate summary button */}
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
              transition={{ duration: 0.3, ease: "easeOut" }}
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
                className="email-content"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(mail.html || mail.fullCleanText, {
                    ADD_TAGS: ["table", "tr", "td", "tbody", "thead"],
                    KEEP_CONTENT: true,
                    ALLOWED_ATTR: [
                      "src",
                      "href",
                      "width",
                      "height",
                      "colspan",
                      "rowspan",
                      "align",
                      "style",
                    ],
                  }),
                }}
              />
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500 text-center mt-4">
            No mails in this thread.
          </p>
        )}
      </div>

      {/* Generated Summary Overlay */}
      <AnimatePresence>
        {generated && (
          <>
            {/* Background Dim */}
            <motion.div
              className="fixed inset-0 bg-black z-40"
              style={{ opacity: 0.25 }} // Light dim
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              onClick={() => setIsGenerated(false)}
            />

            {/* Sliding Summary Panel */}
            <motion.div
              className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 p-6 flex flex-col overflow-y-auto will-change-transform"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-blue-700">
                  Generated Summary
                </h2>
                <button
                  className="text-gray-600 hover:text-red-500 transition-colors"
                  onClick={() => setIsGenerated(false)}
                >
                  ✖
                </button>
              </div>

              <div className="whitespace-pre-wrap text-gray-800">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {generatedContent}
                </ReactMarkdown>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Loading Spinner Overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-white text-lg font-medium">Generating...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
