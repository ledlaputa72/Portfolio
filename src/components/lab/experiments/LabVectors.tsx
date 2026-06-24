import type { ReactNode } from "react";

type VectorCardProps = {
  children: ReactNode;
  className?: string;
  label?: string;
};

export function LabVectorCard({ children, className = "", label }: VectorCardProps) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-lg ${className}`}
      aria-hidden={!label}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      {children}
    </div>
  );
}

/* ── Hiroto Sato — light neutral, yellow tag, blue arrow ── */

export function HirotoMirrorVector({ className = "h-40" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#e4e2dd] ${className}`} label="Mirror showreel">
      <svg viewBox="0 0 160 160" className="h-full w-full p-6">
        <line x1="80" y1="140" x2="80" y2="95" stroke="#d1cfc9" strokeWidth="2" />
        <ellipse cx="80" cy="72" rx="38" ry="38" fill="none" stroke="#c8c5be" strokeWidth="1.5" />
        <rect x="52" y="48" width="56" height="44" rx="4" fill="#1a1a1a" />
        <text x="80" y="66" textAnchor="middle" fill="#9ca3af" fontSize="7" fontFamily="system-ui">
          SHOWREEL
        </text>
        <text x="80" y="82" textAnchor="middle" fill="#facc15" fontSize="5" fontFamily="system-ui">
          START
        </text>
      </svg>
    </LabVectorCard>
  );
}

export function HirotoTagVector({ className = "h-40" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#eeedea] ${className}`} label="Tag sign">
      <svg viewBox="0 0 160 100" className="h-full w-full p-8">
        <rect x="20" y="35" width="120" height="36" rx="3" fill="#facc15" />
        <text x="80" y="58" textAnchor="middle" fill="#151515" fontSize="10" fontWeight="700" fontFamily="system-ui">
          HIROTO SATO
        </text>
      </svg>
    </LabVectorCard>
  );
}

export function HirotoArrowVector({ className = "h-40" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#eeedea] ${className}`} label="Archive arrow">
      <svg viewBox="0 0 160 80" className="h-full w-full p-6">
        <rect x="10" y="28" width="110" height="28" rx="2" fill="#3b82f6" />
        <polygon points="120,42 145,28 145,56" fill="#3b82f6" />
        <text x="55" y="47" textAnchor="middle" fill="#f8fafc" fontSize="7" fontFamily="system-ui">
          ARCHIVE
        </text>
      </svg>
    </LabVectorCard>
  );
}

/* ── DANZAN — dark shell, crimson core ── */

export function DanzanShellVector({ className = "h-40" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#141210] ${className}`} label="Layer A shell">
      <svg viewBox="0 0 160 160" className="h-full w-full">
        <rect width="160" height="160" fill="#1a1816" />
        {[...Array(8)].map((_, i) => (
          <line key={i} x1={i * 22} y1="0" x2={i * 22 + 40} y2="160" stroke="#2a2520" strokeWidth="0.5" />
        ))}
        <line x1="20" y1="140" x2="140" y2="20" stroke="#8b1a1a" strokeWidth="1" opacity="0.4" />
      </svg>
    </LabVectorCard>
  );
}

export function DanzanCutVector({ className = "h-40" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#0a0908] ${className}`} label="Cut plane">
      <svg viewBox="0 0 160 160" className="h-full w-full p-4">
        <line x1="24" y1="136" x2="136" y2="24" stroke="#d6cfc4" strokeWidth="1.5" strokeDasharray="6 5" opacity="0.5" />
        <circle cx="80" cy="80" r="4" fill="#8b1a1a" opacity="0.8" />
      </svg>
    </LabVectorCard>
  );
}

export function DanzanCoreVector({ className = "h-40" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#3d0a10] ${className}`} label="Layer B core">
      <svg viewBox="0 0 160 160" className="h-full w-full">
        <rect width="160" height="160" fill="#5c1018" />
        <circle cx="80" cy="80" r="30" fill="none" stroke="#e8dfd2" strokeWidth="0.5" opacity="0.3" />
        <text x="80" y="88" textAnchor="middle" fill="#f5e6d3" fontSize="36" fontFamily="serif" opacity="0.9">
          斬
        </text>
      </svg>
    </LabVectorCard>
  );
}

/* ── Tony Mak — minimal light grid ── */

export function TonyMakGridVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`border border-[#e5e5e0] bg-[#f7f7f2] ${className}`} label="Project grid">
      <svg viewBox="0 0 200 160" className="h-full w-full p-6">
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => (
            <rect
              key={`${row}-${col}`}
              x={20 + col * 56}
              y={20 + row * 44}
              width="48"
              height="36"
              fill="none"
              stroke="#111111"
              strokeWidth="0.75"
              opacity={0.15 + (row + col) * 0.05}
            />
          )),
        )}
      </svg>
    </LabVectorCard>
  );
}

export function TonyMakWipeVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#f7f7f2] ${className}`} label="Case study wipe">
      <svg viewBox="0 0 200 120" className="h-full w-full">
        <rect x="20" y="20" width="80" height="80" fill="none" stroke="#111111" strokeWidth="0.5" opacity="0.2" />
        <rect x="60" y="48" width="120" height="24" fill="#111111" opacity="0.85" />
        <text x="120" y="64" textAnchor="middle" fill="#f7f7f2" fontSize="8" fontFamily="system-ui" letterSpacing="2">
          ABOUT
        </text>
      </svg>
    </LabVectorCard>
  );
}

export function TonyMakCursorVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#f7f7f2] ${className}`} label="Custom cursor zone">
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <circle cx="60" cy="60" r="28" fill="none" stroke="#111111" strokeWidth="1" opacity="0.25" />
        <circle cx="60" cy="60" r="3" fill="#111111" opacity="0.6" />
        <line x1="60" y1="28" x2="60" y2="40" stroke="#111111" strokeWidth="0.75" opacity="0.3" />
        <line x1="60" y1="80" x2="60" y2="92" stroke="#111111" strokeWidth="0.75" opacity="0.3" />
        <line x1="28" y1="60" x2="40" y2="60" stroke="#111111" strokeWidth="0.75" opacity="0.3" />
        <line x1="80" y1="60" x2="92" y2="60" stroke="#111111" strokeWidth="0.75" opacity="0.3" />
      </svg>
    </LabVectorCard>
  );
}

/* ── Lesse Studio — editorial grid ── */

