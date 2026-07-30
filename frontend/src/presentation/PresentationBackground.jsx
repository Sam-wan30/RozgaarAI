export function PresentationBackground() {
  return (
    <div className="presentation-background" aria-hidden="true">
      <div className="ppt-bg-wash" />
      <div className="ppt-dot-grid ppt-dot-left" />
      <div className="ppt-dot-grid ppt-dot-right" />
      <div className="ppt-outline ppt-outline-left-one" />
      <div className="ppt-outline ppt-outline-left-two" />
      <div className="ppt-outline ppt-outline-right-one" />
      <div className="ppt-outline ppt-outline-right-two" />
      <svg className="ppt-voice-wave" viewBox="0 0 320 210" preserveAspectRatio="none">
        <circle cx="160" cy="104" r="72" />
        <circle cx="160" cy="104" r="112" />
        <path d="M0 104 H28 C36 104 36 77 44 77 C52 77 52 132 60 132 C68 132 68 52 76 52 C84 52 84 156 92 156 C100 156 100 80 108 80 C116 80 116 128 124 128 C132 128 132 72 140 72 C148 72 148 136 156 136 C164 136 164 86 172 86 H196 C204 86 204 136 212 136 C220 136 220 72 228 72 C236 72 236 128 244 128 C252 128 252 80 260 80 C268 80 268 156 276 156 C284 156 284 52 292 52 C300 52 300 132 308 132 C316 132 316 104 324 104" />
        <path className="ppt-mic" d="M160 71 C171 71 178 79 178 90 V110 C178 123 170 132 160 132 C149 132 142 123 142 110 V90 C142 79 149 71 160 71 Z M130 106 C130 128 142 145 160 145 C178 145 190 128 190 106 M160 145 V169 M145 169 H175" />
      </svg>
      <svg className="ppt-skyline" viewBox="0 0 720 230" preserveAspectRatio="none">
        <path d="M0 230 L0 156 L22 156 L22 128 L42 128 L42 98 L62 128 L62 156 L92 156 L92 83 L108 83 L108 60 L123 60 L123 83 L138 83 L138 156 L170 156 C175 112 212 78 258 78 C304 78 342 112 346 156 L390 156 C394 112 426 88 462 88 C496 88 526 116 530 156 L566 156 L566 126 L590 126 L590 98 L612 126 L612 156 L648 156 L648 134 L675 134 L675 156 L720 156 L720 230 Z" />
        <path d="M92 83 C100 69 130 69 138 83" />
      </svg>
      <svg className="ppt-network" viewBox="0 0 360 260" preserveAspectRatio="none">
        <path d="M24 196 L82 154 L136 176 L196 126 L258 148 L338 80" />
        <path d="M82 154 L126 96 L196 126 L246 62 L338 80" />
        <circle cx="24" cy="196" r="5" />
        <circle cx="82" cy="154" r="5" />
        <circle cx="136" cy="176" r="5" />
        <circle cx="196" cy="126" r="5" />
        <circle cx="258" cy="148" r="5" />
        <circle cx="338" cy="80" r="5" />
        <circle cx="126" cy="96" r="5" />
        <circle cx="246" cy="62" r="5" />
      </svg>
      <svg className="ppt-growth" viewBox="0 0 380 320" preserveAspectRatio="none">
        <path className="ppt-growth-curve" d="M10 286 C94 260 144 190 204 136 C262 84 306 56 360 22" />
        <path className="ppt-arrow-head" d="M337 14 L370 8 L358 41 Z" />
        <rect x="78" y="252" width="34" height="62" rx="5" />
        <rect x="146" y="216" width="36" height="98" rx="5" />
        <rect x="218" y="162" width="38" height="152" rx="5" />
        <rect x="294" y="112" width="40" height="202" rx="5" />
      </svg>
      <div className="ppt-mascot">
        <span className="ppt-mascot-head"><i /><b /></span>
        <span className="ppt-mascot-body"><i /></span>
      </div>
    </div>
  );
}
