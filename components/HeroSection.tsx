"use client";

import { motion } from "motion/react";
import Link from "next/link";

export function HeroSection() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 py-20">
      <div className="relative z-10 mx-auto max-w-6xl text-center">
        <h1 className="text-4xl font-bold text-slate-700 md:text-6xl lg:text-8xl dark:text-slate-300 mb-6">
          {"Track time like a pro with TimePulse"
            .split(" ")
            .map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
        </h1>
        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 0.8,
          }}
          className="mx-auto max-w-2xl text-lg font-normal text-neutral-600 dark:text-neutral-400 mb-8"
        >
          Streamline your timesheet management with our powerful platform.
          Contractors can easily log hours, while managers can review and approve with ease.
        </motion.p>
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 1,
          }}
          className="flex flex-wrap items-center justify-center gap-6"
        >
          <Link href="/signup?role=contractor">
            <button className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-xl border border-white/20 px-8 py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              <div className="relative flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Sign up as Contractor
              </div>
            </button>
          </Link>
          <Link href="/signup?role=manager">
            <button className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 px-8 py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/25">
              <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              <div className="relative flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Sign up as Manager
              </div>
            </button>
          </Link>
        </motion.div>
        
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
            delay: 1.1,
          }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium"
            >
              Sign in here
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