export function LesseGridVector({ className = "h-52" }: { className?: string }) {
  return (
    <LabVectorCard className={`border border-[#e2e0da] bg-[#f6f5f1] ${className}`} label="Case study grid">
      <svg viewBox="0 0 200 160" className="h-full w-full p-5">
        <line x1="20" y1="20" x2="180" y2="20" stroke="#1a1a18" strokeWidth="0.5" opacity="0.15" />
        <rect x="20" y="30" width="75" height="100" fill="none" stroke="#1a1a18" strokeWidth="0.75" opacity="0.2" />
        <rect x="105" y="30" width="75" height="46" fill="none" stroke="#1a1a18" strokeWidth="0.75" opacity="0.15" />
        <rect x="105" y="84" width="75" height="46" fill="none" stroke="#1a1a18" strokeWidth="0.75" opacity="0.15" />
        <line x1="30" y1="130" x2="85" y2="130" stroke="#1a1a18" strokeWidth="0.5" opacity="0.1" />
        <line x1="30" y1="140" x2="70" y2="140" stroke="#1a1a18" strokeWidth="0.5" opacity="0.1" />
      </svg>
    </LabVectorCard>
  );
}

export function LesseManifestoVector({ className = "h-52" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#f0efeb] ${className}`} label="Studio manifesto">
      <svg viewBox="0 0 160 160" className="h-full w-full p-8">
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="20"
            y1={36 + i * 22}
            x2={120 - i * 12}
            y2={36 + i * 22}
            stroke="#1a1a18"
            strokeWidth="0.75"
            opacity={0.12 + i * 0.04}
          />
        ))}
        <circle cx="130" cy="130" r="12" fill="none" stroke="#1a1a18" strokeWidth="0.5" opacity="0.2" />
      </svg>
    </LabVectorCard>
  );
}

/* ── KVS — glitch HUD ── */

export function KvsGlitchVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#0a0a0a] ${className}`} label="Glitch hero">
      <svg viewBox="0 0 200 100" className="h-full w-full">
        <text x="30" y="62" fill="#f0f0f0" fontSize="42" fontWeight="900" fontFamily="monospace">
          KVS
        </text>
        <text x="34" y="58" fill="#ff00aa" fontSize="42" fontWeight="900" fontFamily="monospace" opacity="0.5">
          KVS
        </text>
        <text x="26" y="66" fill="#00ff9c" fontSize="42" fontWeight="900" fontFamily="monospace" opacity="0.35">
          KVS
        </text>
      </svg>
    </LabVectorCard>
  );
}

export function KvsHudVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#111] ${className}`} label="HUD overlay">
      <svg viewBox="0 0 160 120" className="h-full w-full p-4">
        <polyline points="12,12 12,32 32,32" fill="none" stroke="#00ff9c" strokeWidth="1" opacity="0.6" />
        <polyline points="148,12 148,32 128,32" fill="none" stroke="#00ff9c" strokeWidth="1" opacity="0.6" />
        <polyline points="12,108 12,88 32,88" fill="none" stroke="#00ff9c" strokeWidth="1" opacity="0.6" />
        <polyline points="148,108 148,88 128,88" fill="none" stroke="#00ff9c" strokeWidth="1" opacity="0.6" />
        <line x1="80" y1="48" x2="80" y2="72" stroke="#f0f0f0" strokeWidth="0.5" opacity="0.3" />
        <line x1="68" y1="60" x2="92" y2="60" stroke="#f0f0f0" strokeWidth="0.5" opacity="0.3" />
        <text x="80" y="100" textAnchor="middle" fill="#00ff9c" fontSize="7" fontFamily="monospace" opacity="0.5">
          1280×720
        </text>
      </svg>
    </LabVectorCard>
  );
}

/* ── Razorpay — #151515 + #0039FF ── */

export function RazorpayLogoVector({ className = "h-8 w-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 28" className={className} aria-label="Razorpay">
      <rect width="96" height="28" rx="4" fill="#0039FF" />
      <text x="48" y="18" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700" fontFamily="system-ui" letterSpacing="1">
        RAZORPAY
      </text>
    </svg>
  );
}

export function RazorpayProductVector({ className = "h-40" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#1a1a1a] ${className}`} label="Product reveal grid">
      <svg viewBox="0 0 160 120" className="h-full w-full p-5">
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => (
            <rect
              key={`${row}-${col}`}
              x={16 + col * 46}
              y={16 + row * 34}
              width="38"
              height="26"
              rx="13"
              fill="none"
              stroke="#0039FF"
              strokeWidth="1"
              opacity={0.3 + (row + col) * 0.15}
            />
          )),
        )}
      </svg>
    </LabVectorCard>
  );
}

export function RazorpayCounterVector({ className = "h-40" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#151515] ${className}`} label="Trigger counter">
      <svg viewBox="0 0 160 100" className="h-full w-full p-4">
        <line x1="20" y1="70" x2="140" y2="70" stroke="#333" strokeWidth="2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={20 + i * 30} y1="65" x2={20 + i * 30} y2="75" stroke="#555" strokeWidth="1" />
        ))}
        <circle cx="80" cy="70" r="8" fill="#0039FF" />
        <text x="80" y="40" textAnchor="middle" fill="#ffffff" fontSize="22" fontWeight="700" fontFamily="system-ui">
          247
        </text>
        <text x="80" y="55" textAnchor="middle" fill="#ffffff" fontSize="6" fontFamily="system-ui" opacity="0.4">
          TRIGGERS
        </text>
      </svg>
    </LabVectorCard>
  );
}

export function RazorpayFlowVector({ className = "h-40" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#151515] ${className}`} label="Payment flow">
      <svg viewBox="0 0 180 80" className="h-full w-full p-4">
        {[
          { x: 30, label: "CART" },
          { x: 90, label: "PAY" },
          { x: 150, label: "DONE" },
        ].map((node, i) => (
          <g key={node.label}>
            <circle cx={node.x} cy="40" r="14" fill="none" stroke="#0039FF" strokeWidth="1.5" />
            <text x={node.x} y="44" textAnchor="middle" fill="#fff" fontSize="5" fontFamily="system-ui">
              {node.label}
            </text>
            {i < 2 ? (
              <line x1={node.x + 16} y1="40" x2={node.x + 44} y2="40" stroke="#0039FF" strokeWidth="1" opacity="0.5" />
            ) : null}
          </g>
        ))}
      </svg>
    </LabVectorCard>
  );
}

export function RazorpayRunnerVector({ className = "h-[50vh]" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#151515] ${className}`} label="Giant object hero">
      <svg viewBox="0 0 400 200" className="h-full w-full">
        <ellipse cx="200" cy="170" rx="120" ry="12" fill="#0039FF" opacity="0.15" />
        <rect x="170" y="60" width="60" height="90" rx="30" fill="#0039FF" />
        <circle cx="200" cy="50" r="22" fill="#0039FF" />
        <line x1="185" y1="100" x2="165" y2="130" stroke="#0039FF" strokeWidth="8" strokeLinecap="round" />
        <line x1="215" y1="100" x2="235" y2="125" stroke="#0039FF" strokeWidth="8" strokeLinecap="round" />
        <line x1="185" y1="150" x2="175" y2="165" stroke="#0039FF" strokeWidth="8" strokeLinecap="round" />
        <line x1="215" y1="150" x2="225" y2="165" stroke="#0039FF" strokeWidth="8" strokeLinecap="round" />
      </svg>
    </LabVectorCard>
  );
}

