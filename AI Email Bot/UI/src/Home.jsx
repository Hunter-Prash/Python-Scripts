import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import axios from "axios"

const floatingCircle = (className, animateProps, duration) => (
  <motion.div
    className={`absolute ${className} rounded-full opacity-20 filter blur-2xl`}
    animate={animateProps}
    transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
  />
)

function Home() {
  const [login, setLogin] = useState(false) 

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await axios.get('http://localhost:5100/me', { withCredentials: true })
        if (response.data.loggedIn) {
          setLogin(true)
          
          window.location.href = "/dashboard" // redirect if logged in
          //console.log(response.data) this console will log in the home screen but we will already bre redirect from there..(lol)
        } 
      } catch (err) {
        console.error(err)
      }
    }

    checkLogin()
  }, [])

  if (login === null) {
    return <p>Loading...</p> // show while checking login status
  }

  const handleClick = () => {
    window.location.href = "http://3.110.77.65:5100/auth/google"
  }

  return (
    <div className="relative min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center gap-6 p-10 overflow-hidden">

      {/* Animated background circles */}
      {floatingCircle("w-96 h-96 bg-blue-600 top-0 left-1/4", { y: [0, 50, 0], x: [0, 30, 0] }, 8)}
      {floatingCircle("w-72 h-72 bg-pink-500 bottom-0 right-1/4", { y: [0, -40, 0], x: [0, -20, 0] }, 10)}
      {floatingCircle("w-40 h-40 bg-green-400 top-20 right-20", { y: [0, 30, 0], x: [0, -15, 0] }, 6)}
      {floatingCircle("w-32 h-32 bg-purple-500 bottom-24 left-16", { y: [0, -20, 0], x: [0, 10, 0] }, 7)}
      {floatingCircle("w-24 h-24 bg-yellow-400 top-1/3 left-1/3", { y: [0, 25, 0], x: [0, -10, 0] }, 5)}

      {/* Content */}
      <h2 className="text-4xl font-bold text-center z-10">
        AI Email Board Summarizer
      </h2>
      <p className="text-gray-400 text-center max-w-md z-10">
        Quickly summarize your inbox and stay on top of your emails effortlessly.
      </p>
      <Button className="bg-blue-600 hover:bg-blue-700 text-white z-10 cursor-pointer" size="lg" onClick={handleClick}>
        Login with Google
      </Button>
    </div>
  )
}

export default Home
