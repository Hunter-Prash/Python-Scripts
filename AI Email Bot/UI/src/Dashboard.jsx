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

  const [user, setUser] = useState(() => JSON.parse(sessionStorage.getItem("user")) || null);
  const [labels, setLabels] = useState(() => JSON.parse(sessionStorage.getItem("labels")) || []);
  const [allMails, setAllMails] = useState(() => JSON.parse(sessionStorage.getItem("allMails")) || []);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(!user || labels.length === 0 || allMails.length === 0);

  const handleClick = (item) => {
    navigate(`/message/${item.id}`, {
      state: { threads: item.threadId, id: item.id },
    });
  };

const handleLabels = (category) => {
  if (category === "All") {
    setFiltered([]);
    return;
  }

  // Remove CATEGORY_ prefix if present
  const cleanedCategory = category.replace(/^CATEGORY_/, "");

  const temp = allMails.filter(
    (mail) => (mail.category || "").toLowerCase() === cleanedCategory.toLowerCase()
  );

  setFiltered(temp);
};


  // Fetch data
  useEffect(() => {
    if (user && labels.length > 0 && allMails.length > 0) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [userRes, labelRes, mailsRes] = await Promise.all([
          axios.get("http://3.110.77.65:5100/me", { withCredentials: true }),//add ec2 public ip instead of local host while accessing from the cloud .. everyitme you restart the instance the public ip will also change
          axios.get("http://3.110.77.65:5100/api/gmail/labels", { withCredentials: true }),
          axios.get("http://3.110.77.65:5100/api/gmail/mails", { withCredentials: true }),
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
        sessionStorage.setItem("allMails", JSON.stringify(mailsRes.data.messages));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, labels.length, allMails.length]);

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

  const mailsToDisplay = filtered.length > 0 ? filtered : allMails;//if not filtered mail is found then render all mails

  return (
    <div className="relative min-h-screen overflow-hidden font-sans text-gray-100 bg-gray-950">
      {/* Background animation */}
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

            {["System Labels", "Other"].map((section) => {
              const sectionLabels =
                section === "System Labels"
                  ? labels.filter((label) =>
                      ["INBOX", "STARRED", "SENT",  "SPAM"].includes(label.name.toUpperCase())
                    )
                  : labels.filter(
                      (label) =>
                        !["INBOX", "STARRED", "SENT", "DRAFT", "SPAM", "TRASH","UNREAD"].includes(label.name.toUpperCase())
                    );

              return (
                <div key={section} className="mb-6">
                  <h4 className={`text-lg font-medium mb-2 ${section === "System Labels" ? "text-blue-400" : "text-purple-400"}`}>
                    {section}
                  </h4>
                  <ul className="space-y-2 pr-2 flex-grow overflow-hidden">
                    {sectionLabels.map((label) => (
                      <motion.li
                        key={label.id}
                        className="bg-gray-800/80 px-4 py-2 rounded-lg hover:bg-blue-800/70 cursor-pointer transition-colors duration-200 border border-transparent hover:border-blue-600"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleLabels(label.name)}
                      >
                        {label.name}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </motion.div>

          {/* Mail list */}
          <div className="flex-1 p-8 overflow-y-auto">
            {user && (
              <motion.div
                className="relative bg-gradient-to-r from-blue-900 to-purple-900 p-6 rounded-xl shadow-lg backdrop-blur-md border border-blue-700 mb-8 overflow-hidden"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-semibold mb-2 text-blue-300">
                  Welcome, {user.name || user.email}
                </h2>
                <p className="text-blue-100 opacity-80">{user.email}</p>
              </motion.div>
            )}

            {mailsToDisplay.length > 0 ? (
              <motion.div className="space-y-4" initial="hidden" animate="visible" variants={listVariants}>
                {mailsToDisplay.map((item) => (
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
            ) : (
              <p className="text-gray-500 text-center mt-4">No mails to display.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
