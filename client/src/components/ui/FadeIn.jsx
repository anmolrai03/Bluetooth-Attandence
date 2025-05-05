import { motion } from 'framer-motion';

export default function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration }}
      {...props}
    >
      {children}
    </motion.div>
  );
}