/* ── Synapser — warm dark + gold ── */

export function SynapserTorusVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#1a1512] ${className}`} label="Blender torus">
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <ellipse cx="60" cy="60" rx="40" ry="16" fill="none" stroke="#c9a66b" strokeWidth="1" opacity="0.6" />
        <ellipse cx="60" cy="60" rx="40" ry="16" fill="none" stroke="#c9a66b" strokeWidth="0.5" opacity="0.3" transform="rotate(60 60 60)" />
        <ellipse cx="60" cy="60" rx="40" ry="16" fill="none" stroke="#c9a66b" strokeWidth="0.5" opacity="0.3" transform="rotate(-60 60 60)" />
      </svg>
    </LabVectorCard>
  );
}

export function SynapserScrollVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#0f0c0a] ${className}`} label="ScrollTrigger observer">
      <svg viewBox="0 0 160 100" className="h-full w-full p-4">
        <rect x="20" y="20" width="120" height="60" rx="2" fill="none" stroke="#c9a66b" strokeWidth="0.75" opacity="0.4" />
        <line x1="20" y1="50" x2="140" y2="50" stroke="#c9a66b" strokeWidth="0.5" strokeDasharray="4 3" opacity="0.3" />
        <polygon points="75,42 85,50 75,58" fill="#c9a66b" opacity="0.5" />
        <text x="80" y="90" textAnchor="middle" fill="#f0ebe3" fontSize="6" fontFamily="monospace" opacity="0.35">
          scrub 0→1
        </text>
      </svg>
    </LabVectorCard>
  );
}

/* ── PRODUX — bold type ── */

export function ProduxSplitVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#f4f2ed] ${className}`} label="SplitText word units">
      <svg viewBox="0 0 200 100" className="h-full w-full">
        <text x="24" y="58" fill="#111" fontSize="28" fontWeight="900" fontFamily="system-ui">
          TO
        </text>
        <text x="72" y="48" fill="#111" fontSize="28" fontWeight="900" fontFamily="system-ui" opacity="0.5">
          GE
        </text>
        <text x="72" y="72" fill="#111" fontSize="28" fontWeight="900" fontFamily="system-ui" opacity="0.5">
          TH
        </text>
        <text x="130" y="58" fill="#111" fontSize="28" fontWeight="900" fontFamily="system-ui">
          ER
        </text>
        <line x1="68" y1="20" x2="68" y2="85" stroke="#111" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.2" />
        <line x1="126" y1="20" x2="126" y2="85" stroke="#111" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.2" />
      </svg>
    </LabVectorCard>
  );
}

export function ProduxRevealVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#ebe8e1] ${className}`} label="Scroll reveal section">
      <svg viewBox="0 0 160 120" className="h-full w-full p-6">
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x="20"
            y={20 + i * 22}
            width={100 + i * 10}
            height="14"
            fill="#111"
            opacity={0.08 + i * 0.06}
          />
        ))}
      </svg>
    </LabVectorCard>
  );
}

/* ── Iris K — black minimal, music sheet ── */

export function IrisWaveformVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#101010] ${className}`} label="Audio waveform">
      <svg viewBox="0 0 200 80" className="h-full w-full px-4">
        <path
          d="M 10 40 Q 30 20, 50 40 T 90 40 T 130 25 T 170 40 T 190 35"
          fill="none"
          stroke="#efefef"
          strokeWidth="1"
          opacity="0.5"
        />
        {[20, 45, 70, 95, 120, 145, 170].map((x, i) => (
          <line
            key={x}
            x1={x}
            y1={40 - (i % 3) * 8 - 4}
            x2={x}
            y2={40 + (i % 4) * 6 + 4}
            stroke="#ffffff"
            strokeWidth="1"
            opacity={0.2 + (i % 3) * 0.15}
          />
        ))}
      </svg>
    </LabVectorCard>
  );
}

export function IrisMusicSheetVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#0a0a0a] ${className}`} label="Music sheet">
      <svg viewBox="0 0 160 120" className="h-full w-full p-6">
        {[28, 40, 52, 64, 76].map((y) => (
          <line key={y} x1="20" y1={y} x2="140" y2={y} stroke="#efefef" strokeWidth="0.5" opacity="0.25" />
        ))}
        {[
          { x: 45, y: 52 },
          { x: 68, y: 40 },
          { x: 92, y: 64 },
          { x: 115, y: 52 },
        ].map((n) => (
          <ellipse key={`${n.x}-${n.y}`} cx={n.x} cy={n.y} rx="5" ry="4" fill="#ffffff" opacity="0.55" />
        ))}
        <line x1="38" y1="28" x2="38" y2="76" stroke="#efefef" strokeWidth="0.75" opacity="0.3" />
      </svg>
    </LabVectorCard>
  );
}

export function IrisPianoKeysVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#101010] ${className}`} label="Piano keys">
      <svg viewBox="0 0 200 80" className="h-full w-full p-4">
        {Array.from({ length: 10 }, (_, i) => (
          <rect
            key={i}
            x={16 + i * 17}
            y="16"
            width="15"
            height="48"
            fill={i % 2 === 0 ? "#efefef" : "#d8d8d8"}
            opacity="0.85"
            rx="1"
          />
        ))}
        {[1, 3, 6, 8].map((i) => (
          <rect
            key={`b-${i}`}
            x={24 + i * 17}
            y="16"
            width="9"
            height="28"
            fill="#101010"
            opacity="0.9"
          />
        ))}
      </svg>
    </LabVectorCard>
  );
}

/* ── Glitch&Grit — editorial cream + RGB burst ── */

export function GritRgbShiftVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#edeae4] ${className}`} label="RGB channel shift">
      <svg viewBox="0 0 200 100" className="h-full w-full p-6">
        <text x="50" y="58" fill="#ff0066" fontSize="28" fontWeight="900" fontFamily="system-ui" opacity="0.55">
          GRIT
        </text>
        <text x="46" y="54" fill="#0a0a0a" fontSize="28" fontWeight="900" fontFamily="system-ui">
          GRIT
        </text>
        <text x="54" y="62" fill="#00d4ff" fontSize="28" fontWeight="900" fontFamily="system-ui" opacity="0.45">
          GRIT
        </text>
      </svg>
    </LabVectorCard>
  );
}

