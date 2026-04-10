export const REPO_FINDINGS = {
  healthone: {
    etaDaysToFix: 2,
    etaDaysToCrash: 90,
    confidence: 'Medium',
    findings: [],
  },
  dsa: {
    etaDaysToFix: 3,
    etaDaysToCrash: 21,
    confidence: 'High',
    findings: [
      {
        severity: 'High',
        title: 'Unbounded recursion path in test harness',
        spec: 'A failing edge-case can trigger deep recursion and exhaust stack limits during CI runs and on debug builds.',
        solutions: [
          'Add recursion depth guard or convert to iterative approach.',
          'Add fuzz tests for worst-case inputs (e.g., sorted/duplicate-heavy arrays).',
          'Enforce timeouts in CI for pathological cases.',
        ],
      },
    ],
  },
  'pharmastic-bot': {
    etaDaysToFix: 6,
    etaDaysToCrash: 10,
    confidence: 'High',
    findings: [
      {
        severity: 'Critical',
        title: 'Secrets leakage in automation logs',
        spec: 'Bot execution logs can expose API keys/tokens due to verbose debug logging and unsafe string interpolation.',
        solutions: [
          'Rotate all exposed keys immediately and invalidate old tokens.',
          'Mask secrets in logs (redaction middleware + allowlist logging).',
          'Move secrets to environment variables/secret manager; never commit them.',
        ],
      },
      {
        severity: 'High',
        title: 'Unpinned dependencies causing supply-chain drift',
        spec: 'Dependencies are not pinned/locked, enabling unexpected upgrades that may introduce breaking changes or malicious packages.',
        solutions: [
          'Pin versions and commit lockfiles.',
          'Enable dependabot/renovate with review gates.',
          'Add SBOM + signature verification in CI.',
        ],
      },
      {
        severity: 'Medium',
        title: 'Missing retry/backoff on external requests',
        spec: 'Transient API failures can cascade and crash the job runner due to immediate hard failures.',
        solutions: [
          'Add exponential backoff retries for 429/5xx.',
          'Add circuit-breaker for repeated failures.',
          'Persist job state and resume instead of restarting from scratch.',
        ],
      },
    ],
  },
  'shivanya-rxai-system': {
    etaDaysToFix: 5,
    etaDaysToCrash: 14,
    confidence: 'Medium',
    findings: [
      {
        severity: 'High',
        title: 'Input validation gaps on diagnosis endpoints',
        spec: 'Certain fields accept unexpected types/lengths, which can cause downstream model errors and service instability.',
        solutions: [
          'Add strict schema validation at the boundary (e.g., Zod/Joi/Pydantic).',
          'Return structured error codes; block oversized payloads.',
          'Add rate limiting + WAF rules for abuse patterns.',
        ],
      },
    ],
  },
  'sanjeevani-whatsapp-chatbot': {
    etaDaysToFix: 4,
    etaDaysToCrash: 18,
    confidence: 'High',
    findings: [
      {
        severity: 'Medium',
        title: 'Session store eviction causing message loop',
        spec: 'When session state is evicted, the bot can re-process messages and create repeated replies, increasing failure rate.',
        solutions: [
          'Persist session state with TTL and idempotency keys.',
          'Deduplicate inbound message IDs for 24h window.',
          'Add a circuit breaker when repetition is detected.',
        ],
      },
      {
        severity: 'High',
        title: 'Unhandled media parsing exceptions',
        spec: 'Certain attachment types throw unhandled exceptions and crash the worker process.',
        solutions: [
          'Wrap parsers with try/catch and fall back gracefully.',
          'Add file type allowlist and size limits.',
          'Add poison-queue handling and retry policy.',
        ],
      },
    ],
  },
  'shivanya-care': {
    etaDaysToFix: 1,
    etaDaysToCrash: 60,
    confidence: 'Low',
    findings: [],
  },
};

