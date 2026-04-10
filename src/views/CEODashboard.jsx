/**
 * completeceo.jsx — entire CEO / executive workspace in one module (BugSentry Console snapshot).
 *
 * Dependencies (peer): react, react-dom, react-icons (fi/fa/fa6), recharts, gsap, @gsap/react
 * Styles: import your app CSS (classes: ceo-*, dev-*, team-link-*, profile-menu-*, etc.)
 *
 * Usage:
 *   import CompleteCeo from './completeceo.jsx';
 *   <CompleteCeo token={token} onLogout={...} onBack={...} />
 *
 * Built by scripts/build-completeceo.mjs — regenerate after editing split CEO files.
 */

import React, { useState, useEffect, useRef, useLayoutEffect, forwardRef } from 'react';
import { FaCode } from 'react-icons/fa';
import {
  FiLayout,
  FiAlertTriangle,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiGrid,
  FiPlus,
  FiCopy,
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronDown,
} from 'react-icons/fi';
import { FaBriefcase } from 'react-icons/fa6';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

gsap.registerPlugin(useGSAP);

// --- Demo team link (localStorage) ---
/**
 * Demo team linking (CEO creates code → developer joins via code).
 * Uses localStorage only — same browser/profile; replace with API for production.
 */

const STORAGE_KEY = 'bugsentry_team_link_demo';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { teams: [] };
  } catch {
    return { teams: [] };
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function randomSegment(len) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < len; i += 1) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

/** New unique invite code, e.g. BUG-A1B2C3 */
function generateTeamCode() {
  return `BUG-${randomSegment(6)}`;
}

function createDemoTeam() {
  const data = load();
  const teams = Array.isArray(data.teams) ? data.teams : [];
  let code = generateTeamCode();
  const existing = new Set(teams.map((t) => t.code));
  while (existing.has(code)) {
    code = generateTeamCode();
  }
  teams.unshift({
    code,
    createdAt: new Date().toISOString(),
  });
  data.teams = teams;
  save(data);
  return code;
}

function listDemoTeams() {
  const data = load();
  return Array.isArray(data.teams) ? [...data.teams] : [];
}

