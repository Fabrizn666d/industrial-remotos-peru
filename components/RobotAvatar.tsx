export function RobotAvatar({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 180 210" role="img" aria-label="IRP Asistente">
      <defs><linearGradient id="robot-body" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#FFFFFF" /><stop offset="1" stopColor="#F5F7FA" /></linearGradient><linearGradient id="robot-blue" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#2563EB" /><stop offset="1" stopColor="#0B1E3A" /></linearGradient></defs>
      <ellipse cx="90" cy="198" rx="58" ry="8" fill="#0B1E3A" opacity=".12" />
      <path d="M50 112c0-21 17-38 38-38h4c21 0 38 17 38 38v57c0 15-12 27-27 27H77c-15 0-27-12-27-27z" fill="url(#robot-body)" stroke="#2563EB" strokeOpacity=".35" strokeWidth="3" />
      <rect x="34" y="26" width="112" height="86" rx="40" fill="url(#robot-body)" stroke="#2563EB" strokeOpacity=".35" strokeWidth="3" />
      <rect x="44" y="38" width="92" height="61" rx="28" fill="#0B1E3A" />
      <path d="M67 67c4-8 12-8 16 0M98 67c4-8 12-8 16 0" fill="none" stroke="#2563EB" strokeLinecap="round" strokeWidth="5" />
      <path d="M72 82c10 8 26 8 36 0" fill="none" stroke="#2563EB" strokeLinecap="round" strokeWidth="4" />
      <path d="M90 26V13" stroke="#2563EB" strokeWidth="4" /><circle cx="90" cy="9" r="6" fill="#2563EB" />
      <circle cx="91" cy="143" r="27" fill="#FFFFFF" stroke="#2563EB" strokeOpacity=".35" strokeWidth="2" /><text x="91" y="151" fill="#2563EB" fontFamily="Arial" fontSize="22" fontWeight="700" textAnchor="middle">IRP</text>
      <path d="M51 126 28 145l8 12 18-10M129 126l23 19-8 12-18-10" fill="url(#robot-body)" stroke="#2563EB" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M70 193v11M110 193v11" stroke="#0B1E3A" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}
