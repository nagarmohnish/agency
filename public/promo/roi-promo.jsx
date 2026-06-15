// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// animations.jsx
// Reusable animation starter: Stage, Timeline, Sprite, easing helpers.
// Exports (to window): Stage, Sprite, PlaybackBar, TextSprite, ImageSprite, RectSprite,
//   useTime, useTimeline, useSprite, Easing, interpolate, animate, clamp.
//
// Usage (in an HTML file that loads React + Babel):
//
//   <Stage width={1280} height={720} duration={10} background="#f6f4ef">
//     <MyScene />
//   </Stage>
//
// <Stage> auto-scales to the viewport and provides the scrubber, play/pause,
// ←/→ seek, space, and 0-to-reset controls, and persists the playhead.
// Inside <Stage>, any child can call useTime() to read the current
// playhead (seconds). Or wrap content in <Sprite start={1} end={4}>...</Sprite>
// to only render during that window -- children receive a `localTime` and
// `progress` via the useSprite() hook. Use Easing + interpolate()/animate()
// for tweens; TextSprite / ImageSprite / RectSprite have built-in entry/exit.
// Build YOUR scenes by composing Sprites inside a Stage.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

// ── Easing functions (hand-rolled, Popmotion-style) ─────────────────────────
// All easings take t ∈ [0,1] and return eased t ∈ [0,1] (may overshoot for back/elastic).
const Easing = {
  linear: (t) => t,

  // Quad
  easeInQuad:    (t) => t * t,
  easeOutQuad:   (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  // Cubic
  easeInCubic:    (t) => t * t * t,
  easeOutCubic:   (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),

  // Quart
  easeInQuart:    (t) => t * t * t * t,
  easeOutQuart:   (t) => 1 - (--t) * t * t * t,
  easeInOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t),

  // Expo
  easeInExpo:  (t) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  easeOutExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutExpo: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return 0.5 * Math.pow(2, 20 * t - 10);
    return 1 - 0.5 * Math.pow(2, -20 * t + 10);
  },

  // Sine
  easeInSine:    (t) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine:   (t) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,

  // Back (overshoot)
  easeOutBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeInOutBack: (t) => {
    const c1 = 1.70158, c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },

  // Elastic
  easeOutElastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

// ── Core interpolation helpers ──────────────────────────────────────────────

// Clamp a value to [min, max]
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// interpolate([0, 0.5, 1], [0, 100, 50], ease?) -> fn(t)
// Popmotion-style: linearly maps t across input keyframes to output values,
// with optional easing per segment (single fn or array of fns).
function interpolate(input, output, ease = Easing.linear) {
  return (t) => {
    if (t <= input[0]) return output[0];
    if (t >= input[input.length - 1]) return output[output.length - 1];
    for (let i = 0; i < input.length - 1; i++) {
      if (t >= input[i] && t <= input[i + 1]) {
        const span = input[i + 1] - input[i];
        const local = span === 0 ? 0 : (t - input[i]) / span;
        const easeFn = Array.isArray(ease) ? (ease[i] || Easing.linear) : ease;
        const eased = easeFn(local);
        return output[i] + (output[i + 1] - output[i]) * eased;
      }
    }
    return output[output.length - 1];
  };
}

// animate({from, to, start, end, ease})(t) — simpler single-segment tween.
// Returns `from` before `start`, `to` after `end`.
function animate({ from = 0, to = 1, start = 0, end = 1, ease = Easing.easeInOutCubic }) {
  return (t) => {
    if (t <= start) return from;
    if (t >= end) return to;
    const local = (t - start) / (end - start);
    return from + (to - from) * ease(local);
  };
}

// ── Timeline context ────────────────────────────────────────────────────────

const TimelineContext = React.createContext({ time: 0, duration: 10, playing: false });

const useTime = () => React.useContext(TimelineContext).time;
const useTimeline = () => React.useContext(TimelineContext);

// ── Sprite ──────────────────────────────────────────────────────────────────
// Renders children only when the playhead is inside [start, end]. Provides
// a sub-context with `localTime` (seconds since start) and `progress` (0..1).
//
//   <Sprite start={2} end={5}>
//     {({ localTime, progress }) => <Thing x={progress * 100} />}
//   </Sprite>
//
// Or as a plain wrapper — children can call useSprite() themselves.

const SpriteContext = React.createContext({ localTime: 0, progress: 0, duration: 0 });
const useSprite = () => React.useContext(SpriteContext);

function Sprite({ start = 0, end = Infinity, children, keepMounted = false }) {
  const { time } = useTimeline();
  const visible = time >= start && time <= end;
  if (!visible && !keepMounted) return null;

  const duration = end - start;
  const localTime = Math.max(0, time - start);
  const progress = duration > 0 && isFinite(duration)
    ? clamp(localTime / duration, 0, 1)
    : 0;

  const value = { localTime, progress, duration, visible };

  return (
    <SpriteContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </SpriteContext.Provider>
  );
}