export function GritNoiseVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#e8e5df] ${className}`} label="Grit noise texture">
      <svg viewBox="0 0 160 120" className="h-full w-full">
        {Array.from({ length: 120 }, (_, i) => (
          <rect
            key={i}
            x={(i * 17) % 160}
            y={Math.floor((i * 17) / 160) * 3}
            width="1.5"
            height="1.5"
            fill="#0a0a0a"
            opacity={0.04 + (i % 7) * 0.02}
          />
        ))}
        <line x1="20" y1="90" x2="140" y2="90" stroke="#0a0a0a" strokeWidth="0.5" opacity="0.15" />
      </svg>
    </LabVectorCard>
  );
}

export function GritProjectCardVector({ className = "h-52" }: { className?: string }) {
  return (
    <LabVectorCard className={`border border-[#d8d4cc] bg-[#f2f0eb] ${className}`} label="Work project card">
      <svg viewBox="0 0 200 140" className="h-full w-full p-5">
        <rect x="20" y="20" width="70" height="90" fill="#c8c2b8" opacity="0.5" />
        <line x1="100" y1="28" x2="180" y2="28" stroke="#0a0a0a" strokeWidth="2" opacity="0.7" />
        <line x1="100" y1="42" x2="160" y2="42" stroke="#0a0a0a" strokeWidth="1" opacity="0.25" />
        <line x1="100" y1="54" x2="150" y2="54" stroke="#0a0a0a" strokeWidth="1" opacity="0.15" />
        <text x="100" y="100" fill="#0a0a0a" fontSize="7" fontFamily="system-ui" opacity="0.4" letterSpacing="2">
          VIEW PROJECT
        </text>
      </svg>
    </LabVectorCard>
  );
}

/* ── digitalists — #171717 + #f1e500 ── */

export function DigitalistsServiceVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`border border-[#2e2e2e] bg-[#1e1e1e] ${className}`} label="Service card">
      <svg viewBox="0 0 160 120" className="h-full w-full p-4">
        <rect x="16" y="16" width="128" height="60" fill="#2a2a2a" />
        <rect x="16" y="16" width="4" height="88" fill="#f1e500" />
        <rect x="16" y="88" width="128" height="3" fill="#f1e500" opacity="0.8" />
        <text x="28" y="38" fill="#f2f2f2" fontSize="9" fontWeight="700" fontFamily="system-ui">
          Branding
        </text>
        <text x="28" y="52" fill="#f2f2f2" fontSize="7" fontFamily="system-ui" opacity="0.45">
          &amp; Design
        </text>
        <text x="28" y="100" fill="#f1e500" fontSize="6" fontFamily="monospace">
          SVC 01
        </text>
      </svg>
    </LabVectorCard>
  );
}

export function DigitalistsCaseVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#171717] ${className}`} label="Case study card">
      <svg viewBox="0 0 160 120" className="h-full w-full p-4">
        <rect x="20" y="20" width="55" height="70" fill="#303030" />
        <line x1="88" y1="28" x2="140" y2="28" stroke="#f2f2f2" strokeWidth="2" opacity="0.8" />
        <line x1="88" y1="42" x2="125" y2="42" stroke="#f2f2f2" strokeWidth="1" opacity="0.3" />
        <rect x="88" y="72" width="40" height="10" rx="2" fill="#f1e500" />
        <text x="92" y="80" fill="#171717" fontSize="6" fontWeight="700" fontFamily="monospace">
          CS 682
        </text>
      </svg>
    </LabVectorCard>
  );
}

export function DigitalistsWordPressVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#1e1e1e] ${className}`} label="WordPress stack">
      <svg viewBox="0 0 160 100" className="h-full w-full p-5">
        <circle cx="50" cy="50" r="28" fill="none" stroke="#f2f2f2" strokeWidth="1.5" opacity="0.35" />
        <text x="50" y="54" textAnchor="middle" fill="#f2f2f2" fontSize="14" fontWeight="700" fontFamily="serif">
          W
        </text>
        <text x="95" y="44" fill="#f2f2f2" fontSize="8" fontWeight="600" fontFamily="system-ui">
          WordPress
        </text>
        <text x="95" y="58" fill="#f1e500" fontSize="7" fontFamily="system-ui">
          WooCommerce
        </text>
        <line x1="78" y1="50" x2="88" y2="50" stroke="#f2f2f2" strokeWidth="0.75" opacity="0.25" />
      </svg>
    </LabVectorCard>
  );
}

/* ── Izanami — warm paper, 和, zen objects ── */

export function IzanamiEnsoVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#e5e0d6] ${className}`} label="School enso">
      <svg viewBox="0 0 120 120" className="h-full w-full p-6">
        <circle cx="60" cy="60" r="38" fill="none" stroke="#b8aea2" strokeWidth="3" strokeLinecap="round" strokeDasharray="200 40" />
        <text x="60" y="100" textAnchor="middle" fill="#8b7355" fontSize="8" fontFamily="serif" letterSpacing="2">
          01 SCHOOL
        </text>
      </svg>
    </LabVectorCard>
  );
}

export function IzanamiCraftVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#ebe6dc] ${className}`} label="Craft vessel">
      <svg viewBox="0 0 100 120" className="h-full w-full p-4">
        <path d="M 35 85 L 30 45 Q 50 30 70 45 L 65 85 Z" fill="#a89f94" opacity="0.85" />
        <ellipse cx="50" cy="45" rx="20" ry="6" fill="#8f8578" />
        <text x="50" y="110" textAnchor="middle" fill="#8b7355" fontSize="8" fontFamily="serif" letterSpacing="2">
          02 CRAFT
        </text>
      </svg>
    </LabVectorCard>
  );
}

export function IzanamiRetreatVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#e0dbd2] ${className}`} label="Retreat stone">
      <svg viewBox="0 0 120 100" className="h-full w-full p-5">
        <ellipse cx="55" cy="68" rx="32" ry="14" fill="#9a9188" />
        <circle cx="70" cy="42" r="8" fill="#6b7a62" opacity="0.8" />
        <circle cx="42" cy="48" r="5" fill="#7d8b72" opacity="0.7" />
        <text x="60" y="92" textAnchor="middle" fill="#8b7355" fontSize="8" fontFamily="serif" letterSpacing="2">
          03 RETREAT
        </text>
      </svg>
    </LabVectorCard>
  );
}

/* ── Cartier W&W — gold, burgundy, luxury ── */

export function CartierAlcoveVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#4a1520] ${className}`} label="Immersive alcove">
      <svg viewBox="0 0 160 120" className="h-full w-full">
        <path d="M 20 100 Q 80 20 140 100 Z" fill="#2a0810" opacity="0.8" />
        <ellipse cx="80" cy="75" rx="22" ry="28" fill="none" stroke="#c9a227" strokeWidth="1" opacity="0.5" />
        <circle cx="80" cy="72" r="14" fill="#1a1410" stroke="#c9a227" strokeWidth="0.75" opacity="0.7" />
      </svg>
    </LabVectorCard>
  );
}

