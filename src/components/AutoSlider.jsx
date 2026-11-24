import { useState, useEffect, useRef } from 'react';
import { optimize, PLACEHOLDER_IMG } from '../lib/constants.js';

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * يعرض مجموعة صور، ولو أكتر من صورة بيقلبهم لوحده.
 * بيبدأ بتأخير عشوائي عشان كروت كتير ما تقلبش في نفس اللحظة.
 */
const AutoSlider = ({ images, alt, interval = 3200, width = 600, className = '', dots = true }) => {
  const list = images?.length ? images : [PLACEHOLDER_IMG];
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const offset = useRef(Math.random() * 1200);

  useEffect(() => setI(0), [list.length, list[0]]);

  useEffect(() => {
    if (list.length < 2 || paused || reduced()) return;
    let t;
    const start = setTimeout(() => { t = setInterval(() => setI((c) => (c + 1) % list.length), interval); }, offset.current);
    return () => { clearTimeout(start); clearInterval(t); };
  }, [list.length, paused, interval]);

  return (
    <div className={`relative w-full h-full ${className}`} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {list.map((src, idx) => (
        <img
          key={src + idx}
          src={src === PLACEHOLDER_IMG ? src : optimize(src, width)}
          alt={idx === 0 ? alt : ''}
          loading={idx === 0 ? 'lazy' : 'lazy'}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${idx === i ? 'opacity-100' : 'opacity-0'}`}
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER_IMG; }}
        />
      ))}
      {dots && list.length > 1 && (
        <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1 pointer-events-none">
          {list.map((_, idx) => (
            <span key={idx} className={`h-1.5 rounded-full transition-all ${idx === i ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AutoSlider;