// ── Sample sprite components ────────────────────────────────────────────────

// TextSprite: fades/slides text in on entry, holds, then fades out on exit.
// Props: text, x, y, size, color, font, entryDur, exitDur, align
function TextSprite({
  text,
  x = 0, y = 0,
  size = 48,
  color = '#111',
  font = 'Inter, system-ui, sans-serif',
  weight = 600,
  entryDur = 0.45,
  exitDur = 0.35,
  entryEase = Easing.easeOutBack,
  exitEase = Easing.easeInCubic,
  align = 'left',
  letterSpacing = '-0.01em',
}) {
  const { localTime, duration } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);

  let opacity = 1;
  let ty = 0;

  if (localTime < entryDur) {
    const t = entryEase(clamp(localTime / entryDur, 0, 1));
    opacity = t;
    ty = (1 - t) * 16;
  } else if (localTime > exitStart) {
    const t = exitEase(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    ty = -t * 8;
  }

  const translateX = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      transform: `translate(${translateX}, ${ty}px)`,
      opacity,
      fontFamily: font,
      fontSize: size,
      fontWeight: weight,
      color,
      letterSpacing,
      whiteSpace: 'pre',
      lineHeight: 1.1,
      willChange: 'transform, opacity',
    }}>
      {text}
    </div>
  );
}

// ImageSprite: scales + fades in; optional Ken Burns drift during hold.
function ImageSprite({
  src,
  x = 0, y = 0,
  width = 400, height = 300,
  entryDur = 0.6,
  exitDur = 0.4,
  kenBurns = false,
  kenBurnsScale = 1.08,
  radius = 12,
  fit = 'cover',
  placeholder = null, // {label: string} for striped placeholder
}) {
  const { localTime, duration } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);

  let opacity = 1;
  let scale = 1;

  if (localTime < entryDur) {
    const t = Easing.easeOutCubic(clamp(localTime / entryDur, 0, 1));
    opacity = t;
    scale = 0.96 + 0.04 * t;
  } else if (localTime > exitStart) {
    const t = Easing.easeInCubic(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    scale = (kenBurns ? kenBurnsScale : 1) + 0.02 * t;
  } else if (kenBurns) {
    const holdSpan = exitStart - entryDur;
    const holdT = holdSpan > 0 ? (localTime - entryDur) / holdSpan : 0;
    scale = 1 + (kenBurnsScale - 1) * holdT;
  }

  const content = placeholder ? (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'repeating-linear-gradient(135deg, #e9e6df 0 10px, #dcd8cf 10px 20px)',
      color: '#6b6458',
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      fontSize: 13,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}>
      {placeholder.label || 'image'}
    </div>
  ) : (
    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: fit, display: 'block' }} />
  );

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width, height,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      borderRadius: radius,
      overflow: 'hidden',
      willChange: 'transform, opacity',
    }}>
      {content}
    </div>
  );
}

// RectSprite: simple rectangle that animates position/size/color via props.
// Useful demo primitive — takes a `render` fn for per-frame customization.
function RectSprite({
  x = 0, y = 0,
  width = 100, height = 100,
  color = '#111',
  radius = 8,
  entryDur = 0.4,
  exitDur = 0.3,
  render, // optional: (ctx) => style overrides
}) {
  const spriteCtx = useSprite();
  const { localTime, duration } = spriteCtx;
  const exitStart = Math.max(0, duration - exitDur);

  let opacity = 1;
  let scale = 1;

  if (localTime < entryDur) {
    const t = Easing.easeOutBack(clamp(localTime / entryDur, 0, 1));
    opacity = clamp(localTime / entryDur, 0, 1);
    scale = 0.4 + 0.6 * t;
  } else if (localTime > exitStart) {
    const t = Easing.easeInQuad(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    scale = 1 - 0.15 * t;
  }

  const overrides = render ? render(spriteCtx) : {};

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width, height,
      background: color,
      borderRadius: radius,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      willChange: 'transform, opacity',
      ...overrides,
    }} />
  );
}


