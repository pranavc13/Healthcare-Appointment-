import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  useReducedMotion,
} from 'framer-motion';

export const EASE = [0.22, 1, 0.36, 1];

const DIRECTIONS = {
  up: { y: 34, x: 0 },
  down: { y: -34, x: 0 },
  left: { y: 0, x: 40 },
  right: { y: 0, x: -40 },
  none: { y: 0, x: 0 },
};

/** Fades + slides children in the first time they scroll into view. */
export function Reveal({
  children,
  as: Tag = 'div',
  direction = 'up',
  delay = 0,
  duration = 0.7,
  amount = 0.25,
  blur = true,
  className,
  ...rest
}) {
  const reduce = useReducedMotion();
  const offset = DIRECTIONS[direction] || DIRECTIONS.up;
  const MotionTag = motion[Tag] || motion.div;

  if (reduce) return <Tag className={className} {...rest}>{children}</Tag>;

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, ...offset, filter: blur ? 'blur(6px)' : 'none' }}
      whileInView={{ opacity: 1, y: 0, x: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

/** Parent that staggers any <RevealItem> descendants. */
export function RevealGroup({ children, className, stagger = 0.09, delay = 0, amount = 0.2, ...rest }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={{ visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export const revealItemVariants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(5px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.65, ease: EASE } },
};

export function RevealItem({ children, className, as: Tag = 'div', ...rest }) {
  const MotionTag = motion[Tag] || motion.div;
  return (
    <MotionTag className={className} variants={revealItemVariants} {...rest}>
      {children}
    </MotionTag>
  );
}

/** Splits a headline into words that rise into place one after another. */
export function AnimatedHeading({ text, className, wordClassName = '', delay = 0, stagger = 0.055 }) {
  const reduce = useReducedMotion();
  const words = String(text).split(' ');

  if (reduce) return <span className={className}>{text}</span>;

  return (
    <motion.span
      className={className}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className={`inline-block ${wordClassName}`}
            variants={{
              hidden: { y: '110%', opacity: 0 },
              visible: { y: '0%', opacity: 1, transition: { duration: 0.85, ease: EASE } },
            }}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/** Counts from 0 to `value` when scrolled into view. */
export function CountUp({ value, duration = 1.8, decimals = 0, prefix = '', suffix = '', className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView || reduce) return undefined;
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration, reduce]);

  const formatted = display.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return <span ref={ref} className={className}>{prefix}{formatted}{suffix}</span>;
}

/** Card that tilts toward the pointer with a soft spring. */
export function TiltCard({ children, className, max = 8, scale = 1.015, ...rest }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [max, -max]), { stiffness: 220, damping: 22 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-max, max]), { stiffness: 220, damping: 22 });

  const onMove = (e) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const reset = () => { mx.set(0); my.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      whileHover={reduce ? undefined : { scale }}
      style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Element drifts slightly against scroll direction. */
export function Parallax({ children, className, distance = 60, ...rest }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  return (
    <motion.div ref={ref} style={reduce ? undefined : { y }} className={className} {...rest}>
      {children}
    </motion.div>
  );
}

/** Infinite horizontal ticker. Children are duplicated for a seamless loop. */
export function Marquee({ children, reverse = false, speed = 38, className = '', itemClassName = '' }) {
  return (
    <div className={`marquee-mask overflow-hidden ${className}`}>
      <div
        className="flex w-max gap-3 hover:[animation-play-state:paused]"
        style={{
          animation: `${reverse ? 'marquee-rev' : 'marquee'} ${speed}s linear infinite`,
        }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 gap-3" aria-hidden={copy === 1}>
            {children.map((child, i) => (
              <div key={i} className={itemClassName}>{child}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Thin gold progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[60] bg-gradient-to-r from-brand-700 via-gold-400 to-brand-700"
      aria-hidden
    />
  );
}