export function CartierDialVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#1a1410] ${className}`} label="Watch dial">
      <svg viewBox="0 0 120 120" className="h-full w-full p-4">
        <circle cx="60" cy="60" r="42" fill="#f5f0e8" />
        <circle cx="60" cy="60" r="42" fill="none" stroke="#c9a227" strokeWidth="2" />
        {[0, 90, 180, 270].map((deg) => (
          <line
            key={deg}
            x1="60"
            y1="22"
            x2="60"
            y2="30"
            stroke="#c9a227"
            strokeWidth="1.5"
            transform={`rotate(${deg} 60 60)`}
          />
        ))}
        <line x1="60" y1="60" x2="60" y2="35" stroke="#c9a227" strokeWidth="2" />
        <line x1="60" y1="60" x2="78" y2="60" stroke="#c9a227" strokeWidth="1.5" />
        <text x="60" y="48" textAnchor="middle" fill="#c9a227" fontSize="6" fontFamily="serif">
          CARTIER
        </text>
      </svg>
    </LabVectorCard>
  );
}

export function CartierMovementVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#0a0808] ${className}`} label="Movement gears">
      <svg viewBox="0 0 120 100" className="h-full w-full p-4">
        <circle cx="50" cy="50" r="22" fill="none" stroke="#c9a227" strokeWidth="2" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <circle key={deg} cx={50 + Math.cos((deg * Math.PI) / 180) * 22} cy={50 + Math.sin((deg * Math.PI) / 180) * 22} r="2" fill="#c9a227" />
        ))}
        <circle cx="78" cy="38" r="12" fill="none" stroke="#b8960c" strokeWidth="1.5" />
        <circle cx="30" cy="62" r="14" fill="none" stroke="#b8960c" strokeWidth="1.5" />
      </svg>
    </LabVectorCard>
  );
}

/* ── PP Neue Montreal — black, variable axes ── */

export function PpWeightAxisVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#111] ${className}`} label="Weight axis wght">
      <svg viewBox="0 0 200 80" className="h-full w-full px-6 py-4">
        <line x1="20" y1="60" x2="180" y2="60" stroke="#fff" strokeWidth="0.5" opacity="0.2" />
        <text x="20" y="50" fill="#fff" fontSize="14" fontFamily="system-ui" fontWeight="100" opacity="0.5">
          Aa
        </text>
        <text x="100" y="50" textAnchor="middle" fill="#fff" fontSize="14" fontFamily="system-ui" fontWeight="500">
          Aa
        </text>
        <text x="170" y="50" textAnchor="end" fill="#fff" fontSize="14" fontFamily="system-ui" fontWeight="900">
          Aa
        </text>
        <text x="20" y="72" fill="#fff" fontSize="6" fontFamily="monospace" opacity="0.35">
          HAIRLINE
        </text>
        <text x="170" y="72" textAnchor="end" fill="#fff" fontSize="6" fontFamily="monospace" opacity="0.35">
          BLACK
        </text>
      </svg>
    </LabVectorCard>
  );
}

export function PpWidthAxisVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-black ${className}`} label="Width axis wdth">
      <svg viewBox="0 0 200 80" className="h-full w-full px-6 py-4">
        <text x="30" y="48" fill="#fff" fontSize="18" fontFamily="system-ui" fontWeight="600" letterSpacing="-2">
          N
        </text>
        <text x="100" y="48" textAnchor="middle" fill="#fff" fontSize="18" fontFamily="system-ui" fontWeight="600">
          N
        </text>
        <text x="165" y="48" textAnchor="end" fill="#fff" fontSize="18" fontFamily="system-ui" fontWeight="600" letterSpacing="6">
          N
        </text>
        <text x="100" y="68" textAnchor="middle" fill="#fff" fontSize="6" fontFamily="monospace" opacity="0.35">
          SQUEEZED → EXPANDED
        </text>
      </svg>
    </LabVectorCard>
  );
}

export function PpMonoGridVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#0a0a0a] ${className}`} label="Neue Montreal Mono">
      <svg viewBox="0 0 160 100" className="h-full w-full p-4">
        {[0, 1, 2, 3, 4].map((row) =>
          [0, 1, 2, 3, 4, 5].map((col) => (
            <rect
              key={`${row}-${col}`}
              x={16 + col * 22}
              y={14 + row * 16}
              width="18"
              height="12"
              fill="none"
              stroke="#fff"
              strokeWidth="0.5"
              opacity="0.2"
            />
          )),
        )}
        <text x="80" y="92" textAnchor="middle" fill="#fff" fontSize="6" fontFamily="monospace" opacity="0.3">
          MONO
        </text>
      </svg>
    </LabVectorCard>
  );
}

/* ── KFC Loyalty — red bucket, points, box ── */

export function KfcBucketVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#FFF8F0] ${className}`} label="KFC bucket">
      <svg viewBox="0 0 120 140" className="h-full w-full p-4">
        <ellipse cx="60" cy="118" rx="38" ry="8" fill="#E4002B" opacity="0.15" />
        <path
          d="M28 45 L32 115 Q60 125 88 115 L92 45 Z"
          fill="#E4002B"
        />
        <rect x="30" y="58" width="60" height="8" fill="#fff" opacity="0.9" />
        <rect x="30" y="78" width="60" height="8" fill="#fff" opacity="0.9" />
        <rect x="30" y="98" width="60" height="8" fill="#fff" opacity="0.9" />
        <ellipse cx="60" cy="45" rx="32" ry="8" fill="#f0f0f0" />
        <ellipse cx="60" cy="42" rx="28" ry="6" fill="#e8e8e8" />
      </svg>
    </LabVectorCard>
  );
}

export function KfcPointsVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#fff0f0] ${className}`} label="Points counter">
      <svg viewBox="0 0 160 100" className="h-full w-full p-4">
        <text x="20" y="58" fill="#E4002B" fontSize="36" fontFamily="system-ui" fontWeight="900">
          250
        </text>
        <text x="20" y="78" fill="#1a1a1a" fontSize="8" fontFamily="system-ui" opacity="0.4">
          POINTS
        </text>
        <path d="M100 30 L130 50 L100 70 Z" fill="#E4002B" opacity="0.2" />
        <circle cx="130" cy="50" r="18" fill="none" stroke="#E4002B" strokeWidth="2" opacity="0.5" />
        <text x="130" y="54" textAnchor="middle" fill="#E4002B" fontSize="10" fontWeight="bold">
          +
        </text>
      </svg>
    </LabVectorCard>
  );
}

