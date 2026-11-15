import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, KeyRound, UserRound } from "lucide-react";

import Avatar from "../components/Avatar";
import { getUser } from "../utils/auth";

const cards = [
  {
    to: "/profile",
    title: "Edit profile",
    text: "Update your name, phone and university.",
    Icon: UserRound,
  },
  {
    to: "/change-password",
    title: "Change password",
    text: "Keep your account secure.",
    Icon: KeyRound,
  },
];

export default function Home() {
  const user = getUser();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4 rounded-3xl bg-gradient-to-br from-primary-700 to-primary-500 p-6 text-white sm:p-8">
        <Avatar src={user?.image} name={`${user?.firstName || ""} ${user?.lastName || ""}`} size={72} />
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">
            Welcome{user ? `, ${user.firstName}` : ""}!
          </h1>
          <p className="text-sm text-primary-100">
            {user?.university || "Add your university in your profile"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map(({ to, title, text, Icon }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-2xl border border-border bg-white p-6 transition-all hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg hover:shadow-primary-500/10"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Icon size={22} />
            </div>
            <h2 className="font-extrabold text-ink">{title}</h2>
            <p className="mt-1 text-sm text-muted">{text}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary-600">
              Open <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}