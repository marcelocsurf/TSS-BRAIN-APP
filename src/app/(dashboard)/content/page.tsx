import Link from 'next/link';
import { getContentInventory } from '@/lib/actions/content';
import { ContentVideoManager } from '@/components/content/ContentVideoManager';
import {
  BarChart3,
  Scroll,
  Compass,
  Waves,
  GraduationCap,
  Dumbbell,
  Video,
  ClipboardList,
  ShieldCheck,
  Award,
  BookOpen,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Course Content admin — manage videos per lesson / drill / mission.
// Marcelo opens this, expands any item, pastes YouTube/Vimeo URLs with a
// label, and the videos surface immediately on the student portal.

type Bucket =
  | 'all'
  | 'pre_course'
  | 'white_belt'
  | 'yellow_belt'
  | 'visual_aids'
  | 'coach'
  | 'tools';

const BUCKETS: { key: Bucket; label: string }[] = [
  { key: 'pre_course',  label: 'Pre-Course' },
  { key: 'white_belt',  label: 'White Belt' },
  { key: 'yellow_belt', label: 'Yellow Belt' },
  { key: 'visual_aids', label: 'Visual Aids' },
  { key: 'coach',       label: 'Coach Curriculum' },
  { key: 'tools',       label: 'Drills + Missions' },
  { key: 'all',         label: 'All' },
];

export default async function ContentAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ bucket?: string }>;
}) {
  const { lessons, drillsMissions, steps } = await getContentInventory();
  const { bucket: bucketParam } = await searchParams;
  const bucket: Bucket =
    BUCKETS.find((b) => b.key === bucketParam)?.key ?? 'white_belt';
  const show = (k: Bucket) => bucket === 'all' || bucket === k;

  const preCourse = lessons.filter(
    (l: any) =>
      l.course_section === 'pre_course_fundamentals' ||
      l.course_section === 'pre_course_values'
  );
  const onboarding = lessons.filter((l: any) => l.course_section === 'wb_onboarding');
  const whiteBelt = lessons.filter((l: any) => l.course_section === 'white_belt');
  const ybOnboarding = lessons.filter((l: any) => l.course_section === 'yb_onboarding');
  const yellowBelt = lessons.filter((l: any) => l.course_section === 'yellow_belt');

  // ─── Coach courses — mirror the 10-tier grouping the coach sees in
  // his own /coach-portal/[token] Courses tab so Marcelo never has to
  // hunt for a lesson when attaching media. Filter conditions are the
  // SAME byte-for-byte as src/app/coach-portal/[token]/CoachPortalTabs.tsx
  // (CoursesTab) — if those change, mirror here.
  const coachLessons = lessons.filter((l: any) => l.course_section?.startsWith('coach_'));
  const coachByPrefix = (prefix: string) =>
    coachLessons.filter(
      (l: any) => l.id?.startsWith(prefix) && l.course_section === 'coach_wb',
    );
  const tierFoundations = coachByPrefix('COACH-FOUND-');
  const tierPreOnboard = coachLessons.filter(
    (l: any) => l.id === 'COACH-PC-VERIFY' || l.id === 'COACH-OB-DELIVERY',
  );
  const tierStps = coachLessons.filter(
    (l: any) =>
      l.course_section === 'coach_wb' &&
      /^COACH-STP-0(0[1-9]|1\d|2[0-5])$/.test(l.id),
  );
  const tierDiagnostics = coachByPrefix('COACH-DIAG-');
  const tierExitTest = coachLessons.filter((l: any) => l.id === 'COACH-WB-EXIT-TEST');
  const tierCareer = coachByPrefix('COACH-CAREER-');
  const tierMaster = coachLessons.filter(
    (l: any) => l.course_section === 'coach_wb_master',
  );
  const ybCoach = coachLessons.filter((l: any) => l.course_section === 'coach_yb');
  const ybTierFoundations = ybCoach.filter(
    (l: any) => l.id === 'COACH-YB-FOUND-01' || l.id === 'COACH-YB-ONB-01',
  );
  const ybTierStps = ybCoach.filter((l: any) => /^COACH-STP-0(2[7-9]|3[0-4])$/.test(l.id));
  const ybTierIntegration = ybCoach.filter(
    (l: any) => l.id === 'COACH-YB-MOD-7' || l.id === 'COACH-YB-MOD-8',
  );

  const drills = drillsMissions.filter((d: any) => d.type === 'drill');
  const missions = drillsMissions.filter((d: any) => d.type === 'mission');

  const totalVideos = [...lessons, ...drillsMissions].reduce(
    (sum: number, item: any) => sum + (item.videos?.length || 0),
    0
  );

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6 pb-12">
      <div>
        <h1
          className="text-2xl font-bold text-[var(--tss-navy)] leading-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Course Content
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage videos for every lesson, drill, and mission. Paste YouTube or
          Vimeo URLs — they appear instantly on the student portal.
        </p>
        <p
          className="text-[10px] uppercase tracking-wider text-gray-400 mt-2 inline-flex items-center gap-1.5"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          <BarChart3 size={11} strokeWidth={1.75} />
          {totalVideos} total videos across {lessons.length + drillsMissions.length} items
        </p>
      </div>

      {/* ─── Bucket picker — pick the course / area you're uploading to. ── */}
      <div className="flex flex-wrap gap-1.5 -mx-1 px-1 overflow-x-auto pb-1">
        {BUCKETS.map((b) => {
          const isActive = bucket === b.key;
          return (
            <Link
              key={b.key}
              href={`/content?bucket=${b.key}`}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                isActive
                  ? 'bg-[var(--tss-navy)] text-white border-[var(--tss-navy)]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
              style={{ fontFamily: 'DM Mono, monospace', letterSpacing: '0.04em' }}
            >
              {b.label.toUpperCase()}
            </Link>
          );
        })}
      </div>

      {/* ─── Pre-Course bucket ─── */}
      {show('pre_course') && (
        <>
      <SectionHeader title="Pre-Course Fundamentals" subtitle="Shared by every belt course · Module 0" />
      <Section
        title="Pre-Course"
        icon={Scroll}
        subtitle="8 items · safety, etiquette, ocean literacy, training mindset"
        items={preCourse}
        kind="lesson"
      />
        </>
      )}

      {/* ─── White Belt bucket ─── */}
      {show('white_belt') && (
        <>
      <SectionHeader title="Student · White Belt Masterclass" subtitle="course_section = wb_onboarding + white_belt" />
      <Section
        title="White Belt · Onboarding"
        icon={Compass}
        subtitle="6 items · Module 1"
        items={onboarding}
        kind="lesson"
      />
      <Section
        title="White Belt · Steps"
        icon={Waves}
        subtitle="25 STPs · Module 2 · Sequences 1–5"
        items={whiteBelt}
        kind="lesson"
      />
        </>
      )}

      {/* ─── Yellow Belt bucket ─── */}
      {show('yellow_belt') && (
        <>
      <SectionHeader title="Student · Yellow Belt Masterclass" subtitle="course_section = yb_onboarding + yellow_belt" />
      <Section
        title="Yellow Belt · Onboarding"
        icon={Compass}
        subtitle="Belt Value Shift · Module 4 · Proceso / Resiliencia"
        items={ybOnboarding}
        kind="lesson"
      />
      <Section
        title="Yellow Belt · Sequences + Complete Ride + Exit Test"
        icon={Waves}
        subtitle="8 STPs · Sequences #6 + #7 · Module 7 + 8"
        items={yellowBelt}
        kind="lesson"
      />
        </>
      )}

      {/* ─── Visual aids bucket ─── */}
      {show('visual_aids') && (
        <>
      <SectionHeader title="Visual aids · By STP" subtitle="Media attached directly to a step (appears in the coach Tools tab)" />
      <Section
        title="By STP — visual aids"
        icon={Waves}
        subtitle="Attach videos, images, diagrams, or documents to a specific step"
        items={steps}
        kind="step"
      />
        </>
      )}

      {/* ─── Coach Curriculum bucket ─── */}
      {show('coach') && (
        <>
      <SectionHeader title="Coach Curriculum" subtitle="Same order as the Courses tab in the coach portal" />
      <Section
        title="Coach · Tier 1 — Foundations"
        icon={GraduationCap}
        subtitle="The TSS method, architecture, and coaching framework"
        items={tierFoundations}
        kind="lesson"
      />

      <Section
        title="Coach · Tier 2 — Pre-Course + Onboarding"
        icon={Compass}
        subtitle="The gate before water + the 6 onboarding items"
        items={tierPreOnboard}
        kind="lesson"
      />

      <Section
        title="Coach · Tier 3 — The 25 Steps"
        icon={ClipboardList}
        subtitle="One lesson per WB STP (001–025). Tabs: What · Deliver · Errors · Validate"
        items={tierStps}
        kind="lesson"
      />

      <Section
        title="Coach · Tier 4 — Diagnostics + Evaluation"
        icon={ClipboardList}
        subtitle="Error taxonomy + Exit Test evaluation protocol"
        items={tierDiagnostics}
        kind="lesson"
      />

      <Section
        title="Coach · Exit Test — Component 1"
        icon={ShieldCheck}
        subtitle="50-question theoretical exam"
        items={tierExitTest}
        kind="lesson"
      />

      <Section
        title="Coach · Tier 5 — Career"
        icon={Award}
        subtitle="5-level certification ladder + code of conduct"
        items={tierCareer}
        kind="lesson"
      />

      <Section
        title="Coach · Master Manual — Canon Reference"
        icon={BookOpen}
        subtitle="15 reference lessons, single source of truth"
        items={tierMaster}
        kind="lesson"
      />

      <Section
        title="Coach · YB Tier 1 — Foundations + Belt Value Shift"
        icon={Compass}
        subtitle="L1 authorization scope for YB · mental shift from humility to resilience"
        items={ybTierFoundations}
        kind="lesson"
      />

      <Section
        title="Coach · YB Tier 2 — The 8 YB STPs"
        icon={ClipboardList}
        subtitle="Sequences #6 + #7 · How to Teach · Correct · Validate per STP"
        items={ybTierStps}
        kind="lesson"
      />

      <Section
        title="Coach · YB Tier 3 — Complete Ride + Exit Test"
        icon={ShieldCheck}
        subtitle="Coach the 11-stage integration · administer the YB Exit Test"
        items={ybTierIntegration}
        kind="lesson"
      />
        </>
      )}

      {/* ─── Tools (drills + missions) bucket ─── */}
      {show('tools') && (
        <>
      <SectionHeader title="Tools · Drills + Missions" subtitle="Cross-belt catalog of training drills and in-water missions" />
      <Section
        title="Drills"
        icon={Dumbbell}
        subtitle="Land / dry-land training drills"
        items={drills}
        kind="drill_mission"
      />

      <Section
        title="Missions"
        icon={Video}
        subtitle="In-water application missions"
        items={missions}
        kind="drill_mission"
      />
        </>
      )}
    </div>
  );
}