export function KfcBoxVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-white ${className}`} label="Mystery box">
      <svg viewBox="0 0 120 100" className="h-full w-full p-4">
        <rect x="25" y="30" width="70" height="55" rx="6" fill="#1a1a1a" />
        <text x="60" y="65" textAnchor="middle" fill="#fff" fontSize="28" fontFamily="system-ui" fontWeight="900">
          ?
        </text>
        <rect x="25" y="22" width="70" height="12" rx="3" fill="#E4002B" />
        <text x="60" y="92" textAnchor="middle" fill="#E4002B" fontSize="7" fontFamily="system-ui" fontWeight="bold">
          MYSTERY BOX
        </text>
      </svg>
    </LabVectorCard>
  );
}

/* ── Hydroflow — deep aqua, bottle, token ── */

export function HydroBottleVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#050d1a] ${className}`} label="Hydro bottle">
      <svg viewBox="0 0 100 140" className="h-full w-full p-4">
        <path
          d="M35 40 L38 115 Q50 122 62 115 L65 40 Z"
          fill="none"
          stroke="#4de8ff"
          strokeWidth="1.5"
          opacity="0.5"
        />
        <rect x="38" y="70" width="24" height="40" rx="2" fill="#00d4ff" opacity="0.5" />
        <rect x="42" y="32" width="16" height="10" rx="2" fill="#b8d4e8" opacity="0.6" />
        <ellipse cx="50" cy="40" rx="14" ry="4" fill="none" stroke="#4de8ff" strokeWidth="1" opacity="0.4" />
      </svg>
    </LabVectorCard>
  );
}

export function HydroFluidVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#0a1a2e] ${className}`} label="Fluid waves">
      <svg viewBox="0 0 160 80" className="h-full w-full px-4 py-6">
        <path
          d="M0 50 Q40 35 80 50 T160 50 L160 80 L0 80 Z"
          fill="#00d4ff"
          opacity="0.35"
        />
        <path
          d="M0 58 Q40 48 80 58 T160 58 L160 80 L0 80 Z"
          fill="#4de8ff"
          opacity="0.25"
        />
        <path
          d="M0 45 Q50 30 100 45 T160 40"
          fill="none"
          stroke="#4de8ff"
          strokeWidth="1"
          opacity="0.5"
        />
      </svg>
    </LabVectorCard>
  );
}

export function HydroTokenVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#051525] ${className}`} label="Token hydration">
      <svg viewBox="0 0 120 100" className="h-full w-full p-4">
        <circle cx="60" cy="50" r="28" fill="none" stroke="#00d4ff" strokeWidth="1.5" opacity="0.5" />
        <circle cx="60" cy="50" r="18" fill="#00d4ff" opacity="0.15" />
        <text x="60" y="54" textAnchor="middle" fill="#4de8ff" fontSize="10" fontFamily="monospace">
          H2O
        </text>
        <text x="60" y="88" textAnchor="middle" fill="#4de8ff" fontSize="6" fontFamily="monospace" opacity="0.5">
          TOKEN
        </text>
      </svg>
    </LabVectorCard>
  );
}

/* ── La Revoltosa — Iberian bubble, gradient, drinks ── */

export function RevoltosaBubbleVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-gradient-to-br from-[#ff4d6d] to-[#ff8c42] ${className}`} label="La burbuja">
      <svg viewBox="0 0 120 100" className="h-full w-full p-4">
        <circle cx="40" cy="45" r="18" fill="#fff" opacity="0.25" />
        <circle cx="70" cy="38" r="12" fill="#fff" opacity="0.2" />
        <circle cx="55" cy="62" r="22" fill="#fff" opacity="0.15" />
        <ellipse cx="55" cy="62" rx="8" ry="4" fill="#fff" opacity="0.35" />
        <text x="60" y="92" textAnchor="middle" fill="#fff" fontSize="7" fontFamily="system-ui" fontWeight="bold" opacity="0.7">
          IBÉRICA
        </text>
      </svg>
    </LabVectorCard>
  );
}

export function RevoltosaGradientVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#1a0a14] ${className}`} label="Gradient sweep">
      <svg viewBox="0 0 160 80" className="h-full w-full">
        <defs>
          <linearGradient id="revSweep" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ff4d6d" />
            <stop offset="33%" stopColor="#e040fb" />
            <stop offset="66%" stopColor="#c6ff00" />
            <stop offset="100%" stopColor="#7b2fbe" />
          </linearGradient>
        </defs>
        <rect width="160" height="80" fill="url(#revSweep)" opacity="0.85" />
        <path
          d="M0 55 Q80 25 160 50"
          fill="none"
          stroke="#fff"
          strokeWidth="1.5"
          opacity="0.4"
        />
      </svg>
    </LabVectorCard>
  );
}

export function RevoltosaDrinkVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#2a1020] ${className}`} label="Mis bebidas">
      <svg viewBox="0 0 140 100" className="h-full w-full px-4 py-3">
        {[
          { x: 24, label: "SIFÓN", fill: "#ff4d6d" },
          { x: 60, label: "LIMÓN", fill: "#c6ff00" },
          { x: 96, label: "COLA", fill: "#7b2fbe" },
        ].map((d) => (
          <g key={d.label}>
            <rect x={d.x} y="28" width="20" height="44" rx="4" fill={d.fill} opacity="0.85" />
            <rect x={d.x + 4} y="22" width="12" height="8" rx="2" fill="#fff" opacity="0.5" />
            <text x={d.x + 10} y="88" textAnchor="middle" fill="#fff" fontSize="5" fontFamily="system-ui" fontWeight="bold">
              {d.label}
            </text>
          </g>
        ))}
      </svg>
    </LabVectorCard>
  );
}

/* ── NorthGarden — wind particles, logo, organic field ── */

export function NorthGardenParticleVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#ebe6dc] ${className}`} label="Particle field">
      <svg viewBox="0 0 160 100" className="h-full w-full px-4 py-5">
        {Array.from({ length: 24 }, (_, i) => {
          const x = 12 + (i % 6) * 24 + (Math.sin(i) * 4);
          const y = 18 + Math.floor(i / 6) * 18 + (Math.cos(i * 1.3) * 3);
          return (
            <ellipse
              key={i}
              cx={x}
              cy={y}
              rx={3 + (i % 3)}
              ry={2 + (i % 2)}
              fill="#f7f4ef"
              opacity={0.35 + (i % 5) * 0.1}
              transform={`rotate(${i * 14} ${x} ${y})`}
            />
          );
        })}
      </svg>
    </LabVectorCard>
  );
}

