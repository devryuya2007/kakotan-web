interface MiniResultMascotSvgProps {
  fillOffset: number;
  prefersReducedMotion: boolean;
  displayProgress: number;
}

// 水ちゃんSVGを分離して見通しを良くする
export function MiniResultMascotSvg({
  fillOffset,
  prefersReducedMotion,
  displayProgress,
}: MiniResultMascotSvgProps) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <path
          id="mini-result-water-shape"
          d="M100,20 C150,20 180,60 180,110 C180,170 150,190 100,190 C50,190 20,170 20,110 C20,60 50,20 100,20 Z"
        />
        <linearGradient id="mini-result-water-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.95" />
        </linearGradient>
        <clipPath id="mini-result-water-clip">
          <use href="#mini-result-water-shape" />
        </clipPath>
      </defs>
      <use
        href="#mini-result-water-shape"
        fill="rgba(255, 255, 255, 0.1)"
        stroke="rgba(255, 255, 255, 0.5)"
        strokeWidth="2"
      />
      <g clipPath="url(#mini-result-water-clip)">
        <g
          style={{
            // 獲得分の水位に合わせる
            transform: `translateY(${fillOffset}px)`,
            transition: prefersReducedMotion
              ? "none"
              : "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <path d="M-50,0 Q0,10 50,0 T150,0 T250,0 V200 H-50 Z" fill="url(#mini-result-water-gradient)">
            {!prefersReducedMotion && (
              <animate
                attributeName="d"
                dur="2.4s"
                repeatCount="indefinite"
                values="M-50,0 Q0,10 50,0 T150,0 T250,0 V200 H-50 Z;M-50,4 Q0,6 50,4 T150,4 T250,4 V200 H-50 Z;M-50,0 Q0,10 50,0 T150,0 T250,0 V200 H-50 Z"
              />
            )}
          </path>
          {prefersReducedMotion ? (
            <>
              <circle cx="50" cy="40" r="3" fill="rgba(255,255,255,0.6)" />
              <circle cx="120" cy="80" r="2" fill="rgba(255,255,255,0.6)" />
            </>
          ) : (
            <>
              <circle cx="50" cy="40" r="3" fill="rgba(255,255,255,0.6)">
                <animate attributeName="cy" from="40" to="-20" dur="1.5s" repeatCount="indefinite" begin="0s" />
                <animate attributeName="opacity" values="0.6;0" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="120" cy="80" r="2" fill="rgba(255,255,255,0.6)">
                <animate attributeName="cy" from="80" to="0" dur="2s" repeatCount="indefinite" begin="0.5s" />
                <animate attributeName="opacity" values="0.6;0" dur="2s" repeatCount="indefinite" />
              </circle>
            </>
          )}
        </g>
      </g>
      {/* 表情は50%以上でニコ */}
      <g transform="translate(0, 10)">
        {displayProgress >= 0.5 ? (
          <>
            <path d="M60,100 Q70,92 80,100" fill="none" stroke="#0b1020" strokeWidth="4" strokeLinecap="round" />
            <path d="M120,100 Q130,92 140,100" fill="none" stroke="#0b1020" strokeWidth="4" strokeLinecap="round" />
            <path d="M86,108 Q100,122 114,108" fill="none" stroke="#0b1020" strokeWidth="3" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx="70" cy="100" rx="8" ry="12" fill="#1e293b" />
            <circle cx="73" cy="96" r="3" fill="#ffffff" />
            <ellipse cx="130" cy="100" rx="8" ry="12" fill="#1e293b" />
            <circle cx="133" cy="96" r="3" fill="#ffffff" />
            <path d="M90,110 Q100,115 110,110" fill="none" stroke="#0b1020" strokeWidth="3" strokeLinecap="round" />
          </>
        )}
        <ellipse cx="60" cy="115" rx="6" ry="3" fill="#fda4af" opacity="0.6" />
        <ellipse cx="140" cy="115" rx="6" ry="3" fill="#fda4af" opacity="0.6" />
      </g>
    </svg>
  );
}
