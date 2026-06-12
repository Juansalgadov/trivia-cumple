'use client';

import { useMemo } from 'react';
import styles from './FloatingDecorations.module.css';

const seededRandom = (seed) => {
  const value = Math.sin(seed + 1) * 10000;
  return value - Math.floor(value);
};

export default function FloatingDecorations({ count = 15 }) {
  const decorations = useMemo(() => {
    const emojis = ['🎈', '🎁', '✨', '🎊', '🎉', '🌟'];
    
    return Array.from({ length: count }).map((_, i) => {
      const emoji = emojis[Math.floor(seededRandom(i) * emojis.length)];
      const size = 1.5 + seededRandom(i + 10) * 2; // rem
      const x = seededRandom(i + 20) * 100; // vw
      const y = seededRandom(i + 30) * 100; // vh
      const duration = 15 + seededRandom(i + 40) * 20; // s
      const delay = seededRandom(i + 50) * 5; // s
      const blur = seededRandom(i + 60) * 4; // px
      const opacity = 0.15 + seededRandom(i + 70) * 0.25;

      return { id: i, emoji, size, x, y, duration, delay, blur, opacity };
    });
  }, [count]);

  return (
    <div className={styles.decorationsContainer} aria-hidden="true">
      {decorations.map((dec) => (
        <div
          key={dec.id}
          className={styles.floatingItem}
          style={{
            '--x': `${dec.x}vw`,
            '--y': `${dec.y}vh`,
            '--size': `${dec.size}rem`,
            '--duration': `${dec.duration}s`,
            '--delay': `${dec.delay}s`,
            '--blur': `${dec.blur}px`,
            '--opacity': dec.opacity,
          }}
        >
          {dec.emoji}
        </div>
      ))}
    </div>
  );
}