// ─── Section group ──

function Section({
  title,
  icon: Icon,
  subtitle,
  items,
  kind,
}: {
  title: string;
  icon: React.ComponentType<any>;
  subtitle: string;
  items: any[];
  kind: 'lesson' | 'drill_mission' | 'step';
}) {
  if (items.length === 0) return null;
  const withVideos = items.filter((i: any) => i.videos.length > 0).length;
  const noun = kind === 'step' ? 'have media' : 'have videos';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[var(--tss-navy)] inline-flex items-center gap-1.5">
              <Icon size={14} strokeWidth={1.75} className="text-[var(--tss-cyan,#5AC3E7)]" />
              {title}
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>
          </div>
          <span className="text-[10px] font-mono text-gray-400">
            {withVideos}/{items.length} {noun}
          </span>
        </div>
      </div>
      <div className="divide-y divide-gray-50">
        {items.map((item: any) => (
          <ItemRow key={item.id} item={item} kind={kind} />
        ))}
      </div>
    </div>
  );
}

// ─── Single item with collapsible video manager ──

function ItemRow({ item, kind }: { item: any; kind: 'lesson' | 'drill_mission' | 'step' }) {
  const videoCount = item.videos.length;
  const noun = kind === 'step' ? 'media' : 'video';

  return (
    <details className="group">
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-mono text-gray-400">
            {item.id}
            {kind === 'drill_mission' && item.step_id ? ` · ${item.step_id}` : ''}
            {kind === 'drill_mission' && item.block_name ? ` · ${item.block_name}` : ''}
            {kind === 'step' && item.course_section
              ? ` · ${item.course_section.replace('_', ' ')}`
              : ''}
          </p>
          <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full ${
              videoCount > 0
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {videoCount} {videoCount === 1 ? noun : `${noun}s`}
          </span>
          <span className="text-xs text-gray-400 transition group-open:rotate-180">▾</span>
        </div>
      </summary>
      <div className="px-4 pb-4 bg-gray-50/40">
        <ContentVideoManager
          videos={item.videos}
          lessonId={kind === 'lesson' ? item.id : undefined}
          drillMissionId={kind === 'drill_mission' ? item.id : undefined}
          stepId={kind === 'step' ? item.id : undefined}
        />
      </div>
    </details>
  );
}

// ─── Group header — visually separates "WB Masterclass", "YB Masterclass",
//     "Coach Curriculum", etc. so the admin scans the page like a TOC. ──
function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="pt-4">
      <p
        className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--tss-cyan,#5AC3E7)]"
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        {title}
      </p>
      {subtitle && (
        <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>
      )}
      <div className="h-px bg-gray-100 mt-2" />
    </div>
  );
}
