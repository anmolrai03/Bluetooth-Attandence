import { motion } from 'framer-motion';

export default function AnimatedButton({
  children,
  onClick,
  className = "",
  ...props
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-4 py-2 rounded-lg transition-colors ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}