function normalizeTeamCode(input) {
  return String(input || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

/**
 * @returns {{ ok: true, code: string } | { ok: false, error: string }}
 */
function joinDemoTeam(rawInput) {
  const code = normalizeTeamCode(rawInput);
  if (!code) {
    return { ok: false, error: 'Enter a team code.' };
  }
  const data = load();
  const teams = Array.isArray(data.teams) ? data.teams : [];
  const exists = teams.some((t) => t.code === code);
  if (!exists) {
    return {
      ok: false,
      error:
        'Invalid code, or it was created in another browser. Demo uses this device only — create a team in CEO view here first.',
    };
  }
  data.devJoined = { code, joinedAt: new Date().toISOString() };
  save(data);
  return { ok: true, code };
}

function getDevJoinedTeam() {
  const data = load();
  return data.devJoined && data.devJoined.code ? data.devJoined : null;
}

function leaveDevDemoTeam() {
  const data = load();
  delete data.devJoined;
  save(data);
}

// --- Executive dashboard demo data ---
/**
 * Executive dashboard demo data.
 * Replace with API responses when wiring BugSentry-System.
 */

const CEO_EXECUTIVE_METRICS = {
  overallRiskLevel: 'High',
  overallRiskScore: 72,
  estimatedBusinessLoss: '$1.8M – $2.4M',
  releaseDelayRisk: '10–14 days',
  usersAffected: '~42,000',
  usersAffectedNote: 'active accounts in affected regions',
};

const CEO_CRITICAL_ISSUES = [
  {
    id: 'pay-1',
    module: 'Payment & billing system',
    riskLevel: 'Critical',
    failureProbability: '38% in 30 days',
    businessImpact:
      'Failed charges and refunds could erode trust and reduce recurring revenue in our largest market.',
    leadershipAsk:
      'Are we willing to slow non-essential billing changes until retry and refund paths are proven stable?',
  },
  {
    id: 'auth-1',
    module: 'Customer authentication',
    riskLevel: 'High',
    failureProbability: '22% in 45 days',
    businessImpact:
      'Login outages would spike support costs and slow new customer onboarding.',
    leadershipAsk:
      'Do we need a temporary executive sponsor for identity work across product and security?',
  },
  {
    id: 'data-1',
    module: 'Data pipeline (analytics)',
    riskLevel: 'High',
    failureProbability: '18% in 60 days',
    businessImpact:
      'Reporting gaps could delay leadership decisions and compliance filings.',
    leadershipAsk:
      'Should compliance and finance get a dated readout plan if pipeline SLAs slip further?',
  },
];

const CEO_RECOMMENDED_ACTION = {
  headline: 'Fix payment system within 48 hours',
  detail:
    'Prioritize stabilization of the payment and billing module before the next release window to limit revenue exposure and protect customer trust.',
  deadline: 'Target: 48 hours',
};

const CEO_IF_IGNORED = {
  financialLoss: 'Up to $2.4M in projected loss over 90 days',
  releaseDelay: 'Additional 2–3 week slip on the flagship release',
  userImpact: 'Roughly 40k+ users exposed to payment or access failures',
};

const CEO_RISK_TREND = [
  { period: 'Week 1', risk: 52 },
  { period: 'Week 2', risk: 58 },
  { period: 'Week 3', risk: 61 },
  { period: 'Week 4', risk: 68 },
  { period: 'Week 5', risk: 70 },
  { period: 'Week 6', risk: 72 },
];

const CEO_PREDICTIONS = {
  expectedFailureWindow: '14–21 days without intervention',
  probabilityOfFailure: '34%',
  confidenceLevel: 'Medium–high (based on last 90 days of signals)',
};

const CEO_TEAM_IMPACT = {
  loadStatus: 'Engineering is moderately overloaded relative to risk backlog.',
  bottlenecks: 'Payment squad and on-call rotation are the main constraints.',
  productivity:
    'Context switching from incidents is reducing delivery predictability this quarter.',
};

const CEO_AI_INSIGHT =
  'Risk has increased due to frequent production updates, uneven test coverage in billing flows, and a growing backlog of unresolved high-severity items. Acting on the payment system first offers the strongest reduction in financial and reputational exposure.';

/** Per-page header copy when using sidebar panel navigation */
const CEO_PANEL_PAGES = {
  'ceo-exec-summary': {
    kicker: 'Portfolio pulse',
    title: 'Executive summary',
    lede: 'One place to see risk, money, timeline, and customer reach — before you dive into issues or actions.',
  },
  'ceo-exec-critical': {
    kicker: 'Priority issues',
    title: 'Critical issues',
    lede: 'The few problems that drive most of your downside this cycle. Each ties to a clear business outcome.',
  },
  'ceo-exec-next': {
    kicker: 'Decisions',
    title: 'Next steps',
    lede: 'What to do first, what happens if you wait, and how to align the organization around it.',
  },
  'ceo-exec-outlook': {
    kicker: 'Forward view',
    title: 'Outlook',
    lede: 'How risk has trended and what the model suggests if today’s patterns continue.',
  },
  'ceo-exec-teams': {
    kicker: 'Organization',
    title: 'Teams & roster',
    lede: 'Engineering squads, leads, and member-level signals — compensation, satisfaction, behaviour, and team fit.',
  },
  'ceo-exec-people': {
    kicker: 'People & delivery',
    title: 'Team & insight',
    lede: 'Whether the organization can absorb the work, where it hurts, and what the AI summary recommends.',
  },
};

const CEO_SUMMARY_NARRATIVE =
  'Signals from production, customer support, and revenue systems are aligned: exposure is concentrated in payment and identity flows. The portfolio risk index is elevated but not yet in crisis territory — early, decisive action on the top issues keeps optionality for the quarter.';

const CEO_SUMMARY_HIGHLIGHTS = [
  'Most modeled financial loss ties to billing and renewal paths, not back-office tools.',
  'Release pressure is increasing while two teams are already above sustainable on-call load.',
  'Customer-visible failure modes are more likely than internal-only outages in the next 30 days.',
];

/** Executive summary — quick program statistics (replace with API) */
const CEO_SUMMARY_STATS = [
  {
    id: 'findings',
    label: 'Open critical & high findings',
    value: '47',
    delta: '+6',
    deltaLabel: 'vs prior 30 days',
    sentiment: 'negative',
  },
  {
    id: 'repos',
    label: 'Repositories monitored',
    value: '186',
    delta: '+12',
    deltaLabel: 'new integrations',
    sentiment: 'neutral',
  },
  {
    id: 'mtta',
    label: 'Mean time to acknowledge',
    value: '4.2h',
    delta: '−0.8h',
    deltaLabel: 'vs last quarter',
    sentiment: 'positive',
  },
  {
    id: 'coverage',
    label: 'Critical-path test coverage',
    value: '61%',
    delta: '−4 pts',
    deltaLabel: 'billing & auth scope',
    sentiment: 'negative',
  },
];

/** Risk-weighted exposure index by business area (0–100) for summary bar chart */
const CEO_SUMMARY_EXPOSURE_BY_AREA = [
  { area: 'Payments & billing', exposure: 94 },
  { area: 'Customer identity', exposure: 76 },
  { area: 'Data & analytics', exposure: 58 },
  { area: 'Core platform', exposure: 44 },
  { area: 'Internal tools', exposure: 22 },
];

const CEO_CRITICAL_PAGE_INTRO =
  'These items are ranked by combined business impact and likelihood. Use them to set weekly priorities — not to replace deeper technical reviews owned by your leads.';

const CEO_ACTION_STAKEHOLDERS = [
  { role: 'Product', ask: 'Confirm scope freeze or phased rollout for billing-adjacent features.' },
  { role: 'Engineering', ask: 'Assign a single owner for payment stability through the next release window.' },
  { role: 'Customer success', ask: 'Prepare proactive messaging if payment retries or refunds degrade.' },
];

const CEO_ACTION_CHECKLIST = [
  { step: '1', title: 'Confirm severity with owners', detail: '30-minute sync with product + eng leads on payment and auth.' },
  { step: '2', title: 'Protect the customer path', detail: 'Agree on guardrails for deploys touching billing until metrics recover.' },
  { step: '3', title: 'Communicate upward', detail: 'Short board-ready note: risk, decision, and 7-day checkpoint.' },
];

const CEO_OUTLOOK_NARRATIVE =
  'The risk index has climbed steadily as shipping frequency outpaced validation in high-value flows. The curve flattens only when remediation and release discipline move in tandem — not when pauses all work.';

const CEO_OUTLOOK_SCENARIOS = [
  { label: 'Base case', text: 'Targeted fixes on payment + auth; index stabilizes within 3–4 weeks.' },
  { label: 'Stress case', text: 'Continued rapid deploys without test investment; incident rate doubles vs. trailing quarter.' },
  { label: 'Upside case', text: 'Dedicated stabilization sprint; measurable drop in customer-impacting defects by week 6.' },
];

const CEO_ORG_CAPACITY = [
  { label: 'Engineering throughput', pct: 72, note: 'Backlog growing faster than completion' },
  { label: 'Incident / on-call load', pct: 84, note: 'Above sustainable for two squads' },
  { label: 'Cross-team alignment', pct: 58, note: 'Decision latency on shared services' },
];

const CEO_ORG_CADENCE =
  'Weekly 30-minute executive risk review until the payment workstream is green. Cancel early if metrics hold for two consecutive weeks.';

// --- Teams roster demo data ---
/**
 * Executive teams roster — demo data.
 * Replace with HRIS / people API; treat compensation as restricted.
 */

/** @typedef {{ memberId: string; name: string; title: string }} CeoTeamMemberRef */
/** @typedef {{ id: string; name: string; focus: string; leader: CeoTeamMemberRef; members: CeoTeamMemberRef[] }} CeoTeam */

/** @type {CeoTeam[]} */
const CEO_TEAMS = [
  {
    id: 'payments',
    name: 'Payments & billing',
    focus: 'Checkout, renewals, refunds',
    leader: {
      memberId: 'tm-alex',
      name: 'Alex Rivera',
      title: 'Engineering Manager',
    },
    members: [
      { memberId: 'tm-jordan', name: 'Jordan Lee', title: 'Senior Software Engineer' },
      { memberId: 'tm-sam', name: 'Sam Okonkwo', title: 'Software Engineer' },
      { memberId: 'tm-ria', name: 'Ria Patel', title: 'QA Lead' },
    ],
  },
  {
    id: 'identity',
    name: 'Customer identity',
    focus: 'Auth, sessions, SSO',
    leader: {
      memberId: 'tm-morgan',
      name: 'Morgan Chen',
      title: 'Engineering Manager',
    },
    members: [
      { memberId: 'tm-drew', name: 'Drew Kim', title: 'Staff Engineer' },
      { memberId: 'tm-lena', name: 'Lena Volkov', title: 'Software Engineer' },
    ],
  },
  {
    id: 'data',
    name: 'Data & analytics',
    focus: 'Pipelines, reporting, compliance exports',
    leader: {
      memberId: 'tm-nina',
      name: 'Nina Brooks',
      title: 'Engineering Manager',
    },
    members: [
      { memberId: 'tm-chris', name: 'Chris Adebayo', title: 'Data Engineer' },
      { memberId: 'tm-taylor', name: 'Taylor Singh', title: 'Analytics Engineer' },
    ],
  },
];

/** @param {number[]} values eight weekly index values (0–100 scale) */
function workTrendSeries(values) {
  return {
    label: 'Weekly delivery index',
    note: 'Illustrative blend of shipped work, reviews, and on-call load (last 8 weeks).',
    points: values.map((value, i) => ({ week: `W${i + 1}`, value })),
  };
}

/**
 * Rich profile per person (leaders + ICs). Keys = memberId.
 * @type {Record<string, {
 *   teamId: string;
 *   workSatisfaction: { score: number; max: number; label: string; detail: string };
 *   compensation: { annualBase: string; note: string };
 *   behaviour: string;
 *   teamAlignment: { label: string; score: number; summary: string };
 *   workTrend: { label: string; note: string; points: { week: string; value: number }[] };
 * }>}
 */
const CEO_MEMBER_PROFILES = {
  'tm-alex': {
    teamId: 'payments',
    compensation: { annualBase: '$212,000', note: 'Annual base · FY26 · US' },
    workSatisfaction: {
      score: 7,
      max: 10,
      label: 'Solid',
      detail: 'Positive on mission clarity; wants faster headcount for on-call relief.',
    },
    behaviour:
      'Calm under incident pressure; sets clear expectations. Occasionally overcommits the team when negotiating deadlines with product.',
    teamAlignment: {
      label: 'Strong fit',
      score: 91,
      summary:
        'Trusted by reports and peers; aligns squad goals with company metrics. Good partner for cross-team initiatives.',
    },
    workTrend: workTrendSeries([70, 72, 68, 75, 78, 74, 80, 79]),
  },
  'tm-jordan': {
    teamId: 'payments',
    compensation: { annualBase: '$186,000', note: 'Annual base · FY26 · US' },
    workSatisfaction: {
      score: 8,
      max: 10,
      label: 'High',
      detail: 'Enjoys technical depth; requesting more design pairing before major releases.',
    },
    behaviour:
      'Direct communicator; mentors juniors proactively. Can be terse in written reviews when overloaded.',
    teamAlignment: {
      label: 'Strong fit',
      score: 88,
      summary:
        'Core technical anchor for billing; collaborates well with QA and product. Natural choice for incident commander rotation.',
    },
    workTrend: workTrendSeries([65, 70, 74, 76, 78, 82, 85, 88]),
  },
  'tm-sam': {
    teamId: 'payments',
    compensation: { annualBase: '$142,000', note: 'Annual base · FY26 · US' },
    workSatisfaction: {
      score: 6,
      max: 10,
      label: 'Mixed',
      detail: 'Growing skills; feels scope creep on support tickets vs feature work.',
    },
    behaviour:
      'Curious and willing to learn; sometimes needs clearer prioritization from leadership to avoid thrash.',
    teamAlignment: {
      label: 'Good fit',
      score: 76,
      summary:
        'Fits culture; would benefit from tighter sprint boundaries. Not a cohesion risk if workload is stabilized.',
    },
    workTrend: workTrendSeries([72, 70, 68, 65, 63, 66, 70, 68]),
  },
  'tm-ria': {
    teamId: 'payments',
    compensation: { annualBase: '$138,000', note: 'Annual base · FY26 · US' },
    workSatisfaction: {
      score: 8,
      max: 10,
      label: 'High',
      detail: 'Proud of quality bar; asks for earlier involvement in payment edge cases.',
    },
    behaviour:
      'Detail-oriented; raises risks early. Strong advocate for customer-visible quality.',
    teamAlignment: {
      label: 'Strong fit',
      score: 90,
      summary:
        'Bridges eng and quality effectively; respected across Payments. Strengthens team decision-making.',
    },
    workTrend: workTrendSeries([68, 72, 75, 74, 76, 78, 77, 79]),
  },
  'tm-morgan': {
    teamId: 'identity',
    compensation: { annualBase: '$205,000', note: 'Annual base · FY26 · US' },
    workSatisfaction: {
      score: 8,
      max: 10,
      label: 'High',
      detail: 'Energized by security roadmap; concerned about roadmap sequencing vs platform debt.',
    },
    behaviour:
      'Collaborative with security and IT; transparent in status updates. Pushes back constructively on risky shortcuts.',
    teamAlignment: {
      label: 'Strong fit',
      score: 89,
      summary:
        'Aligns Identity squad with org security posture; strong trust from stakeholders.',
    },
    workTrend: workTrendSeries([75, 74, 76, 72, 70, 73, 75, 77]),
  },
  'tm-drew': {
    teamId: 'identity',
    compensation: { annualBase: '$224,000', note: 'Annual base · FY26 · US' },
    workSatisfaction: {
      score: 7,
      max: 10,
      label: 'Solid',
      detail: 'Wants clearer long-term staff expectations and reduced context switching.',
    },
    behaviour:
      'Deeply technical; patient in knowledge sharing. Occasionally disengages when decisions get reversed late.',
    teamAlignment: {
      label: 'Strong fit',
      score: 85,
      summary:
        'Technical leader for auth hardening; works well with Morgan. Minor friction only under shifting priorities.',
    },
    workTrend: workTrendSeries([80, 78, 76, 74, 72, 70, 73, 75]),
  },
  'tm-lena': {
    teamId: 'identity',
    compensation: { annualBase: '$148,000', note: 'Annual base · FY26 · US' },
    workSatisfaction: {
      score: 9,
      max: 10,
      label: 'Very high',
      detail: 'Thriving on growth; interested in security certification sponsorship.',
    },
    behaviour:
      'Positive, reliable, asks good questions in planning. Brings junior-friendly documentation habits.',
    teamAlignment: {
      label: 'Strong fit',
      score: 92,
      summary:
        'Culture carrier for Identity; elevates team morale without slowing delivery.',
    },
    workTrend: workTrendSeries([62, 68, 74, 79, 82, 85, 88, 90]),
  },
  'tm-nina': {
    teamId: 'data',
    compensation: { annualBase: '$198,000', note: 'Annual base · FY26 · US' },
    workSatisfaction: {
      score: 6,
      max: 10,
      label: 'Mixed',
      detail: 'Stakeholder noise on ad-hoc reports; seeking executive air-cover on priorities.',
    },
    behaviour:
      'Structured and accountable; can sound sharp when deadlines slip due to upstream schema changes.',
    teamAlignment: {
      label: 'Good fit',
      score: 79,
      summary:
        'Right leader for compliance-heavy work; needs clearer top-down prioritization to stay aligned with peers.',
    },
    workTrend: workTrendSeries([78, 76, 74, 72, 70, 68, 71, 73]),
  },
  'tm-chris': {
    teamId: 'data',
    compensation: { annualBase: '$165,000', note: 'Annual base · FY26 · US' },
    workSatisfaction: {
      score: 7,
      max: 10,
      label: 'Solid',
      detail: 'Enjoys pipeline work; wants investment in tooling to reduce manual ops.',
    },
    behaviour:
      'Steady operator; documents runbooks well. Prefers async communication.',
    teamAlignment: {
      label: 'Strong fit',
      score: 86,
      summary:
        'Reliable partner for finance and compliance consumers; integrates smoothly with Data squad rituals.',
    },
    workTrend: workTrendSeries([70, 71, 73, 72, 74, 76, 75, 77]),
  },
  'tm-taylor': {
    teamId: 'data',
    compensation: { annualBase: '$152,000', note: 'Annual base · FY26 · US' },
    workSatisfaction: {
      score: 7,
      max: 10,
      label: 'Solid',
      detail: 'Interested in moving toward product analytics partnership.',
    },
    behaviour:
      'Analytical, diplomatic in meetings. Sometimes takes on too much “glue” work.',
    teamAlignment: {
      label: 'Good fit',
      score: 81,
      summary:
        'Works well with Chris and Nina; risk of overload if not guarded — not a values mismatch.',
    },
    workTrend: workTrendSeries([66, 68, 70, 72, 74, 73, 75, 74]),
  },
};

function getCeoMemberProfile(memberId) {
  return CEO_MEMBER_PROFILES[memberId] ?? null;
}

function findTeamForMember(memberId) {
  return CEO_TEAMS.find(
    (t) =>
      t.leader.memberId === memberId || t.members.some((m) => m.memberId === memberId)
  );
}

// --- Auth (minimal; avoids @tanstack/react-query in this file) ---
const __AUTH_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_AUTH_URL
  ? String(import.meta.env.VITE_AUTH_URL).trim().replace(/\/$/, '')
  : '') || 'https://bugsentry-auth.onrender.com';

async function __fetchAuthMe(token) {
  const r = await fetch(`${__AUTH_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error('auth-me');
  return r.json();
}

function useCeoUser(token) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    let cancelled = false;
    __fetchAuthMe(token)
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);
  return { user };
}

// --- Profile menu (GSAP) ---
gsap.registerPlugin(useGSAP);

function profileMenuPrefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Profile trigger + dropdown (developer & CEO topbars). GSAP: chevron flip, panel scale/y,
 * staggered header lines and menu rows, separator draw.
 */
const ProfileMenuBlock = forwardRef(function ProfileMenuBlock(
  {
    user,
    displayFallback,
    roleLabel,
    open,
    onOpenChange,
    onLogout,
    variant = 'developer',
  },
  forwardedRef
) {
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const chevronWrapRef = useRef(null);

  const setWrapperNode = (node) => {
    rootRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    gsap.set(panel, { autoAlpha: 0, pointerEvents: 'none' });
  }, []);

  useGSAP(
    () => {
      const panel = panelRef.current;
      const chevronWrap = chevronWrapRef.current;
      if (!panel || !chevronWrap) return undefined;

      gsap.to(chevronWrap, {
        rotation: open ? 180 : 0,
        duration: profileMenuPrefersReducedMotion() ? 0 : 0.32,
        ease: 'power3.out',
        transformOrigin: '50% 50%',
      });

      if (!open) {
        const t = gsap.to(panel, {
          autoAlpha: 0,
          y: -8,
          scale: 0.96,
          duration: 0.22,
          ease: 'power3.in',
          transformOrigin: '100% 0%',
          onComplete: () => {
            gsap.set(panel, { pointerEvents: 'none' });
          },
        });
        return () => t.kill();
      }

      gsap.set(panel, { pointerEvents: 'auto' });
      const q = gsap.utils.selector(panel);

      if (profileMenuPrefersReducedMotion()) {
        gsap.set(panel, { autoAlpha: 1, y: 0, scale: 1 });
        gsap.set(q('.profile-menu-pro-header-inner > *'), { autoAlpha: 1, y: 0 });
        gsap.set(q('.menu-item'), { autoAlpha: 1, x: 0 });
        gsap.set(q('.profile-menu-sep'), { scaleX: 1, autoAlpha: 1 });
        return undefined;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        panel,
        { autoAlpha: 0, y: -14, scale: 0.92, transformOrigin: '100% 0%' },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.38 }
      )
        .from(
          q('.profile-menu-pro-header-inner > *'),
          { autoAlpha: 0, y: 8, stagger: 0.055, duration: 0.28 },
          '-=0.28'
        )
        .from(
          q('.profile-menu-body > .menu-item:not(.menu-item--signout)'),
          { autoAlpha: 0, x: -14, stagger: 0.05, duration: 0.26 },
          '-=0.2'
        )
        .from(
          q('.profile-menu-sep'),
          { scaleX: 0, autoAlpha: 0, transformOrigin: 'left center', duration: 0.22 },
          '-=0.12'
        )
        .from(
          q('.menu-item--signout'),
          { autoAlpha: 0, x: -12, duration: 0.24 },
          '-=0.14'
        );

      return () => {
        tl.kill();
      };
    },
    { dependencies: [open], scope: rootRef }
  );

  const display = user?.name || user?.email || displayFallback;

  return (
    <div
      ref={setWrapperNode}
      className="user-menu-wrapper profile-menu-block"
      data-variant={variant}
      data-menu-open={open ? 'true' : 'false'}
    >
      <button
        type="button"
        className="profile-trigger profile-trigger--pro"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {user?.picture ? (
          <img src={user.picture} alt="" className="dev-user-avatar-img" />
        ) : (
          <div className="dev-user-avatar dev-user-avatar--pro" aria-hidden />
        )}
        <span ref={chevronWrapRef} className="profile-trigger-chevron" aria-hidden>
          <FiChevronDown size={14} strokeWidth={2.2} />
        </span>
      </button>

      <div
        ref={panelRef}
        className="profile-menu-dropdown profile-menu-dropdown--pro"
        role="menu"
        aria-hidden={!open}
      >
        <div className="profile-menu-header profile-menu-pro-header">
          <div className="profile-menu-pro-header-inner">
            <span className="profile-menu-header-label profile-menu-pro-kicker">Signed in as</span>
            <strong className="profile-menu-header-name" title={user?.name || user?.email}>
              {display}
            </strong>
            {roleLabel ? <span className="profile-menu-role-line">{roleLabel}</span> : null}
          </div>
        </div>
        <div className="profile-menu-body">
          <button type="button" className="menu-item" role="menuitem" onClick={() => onOpenChange(false)}>
            <span className="menu-item-icon" aria-hidden>
              <FiUser size={18} strokeWidth={1.75} />
            </span>
            <span className="menu-item-label">Profile</span>
          </button>
          <button type="button" className="menu-item" role="menuitem" onClick={() => onOpenChange(false)}>
            <span className="menu-item-icon" aria-hidden>
              <FiSettings size={18} strokeWidth={1.75} />
            </span>
            <span className="menu-item-label">Settings</span>
          </button>
          <div className="profile-menu-sep" role="separator" />
          <button
            type="button"
            className="menu-item menu-item--signout"
            role="menuitem"
            onClick={() => {
              onOpenChange(false);
              onLogout();
            }}
          >
            <span className="menu-item-icon" aria-hidden>
              <FiLogOut size={18} strokeWidth={1.75} />
            </span>
            <span className="menu-item-label">Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
});

// --- Teams panel ---
function MemberWorkChart({ memberId, workTrend }) {
  const gradId = `ceo-mw-${memberId}`;
  const last = workTrend.points[workTrend.points.length - 1]?.value;

  return (
    <div className="ceo-teams-work-chart dev-activity-card">
      <div className="ceo-teams-work-chart-head">
        <div>
          <p className="ceo-teams-work-chart-title">{workTrend.label}</p>
          <p className="ceo-teams-work-chart-note">{workTrend.note}</p>
        </div>
        {last != null && (
          <span className="ceo-teams-work-chart-latest" title="Latest week index">
            {last}
          </span>
        )}
      </div>
      <div
        className="ceo-teams-work-chart-canvas"
        role="img"
        aria-label={`${workTrend.label}: trend over eight weeks`}
      >
        <ResponsiveContainer width="100%" height={104}>
          <AreaChart data={workTrend.points} margin={{ top: 6, right: 8, left: 0, bottom: 2 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#58a6ff" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#58a6ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.38)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickLine={false}
              dy={6}
            />
            <YAxis domain={[0, 100]} width={0} hide />
            <Tooltip
              cursor={{ stroke: 'rgba(88, 166, 255, 0.35)', strokeWidth: 1 }}
              contentStyle={{
                background: 'rgba(17, 22, 32, 0.96)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#fff',
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.55)' }}
              formatter={(v) => [`${v}`, 'Index']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#58a6ff"
              strokeWidth={2}
              fill={`url(#${gradId})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: '#79c0ff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function alignmentClass(score) {
  if (score >= 86) return 'ceo-teams-align--strong';
  if (score >= 72) return 'ceo-teams-align--good';
  return 'ceo-teams-align--watch';
}

function satisfactionClass(score, max) {
  const ratio = score / max;
  if (ratio >= 0.8) return 'ceo-teams-sat--high';
  if (ratio >= 0.55) return 'ceo-teams-sat--mid';
  return 'ceo-teams-sat--low';
}

function MemberPickerButton({ person, selectedId, onSelect, variant }) {
  const isLeader = variant === 'leader';
  const isSelected = selectedId === person.memberId;
  return (
    <button
      type="button"
      className={`ceo-teams-member-btn${isLeader ? ' ceo-teams-member-btn--leader' : ''}${isSelected ? ' is-selected' : ''}`}
      onClick={() => onSelect(person.memberId)}
      aria-pressed={isSelected}
    >
      <span className="ceo-teams-member-btn-avatar" aria-hidden>
        <FiUser />
      </span>
      <span className="ceo-teams-member-btn-text">
        <span className="ceo-teams-member-btn-name">{person.name}</span>
        <span className="ceo-teams-member-btn-title">{person.title}</span>
      </span>
      {isLeader && <span className="ceo-teams-member-btn-badge">Lead</span>}
    </button>
  );
}

function MemberDetail({ memberId }) {
  const profile = getCeoMemberProfile(memberId);
  const team = findTeamForMember(memberId);
  const person =
    team &&
    (team.leader.memberId === memberId
      ? team.leader
      : team.members.find((m) => m.memberId === memberId));

  if (!profile || !person || !team) {
    return (
      <div className="ceo-teams-detail ceo-teams-detail--empty dev-activity-card">
        <p className="ceo-teams-detail-placeholder">Select a team lead or member to view their executive profile.</p>
      </div>
    );
  }

  const sat = profile.workSatisfaction;

  return (
    <div className="ceo-teams-detail dev-activity-card">
      <header className="ceo-teams-detail-head">
        <div>
          <p className="ceo-teams-detail-kicker">{team.name}</p>
          <h3 className="ceo-teams-detail-name">{person.name}</h3>
          <p className="ceo-teams-detail-title">{person.title}</p>
        </div>
        <div
          className={`ceo-teams-sat-pill ${satisfactionClass(sat.score, sat.max)}`}
          aria-label={`Work satisfaction ${sat.score} out of ${sat.max}`}
        >
          <span className="ceo-teams-sat-pill-score">
            {sat.score}/{sat.max}
          </span>
          <span className="ceo-teams-sat-pill-label">{sat.label}</span>
        </div>
      </header>

      {profile.workTrend && (
        <MemberWorkChart memberId={memberId} workTrend={profile.workTrend} />
      )}

      <dl className="ceo-teams-detail-grid">
        <div className="ceo-teams-detail-block">
          <dt>Compensation (annual base)</dt>
          <dd>
            <strong className="ceo-teams-detail-value">{profile.compensation.annualBase}</strong>
            <span className="ceo-teams-detail-note">{profile.compensation.note}</span>
          </dd>
        </div>
        <div className="ceo-teams-detail-block ceo-teams-detail-block--wide">
          <dt>Work satisfaction</dt>
          <dd>
            <p className="ceo-teams-detail-prose">{sat.detail}</p>
          </dd>
        </div>
        <div className="ceo-teams-detail-block ceo-teams-detail-block--wide">
          <dt>Behaviour & working style</dt>
          <dd>
            <p className="ceo-teams-detail-prose">{profile.behaviour}</p>
          </dd>
        </div>
        <div className="ceo-teams-detail-block ceo-teams-detail-block--wide">
          <dt>Fit with this team</dt>
          <dd>
            <div className="ceo-teams-align-row">
              <span className={`ceo-teams-align-badge ${alignmentClass(profile.teamAlignment.score)}`}>
                {profile.teamAlignment.label}
              </span>
              <span className="ceo-teams-align-score">{profile.teamAlignment.score}/100</span>
            </div>
            <p className="ceo-teams-detail-prose">{profile.teamAlignment.summary}</p>
          </dd>
        </div>
      </dl>
    </div>
  );
}

function CeoTeamsPanel() {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div className="ceo-panel-page">
      <p className="ceo-teams-disclaimer">
        Restricted people data — illustrative for demo. Connect HRIS / performance tools for production; follow
        local compensation disclosure rules.
      </p>

      <div className="ceo-teams-layout">
        <div className="ceo-teams-roster">
          {CEO_TEAMS.map((team) => (
            <section key={team.id} className="ceo-teams-team dev-activity-card">
              <header className="ceo-teams-team-head">
                <h3 className="ceo-teams-team-name">{team.name}</h3>
                <p className="ceo-teams-team-focus">{team.focus}</p>
              </header>
              <div className="ceo-teams-team-section">
                <p className="ceo-teams-team-label">Team lead</p>
                <MemberPickerButton
                  person={team.leader}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  variant="leader"
                />
              </div>
              <div className="ceo-teams-team-section">
                <p className="ceo-teams-team-label">Members</p>
                <div className="ceo-teams-member-list">
                  {team.members.map((m) => (
                    <MemberPickerButton
                      key={m.memberId}
                      person={m}
                      selectedId={selectedId}
                      onSelect={setSelectedId}
                      variant="member"
                    />
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

        <div className="ceo-teams-detail-column">
          <h4 className="ceo-teams-detail-column-title">Member profile</h4>
          <MemberDetail memberId={selectedId} />
        </div>
      </div>
    </div>
  );
}

// --- Main workspace panels ---
function riskLevelClass(level) {
  const l = String(level).toLowerCase();
  if (l.includes('critical')) return 'ceo-risk-pill critical';
  if (l.includes('high')) return 'ceo-risk-pill high';
  if (l.includes('medium')) return 'ceo-risk-pill medium';
  return 'ceo-risk-pill low';
}

function capacityTone(pct) {
  if (pct >= 80) return 'high';
  if (pct >= 65) return 'medium';
  return 'low';
}

function exposureBarColor(score) {
  if (score >= 80) return '#f85149';
  if (score >= 55) return '#d29922';
  return '#58a6ff';
}

function CeoWorkspacePanel({ panelId }) {
  const m = CEO_EXECUTIVE_METRICS;

  switch (panelId) {
    case 'ceo-exec-summary':
      return (
        <div className="ceo-panel-page">
          <div className="ceo-panel-hero dev-activity-card">
            <p className="ceo-panel-prose">{CEO_SUMMARY_NARRATIVE}</p>
            <ul className="ceo-panel-bullets">
              {CEO_SUMMARY_HIGHLIGHTS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="ceo-exec-block-head ceo-panel-section-head">
            <h2 className="ceo-exec-block-title">Program statistics</h2>
            <p className="ceo-exec-block-desc">Operational counts and quality signals for this reporting period.</p>
          </div>
          <div className="ceo-summary-stats-grid">
            {CEO_SUMMARY_STATS.map((s) => (
              <article key={s.id} className="ceo-summary-stat-card dev-activity-card">
                <span className="ceo-summary-stat-label">{s.label}</span>
                <p className="ceo-summary-stat-value">{s.value}</p>
                <span className={`ceo-summary-stat-delta ceo-summary-stat-delta--${s.sentiment}`}>
                  <span className="ceo-summary-stat-delta-num">{s.delta}</span>
                  <span className="ceo-summary-stat-delta-note">{s.deltaLabel}</span>
                </span>
              </article>
            ))}
          </div>

          <div className="ceo-summary-charts">
            <div className="ceo-summary-chart-card dev-activity-card">
              <div className="ceo-summary-chart-head">
                <h3 className="ceo-summary-chart-title">Exposure by business area</h3>
                <p className="ceo-summary-chart-sub">Risk-weighted index · higher = more attention needed</p>
              </div>
              <div className="ceo-summary-chart-body ceo-summary-chart-body--bars">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    layout="vertical"
                    data={CEO_SUMMARY_EXPOSURE_BY_AREA}
                    margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="4 6"
                      stroke="rgba(255,255,255,0.06)"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="area"
                      width={128}
                      tick={{ fill: 'rgba(255,255,255,0.72)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                      contentStyle={{
                        background: '#161b22',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                      labelStyle={{ color: '#e6edf3' }}
                      formatter={(v) => [`${v}`, 'Index']}
                    />
                    <Bar dataKey="exposure" name="Exposure" radius={[0, 6, 6, 0]} barSize={20}>
                      {CEO_SUMMARY_EXPOSURE_BY_AREA.map((entry) => (
                        <Cell key={entry.area} fill={exposureBarColor(entry.exposure)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="ceo-summary-chart-card dev-activity-card">
              <div className="ceo-summary-chart-head">
                <h3 className="ceo-summary-chart-title">Portfolio risk index</h3>
                <p className="ceo-summary-chart-sub">Trailing six weeks · same scale as Outlook</p>
              </div>
              <div className="ceo-summary-chart-body">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={CEO_RISK_TREND} margin={{ top: 8, right: 8, left: -18, bottom: 4 }}>
                    <defs>
                      <linearGradient id="ceoSummaryRiskGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#58a6ff" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#58a6ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 8"
                      stroke="rgba(255,255,255,0.06)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="period"
                      tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[40, 80]}
                      tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={32}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#161b22',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                      labelStyle={{ color: '#e6edf3' }}
                      itemStyle={{ color: '#58a6ff' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="risk"
                      stroke="#58a6ff"
                      strokeWidth={2}
                      fill="url(#ceoSummaryRiskGrad)"
                      name="Risk index"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="ceo-exec-block-head ceo-panel-section-head">
            <h2 className="ceo-exec-block-title">Key metrics</h2>
            <p className="ceo-exec-block-desc">Financial and customer snapshot — same definitions across all views.</p>
          </div>
          <div className="ceo-metric-grid">
            <article className="ceo-metric-card ceo-metric-hero dev-activity-card">
              <span className="ceo-metric-label">Overall risk level</span>
              <div className="ceo-metric-value-row">
                <span className={riskLevelClass(m.overallRiskLevel)}>{m.overallRiskLevel}</span>
                <span className="ceo-metric-sub">{m.overallRiskScore} / 100</span>
              </div>
            </article>
            <article className="ceo-metric-card dev-activity-card">
              <span className="ceo-metric-label">Estimated business loss</span>
              <p className="ceo-metric-value">{m.estimatedBusinessLoss}</p>
              <span className="ceo-metric-hint">If issues persist — 90-day range</span>
            </article>
            <article className="ceo-metric-card dev-activity-card">
              <span className="ceo-metric-label">Release delay risk</span>
              <p className="ceo-metric-value">{m.releaseDelayRisk}</p>
              <span className="ceo-metric-hint">Versus planned ship date</span>
            </article>
            <article className="ceo-metric-card dev-activity-card">
              <span className="ceo-metric-label">Users affected</span>
              <p className="ceo-metric-value">{m.usersAffected}</p>
              <span className="ceo-metric-hint">{m.usersAffectedNote}</span>
            </article>
          </div>
          <p className="ceo-panel-footnote">
            Figures aggregate signals from connected systems. Replace with live API data when your backend is wired.
          </p>
        </div>
      );

    case 'ceo-exec-critical':
      return (
        <div className="ceo-panel-page">
          <div className="ceo-panel-hero dev-activity-card">
            <p className="ceo-panel-prose">{CEO_CRITICAL_PAGE_INTRO}</p>
          </div>
          <ol className="ceo-critical-list ceo-critical-list--page">
            {CEO_CRITICAL_ISSUES.map((issue, index) => (
              <li key={issue.id} className="ceo-critical-card dev-activity-card ceo-critical-card--expanded">
                <span className="ceo-critical-index" aria-hidden>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="ceo-critical-body">
                  <div className="ceo-critical-top">
                    <h3 className="ceo-critical-module">{issue.module}</h3>
                    <span className={riskLevelClass(issue.riskLevel)}>{issue.riskLevel}</span>
                  </div>
                  <dl className="ceo-critical-meta">
                    <div>
                      <dt>Failure probability</dt>
                      <dd>{issue.failureProbability}</dd>
                    </div>
                    <div className="ceo-critical-impact">
                      <dt>Business impact</dt>
                      <dd>{issue.businessImpact}</dd>
                    </div>
                  </dl>
                  <div className="ceo-leadership-ask">
                    <span className="ceo-leadership-ask-label">Decision prompt</span>
                    <p className="ceo-leadership-ask-text">{issue.leadershipAsk}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      );

    case 'ceo-exec-next':
      return (
        <div className="ceo-panel-page">
          <div className="ceo-exec-block-head ceo-panel-section-head">
            <h2 className="ceo-exec-block-title">Recommended action</h2>
            <p className="ceo-exec-block-desc">Single highest-priority move for leadership alignment.</p>
          </div>
          <div className="agent-action-bar ceo-action-callout" role="status">
            <div className="ceo-action-icon" aria-hidden>
              <FiTarget />
            </div>
            <div className="ceo-action-body">
              <p className="ceo-action-headline">{CEO_RECOMMENDED_ACTION.headline}</p>
              <p className="ceo-action-detail">{CEO_RECOMMENDED_ACTION.detail}</p>
              <span className="ceo-action-deadline">{CEO_RECOMMENDED_ACTION.deadline}</span>
            </div>
          </div>

          <div className="ceo-panel-two">
            <div className="ceo-checklist-card dev-activity-card">
              <h3 className="ceo-panel-card-title">Execution checklist</h3>
              <p className="ceo-panel-card-lede">Concrete steps for the next few days.</p>
              <ul className="ceo-checklist">
                {CEO_ACTION_CHECKLIST.map((row) => (
                  <li key={row.step} className="ceo-checklist-row">
                    <span className="ceo-checklist-badge">{row.step}</span>
                    <div>
                      <strong className="ceo-checklist-title">{row.title}</strong>
                      <p className="ceo-checklist-detail">{row.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="ceo-stakeholder-card dev-activity-card">
              <h3 className="ceo-panel-card-title">Stakeholder asks</h3>
              <p className="ceo-panel-card-lede">What to request from each function.</p>
              <ul className="ceo-stakeholder-list">
                {CEO_ACTION_STAKEHOLDERS.map((s) => (
                  <li key={s.role}>
                    <span className="ceo-stakeholder-role">{s.role}</span>
                    <span className="ceo-stakeholder-ask">{s.ask}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="ceo-exec-block-head ceo-exec-block-head-spaced">
            <h2 className="ceo-exec-block-title">If this is ignored</h2>
            <p className="ceo-exec-block-desc">Downside if no meaningful action is taken.</p>
          </div>
          <div className="ceo-ignored-card">
            <ul className="ceo-ignored-list">
              <li>
                <strong>Financial</strong>
                <span>{CEO_IF_IGNORED.financialLoss}</span>
              </li>
              <li>
                <strong>Release</strong>
                <span>{CEO_IF_IGNORED.releaseDelay}</span>
              </li>
              <li>
                <strong>Users</strong>
                <span>{CEO_IF_IGNORED.userImpact}</span>
              </li>
            </ul>
          </div>
        </div>
      );

    case 'ceo-exec-outlook':
      return (
        <div className="ceo-panel-page">
          <div className="ceo-panel-hero dev-activity-card">
            <p className="ceo-panel-prose">{CEO_OUTLOOK_NARRATIVE}</p>
          </div>
          <div className="ceo-scenario-grid">
            {CEO_OUTLOOK_SCENARIOS.map((s) => (
              <div key={s.label} className="ceo-scenario-card dev-activity-card">
                <span className="ceo-scenario-label">{s.label}</span>
                <p className="ceo-scenario-text">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="ceo-outlook-chart-block">
            <div className="ceo-chart-card">
              <div className="ceo-chart-head">
                <FiTrendingUp className="ceo-chart-icon" aria-hidden />
                <span>Risk index — higher means more exposure</span>
              </div>
              <div className="ceo-chart-wrap ceo-chart-wrap--wide">
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={CEO_RISK_TREND} margin={{ top: 10, right: 12, left: -12, bottom: 4 }}>
                    <defs>
                      <linearGradient id="ceoRiskAreaGradPanel" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#58a6ff" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#58a6ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 8"
                      stroke="rgba(255,255,255,0.06)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="period"
                      tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[40, 80]}
                      tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={36}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#161b22',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                      labelStyle={{ color: '#e6edf3' }}
                      itemStyle={{ color: '#58a6ff' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="risk"
                      stroke="#58a6ff"
                      strokeWidth={2}
                      fill="url(#ceoRiskAreaGradPanel)"
                      name="Risk"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="ceo-predict-card">
              <h3 className="ceo-exec-subcard-title">Model outputs</h3>
              <p className="ceo-exec-subcard-desc">Forward signals if patterns hold.</p>
              <dl className="ceo-predict-dl">
                <div>
                  <dt>Expected stress window</dt>
                  <dd>{CEO_PREDICTIONS.expectedFailureWindow}</dd>
                </div>
                <div>
                  <dt>Probability of serious incident</dt>
                  <dd>{CEO_PREDICTIONS.probabilityOfFailure}</dd>
                </div>
                <div>
                  <dt>Confidence</dt>
                  <dd>{CEO_PREDICTIONS.confidenceLevel}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      );

    case 'ceo-exec-teams':
      return <CeoTeamsPanel />;

    case 'ceo-exec-people':
      return (
        <div className="ceo-panel-page">
          <div className="ceo-capacity-section dev-activity-card">
            <h3 className="ceo-panel-card-title">Organizational load</h3>
            <p className="ceo-panel-card-lede">Indicative capacity — not a headcount report.</p>
            <ul className="ceo-capacity-list">
              {CEO_ORG_CAPACITY.map((row) => (
                <li key={row.label} className="ceo-capacity-row">
                  <div className="ceo-capacity-top">
                    <span className="ceo-capacity-label">{row.label}</span>
                    <span className="ceo-capacity-pct">{row.pct}%</span>
                  </div>
                  <div className="ceo-capacity-bar-bg" aria-hidden>
                    <div
                      className={`ceo-capacity-bar-fill ceo-capacity-bar-fill--${capacityTone(row.pct)}`}
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  <p className="ceo-capacity-note">{row.note}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="ceo-exec-block-head ceo-panel-section-head">
            <h2 className="ceo-exec-block-title">Team impact</h2>
            <p className="ceo-exec-block-desc">Narrative view of delivery and constraints.</p>
          </div>
          <div className="ceo-team-card">
            <ul className="ceo-team-list">
              <li>
                <span className="ceo-team-label">Workload</span>
                <span>{CEO_TEAM_IMPACT.loadStatus}</span>
              </li>
              <li>
                <span className="ceo-team-label">Bottlenecks</span>
                <span>{CEO_TEAM_IMPACT.bottlenecks}</span>
              </li>
              <li>
                <span className="ceo-team-label">Productivity</span>
                <span>{CEO_TEAM_IMPACT.productivity}</span>
              </li>
            </ul>
          </div>

          <div className="ceo-cadence-card dev-activity-card">
            <h3 className="ceo-panel-card-title">Suggested cadence</h3>
            <p className="ceo-cadence-text">{CEO_ORG_CADENCE}</p>
          </div>

          <div className="ceo-exec-block-head ceo-exec-block-head-spaced">
            <h2 className="ceo-exec-block-title">AI insight</h2>
            <p className="ceo-exec-block-desc">Plain-language read on your current signals.</p>
          </div>
          <div className="ceo-ai-card ceo-ai-card--polished">
            <div className="ceo-ai-badge" aria-hidden>
              <FaBriefcase />
            </div>
            <p className="ceo-ai-text">{CEO_AI_INSIGHT}</p>
          </div>
        </div>
      );

    default:
      return null;
  }
}

// --- Shell layout ---
/** Sidebar: grouped — ids match panel keys in CEO_PANEL_PAGES */
const CEO_SIDEBAR_GROUPS = [
  {
    title: 'Overview',
    items: [
      { id: 'ceo-exec-summary', label: 'Executive summary', icon: FiLayout },
      { id: 'ceo-exec-critical', label: 'Critical issues', icon: FiAlertTriangle },
    ],
  },
  {
    title: 'Actions',
    items: [{ id: 'ceo-exec-next', label: 'Next steps', icon: FiTarget }],
  },
  {
    title: 'Outlook',
    items: [{ id: 'ceo-exec-outlook', label: 'Outlook', icon: FiTrendingUp }],
  },
  {
    title: 'Organization',
    items: [
      { id: 'ceo-exec-teams', label: 'Teams & roster', icon: FiGrid },
      { id: 'ceo-exec-people', label: 'Team & insight', icon: FiUsers },
    ],
  },
];


export function CEODashboard({ token, onLogout, onBack }) {
  const { user } = useCeoUser(token);
  const m = CEO_EXECUTIVE_METRICS;
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTeamLink, setShowTeamLink] = useState(false);
  const [teamCodes, setTeamCodes] = useState(() => listDemoTeams());
  const [copyFlash, setCopyFlash] = useState(null);
  const [activePanel, setActivePanel] = useState(CEO_SIDEBAR_GROUPS[0].items[0].id);
  const userMenuRef = useRef(null);
  const teamLinkRef = useRef(null);

  const pageMeta = CEO_PANEL_PAGES[activePanel] ?? CEO_PANEL_PAGES['ceo-exec-summary'];

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showUserMenu) return;
    function onKey(e) {
      if (e.key === 'Escape') setShowUserMenu(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showUserMenu]);

  useEffect(() => {
    if (!showTeamLink) return;
    function handleClickOutside(event) {
      if (teamLinkRef.current && !teamLinkRef.current.contains(event.target)) {
        setShowTeamLink(false);
      }
    }
    function onKey(e) {
      if (e.key === 'Escape') setShowTeamLink(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [showTeamLink]);

  function handleCreateTeam() {
    createDemoTeam();
    setTeamCodes(listDemoTeams());
  }

  async function handleCopyCode(code) {
    try {
      await navigator.clipboard.writeText(code);
      setCopyFlash(code);
      setTimeout(() => setCopyFlash((c) => (c === code ? null : c)), 1600);
    } catch {
      setCopyFlash(null);
    }
  }

  return (
    <div className="dev-dashboard-layout ceo-dashboard">
      <div className="bg-glow" />
      <div className="light-spot spot-1" />
      <div className="light-spot spot-2" />

      <header className="dev-topbar">
        <div className="dev-topbar-left">
          <img src="/logo.png" alt="BugSentry" className="dev-logo" />
          <div className="ceo-topbar-titles">
            <span className="dev-topbar-title">Executive dashboard</span>
            <span className="ceo-topbar-sub">Organization risk & decisions</span>
          </div>
        </div>

        <div className="dev-topbar-right">
          <div className="team-link-anchor" ref={teamLinkRef}>
            <button
              type="button"
              className="team-link-top-btn"
              onClick={() => {
                setShowTeamLink((v) => !v);
                setTeamCodes(listDemoTeams());
              }}
              aria-expanded={showTeamLink}
            >
              <FiPlus className="team-link-top-btn-icon" aria-hidden />
              Create team
            </button>
            {showTeamLink && (
              <div className="team-link-popover" role="dialog" aria-label="Team invite codes">
                <p className="team-link-popover-title">Invite developers (demo)</p>
                <p className="team-link-popover-lede">
                  Generates a unique code. Developer uses <strong>Join team</strong> with the same code. Stored in this
                  browser only.
                </p>
                <button type="button" className="team-link-generate" onClick={handleCreateTeam}>
                  Generate new code
                </button>
                {teamCodes.length === 0 ? (
                  <p className="team-link-empty">No codes yet — generate one to share.</p>
                ) : (
                  <ul className="team-link-list">
                    {teamCodes.map(({ code }) => (
                      <li key={code} className="team-link-row">
                        <code className="team-link-code">{code}</code>
                        <button
                          type="button"
                          className="team-link-copy"
                          onClick={() => handleCopyCode(code)}
                          title="Copy code"
                        >
                          <FiCopy aria-hidden />
                          {copyFlash === code ? 'Copied' : 'Copy'}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <button type="button" className="icon-btn" onClick={onBack} title="Switch to developer workspace">
            <FaCode style={{ fontSize: '15px' }} />
          </button>

          <ProfileMenuBlock
            ref={userMenuRef}
            user={user}
            displayFallback="Executive"
            roleLabel="Executive workspace"
            open={showUserMenu}
            onOpenChange={setShowUserMenu}
            onLogout={onLogout}
            variant="ceo"
          />
        </div>
      </header>

      <div className="dev-main-grid">
        <aside className="dev-sidebar-left ceo-exec-sidebar" aria-label="Workspace">
          <div className="ceo-exec-snapshot dev-activity-card ceo-exec-snapshot--elevated">
            <span className="ceo-exec-snapshot-label">Portfolio risk</span>
            <div className="ceo-exec-snapshot-row">
              <span className={riskLevelClass(m.overallRiskLevel)}>{m.overallRiskLevel}</span>
              <span className="ceo-exec-snapshot-score">{m.overallRiskScore}</span>
            </div>
            <span className="ceo-exec-snapshot-meta">Index · last sync moments ago</span>
          </div>

          <nav className="ceo-exec-nav-shell" aria-label="Dashboard sections">
            {CEO_SIDEBAR_GROUPS.map((group) => (
              <div key={group.title} className="ceo-exec-sidebar-group">
                <p className="ceo-exec-nav-section-head">{group.title}</p>
                <div className="ceo-exec-nav" role="group" aria-label={group.title}>
                  {group.items.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      className={`ceo-exec-nav-item${activePanel === id ? ' is-active' : ''}`}
                      onClick={() => setActivePanel(id)}
                      aria-current={activePanel === id ? 'page' : undefined}
                    >
                      <Icon className="sidebar-icon" aria-hidden />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <hr className="sidebar-divider" />

          <div className="ceo-exec-sidebar-user">
            {user?.picture ? (
              <img src={user.picture} alt="" className="dev-user-avatar-img small" />
            ) : (
              <div className="dev-user-avatar small" />
            )}
            <div className="ceo-exec-sidebar-user-text">
              <span className="ceo-exec-sidebar-name">{user?.name || user?.email || 'Executive viewer'}</span>
              <span className="ceo-exec-sidebar-role">Executive workspace</span>
            </div>
          </div>
        </aside>

        <div className="dev-center-feed ceo-exec-feed ceo-exec-feed--panels">
          <header className="ceo-exec-page-intro" key={activePanel}>
            <p className="ceo-exec-kicker">{pageMeta.kicker}</p>
            <h1 className="feed-title ceo-exec-page-title">{pageMeta.title}</h1>
            <p className="ceo-exec-page-lede">{pageMeta.lede}</p>
          </header>

          <div className="ceo-panel-mount">
            <CeoWorkspacePanel panelId={activePanel} />
          </div>
        </div>
      </div>
    </div>
  );
}
