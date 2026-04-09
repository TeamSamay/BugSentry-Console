export function Card({ className = '', children }) {
  return (
    <div
      className={[
        'rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-gradient-to-b from-[#1A2030]/85 to-[#121827]/85 shadow-[0_25px_80px_rgba(0,0,0,0.55)] backdrop-blur',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

