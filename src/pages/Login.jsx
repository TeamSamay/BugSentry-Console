import { useMemo, useState } from 'react'
import { Badge } from '../components/Badge.jsx'
import { Button } from '../components/Button.jsx'
import { Card } from '../components/Card.jsx'
import { Navbar } from '../components/Navbar.jsx'

function ProviderIcon({ name }) {
  if (name === 'github') {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="text-[#ffffff]"
      >
        <path
          fill="currentColor"
          d="M12 .5C5.73.5.75 5.48.75 11.77c0 4.98 3.22 9.2 7.69 10.69c.56.1.77-.24.77-.54v-1.9c-3.13.68-3.79-1.35-3.79-1.35c-.51-1.3-1.25-1.65-1.25-1.65c-1.02-.7.08-.69.08-.69c1.12.08 1.72 1.16 1.72 1.16c1 .17 1.52-.51 1.87-.92c.1-.73.39-1.22.71-1.5c-2.5-.28-5.13-1.25-5.13-5.58c0-1.24.44-2.25 1.16-3.05c-.12-.28-.5-1.43.11-2.98c0 0 .95-.3 3.11 1.16c.9-.25 1.86-.38 2.82-.38c.96 0 1.92.13 2.82.38c2.16-1.46 3.11-1.16 3.11-1.16c.61 1.55.23 2.7.11 2.98c.72.8 1.16 1.81 1.16 3.05c0 4.34-2.64 5.3-5.15 5.58c.4.35.77 1.04.77 2.1v3.1c0 .3.2.65.78.54c4.46-1.5 7.68-5.71 7.68-10.69C23.25 5.48 18.27.5 12 .5Z"
        />
      </svg>
    )
  }
  if (name === 'gitlab') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#ffffff"
          d="M12 22.3L3.3 15.4a1 1 0 0 1-.35-1.07L5.7 4.8a.6.6 0 0 1 1.13-.03l1.82 5.65h6.7l1.82-5.65a.6.6 0 0 1 1.13.03l2.75 9.53a1 1 0 0 1-.35 1.07L12 22.3Z"
          opacity="0.92"
        />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#ffffff"
        d="M21.8 12.2c0-.7-.06-1.2-.17-1.8H12v3.4h5.5c-.11.9-.72 2.3-2.1 3.2l-.02.12l3.03 2.35l.21.02c1.93-1.78 3.05-4.4 3.05-7.3Z"
      />
      <path
        fill="#ffffff"
        opacity="0.88"
        d="M12 22c2.77 0 5.09-.9 6.79-2.47l-3.22-2.49c-.86.6-2.02 1.02-3.57 1.02c-2.72 0-5.02-1.78-5.84-4.25l-.11.01L2.9 16.3l-.03.1C4.55 19.8 8.02 22 12 22Z"
      />
      <path
        fill="#ffffff"
        opacity="0.82"
        d="M6.16 13.81A6.3 6.3 0 0 1 5.82 12c0-.63.12-1.23.33-1.8l-.01-.12L2.9 7.56l-.1.05A9.99 9.99 0 0 0 2 12c0 1.61.38 3.13 1.05 4.49l3.11-2.68Z"
      />
      <path
        fill="#ffffff"
        opacity="0.85"
        d="M12 5.93c1.96 0 3.27.84 4.02 1.54l2.93-2.85C17.07 2.9 14.77 2 12 2C8.02 2 4.55 4.2 2.87 7.6l3.29 2.6C6.98 7.71 9.28 5.93 12 5.93Z"
      />
    </svg>
  )
}

function KeyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7.5 14a4.5 4.5 0 1 1 3.91-2.28L22 11.72V16h-3v3h-3v3h-4v-4.18l-1.32-.86A4.48 4.48 0 0 1 7.5 14Zm0-7A2.5 2.5 0 1 0 10 9.5A2.5 2.5 0 0 0 7.5 7Z"
      />
    </svg>
  )
}

