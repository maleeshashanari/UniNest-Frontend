import { motion } from "framer-motion";
import { GraduationCap, Home, MapPin, ShieldCheck, Users } from "lucide-react";

const floatingIcons = [
  { Icon: Home, top: "12%", left: "10%", delay: 0 },
  { Icon: GraduationCap, top: "22%", left: "72%", delay: 0.6 },
  { Icon: MapPin, top: "62%", left: "14%", delay: 1.2 },
  { Icon: Users, top: "74%", left: "66%", delay: 1.8 },
];

export default function AuthLayout({
  headline,
  highlight,
  text,
  footerText = "Secure sign-in with encrypted passwords and verified Google login.",
  children,
}) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      {/* LEFT: animated showcase */}
      <div className="relative hidden w-[45%] overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 bg-[length:200%_200%] animate-gradient lg:block">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-accent-500/40 blur-3xl animate-blob" />
        <div className="absolute -right-10 bottom-10 h-80 w-80 rounded-full bg-primary-300/40 blur-3xl animate-blob [animation-delay:4s]" />

        {floatingIcons.map(({ Icon, top, left, delay }, i) => (
          <motion.div
            key={i}
            style={{ top, left }}
            animate={{ y: [0, -18, 0], rotate: [0, 6, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay, ease: "easeInOut" }}
            className="absolute flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md"
          >
            <Icon size={28} />
          </motion.div>
        ))}

        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5 text-2xl font-extrabold"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary-600">
              <Home size={22} />
            </span>
            UniNest
          </motion.div>

          <div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl font-extrabold leading-tight xl:text-5xl"
            >
              {headline}
              <br />
              <span className="text-accent-300">{highlight}</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 max-w-sm text-primary-100"
            >
              {text}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md"
          >
            <ShieldCheck className="shrink-0 text-accent-300" />
            <p className="text-sm text-primary-50">{footerText}</p>
          </motion.div>
        </div>
      </div>

      {/* RIGHT: page content */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-200/60 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-accent-100 blur-3xl animate-blob [animation-delay:6s]" />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative w-full max-w-md rounded-3xl border border-white bg-white/70 p-6 shadow-2xl shadow-primary-900/10 backdrop-blur-xl sm:p-9"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}