function Stage({
  width = 1280,
  height = 720,
  duration = 10,
  background = '#f6f4ef',
  fps = 60,
  loop = true,
  autoplay = true,
  persistKey = 'animstage',
  children,
}) {
  const [time, setTime] = React.useState(() => {
    try {
      const v = parseFloat(localStorage.getItem(persistKey + ':t') || '0');
      return isFinite(v) ? clamp(v, 0, duration) : 0;
    } catch { return 0; }
  });
  const [playing, setPlaying] = React.useState(autoplay);
  const [hoverTime, setHoverTime] = React.useState(null);
  const [scale, setScale] = React.useState(1);

  const stageRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const lastTsRef = React.useRef(null);

  // Persist playhead
  React.useEffect(() => {
    try { localStorage.setItem(persistKey + ':t', String(time)); } catch {}
  }, [time, persistKey]);

  // Auto-scale to fit viewport
  React.useEffect(() => {
    if (!stageRef.current) return;
    const el = stageRef.current;
    const measure = () => {
      const barH = 44; // playback bar height
      const s = Math.min(
        el.clientWidth / width,
        (el.clientHeight - barH) / height
      );
      setScale(Math.max(0.05, s));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [width, height]);

  // Animation loop
  React.useEffect(() => {
    if (!playing) {
      lastTsRef.current = null;
      return;
    }
    const step = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      setTime((t) => {
        let next = t + dt;
        if (next >= duration) {
          if (loop) next = next % duration;
          else { next = duration; setPlaying(false); }
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [playing, duration, loop]);

  // Keyboard: space = play/pause, ← → = seek
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setPlaying(p => !p);
      } else if (e.code === 'ArrowLeft') {
        setTime(t => clamp(t - (e.shiftKey ? 1 : 0.1), 0, duration));
      } else if (e.code === 'ArrowRight') {
        setTime(t => clamp(t + (e.shiftKey ? 1 : 0.1), 0, duration));
      } else if (e.key === '0' || e.code === 'Home') {
        setTime(0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [duration]);

  const displayTime = hoverTime != null ? hoverTime : time;

  const ctxValue = React.useMemo(
    () => ({ time: displayTime, duration, playing, setTime, setPlaying }),
    [displayTime, duration, playing]
  );

  return (
    <div
      ref={stageRef}
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        background: '#0a0a0a',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Canvas area — vertically centered in remaining space */}
      <div style={{
        flex: 1,
        width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        <div
          ref={canvasRef}
          style={{
            width, height,
            background,
            position: 'relative',
            transform: `scale(${scale})`,
            transformOrigin: 'center',
            flexShrink: 0,
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            overflow: 'hidden',
          }}
        >
          <TimelineContext.Provider value={ctxValue}>
            {children}
          </TimelineContext.Provider>
        </div>
      </div>

      {/* Playback bar — stacked below canvas, never overlapping */}
      <PlaybackBar
        time={displayTime}
        actualTime={time}
        duration={duration}
        playing={playing}
        onPlayPause={() => setPlaying(p => !p)}
        onReset={() => { setTime(0); }}
        onSeek={(t) => setTime(t)}
        onHover={(t) => setHoverTime(t)}
      />
    </div>
  );
}

// ── Playback bar ────────────────────────────────────────────────────────────
// Play/pause, return-to-begin, scrub track, time display.
// Uses fixed-width time fields so layout doesn't thrash.

function PlaybackBar({ time, duration, playing, onPlayPause, onReset, onSeek, onHover }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);

  const timeFromEvent = React.useCallback((e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    return x * duration;
  }, [duration]);

  const onTrackMove = (e) => {
    if (!trackRef.current) return;
    const t = timeFromEvent(e);
    if (dragging) {
      onSeek(t);
    } else {
      onHover(t);
    }
  };

  const onTrackLeave = () => {
    if (!dragging) onHover(null);
  };

  const onTrackDown = (e) => {
    setDragging(true);
    const t = timeFromEvent(e);
    onSeek(t);
    onHover(null);
  };

  React.useEffect(() => {
    if (!dragging) return;
    const onUp = () => setDragging(false);
    const onMove = (e) => {
      if (!trackRef.current) return;
      const t = timeFromEvent(e);
      onSeek(t);
    };
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
    };
  }, [dragging, timeFromEvent, onSeek]);

  const pct = duration > 0 ? (time / duration) * 100 : 0;
  const fmt = (t) => {
    const total = Math.max(0, t);
    const m = Math.floor(total / 60);
    const s = Math.floor(total % 60);
    const cs = Math.floor((total * 100) % 100);
    return `${String(m).padStart(1, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };

  const mono = 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '8px 16px',
      background: 'rgba(20,20,20,0.92)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      width: '100%',
      maxWidth: 680,
      alignSelf: 'center',

      borderRadius: 8,
      color: '#f6f4ef',
      fontFamily: 'Inter, system-ui, sans-serif',
      userSelect: 'none',
      flexShrink: 0,
    }}>
      <IconButton onClick={onReset} title="Return to start (0)">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 2v10M12 2L5 7l7 5V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
        </svg>
      </IconButton>
      <IconButton onClick={onPlayPause} title="Play/pause (space)">
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="3" y="2" width="3" height="10" fill="currentColor"/>
            <rect x="8" y="2" width="3" height="10" fill="currentColor"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 2l9 5-9 5V2z" fill="currentColor"/>
          </svg>
        )}
      </IconButton>

      {/* Current time: fixed width so it doesn't thrash */}
      <div style={{
        fontFamily: mono,
        fontSize: 12,
        fontVariantNumeric: 'tabular-nums',
        width: 64, textAlign: 'right',
        color: '#f6f4ef',
      }}>
        {fmt(time)}
      </div>

      {/* Scrub track */}
      <div
        ref={trackRef}
        onMouseMove={onTrackMove}
        onMouseLeave={onTrackLeave}
        onMouseDown={onTrackDown}
        style={{
          flex: 1,
          height: 22,
          position: 'relative',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center',
        }}
      >
        <div style={{
          position: 'absolute',
          left: 0, right: 0, height: 4,
          background: 'rgba(255,255,255,0.12)',
          borderRadius: 2,
        }}/>
        <div style={{
          position: 'absolute',
          left: 0, width: `${pct}%`, height: 4,
          background: 'oklch(72% 0.12 250)',
          borderRadius: 2,
        }}/>
        <div style={{
          position: 'absolute',
          left: `${pct}%`, top: '50%',
          width: 12, height: 12,
          marginLeft: -6, marginTop: -6,
          background: '#fff',
          borderRadius: 6,
          boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
        }}/>
      </div>

      {/* Duration: fixed width */}
      <div style={{
        fontFamily: mono,
        fontSize: 12,
        fontVariantNumeric: 'tabular-nums',
        width: 64, textAlign: 'left',
        color: 'rgba(246,244,239,0.55)',
      }}>
        {fmt(duration)}
      </div>
    </div>
  );
}

function IconButton({ children, onClick, title }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 28, height: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hover ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 6,
        color: '#f6f4ef',
        cursor: 'pointer',
        padding: 0,
        transition: 'background 120ms',
      }}
    >
      {children}
    </button>
  );
}


Object.assign(window, {
  Easing, interpolate, animate, clamp,
  TimelineContext, useTime, useTimeline,
  Sprite, SpriteContext, useSprite,
  TextSprite, ImageSprite, RectSprite,
  Stage, PlaybackBar,
});



/* ===== ROI LABS PROMO SCENES ===== */

// roi-scenes.jsx — ROI Labs promo scenes.
// Appended after animations.jsx (Stage, Sprite, useTime, useSprite, Easing,
// interpolate, animate, clamp are all in lexical scope from the engine above).

const BG = '#f2f1f6';
const INK = '#1a1730';
const INDIGO = '#5b57f0';
const INDIGO_SOFT = '#a9a6f4';
const CORAL = '#f0563f';
const MUTED = '#8c89a0';
const GREEN = '#15a05a';
const FD = "'Hanken Grotesk', system-ui, sans-serif";
const FM = "'JetBrains Mono', ui-monospace, monospace";
const IMG = {
  overview: 'assets/dash-overview.png',
  google: 'assets/dash-google.png',
  meta: 'assets/dash-meta.png',
  shopify: 'assets/dash-shopify.png',
};

const fade = (lt, dur, inD = 0.55, outD = 0.55) => {
  if (lt < inD) return clamp(lt / inD, 0, 1);
  if (lt > dur - outD) return clamp((dur - lt) / outD, 0, 1);
  return 1;
};

// per-second label on the host root for commenting
function TimeLabel() {
  const t = useTime();
  React.useEffect(() => {
    const el = document.getElementById('promo-root');
    if (el) el.dataset.screenLabel = String(Math.floor(t)).padStart(2, '0') + 's';
  });
  return null;
}

// scene wrapper: gates to [start,end] and auto fades content in/out
function Scene({ start, end, children }) {
  return (
    <Sprite start={start} end={end}>
      {(s) => (
        <div style={{ position: 'absolute', inset: 0, opacity: fade(s.localTime, s.duration) }}>
          {typeof children === 'function' ? children(s) : children}
        </div>
      )}
    </Sprite>
  );
}

// ── persistent drifting background blobs ───────────────────────────────────
function Blobs() {
  const t = useTime();
  const blob = (cx, cy, r, color, phase, amp) => {
    const x = cx + Math.sin(t * 0.28 + phase) * amp;
    const y = cy + Math.cos(t * 0.22 + phase) * amp * 0.7;
    return (
      <div style={{
        position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, rgba(255,255,255,0) 70%)`,
        filter: 'blur(10px)',
      }} />
    );
  };
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {blob(430, 320, 460, 'rgba(91,87,240,0.16)', 0, 70)}
      {blob(1560, 770, 540, 'rgba(240,86,63,0.13)', 2, 80)}
      {blob(1320, 170, 380, 'rgba(120,140,255,0.13)', 4, 55)}
    </div>
  );
}

// ── browser-window frame around a product screenshot ───────────────────────
function BrowserFrame({ x, y, w, src, url, rot = 0, scale = 1, tx = 0, ty = 0, opacity = 1, z = 1 }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w,
      transformOrigin: 'center top',
      transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`,
      opacity, zIndex: z,
      borderRadius: 16, overflow: 'hidden', background: '#fff',
      boxShadow: '0 50px 100px rgba(26,23,48,0.24), 0 10px 30px rgba(26,23,48,0.10)',
    }}>
      <div style={{
        height: 42, display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px',
        background: '#fbfbfd', borderBottom: '1px solid #eeedf3',
      }}>
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
        <span style={{
          marginLeft: 14, fontFamily: FM, fontSize: 12, color: '#a3a1b4',
          background: '#f1f0f6', padding: '4px 14px', borderRadius: 7,
        }}>{url}</span>
      </div>
      <img src={src} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
    </div>
  );
}

function Cursor({ x, y, opacity = 1 }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, opacity,
      filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))', zIndex: 50,
    }}>
      <svg width="36" height="36" viewBox="0 0 24 24">
        <path d="M5 2.3l13.7 6.9-5.7 1.6-1.7 5.7L5 2.3z" fill="#1a1730" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Callout({ x, y, value, label, color = INDIGO, show }) {
  const sc = 0.6 + 0.4 * Easing.easeOutBack(clamp(show, 0, 1));
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `scale(${sc})`, transformOrigin: 'left center',
      opacity: clamp(show * 1.6, 0, 1), zIndex: 55,
      display: 'flex', alignItems: 'center', gap: 11,
      background: '#fff', borderRadius: 13, padding: '11px 16px',
      boxShadow: '0 18px 40px rgba(26,23,48,0.22)', border: '1px solid #efeef4',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
      <span style={{ fontFamily: FD, fontSize: 20, fontWeight: 700, color: INK }}>{value}</span>
      {label ? <span style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.08em', color: MUTED, textTransform: 'uppercase' }}>{label}</span> : null}
    </div>
  );
}

// ── Scene 1: brand intro ───────────────────────────────────────────────────
function FloatingChips({ lt }) {
  const chip = (x, y, label, value, color, ph) => {
    const o = clamp((lt - 0.4 - ph * 0.18) / 0.7, 0, 1);
    const dy = Math.sin(lt * 0.8 + ph) * 9;
    return (
      <div style={{
        position: 'absolute', left: x, top: y + dy,
        opacity: o * 0.96, transform: `translateY(${(1 - o) * 16}px)`,
        display: 'flex', alignItems: 'center', gap: 9,
        background: '#fff', borderRadius: 12, padding: '10px 14px',
        boxShadow: '0 20px 44px rgba(26,23,48,0.10)', border: '1px solid #eeedf3',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
        <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 19, color: INK }}>{value}</span>
        <span style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.08em', color: MUTED }}>{label}</span>
      </div>
    );
  };
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {chip(245, 255, 'ROAS', '3.22×', INDIGO, 0)}
      {chip(1430, 290, 'REVENUE', '₹42.8L', CORAL, 1)}
      {chip(300, 815, 'CPI', '₹34.8', INDIGO, 2)}
      {chip(1470, 770, 'ORDERS', '5,640', INDIGO, 3)}
    </div>
  );
}

function SceneIntro() {
  return (
    <Scene start={0} end={5.6}>
      {({ localTime: lt }) => {
        const titleO = clamp(lt / 0.5, 0, 1);
        const titleS = 0.9 + 0.1 * Easing.easeOutBack(clamp(lt / 0.7, 0, 1));
        const eyeO = clamp((lt - 0.3) / 0.5, 0, 1);
        const lineW = Easing.easeInOutCubic(clamp((lt - 0.7) / 0.7, 0, 1));
        const tagO = clamp((lt - 1.6) / 0.6, 0, 1);
        const driftY = -lt * 5;
        return (
          <div style={{ position: 'absolute', inset: 0 }}>
            <FloatingChips lt={lt} />
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', transform: `translateY(${driftY}px)`,
            }}>
              <div style={{ fontFamily: FM, fontSize: 18, letterSpacing: '0.34em', color: INDIGO, opacity: eyeO, transform: `translateY(${(1 - eyeO) * 10}px)`, marginBottom: 26 }}>
                AI-NATIVE PAID MEDIA AGENCY
              </div>
              <div style={{ fontFamily: FD, fontWeight: 800, fontSize: 152, letterSpacing: '-0.03em', lineHeight: 1, whiteSpace: 'nowrap', opacity: titleO, transform: `scale(${titleS})` }}>
                <span style={{ color: CORAL }}>ROI</span><span style={{ color: INK }}> Labs</span>
              </div>
              <div style={{ width: 540, height: 5, marginTop: 20, background: '#e3e1ee', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${lineW * 100}%`, background: `linear-gradient(90deg, ${INDIGO}, ${CORAL})`, borderRadius: 3 }} />
              </div>
              <div style={{ fontFamily: FD, fontSize: 31, fontWeight: 500, color: MUTED, marginTop: 30, opacity: tagO, transform: `translateY(${(1 - tagO) * 10}px)` }}>
                Paid media, measured in revenue.
              </div>
            </div>
          </div>
        );
      }}
    </Scene>
  );
}

