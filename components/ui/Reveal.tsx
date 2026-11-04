'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { variants, fm } from '@/lib/motion';

type Props = {
  children: ReactNode;
  variant?: 'rise' | 'plate' | 'clip';
  delay?: number;
  className?: string;
  as?: 'div' | 'li' | 'section' | 'article' | 'p';
};

const clip = {
  hidden: { clipPath: 'inset(0 0 100% 0)', y: 24 },
  show: { clipPath: 'inset(0 0 0% 0)', y: 0, transition: fm.section },
};

/** Entrances are never plain fades: blur-to-sharp rise, scale-in plate, or clip wipe. */
export function Reveal({ children, variant = 'rise', delay = 0, className, as = 'div' }: Props) {
  const MotionTag = motion[as] as typeof motion.div;
  const v = variant === 'rise' ? variants.rise : variant === 'plate' ? variants.plate : clip;
  return (
    <MotionTag
      className={className}
      variants={v}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}
