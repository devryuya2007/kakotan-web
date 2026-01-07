import {
  type CSSProperties,
  useId,
  useRef,
} from "react";

import { gsap } from "gsap";

interface ExpIndicatorProps {
  value: number;
  isPulse: boolean;
  prefersReducedMotion: boolean;
  isCompact: boolean;
  fillRatio: number;
  className?: string;
}

// テスト中の累積EXPを表示する小さなコンポーネント
export const ExpIndicator = ({
  value,
  isPulse,
  prefersReducedMotion,
  isCompact,
  fillRatio,
  className,
}: ExpIndicatorProps) => {
  // 複数表示されてもIDがかぶらないようにユニークなIDを作る
  const baseId = useId().replace(/:/g, "");
  // SVG内の定義を参照するためのIDをまとめて用意する
  const charShapeId = `${baseId}-shape`;
  const waterGradientId = `${baseId}-water`;
  const clipPathId = `${baseId}-clip`;
  const expIndicatorClass =
    className ??
    (isCompact
      ? "absolute left-1/2 top-[6px] z-[30] -translate-x-1/2"
      : "absolute left-1/2 top-[14px] z-[30] -translate-x-1/2");
  const expIndicatorInnerClass = `relative inline-flex ${
    isCompact ? "h-[54px] w-[54px]" : "h-[70px] w-[70px]"
  } items-center justify-center ${
    isPulse ? "scale-[1.03]" : "scale-100"
  } ${prefersReducedMotion ? "" : "transition-transform duration-300"}`;
  // 波の形を2パターン用意して、左右移動ではなく形だけ揺らす
  const wavePathBase = "M-50,0 Q0,10 50,0 T150,0 T250,0 V200 H-50 Z";
  const wavePathAlt = "M-50,4 Q0,6 50,4 T150,4 T250,4 V200 H-50 Z";
  // 0〜1で来る比率を0〜100の水位に変換して使う
  const fillLevel = Math.min(100, Math.max(0, fillRatio * 100));
  // 50%以上で表情をニコっと変える
  const isHappyFace = fillLevel >= 50;
  // 水位に合わせて水面の位置を上下させる（下が空、上が満タン）
  const waterTranslateY = 190 - (170 * fillLevel) / 100;
  // 低減設定のときはアニメを止めるためにtransitionを切る
  const waterStyle: CSSProperties = {
    transform: `translateY(${waterTranslateY}px)`,
    transition: prefersReducedMotion
      ? "none"
      : "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  };
  const mascotRef = useRef<HTMLButtonElement | null>(null);
  const bounceTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const handleMascotTap = () => {
    if (prefersReducedMotion) return;
    const mascot = mascotRef.current;
    if (!mascot) return;

    if (bounceTimelineRef.current) {
      bounceTimelineRef.current.kill();
      bounceTimelineRef.current = null;
    }

    bounceTimelineRef.current = gsap
      .timeline()
      .to(mascot, {
        y: -12,
        scale: 1.14,
        duration: 0.14,
        ease: "power1.out",
        overwrite: "auto",
      })
      .to(mascot, {
        y: 0,
        scale: 1,
        duration: 0.26,
        ease: "bounce.out",
      });
  };

  return (
    <div className={expIndicatorClass} aria-live="polite" data-testid="exp-indicator">
      <button
        ref={mascotRef}
        type="button"
        className={`${expIndicatorInnerClass} border-none bg-transparent p-0`}
        onClick={handleMascotTap}
        aria-label="水ちゃんを動かす"
      >
        <svg
          className="absolute inset-0 h-full w-full -translate-y-[2px]"
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          <defs>
            <path
              id={charShapeId}
              d="M100,20 C150,20 180,60 180,110 C180,170 150,190 100,190 C50,190 20,170 20,110 C20,60 50,20 100,20 Z"
            />
            <linearGradient id={waterGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.95" />
            </linearGradient>
            <clipPath id={clipPathId}>
              <use href={`#${charShapeId}`} />
            </clipPath>
          </defs>

          <use
            href={`#${charShapeId}`}
            fill="rgba(255, 255, 255, 0.1)"
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth="2"
          />

          <g clipPath={`url(#${clipPathId})`}>
            <g style={waterStyle}>
              <path d={wavePathBase} fill={`url(#${waterGradientId})`}>
                {!prefersReducedMotion && (
                  <animate
                    attributeName="d"
                    dur="2.4s"
                    repeatCount="indefinite"
                    values={`${wavePathBase};${wavePathAlt};${wavePathBase}`}
                  />
                )}
              </path>
              <circle cx="50" cy="40" r="3" fill="rgba(255,255,255,0.6)">
                <animate attributeName="cy" from="40" to="-20" dur="1.5s" repeatCount="indefinite" begin="0s" />
                <animate attributeName="opacity" values="0.6;0" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="120" cy="80" r="2" fill="rgba(255,255,255,0.6)">
                <animate attributeName="cy" from="80" to="0" dur="2s" repeatCount="indefinite" begin="0.5s" />
                <animate attributeName="opacity" values="0.6;0" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          </g>
          {/* 顔は水より手前に出してキャラ感を優先する */}
          <g transform="translate(0, 10)">
            {isHappyFace ? (
              <>
                <path d="M60,100 Q70,92 80,100" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
                <path d="M120,100 Q130,92 140,100" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
              </>
            ) : (
              <>
                <ellipse cx="70" cy="100" rx="8" ry="12" fill="#1e293b" />
                <circle cx="73" cy="96" r="3" fill="#ffffff" />
                <ellipse cx="130" cy="100" rx="8" ry="12" fill="#1e293b" />
                <circle cx="133" cy="96" r="3" fill="#ffffff" />
              </>
            )}
            <path
              d={isHappyFace ? "M86,108 Q100,122 114,108" : "M90,110 Q100,115 110,110"}
              fill="none"
              stroke="#1e293b"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <ellipse cx="60" cy="115" rx="6" ry="3" fill="#fda4af" opacity="0.6" />
            <ellipse cx="140" cy="115" rx="6" ry="3" fill="#fda4af" opacity="0.6" />
          </g>
        </svg>
        <span className="sr-only">{value}</span>
      </button>
    </div>
  );
};
