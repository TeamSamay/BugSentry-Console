export function Button({
  className = '',
  variant = 'primary',
  disabled = false,
  children,
  ...props
}) {
  const base =
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-[8px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6AA9FF]/40 focus-visible:ring-offset-0 disabled:opacity-60 disabled:cursor-not-allowed'

  const variants = {
    primary:
      'h-[44px] w-full bg-[#7DB5FF] text-[#0A0E18] hover:bg-[#8CC0FF] active:bg-[#6AA9FF]',
    subtle:
      'h-[44px] w-full bg-[rgba(255,255,255,0.05)] text-[#ffffff] hover:bg-[rgba(255,255,255,0.08)] active:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)]',
    tile:
      'h-[68px] w-[86px] flex-col bg-[#1B2030]/70 hover:bg-[#1E2537] active:bg-[#1A2234] border border-[rgba(255,255,255,0.1)]',
    nav:
      'h-[34px] w-auto rounded-[8px] bg-[rgba(255,255,255,0.04)] text-[#ffffff] hover:bg-[rgba(255,255,255,0.07)] active:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.08)]',
  }

  return (
    <button
      className={[base, variants[variant] ?? variants.primary, className].join(
        ' ',
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