// ── Scene 2: thesis ────────────────────────────────────────────────────────
function SceneThesis() {
  return (
    <Scene start={5.6} end={11.2}>
      {({ localTime: lt }) => {
        const line = (i) => { const o = clamp((lt - 0.3 - i * 0.5) / 0.6, 0, 1); return { opacity: o, transform: `translateY(${(1 - o) * 24}px)` }; };
        const cp = Easing.easeOutExpo(clamp((lt - 1.3) / 1.8, 0, 1));
        const rev = (42.8 * cp).toFixed(1);
        const panelO = clamp((lt - 1.0) / 0.7, 0, 1);
        const spark = 'M0 70 L40 62 L80 66 L120 50 L160 54 L200 38 L240 30 L300 14';
        return (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 130px' }}>
            <div style={{ fontFamily: FD, fontWeight: 800, fontSize: 88, lineHeight: 1.14, letterSpacing: '-0.03em' }}>
              <div style={{ color: INK, whiteSpace: 'nowrap', ...line(0) }}>Paid media,</div>
              <div style={{ color: INDIGO, whiteSpace: 'nowrap', ...line(1) }}>measured in revenue.</div>
              <div style={{ color: INK, whiteSpace: 'nowrap', ...line(2) }}>Scaled by <span style={{ color: CORAL }}>AI</span>.</div>
            </div>
            <div style={{
              width: 380, background: '#fff', borderRadius: 20, padding: '28px 30px',
              boxShadow: '0 40px 90px rgba(26,23,48,0.16)', border: '1px solid #eeedf3',
              opacity: panelO, transform: `translateY(${(1 - panelO) * 24}px)`,
            }}>
              <div style={{ fontFamily: FM, fontSize: 12, letterSpacing: '0.12em', color: MUTED }}>STORE REVENUE · 28D</div>
              <div style={{ fontFamily: FD, fontWeight: 800, fontSize: 72, letterSpacing: '-0.02em', color: INK, marginTop: 8, lineHeight: 1 }}>₹{rev}L</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 8, fontSize: 16 }}>
                <span style={{ color: GREEN, fontWeight: 700, fontFamily: FD }}>▲ 16.4%</span>
                <span style={{ color: MUTED, fontFamily: FD }}>vs prev period</span>
              </div>
              <svg viewBox="0 0 300 80" style={{ width: '100%', height: 70, marginTop: 16, display: 'block', overflow: 'visible' }}>
                <path d={spark} fill="none" stroke={INDIGO} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray="600" strokeDashoffset={(1 - cp) * 600} />
              </svg>
            </div>
          </div>
        );
      }}
    </Scene>
  );
}

