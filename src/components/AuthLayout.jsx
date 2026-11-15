import { motion } from "framer-motion";
import { GraduationCap, Home, MapPin, ShieldCheck, Users } from "lucide-react";

const floatingIcons = [
  { Icon: Home, top: "12%", left: "10%", delay: "0s" },
  { Icon: GraduationCap, top: "22%", left: "72%", delay: "1s" },
  { Icon: MapPin, top: "62%", left: "14%", delay: "2s" },
  { Icon: Users, top: "74%", left: "66%", delay: "3s" },
];

const glow = {
  background:
    "radial-gradient(circle at 15% 15%, rgba(255,107,74,.35), transparent 40%), radial-gradient(circle at 85% 85%, rgba(165,180,252,.35), transparent 45%)",
};

export default function AuthLayout({
  headline,
  highlight,
  text,
  footerText = "Secure sign-in with encrypted passwords and verified Google login.",
  children,
}) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      {/* LEFT showcase */}
      <div className="relative hidden w-[45%] overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 lg:block">
        <div className="absolute inset-0" style={glow} />

        {floatingIcons.map(({ Icon, top, left, delay }, i) => (
          <div
            key={i}
            style={{ top, left, animationDelay: delay }}
            className="absolute flex h-16 w-16 animate-float items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white"
          >
            <Icon size={28} />
          </div>
        ))}

        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2.5 text-2xl font-extrabold">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary-600">
              <Home size={22} />
            </span>
            UniNest
          </div>

          <div>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-4xl font-extrabold leading-tight xl:text-5xl"
            >
              {headline}
              <br />
              <span className="text-accent-300">{highlight}</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-4 max-w-sm text-primary-100"
            >
              {text}
            </motion.p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4">
            <ShieldCheck className="shrink-0 text-accent-300" />
            <p className="text-sm text-primary-50">{footerText}</p>
          </div>
        </div>
      </div>

      {/* RIGHT content */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative w-full max-w-md rounded-3xl border border-border bg-white p-6 shadow-xl shadow-primary-900/10 sm:p-9"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}