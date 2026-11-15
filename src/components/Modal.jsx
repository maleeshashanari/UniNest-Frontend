import { motion } from "framer-motion";

export default function Modal({ onClose, children, maxWidth = "max-w-md" }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ${maxWidth}`}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}