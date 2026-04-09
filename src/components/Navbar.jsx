import { Button } from './Button.jsx'

export function Navbar({
  actions = [
    { id: 'docs', label: 'Docs', onClick: () => {} },
    { id: 'support', label: 'Support', onClick: () => {} },
  ],
  actionsClassName = '',
}) {
  return (
    <div className="relative z-10 pt-[18px]">
      <div className="flex w-full items-center justify-between px-[24px]">
          <div className="inline-flex items-center gap-[12px] text-[18px] font-semibold text-[rgba(255,255,255,0.9)]">
            <span className="grid h-[28px] w-[28px] place-items-center rounded-[6px] bg-[#0F1627] ring-1 ring-[rgba(255,255,255,0.1)]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="text-[#9CC3FF]"
              >
                <path
                  fill="currentColor"
                  d="M12 2l8 4.6V12c0 5-3.4 9.4-8 10c-4.6-.6-8-5-8-10V6.6L12 2Zm0 3.1L6.4 8v4c0 3.6 2.3 6.9 5.6 7.8c3.3-.9 5.6-4.2 5.6-7.8V8L12 5.1Z"
                />
              </svg>
            </span>
            <span>Bugsentry</span>
          </div>

          <div className={['flex items-center gap-[10px]', actionsClassName].join(' ')}>
            {actions.map((a) => (
              <Button
                key={a.id}
                variant="nav"
                onClick={a.onClick}
                className="px-[12px]"
                type="button"
              >
                <span className="text-[12px] font-semibold tracking-[0.02em]">
                  {a.label}
                </span>
              </Button>
            ))}
          </div>
      </div>
    </div>
  )
}

