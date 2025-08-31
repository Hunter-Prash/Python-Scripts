import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Loading spinner component
const LoadingSpinner = () => (
  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gray-950/90 backdrop-blur-sm">
    <div className="w-16 h-16 border-4 border-blue-500 border-t-blue-200 rounded-full animate-spin"></div>
    <p className="mt-4 text-lg text-blue-400 tracking-wider">Loading...</p>
  </div>
);

const App = () => {
  const navigate = useNavigate();

  // Lazy initialization from sessionStorage
  const [user, setUser] = useState(() => {
    const cached = sessionStorage.getItem("user");
    return cached ? JSON.parse(cached) : null;
  });

  const [labels, setLabels] = useState(() => {
    const cached = sessionStorage.getItem("labels");
    return cached ? JSON.parse(cached) : [];
  });

  const [allMails, setAllMails] = useState(() => {
    const cached = sessionStorage.getItem("allMails");
    return cached ? JSON.parse(cached) : [];
  });

  const [isLoading, setIsLoading] = useState(
    !user || labels.length === 0 || allMails.length === 0
  );

  const handleClick = (item) => {
    navigate(`/message/${item.id}`, {
      state: { threads:item.threadId,id:item.id,},
    });
  };

  // Animated background circles
  const circles = [
    { size: "w-20 h-20", color: "bg-blue-700", delay: 0, x: "10%", y: "20%" },
    { size: "w-32 h-32", color: "bg-purple-800", delay: 1, x: "70%", y: "80%" },
    { size: "w-40 h-40", color: "bg-blue-700", delay: 2, x: "40%", y: "50%" },
    { size: "w-24 h-24", color: "bg-purple-800", delay: 3, x: "80%", y: "30%" },
    { size: "w-28 h-28", color: "bg-blue-700", delay: 4, x: "20%", y: "90%" },
    { size: "w-36 h-36", color: "bg-purple-800", delay: 5, x: "50%", y: "10%" },
  ];

  const listVariants = {
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    hidden: { opacity: 0 },
  };

  const itemVariants = {
    visible: { opacity: 1, y: 0 },
    hidden: { opacity: 0, y: 20 },
  };

  useEffect(() => {
    // If everything is already cached, skip fetching
    if (user && labels.length > 0 && allMails.length > 0) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [userRes, labelRes, mailsRes] = await Promise.all([
          axios.get("http://localhost:5100/me", { withCredentials: true }),
          axios.get("http://localhost:5100/api/gmail/labels", { withCredentials: true }),
          axios.get("http://localhost:5100/api/gmail/mails", { withCredentials: true }),
        ]);

        if (userRes.data.loggedIn) {
          setUser(userRes.data.user);
          sessionStorage.setItem("user", JSON.stringify(userRes.data.user));
        }

        const filteredLabels = (labelRes.data.labels || []).filter(
          (label) =>
            !["CHAT", "INBOX", "STARRED", "YELLOW_STAR"].includes(label.name.toUpperCase())
        );
        setLabels(filteredLabels);
        sessionStorage.setItem("labels", JSON.stringify(filteredLabels));

        setAllMails(mailsRes.data.messages);
        console.log(mailsRes.data.messages)
        sessionStorage.setItem("allMails", JSON.stringify(mailsRes.data.messages));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, labels.length, allMails.length]);

  return (
    <div className="relative min-h-screen overflow-hidden font-sans text-gray-100 bg-gray-950">
      {/* Animated background */}
      <div className="absolute inset-0">
        {circles.map((circle, index) => (
          <motion.div
            key={index}
            className={`absolute rounded-full opacity-15 ${circle.size} ${circle.color}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.2, 1],
              opacity: [0, 0.15, 0.15, 0.1],
              x: [0, Math.random() * 200 - 100],
              y: [0, Math.random() * 200 - 100],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: circle.delay,
              repeatType: "reverse",
            }}
            style={{ left: circle.x, top: circle.y }}
          />
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="relative z-10 flex min-h-screen">
          {/* Labels sidebar */}
          <motion.div
            className="w-1/4 bg-gray-900/60 backdrop-blur-lg p-6 border-r border-gray-800 flex flex-col"
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-200">Gmail Labels</h3>
            <ul className="space-y-2 overflow-y-auto pr-2 flex-grow">
              {labels.map((label) => (
                <motion.li
                  key={label.id}
                  className="bg-gray-800/80 px-4 py-2 rounded-lg hover:bg-blue-800/70 cursor-pointer transition-colors duration-200 border border-transparent hover:border-blue-600"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {label.name}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Mail list */}
          <div className="flex-1 p-8 overflow-y-auto">
            {user ? (
              <motion.div
                className="relative bg-gradient-to-r from-blue-900 to-purple-900 p-6 rounded-xl shadow-lg backdrop-blur-md border border-blue-700 mb-8 overflow-hidden"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="absolute w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_10px_3px_rgba(59,130,246,0.8)]"
                  initial={{ x: 0, y: 0 }}
                  animate={{
                    x: ["0%", "100%", "100%", "0%", "0%"],
                    y: ["0%", "0%", "100%", "100%", "0%"],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{ top: "-6px", left: "-6px" }}
                />
                <h2 className="text-2xl font-semibold mb-2 text-blue-300">
                  Welcome, {user.name || user.email}
                </h2>
                <p className="text-blue-100 opacity-80">{user.email}</p>
              </motion.div>
            ) : (
              <div className="bg-gray-900/70 p-6 rounded-xl shadow-lg backdrop-blur-md border border-gray-700 mb-8">
                <p>Could not load user info.</p>
              </div>
            )}

            <motion.div className="space-y-4" initial="hidden" animate="visible" variants={listVariants}>
              {allMails.map((item) => (
                <motion.div
                  key={item.id}
                  className="bg-gray-800/80 p-4 rounded-lg border border-gray-700 hover:bg-blue-800/70 hover:border-blue-600 cursor-pointer transition-all duration-200"
                  variants={itemVariants}
                  whileHover={{ y: -3 }}
                  onClick={() => handleClick(item)}
                >
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-semibold text-gray-200 truncate pr-4">{item.from}</h4>
                  </div>
                  <h3 className="text-lg font-medium text-gray-300 mt-1">{item.subject}</h3>
                  <p className="text-sm text-gray-400 mt-2 truncate">{item.snippet}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
