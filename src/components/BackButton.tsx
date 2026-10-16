import { motion } from 'framer-motion';

interface Props {
  onClick: () => void;
  className?: string;
}

export default function BackButton({ onClick, className = '' }: Props) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className={`w-12 h-12 bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md border border-white/50 ${className}`}
      aria-label="뒤로가기"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M11 4L6 9L11 14" stroke="#0ea5e9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </motion.button>
  );
}