// ── Scene 3: the cockpit ───────────────────────────────────────────────────
function SceneCockpit() {
  return (
    <Scene start={11.2} end={19.4}>
      {({ localTime: lt }) => {
        const riseO = clamp(lt / 0.8, 0, 1);
        const fy = interpolate([0, 1.0], [380, 300], Easing.easeOutCubic)(lt);
        const kb = 1 + 0.05 * Easing.easeInOutSine(clamp(lt / 8.2, 0, 1));
        const capO = clamp((lt - 0.3) / 0.6, 0, 1);
        const cx = interpolate([0, 1.0, 2.4, 3.4, 4.9, 8.2], [1560, 1560, 626, 626, 628, 628], Easing.easeInOutCubic)(lt);
        const cy = interpolate([0, 1.0, 2.4, 3.4, 4.9, 8.2], [1030, 1030, 486, 486, 540, 540], Easing.easeInOutCubic)(lt);
        const call1 = clamp((lt - 2.5) / 0.4, 0, 1) - clamp((lt - 4.3) / 0.3, 0, 1);
        const call2 = clamp((lt - 5.0) / 0.4, 0, 1);
        const ringO = clamp((lt - 5.0) / 0.3, 0, 1);
        const ringS = 1 + 0.18 * Math.sin(lt * 6);
        return (
          <div style={{ position: 'absolute', inset: 0 }}>
            <div style={{ position: 'absolute', left: 130, top: 120, opacity: capO, transform: `translateY(${(1 - capO) * 12}px)` }}>
              <div style={{ fontFamily: FM, fontSize: 14, letterSpacing: '0.18em', color: INDIGO }}>THE COCKPIT</div>
              <div style={{ fontFamily: FD, fontWeight: 800, fontSize: 48, letterSpacing: '-0.02em', color: INK, marginTop: 8 }}>
                Two funnels. One number that matters.
              </div>
            </div>
            <div style={{ transform: `scale(${kb})`, transformOrigin: 'center 62%' }}>
              <BrowserFrame x={360} y={fy} w={1200} src={IMG.overview} url="app.roilabs.in/engine"
                opacity={riseO} ty={(1 - riseO) * 34} />
            </div>
            {/* highlight ring on ROAS pill */}
            <div style={{
              position: 'absolute', left: 628 - 54, top: 540 - 22, width: 108, height: 44,
              border: `2.5px solid ${CORAL}`, borderRadius: 10, opacity: ringO * 0.9,
              transform: `scale(${ringS})`, transformOrigin: 'center', zIndex: 48,
              boxShadow: `0 0 0 6px rgba(240,86,63,0.12)`,
            }} />
            <Callout x={690} y={430} value="Real store revenue" label="Shopify net" color={INDIGO} show={call1} />
            <Callout x={700} y={600} value="3.22× ROAS" label="on ad spend" color={CORAL} show={call2} />
            <Cursor x={cx} y={cy} />
          </div>
        );
      }}
    </Scene>
  );
}

