"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="relative w-full max-w-md overflow-hidden p-1">
      <AnimatePresence mode="wait">
        {isLogin ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -30, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 30, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <LoginForm onSwitchMode={() => setIsLogin(false)} />
          </motion.div>
        ) : (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: 30, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -30, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <RegisterForm onSwitchMode={() => setIsLogin(true)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
