export function Badge({ className = '', children }) {
  return (
    <span
      className={[
        'inline-flex h-[16px] items-center rounded-[3px] bg-[#4DA3FF] px-[6px] text-[9px] font-semibold tracking-wide text-[#07101F]',
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}