export default function Login() {
  const providers = useMemo(
    () => [
      { id: 'github', label: 'GITHUB', lastUsed: true },
      { id: 'gitlab', label: 'GITLAB', lastUsed: false },
      { id: 'google', label: 'GOOGLE', lastUsed: false },
    ],
    [],
  )

  const [loadingProvider, setLoadingProvider] = useState(null)
  const [loadingSSO, setLoadingSSO] = useState(false)

  async function simulateAuth(id) {
    if (id === 'sso') setLoadingSSO(true)
    else setLoadingProvider(id)
    await new Promise((r) => setTimeout(r, 900))
    setLoadingProvider(null)
    setLoadingSSO(false)
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0B0F17] text-[#ffffff]">
      {/* background glow + vignette */}
      <div className="pointer-events-none fixed inset-0 overflow-x-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(700px_380px_at_50%_24%,rgba(78,116,204,0.28),rgba(11,15,23,0)_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_8%,rgba(255,255,255,0.06),rgba(11,15,23,0)_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_700px_at_50%_60%,rgba(0,0,0,0),rgba(0,0,0,0.35)_75%)]" />
        <div className="absolute left-0 right-0 top-[50%] h-px bg-[rgba(255,255,255,0.1)]" />
      </div>

      <Navbar
        actionsClassName="mr-[90px]"
        actions={[
          { id: 'docs', label: 'Docs', onClick: () => {} },
          { id: 'support', label: 'Support', onClick: () => {} },
        ]}
      />

      <div className="relative mx-auto min-h-screen max-w-[1040px] px-[24px]">
        {/* center content */}
        <div className="flex min-h-[calc(100vh-84px)] flex-col items-center justify-start pt-[26px]">
          <h1 className="text-center text-[34px] font-semibold tracking-[-0.02em] text-[rgba(255,255,255,0.95)]">
            Sign in to Bugsentry
          </h1>
          <p className="mt-[10px] max-w-[340px] text-center text-[13px] leading-[18px] text-[rgba(255,255,255,0.55)]">
            Access your AI-powered risk intelligence
            <br />
            workspace
          </p>

          <Card className="mt-[26px] w-[420px] px-[34px] pb-[28px] pt-[26px]">
            <div className="mx-auto w-[316px]">
              <div className="grid grid-cols-3 gap-[18px]">
                {providers.map((p) => (
                  <div key={p.id} className="relative">
                    {p.lastUsed ? (
                      <div className="absolute -top-[10px] left-[12px]">
                        <Badge>LAST USED</Badge>
                      </div>
                    ) : null}
                    <Button
                      variant="tile"
                      className="w-full"
                      onClick={() => simulateAuth(p.id)}
                      disabled={loadingProvider !== null || loadingSSO}
                      aria-label={`Sign in with ${p.label}`}
                    >
                      <span className="mt-[6px] grid h-[26px] w-[26px] place-items-center rounded-[6px] bg-[rgba(255,255,255,0.05)] ring-1 ring-[rgba(255,255,255,0.1)]">
                        <ProviderIcon name={p.id} />
                      </span>
                      <span className="mt-[6px] text-[10px] font-semibold tracking-[0.12em] text-[rgba(255,255,255,0.7)]">
                        {loadingProvider === p.id ? '...' : p.label}
                      </span>
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-[18px] flex items-center justify-center gap-[12px]">
                <div className="h-px flex-1 bg-[rgba(255,255,255,0.1)]" />
                <div className="text-[10px] font-semibold tracking-[0.14em] text-[rgba(255,255,255,0.35)]">
                  OR INTELLIGENCE ACCESS
                </div>
                <div className="h-px flex-1 bg-[rgba(255,255,255,0.1)]" />
              </div>

              <div className="mt-[16px]">
                <Button
                  variant="primary"
                  onClick={() => simulateAuth('sso')}
                  disabled={loadingProvider !== null || loadingSSO}
                >
                  <span className="text-[#0A0E18]">
                    <KeyIcon />
                  </span>
                  <span className="text-[14px] font-semibold">
                    {loadingSSO ? 'Signing in…' : 'Sign in with SSO'}
                  </span>
                </Button>
              </div>

              <div className="mt-[18px] text-center text-[12px] text-[rgba(255,255,255,0.55)]">
                Need an account?{' '}
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-baseline bg-transparent p-0 font-semibold text-[#7DB5FF] underline-offset-[3px] outline-none hover:text-[#8CC0FF] hover:underline focus-visible:underline"
                >
                  Sign up
                </button>
              </div>
              <div className="mt-[10px] text-center text-[10px] font-semibold tracking-[0.16em] text-[rgba(255,255,255,0.25)]">
                FORGOT CREDENTIALS?
              </div>
            </div>
          </Card>

          {/* bottom status */}
          <div className="mt-auto pb-[18px] pt-[34px] text-center">
            <div className="inline-flex items-center gap-[18px] text-[10px] font-semibold tracking-[0.14em] text-[rgba(255,255,255,0.3)]">
              <span className="inline-flex items-center gap-[8px]">
                <span className="h-[6px] w-[6px] rounded-full bg-[#37D67A]" />
                SYSTEMS OPERATIONAL
              </span>
              <span className="inline-flex items-center gap-[8px]">
                <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 2l7 4v6c0 5-3 9-7 10c-4-1-7-5-7-10V6l7-4Zm0 4.2L7 8.9V12c0 3.7 2 6.9 5 7.9c3-1 5-4.2 5-7.9V8.9l-5-2.7Z"
                    opacity="0.9"
                  />
                </svg>
                v2.4.0 STABLE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