// ── Scene 4: every channel ─────────────────────────────────────────────────
function SceneChannels() {
  return (
    <Scene start={19.4} end={26.4}>
      {({ localTime: lt }) => {
        const capO = clamp((lt - 0.2) / 0.6, 0, 1);
        const card = (delay) => {
          const e = Easing.easeOutBack(clamp((lt - delay) / 0.9, 0, 1));
          const o = clamp((lt - delay) / 0.6, 0, 1);
          return { tx: (1 - e) * 520, opacity: o };
        };
        const g = card(0.0), s = card(0.5), m = card(1.0);
        const drift = (i) => Math.sin((lt + i) * 0.6) * 7;
        const chipO = clamp((lt - 4.4) / 0.5, 0, 1);
        const chip = (color, letter, name, top, left) => (
          <div style={{ position: 'absolute', left, top, zIndex: 60, display: 'flex', alignItems: 'center', gap: 9, background: '#fff', borderRadius: 11, padding: '8px 14px 8px 8px', boxShadow: '0 16px 36px rgba(26,23,48,0.16)', border: '1px solid #eeedf3' }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: '#fff', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FD, fontWeight: 800, fontSize: 15, color }}>{letter}</span>
            <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: INK }}>{name}</span>
          </div>
        );
        return (
          <div style={{ position: 'absolute', inset: 0 }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', opacity: capO, transform: `translateY(${(1 - capO) * 12}px)` }}>
              <div style={{ fontFamily: FM, fontSize: 14, letterSpacing: '0.18em', color: INDIGO }}>EVERY SOURCE, RECONCILED</div>
              <div style={{ fontFamily: FD, fontWeight: 800, fontSize: 48, letterSpacing: '-0.02em', color: INK, marginTop: 8 }}>
                Meta. Google. Shopify — one truth.
              </div>
            </div>
            <BrowserFrame x={235} y={350} w={650} src={IMG.google} url="app.roilabs.in/google" rot={-8} z={1} tx={g.tx} ty={drift(0)} opacity={g.opacity} />
            <BrowserFrame x={1035} y={385} w={650} src={IMG.shopify} url="app.roilabs.in/shopify" rot={8} z={2} tx={-s.tx + 0} ty={drift(1)} opacity={s.opacity} />
            <BrowserFrame x={635} y={300} w={680} src={IMG.meta} url="app.roilabs.in/meta" rot={0} z={3} tx={m.tx} ty={drift(2)} opacity={m.opacity} />
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', opacity: chipO, transform: `translateY(${(1 - chipO) * 14}px)`, zIndex: 65 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: INK, color: '#fff', borderRadius: 14, padding: '14px 22px', fontFamily: FD, fontWeight: 600, fontSize: 22, boxShadow: '0 20px 50px rgba(26,23,48,0.30)' }}>
                <span style={{ fontFamily: FM, fontSize: 13, letterSpacing: '0.1em', color: INDIGO_SOFT }}>BLENDED →</span>
                ₹42.8L revenue · 3.22× ROAS
              </span>
            </div>
          </div>
        );
      }}
    </Scene>
  );
}