export function NorthGardenWindVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#1a1814] ${className}`} label="Wind simulation">
      <svg viewBox="0 0 160 90" className="h-full w-full px-4 py-6">
        <path
          d="M10 45 Q50 25 90 45 T160 40"
          fill="none"
          stroke="#f7f4ef"
          strokeWidth="1"
          opacity="0.35"
        />
        <path
          d="M10 58 Q55 38 100 55 T160 52"
          fill="none"
          stroke="#ebe6dc"
          strokeWidth="1.2"
          opacity="0.5"
        />
        <path
          d="M10 32 Q45 52 85 30 T150 35"
          fill="none"
          stroke="#ddd6c8"
          strokeWidth="0.8"
          opacity="0.3"
        />
        <text x="80" y="82" textAnchor="middle" fill="#f7f4ef" fontSize="6" fontFamily="monospace" opacity="0.4">
          WIND FIELD
        </text>
      </svg>
    </LabVectorCard>
  );
}

export function NorthGardenLogoVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#f7f4ef] ${className}`} label="Studio mark">
      <svg viewBox="0 0 80 90" className="mx-auto h-full w-16 py-4">
        <path
          d="M38 8 C34 18 28 24 22 28 C30 26 36 30 38 38 C40 30 46 26 54 28 C48 24 42 18 38 8Z"
          fill="#1a1814"
          opacity="0.85"
        />
        <path
          d="M38 42 C32 52 24 62 18 72 C28 66 34 68 38 78 C42 68 48 66 58 72 C52 62 44 52 38 42Z"
          fill="#1a1814"
          opacity="0.55"
        />
        <text x="40" y="88" textAnchor="middle" fill="#1a1814" fontSize="5" fontFamily="system-ui" fontWeight="600">
          NG
        </text>
      </svg>
    </LabVectorCard>
  );
}

/* ── LOFT THIRTY ONE — room, camera path, materials ── */

export function LoftRoomVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#f3efe8] ${className}`} label="Loft shell">
      <svg viewBox="0 0 140 90" className="h-full w-full px-4 py-5">
        <rect x="20" y="50" width="100" height="8" fill="#8b6f52" opacity="0.85" />
        <rect x="20" y="22" width="100" height="28" fill="#f3efe8" stroke="#1c1916" strokeWidth="0.5" opacity="0.2" />
        <rect x="22" y="24" width="28" height="20" fill="#ffd4a0" opacity="0.45" />
        <rect x="70" y="38" width="24" height="6" fill="#5c4a3a" opacity="0.6" />
        <rect x="55" y="30" width="18" height="10" fill="#e8e2d8" opacity="0.7" />
        <line x1="20" y1="22" x2="120" y2="22" stroke="#5c4a3a" strokeWidth="1" opacity="0.35" />
      </svg>
    </LabVectorCard>
  );
}

export function LoftCameraVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#1c1916] ${className}`} label="Scroll camera">
      <svg viewBox="0 0 160 80" className="h-full w-full px-4 py-6">
        <path
          d="M12 58 Q45 42 75 48 T140 32"
          fill="none"
          stroke="#ffd4a0"
          strokeWidth="1.5"
          opacity="0.7"
        />
        <circle cx="12" cy="58" r="4" fill="#f3efe8" opacity="0.8" />
        <circle cx="75" cy="48" r="4" fill="#f3efe8" opacity="0.6" />
        <circle cx="140" cy="32" r="4" fill="#f3efe8" opacity="0.5" />
        <text x="80" y="72" textAnchor="middle" fill="#f3efe8" fontSize="6" fontFamily="monospace" opacity="0.4">
          WALKTHROUGH
        </text>
      </svg>
    </LabVectorCard>
  );
}

export function LoftMaterialVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#ebe6dc] ${className}`} label="Warm palette">
      <svg viewBox="0 0 140 90" className="h-full w-full px-5 py-6">
        {[
          { x: 20, fill: "#8b6f52", label: "WOOD" },
          { x: 55, fill: "#f3efe8", label: "WALL" },
          { x: 90, fill: "#ffd4a0", label: "LIGHT" },
        ].map((sw) => (
          <g key={sw.label}>
            <rect x={sw.x} y="28" width="24" height="24" rx="2" fill={sw.fill} />
            <text x={sw.x + 12} y="68" textAnchor="middle" fill="#1c1916" fontSize="5" fontFamily="monospace" opacity="0.45">
              {sw.label}
            </text>
          </g>
        ))}
      </svg>
    </LabVectorCard>
  );
}

/* ── CryptOwl — timeline, glow, metrics ── */

export function CryptOwlTimelineVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#07090d] ${className}`} label="3D timeline">
      <svg viewBox="0 0 160 80" className="h-full w-full px-4 py-6">
        <path
          d="M8 48 Q50 28 80 42 T152 36"
          fill="none"
          stroke="#7ce6ff"
          strokeWidth="2"
          opacity="0.7"
        />
        {[20, 55, 90, 125].map((x, i) => (
          <circle key={x} cx={x} cy={42 - (i % 2) * 6} r="4" fill="#f8fdff" opacity={0.5 + i * 0.1} />
        ))}
      </svg>
    </LabVectorCard>
  );
}

export function CryptOwlGlowVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#0c121b] ${className}`} label="Neon glow">
      <svg viewBox="0 0 120 100" className="h-full w-full p-6">
        <circle cx="60" cy="50" r="22" fill="none" stroke="#2eafff" strokeWidth="1" opacity="0.4" />
        <circle cx="60" cy="50" r="12" fill="#7ce6ff" opacity="0.35" />
        <circle cx="60" cy="50" r="5" fill="#bdf7ff" opacity="0.9" />
      </svg>
    </LabVectorCard>
  );
}

export function CryptOwlMetricVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#07090d] ${className}`} label="Strategy metrics">
      <svg viewBox="0 0 140 90" className="h-full w-full px-5 py-5">
        <text x="10" y="38" fill="#7ed6a3" fontSize="14" fontFamily="monospace" fontWeight="500">
          +$1,152
        </text>
        <text x="10" y="56" fill="#84949e" fontSize="7" fontFamily="monospace">
          NET PNL
        </text>
        <text x="75" y="38" fill="#f8fdff" fontSize="11" fontFamily="monospace">
          +11.52%
        </text>
        <text x="75" y="56" fill="#84949e" fontSize="7" fontFamily="monospace">
          ROI
        </text>
        <text x="10" y="78" fill="#b7c6cf" fontSize="8" fontFamily="monospace">
          WIN 57.9% · TRADES 38
        </text>
      </svg>
    </LabVectorCard>
  );
}

/* ── Cipher Digital — grid, rack, capacity ── */

export function CipherRackVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#0d0e10] ${className}`} label="Server rack">
      <svg viewBox="0 0 100 120" className="h-full w-full p-5">
        <rect x="30" y="20" width="40" height="70" fill="none" stroke="#abd233" strokeWidth="1" opacity="0.6" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x="34" y={28 + i * 12} width="32" height="6" fill="#141618" stroke="#939ca2" strokeWidth="0.5" opacity="0.7" />
        ))}
      </svg>
    </LabVectorCard>
  );
}

