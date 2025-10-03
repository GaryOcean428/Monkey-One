import React from 'react'
import { motion } from 'framer-motion'
import { NeonMonkey } from '../components/Logo/NeonMonkey'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

export const Login: React.FC = () => {
  return (
    <div className="bg-bg-darker flex min-h-screen items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <NeonMonkey size="xl" />
          <motion.h2
            className="text-text-primary mt-6 text-center text-3xl font-bold tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Monkey One
          </motion.h2>
          <motion.p
            className="text-text-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Your AI Development Companion
          </motion.p>
        </div>

        <motion.div
          className="mt-8 space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email address"
                className="bg-bg-light text-text-primary focus:ring-neon-pink/50 border-none focus:ring-2"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                className="bg-bg-light text-text-primary focus:ring-neon-blue/50 border-none focus:ring-2"
              />
            </div>
          </div>

          <div>
            <Button className="from-neon-pink to-neon-blue w-full bg-gradient-to-r transition-opacity hover:opacity-90">
              Sign in
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="#" className="text-neon-blue hover:text-neon-purple">
                Forgot your password?
              </a>
            </div>
            <div className="text-sm">
              <a href="#" className="text-neon-pink hover:text-neon-purple">
                Create account
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Login
