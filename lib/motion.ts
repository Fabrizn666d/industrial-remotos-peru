import type { Transition, Variants } from "framer-motion";

export const motionEase = {
  enter: [0.22, 1, 0.36, 1],
  long: [0.65, 0, 0.35, 1]
} as const;

export const motionDuration = {
  micro: 0.24,
  normal: 0.8,
  hero: 1.16,
  reduced: 0.18
} as const;

export const motionDistance = {
  scroll: 28,
  hero: 48,
  mobile: 22
} as const;

export const motionStagger = {
  cards: 0.08,
  hero: 0.1
} as const;

export const scrollViewport = {
  once: true,
  amount: 0.2
} as const;

type FadeUpOptions = {
  delay?: number;
  distance?: number;
  duration?: number;
};

export function createFadeUpVariants(
  reduceMotion: boolean,
  options: FadeUpOptions = {}
): Variants {
  const {
    delay = 0,
    distance = motionDistance.scroll,
    duration = motionDuration.normal
  } = options;

  return {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? motionDuration.reduced : duration,
        delay: reduceMotion ? 0 : delay,
        ease: motionEase.enter
      }
    }
  };
}

export function createStaggerContainer(
  reduceMotion: boolean,
  delayChildren = 0
): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        delayChildren: reduceMotion ? 0 : delayChildren,
        staggerChildren: reduceMotion ? 0 : motionStagger.cards
      }
    }
  };
}

export function motionTransition(
  reduceMotion: boolean,
  duration = motionDuration.normal,
  delay = 0
): Transition {
  return {
    duration: reduceMotion ? motionDuration.reduced : duration,
    delay: reduceMotion ? 0 : delay,
    ease: motionEase.enter
  };
}