export function CipherGridVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#141618] ${className}`} label="Dynamic grid">
      <svg viewBox="0 0 160 90" className="h-full w-full px-4 py-5">
        <line x1="24" y1="72" x2="136" y2="72" stroke="#5a636a" strokeWidth="0.5" opacity="0.9" />
        <line x1="24" y1="28" x2="24" y2="72" stroke="#5a636a" strokeWidth="0.5" opacity="0.9" />
        <line x1="52" y1="42" x2="52" y2="72" stroke="#5a636a" strokeWidth="0.5" opacity="0.85" />
        <line x1="80" y1="42" x2="80" y2="72" stroke="#5a636a" strokeWidth="0.5" opacity="0.85" />
        {[
          [24, 72],
          [52, 42],
          [52, 72],
          [80, 42],
          [80, 72],
          [136, 72],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="3" fill="#5a636a" opacity={0.7 + (i % 2) * 0.2} />
        ))}
        <text x="30" y="24" fill="#eff0f1" fontSize="8" fontFamily="system-ui">
          Built for
        </text>
        <text x="30" y="36" fill="#abd233" fontSize="9" fontFamily="system-ui">
          Hyperscale.
        </text>
      </svg>
    </LabVectorCard>
  );
}

export function CipherCapacityVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#0d0e10] ${className}`} label="Capacity">
      <svg viewBox="0 0 140 90" className="h-full w-full px-4 py-5">
        {[
          { x: 8, label: "600MW", sub: "CONTRACTED" },
          { x: 52, label: "3.2GW", sub: "PIPELINE" },
          { x: 96, label: "327MW", sub: "OPERATING" },
        ].map((s) => (
          <g key={s.sub}>
            <text x={s.x} y="48" fill="#abd233" fontSize="13" fontFamily="monospace" fontWeight="500">
              {s.label}
            </text>
            <text x={s.x} y="62" fill="#939ca2" fontSize="6" fontFamily="monospace">
              {s.sub}
            </text>
          </g>
        ))}
      </svg>
    </LabVectorCard>
  );
}

/* ── Armory — radar, drone, SURGE ── */

export function ArmoryRadarVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#0a100d] ${className}`} label="Loading radar">
      <svg viewBox="0 0 120 120" className="h-full w-full p-5">
        <circle cx="60" cy="60" r="48" fill="none" stroke="#1a5c38" strokeWidth="1" />
        <circle cx="60" cy="60" r="32" fill="none" stroke="#1a5c38" strokeWidth="0.8" opacity="0.6" />
        <text x="60" y="98" textAnchor="middle" fill="#6b7c72" fontSize="6" fontFamily="monospace">
          INIT
        </text>
      </svg>
    </LabVectorCard>
  );
}

export function ArmoryDroneVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#0f1812] ${className}`} label="Wireframe UAV">
      <svg viewBox="0 0 100 100" className="h-full w-full p-6">
        <rect x="35" y="42" width="30" height="10" fill="none" stroke="#6b7c72" strokeWidth="1" />
        <line x1="50" y1="47" x2="20" y2="47" stroke="#6b7c72" strokeWidth="1" />
        <line x1="50" y1="47" x2="80" y2="47" stroke="#6b7c72" strokeWidth="1" />
        <line x1="50" y1="47" x2="50" y2="22" stroke="#6b7c72" strokeWidth="1" />
        <line x1="50" y1="47" x2="50" y2="72" stroke="#f87171" strokeWidth="1" opacity="0.8" />
        <circle cx="50" cy="47" r="3" fill="#f87171" opacity="0.7" />
      </svg>
    </LabVectorCard>
  );
}

export function ArmorySurgeVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#0a100d] ${className}`} label="SURGE C-UAS">
      <svg viewBox="0 0 140 80" className="h-full w-full px-4 py-5">
        <text x="10" y="36" fill="#3dff8b" fontSize="16" fontFamily="monospace" fontWeight="600">
          SURGE
        </text>
        <text x="10" y="52" fill="#6b7c72" fontSize="7" fontFamily="monospace">
          C-UAS · SAMARITAN OS
        </text>
        <text x="10" y="68" fill="#8fa89a" fontSize="6" fontFamily="monospace">
          DETECT · DETER · DESTROY
        </text>
      </svg>
    </LabVectorCard>
  );
}

/* ── Hashgraph Ventures — hex, network, particles ── */

export function HashgraphHexVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#000209] ${className}`} label="Hex core">
      <svg viewBox="0 0 100 100" className="h-full w-full p-6">
        <polygon
          points="50,12 82,30 82,70 50,88 18,70 18,30"
          fill="none"
          stroke="#9bb8e1"
          strokeWidth="0.8"
          opacity="0.7"
        />
        <polygon
          points="50,22 72,34 72,66 50,78 28,66 28,34"
          fill="none"
          stroke="#5f87b9"
          strokeWidth="0.6"
          opacity="0.5"
        />
        <circle cx="50" cy="50" r="4" fill="#2c4e73" stroke="#9bb8e1" strokeWidth="0.5" />
      </svg>
    </LabVectorCard>
  );
}

export function HashgraphNetworkVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#080c14] ${className}`} label="Network graph">
      <svg viewBox="0 0 140 90" className="h-full w-full px-4 py-5">
        {[
          [70, 45],
          [30, 25],
          [110, 25],
          [25, 65],
          [115, 65],
          [70, 75],
        ].map(([cx, cy], i) => (
          <g key={i}>
            {i > 0 ? (
              <line x1={70} y1={45} x2={cx} y2={cy} stroke="#5f87b9" strokeWidth="0.5" opacity="0.5" />
            ) : null}
            <circle cx={cx} cy={cy} r="3" fill="#9bb8e1" opacity={0.6 + (i % 2) * 0.2} />
          </g>
        ))}
      </svg>
    </LabVectorCard>
  );
}

export function HashgraphParticleVector({ className = "h-48" }: { className?: string }) {
  return (
    <LabVectorCard className={`bg-[#000209] ${className}`} label="Particle field">
      <svg viewBox="0 0 140 90" className="h-full w-full">
        {Array.from({ length: 40 }, (_, i) => {
          const x = 15 + (i % 8) * 15 + (i % 3) * 2;
          const y = 12 + Math.floor(i / 8) * 16 + (i % 2) * 3;
          return <circle key={i} cx={x} cy={y} r="1.2" fill="#9bb8e1" opacity={0.2 + (i % 5) * 0.12} />;
        })}
        <circle cx="70" cy="45" r="18" fill="none" stroke="#2c4e73" strokeWidth="0.5" opacity="0.4" />
      </svg>
    </LabVectorCard>
  );
}