// ── Scene 5: results ───────────────────────────────────────────────────────
function SceneResults() {
  return (
    <Scene start={26.4} end={31.8}>
      {({ localTime: lt }) => {
        const capO = clamp((lt - 0.2) / 0.6, 0, 1);
        const stat = (delay, render, label, x, color) => {
          const p = Easing.easeOutExpo(clamp((lt - delay) / 1.6, 0, 1));
          const o = clamp((lt - delay) / 0.5, 0, 1);
          return (
            <div style={{ position: 'absolute', left: x, top: 470, width: 360, textAlign: 'center', transform: `translateX(-50%) translateY(${(1 - o) * 18}px)`, opacity: o }}>
              <div style={{ fontFamily: FD, fontWeight: 800, fontSize: 104, letterSpacing: '-0.03em', color, lineHeight: 1 }}>{render(p)}</div>
              <div style={{ fontFamily: FM, fontSize: 15, letterSpacing: '0.14em', color: MUTED, marginTop: 14, textTransform: 'uppercase' }}>{label}</div>
            </div>
          );
        };
        return (
          <div style={{ position: 'absolute', inset: 0 }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', opacity: capO, transform: `translateY(${(1 - capO) * 12}px)` }}>
              <div style={{ fontFamily: FM, fontSize: 14, letterSpacing: '0.18em', color: INDIGO }}>LAST 28 DAYS · THE ASTRO TIME</div>
              <div style={{ fontFamily: FD, fontWeight: 800, fontSize: 52, letterSpacing: '-0.02em', color: INK, marginTop: 10 }}>The number that matters.</div>
            </div>
            {stat(0.0, (p) => '₹' + (42.8 * p).toFixed(1) + 'L', 'Store revenue', 500, INK)}
            {stat(0.25, (p) => (3.22 * p).toFixed(2) + '×', 'Blended ROAS', 960, INDIGO)}
            {stat(0.5, (p) => Math.round(5640 * p).toLocaleString(), 'Orders', 1420, CORAL)}
            <div style={{ position: 'absolute', left: 740, right: 740, top: 500, height: 90, borderLeft: '1px solid #dddbe6', borderRight: '1px solid #dddbe6', opacity: capO }} />
          </div>
        );
      }}
    </Scene>
  );
}

// ── Scene 6: CTA ───────────────────────────────────────────────────────────
function SceneCTA() {
  return (
    <Scene start={31.8} end={37.5}>
      {({ localTime: lt }) => {
        const headO = clamp((lt - 0.3) / 0.7, 0, 1);
        const subO = clamp((lt - 0.8) / 0.7, 0, 1);
        const btnO = clamp((lt - 1.3) / 0.6, 0, 1);
        const btnS = 0.9 + 0.1 * Easing.easeOutBack(clamp((lt - 1.3) / 0.7, 0, 1));
        const pulse = 1 + 0.02 * Math.sin(lt * 3.5);
        const footO = clamp((lt - 1.8) / 0.7, 0, 1);
        return (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: FD, fontWeight: 800, fontSize: 76, letterSpacing: '-0.03em', color: INK, textAlign: 'center', whiteSpace: 'nowrap', opacity: headO, transform: `translateY(${(1 - headO) * 18}px)`, lineHeight: 1.1 }}>
              <div>Put AI to work on</div>
              <div>your paid media.</div>
            </div>
            <div style={{ fontFamily: FD, fontSize: 30, fontWeight: 500, color: MUTED, marginTop: 22, opacity: subO, transform: `translateY(${(1 - subO) * 12}px)` }}>
              Measured in revenue — not ROAS.
            </div>
            <div style={{ marginTop: 46, opacity: btnO, transform: `scale(${btnS * pulse})` }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: INDIGO, color: '#fff', borderRadius: 16, padding: '20px 38px', fontFamily: FD, fontWeight: 700, fontSize: 28, boxShadow: '0 24px 60px rgba(91,87,240,0.40)' }}>
                Book your audit
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M5 12h13M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </div>
            <div style={{ position: 'absolute', bottom: 72, display: 'flex', alignItems: 'center', gap: 16, opacity: footO }}>
              <span style={{ fontFamily: FD, fontWeight: 800, fontSize: 26, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                <span style={{ color: CORAL }}>ROI</span><span style={{ color: INK }}> Labs</span>
              </span>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#c8c6d4' }} />
              <span style={{ fontFamily: FM, fontSize: 18, color: MUTED }}>roilabs.in</span>
            </div>
          </div>
        );
      }}
    </Scene>
  );
}

function RoiPromo() {
  return (
    <Stage width={1920} height={1080} duration={37.5} background={BG} persistKey="roi-promo">
      <Blobs />
      <TimeLabel />
      <SceneIntro />
      <SceneThesis />
      <SceneCockpit />
      <SceneChannels />
      <SceneResults />
      <SceneCTA />
    </Stage>
  );
}

window.RoiPromo = RoiPromo;
