import { getContentInventory } from '@/lib/actions/content';
import { ContentVideoManager } from '@/components/content/ContentVideoManager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Course Content admin — manage videos per lesson / drill / mission.
// Marcelo opens this, expands any item, pastes YouTube/Vimeo URLs with a
// label, and the videos surface immediately on the student portal.

export default async function ContentAdminPage() {
  const { lessons, drillsMissions } = await getContentInventory();

  const preCourse = lessons.filter(
    (l: any) =>
      l.course_section === 'pre_course_fundamentals' ||
      l.course_section === 'pre_course_values'
  );
  const onboarding = lessons.filter((l: any) => l.course_section === 'wb_onboarding');
  const whiteBelt = lessons.filter((l: any) => l.course_section === 'white_belt');
  const coachLessons = lessons.filter((l: any) => l.course_section?.startsWith('coach_'));

  const drills = drillsMissions.filter((d: any) => d.type === 'drill');
  const missions = drillsMissions.filter((d: any) => d.type === 'mission');

  const totalVideos = [...lessons, ...drillsMissions].reduce(
    (sum: number, item: any) => sum + (item.videos?.length || 0),
    0
  );

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-bold text-[var(--tss-navy)]">Course Content</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage videos for every lesson, drill, and mission. Paste YouTube or
          Vimeo URLs — they appear instantly on the student portal.
        </p>
        <p className="text-[11px] text-gray-400 mt-2">
          📊 {totalVideos} total videos across {lessons.length + drillsMissions.length} items
        </p>
      </div>

      <Section
        title="Pre-Course"
        emoji="📜"
        subtitle="8 items · Module 0"
        items={preCourse}
        kind="lesson"
      />

      <Section
        title="Onboarding"
        emoji="🧭"
        subtitle="6 items · Module 1"
        items={onboarding}
        kind="lesson"
      />

      <Section
        title="White Belt Steps"
        emoji="🏄"
        subtitle="25 STPs · Module 2"
        items={whiteBelt}
        kind="lesson"
      />

      <Section
        title="Coach Courses"
        emoji="🎓"
        subtitle="Coach curriculum (delivery + master canon)"
        items={coachLessons}
        kind="lesson"
      />

      <Section
        title="Drills"
        emoji="🏋️"
        subtitle="Land / dry-land training drills"
        items={drills}
        kind="drill_mission"
      />

      <Section
        title="Missions"
        emoji="🌊"
        subtitle="In-water application missions"
        items={missions}
        kind="drill_mission"
      />
    </div>
  );
}

// ─── Section group ──

function Section({
  title,
  emoji,
  subtitle,
  items,
  kind,
}: {
  title: string;
  emoji: string;
  subtitle: string;
  items: any[];
  kind: 'lesson' | 'drill_mission';
}) {
  if (items.length === 0) return null;
  const withVideos = items.filter((i: any) => i.videos.length > 0).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[var(--tss-navy)]">
              {emoji} {title}
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>
          </div>
          <span className="text-[10px] font-mono text-gray-400">
            {withVideos}/{items.length} have videos
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

function ItemRow({ item, kind }: { item: any; kind: 'lesson' | 'drill_mission' }) {
  const videoCount = item.videos.length;

  return (
    <details className="group">
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-mono text-gray-400">
            {item.id}
            {kind === 'drill_mission' && item.step_id ? ` · ${item.step_id}` : ''}
            {kind === 'drill_mission' && item.block_name ? ` · ${item.block_name}` : ''}
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
            {videoCount} {videoCount === 1 ? 'video' : 'videos'}
          </span>
          <span className="text-xs text-gray-400 transition group-open:rotate-180">▾</span>
        </div>
      </summary>
      <div className="px-4 pb-4 bg-gray-50/40">
        <ContentVideoManager
          videos={item.videos}
          lessonId={kind === 'lesson' ? item.id : undefined}
          drillMissionId={kind === 'drill_mission' ? item.id : undefined}
        />
      </div>
    </details>
  );
}
