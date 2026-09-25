'use client';

/**
 * Lightweight markdown renderer (no external deps).
 * Supports: H1-H4, **bold**, *italic*, `code`, ==highlight==, lists, blockquotes,
 * tables, hr, and titled CALLOUT boxes for pedagogy:
 *   > [!CRITICAL]  > [!DOCTRINE]  > [!TEACH]  > [!CORRECT]  > [!VALIDATE]
 *   > [!CUE]  > [!MANTRA]  > [!KEYWORDS]
 * A plain `>` blockquote (no [!TYPE]) renders in the original cyan style.
 */

// Callout palette — label + colors per type. Brand-aligned, no emojis.
const CALLOUTS: Record<
  string,
  { label: string; border: string; bg: string; text: string; accent: string }
> = {
  CRITICAL: { label: 'Critical', border: '#FF6B6B', bg: '#F7F9FA', text: '#10263B', accent: '#C0392B' },
  DOCTRINE: { label: 'Doctrinal Note', border: '#DCD7C6', bg: '#F7F9FA', text: '#10263B', accent: '#55666E' },
  TEACH: { label: 'How you teach it', border: '#00A8CC', bg: '#F7F9FA', text: '#10263B', accent: '#00A8CC' },
  CORRECT: { label: 'How you correct it', border: '#DCD7C6', bg: '#F7F9FA', text: '#10263B', accent: '#55666E' },
  VALIDATE: { label: 'How you validate it', border: '#39D98A', bg: '#F7F9FA', text: '#10263B', accent: '#1B5E3A' },
  CUE: { label: 'Coach cue', border: '#00D2FF', bg: '#F7F9FA', text: '#10263B', accent: '#00A8CC' },
  MANTRA: { label: 'Mantra', border: '#10263B', bg: '#F7F9FA', text: '#10263B', accent: '#10263B' },
  KEYWORDS: { label: '5 Key Words', border: '#00D2FF', bg: '#F7F9FA', text: '#10263B', accent: '#00A8CC' },
};

interface MarkdownContentProps {
  markdown: string;
  /** Pliega cada '## tema' cuando hay 3 o más (lecciones largas). */
  collapsible?: boolean;
}

export function MarkdownContent({ markdown, collapsible = false }: MarkdownContentProps) {
  if (!markdown) return null;

  const blocks = parseMarkdown(markdown);

  // Temas plegables (Marcelo 2026-09-17): en lecciones largas y de corrido
  // (3 Circles, One Wave…) cada "## Tema" se muestra como título y se abre
  // al tocarlo. El primero viene abierto; lo de antes del primer tema queda
  // siempre visible. Con menos de 3 temas no vale la pena plegar.
  if (collapsible) {
    const groups: { heading: Block | null; blocks: Block[] }[] = [{ heading: null, blocks: [] }];
    for (const b of blocks) {
      if (b.type === 'h2') groups.push({ heading: b, blocks: [] });
      else groups[groups.length - 1].blocks.push(b);
    }
    const topics = groups.filter((g) => g.heading);
    if (topics.length >= 3) {
      let n = 0;
      return (
        <div className="markdown-content text-[15px] leading-[1.8] text-[#10263B] max-w-[68ch]">
          {groups[0].blocks.map((block, idx) => renderBlock(block, idx))}
          {topics.map((g, gi) => (
            <details key={gi} open={gi === 0} className="group mt-3 rounded-lg border border-[#DCD7C6] bg-[#F7F9FA]">
              <summary
                className="list-none cursor-pointer flex items-center justify-between gap-3 px-4 py-3 text-[15px] font-black uppercase text-[var(--tss-navy)] leading-snug [&::-webkit-details-marker]:hidden"
                style={{ fontFamily: 'var(--font-archivo), sans-serif', fontStretch: '125%' }}
              >
                <span>{renderInline((g.heading as { content: string }).content)}</span>
                <span aria-hidden className="shrink-0 text-[#55666E] transition-transform group-open:rotate-180">⌄</span>
              </summary>
              <div className="px-4 pb-4 -mt-1">
                {g.blocks.map((block) => renderBlock(block, n++))}
              </div>
            </details>
          ))}
        </div>
      );
    }
  }

  return (
    <div className="markdown-content text-[15px] leading-[1.8] text-[#10263B] max-w-[68ch]">
      {blocks.map((block, idx) => renderBlock(block, idx))}
    </div>
  );
}

type Block =
  | { type: 'h1'; content: string }
  | { type: 'h2'; content: string }
  | { type: 'h3'; content: string }
  | { type: 'h4'; content: string }
  | { type: 'p'; content: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'blockquote'; content: string }
  | { type: 'callout'; variant: string; content: string }
  | { type: 'hr' }
  | { type: 'image'; src: string; alt: string }
  | { type: 'code'; content: string }
  | { type: 'table'; rows: string[][] };

function parseMarkdown(md: string): Block[] {
  const lines = md.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // HR
    if (line.trim() === '---' || line.trim() === '***') {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // Code block
    if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'code', content: codeLines.join('\n') });
      i++; // skip closing ```
      continue;
    }

    // Imagen sola en su línea: ![alt](src). Las láminas del método viven en
    // /uploads/fotos (Marcelo 2026-09-25: la lámina de las señales en Safety Rules).
    const img = line.trim().match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (img) {
      blocks.push({ type: 'image', alt: img[1], src: img[2] });
      i++;
      continue;
    }

    // Headers
    if (line.startsWith('#### ')) {
      blocks.push({ type: 'h4', content: line.slice(5).trim() });
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', content: line.slice(4).trim() });
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', content: line.slice(3).trim() });
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', content: line.slice(2).trim() });
      i++;
      continue;
    }

    // Blockquote / callout
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      let body = quoteLines.join('\n').trim();
      // Callout: first token is [!TYPE]
      const m = body.match(/^\[!([A-Za-z]+)\]\s*/);
      if (m) {
        const variant = m[1].toUpperCase();
        body = body.slice(m[0].length).trim();
        blocks.push({ type: 'callout', variant, content: body });
      } else {
        blocks.push({ type: 'blockquote', content: quoteLines.join(' ') });
      }
      continue;
    }

    // Tables (basic detection)
    if (line.includes('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
      const headerRow = line.split('|').map((c) => c.trim()).filter(Boolean);
      i += 2; // skip separator row
      const rows: string[][] = [headerRow];
      while (i < lines.length && lines[i].includes('|')) {
        const row = lines[i].split('|').map((c) => c.trim()).filter(Boolean);
        if (row.length === 0) break;
        rows.push(row);
        i++;
      }
      blocks.push({ type: 'table', rows });
      continue;
    }

    // Unordered list
    if (line.match(/^[-*]\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*]\s/)) {
        items.push(lines[i].replace(/^[-*]\s/, ''));
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\.\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    // Default: paragraph (collect consecutive non-empty lines)
    const paraLines: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push({ type: 'p', content: paraLines.join(' ') });
  }

  return blocks;
}

function isBlockStart(line: string): boolean {
  return (
    line.startsWith('#') ||
    line.startsWith('>') ||
    line.startsWith('```') ||
    line.startsWith('- ') ||
    line.startsWith('* ') ||
    !!line.match(/^\d+\.\s/) ||
    line.trim() === '---' ||
    line.includes('|')
  );
}

// Reglas inline. El ORDEN importa solo cuando dos patrones empiezan en la
// MISMA posición: `**x**` también hace match como cursiva, así que la negrita
// tiene que ir primero.
// El contenido de negrita/cursiva/resaltado se vuelve a procesar: se anida
// seguido (`**Go when *your* window opens**`) y sin esto el tramo interno
// salía crudo. La recursión termina siempre: cada vuelta consume delimitadores,
// así que el texto es estrictamente más corto. `code` NO recursa a propósito —
// dentro de un código el asterisco es un asterisco.
const INLINE_RULES: { re: RegExp; node: (content: string, key: number) => React.ReactNode }[] = [
  { re: /\*\*(.+?)\*\*/, node: (c, k) => <strong key={k} className="font-bold text-[var(--tss-navy)]">{renderInline(c)}</strong> },
  { re: /\*(.+?)\*/, node: (c, k) => <em key={k} className="italic">{renderInline(c)}</em> },
  { re: /==(.+?)==/, node: (c, k) => <mark key={k} className="bg-[#B3F1FF] text-[var(--tss-navy)] px-1 rounded-[3px] font-medium">{renderInline(c)}</mark> },
  { re: /`([^`]+?)`/, node: (c, k) => <code key={k} className="bg-[#F7F9FA] text-[var(--tss-navy)] px-1 py-0.5 rounded text-[12px]">{c}</code> },
];

function renderInline(text: string): React.ReactNode {
  // Se busca el match que empieza ANTES en la línea, sea del tipo que sea, y
  // se sigue procesando lo que queda. La versión anterior probaba negrita
  // primero sobre TODA la línea: si en la misma línea había cursiva y después
  // negrita, el tramo previo a la negrita se emitía crudo y el alumno veía los
  // asteriscos. Afectaba a 45 de las 196 lecciones activas.
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    let best: { index: number; length: number; content: string; make: (c: string, k: number) => React.ReactNode } | null = null;
    for (const rule of INLINE_RULES) {
      const m = remaining.match(rule.re);
      if (!m || m.index === undefined) continue;
      if (!best || m.index < best.index) {
        best = { index: m.index, length: m[0].length, content: m[1], make: rule.node };
      }
    }
    if (!best) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }
    if (best.index > 0) parts.push(<span key={key++}>{remaining.slice(0, best.index)}</span>);
    parts.push(best.make(best.content, key++));
    remaining = remaining.slice(best.index + best.length);
  }

  return parts;
}

function renderBlock(block: Block, idx: number): React.ReactNode {
  switch (block.type) {
    case 'h1':
      return (
        <h1
          key={idx}
          className="text-[22px] font-black uppercase mt-8 mb-3 text-[var(--tss-navy)] leading-tight tracking-tight"
          style={{ fontFamily: 'var(--font-archivo), sans-serif', fontStretch: '125%' }}
        >
          {renderInline(block.content)}
        </h1>
      );
    case 'h2':
      return (
        <h2
          key={idx}
          className="text-[18px] font-black uppercase mt-7 mb-2.5 text-[var(--tss-navy)] leading-snug border-b border-[#DCD7C6] pb-1.5"
          style={{ fontFamily: 'var(--font-archivo), sans-serif', fontStretch: '125%' }}
        >
          {renderInline(block.content)}
        </h2>
      );
    case 'h3':
      return (
        <h3
          key={idx}
          className="text-[15px] font-bold mt-5 mb-2 text-[var(--tss-navy)]"
        >
          {renderInline(block.content)}
        </h3>
      );
    case 'h4':
      return (
        <h4
          key={idx}
          className="text-[13px] font-semibold mt-4 mb-1.5 text-[#55666E] uppercase tracking-wide"
          style={{ fontFamily: 'var(--font-plex)' }}
        >
          {renderInline(block.content)}
        </h4>
      );
    case 'p':
      return (
        <p key={idx} className="my-3 leading-[1.8] text-[#10263B]">
          {renderInline(block.content)}
        </p>
      );
    case 'ul':
      return (
        <ul key={idx} className="list-disc pl-5 my-3 space-y-1.5 text-[#10263B]">
          {block.items.map((it, j) => (
            <li key={j} className="leading-[1.7]">{renderInline(it)}</li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol key={idx} className="list-decimal pl-5 my-3 space-y-1.5 text-[#10263B]">
          {block.items.map((it, j) => (
            <li key={j} className="leading-[1.7]">{renderInline(it)}</li>
          ))}
        </ol>
      );
    case 'blockquote':
      return (
        <blockquote
          key={idx}
          className="border-l-4 border-[var(--tss-cyan,#00D2FF)] bg-[var(--tss-cyan,#00D2FF)]/5 pl-4 pr-3 py-2 my-4 italic text-[#55666E] rounded-r-[5px]"
        >
          {renderInline(block.content)}
        </blockquote>
      );
    case 'callout': {
      const c = CALLOUTS[block.variant] ?? CALLOUTS.DOCTRINE;
      const isKeywords = block.variant === 'KEYWORDS';
      return (
        <div
          key={idx}
          className="my-4 rounded-lg border px-4 py-3"
          style={{ borderColor: c.border, background: c.bg }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-[0.12em] mb-1.5"
            style={{ color: c.accent, fontFamily: 'var(--font-plex)' }}
          >
            {c.label}
          </p>
          {isKeywords ? (
            <div className="flex flex-wrap gap-1.5">
              {block.content
                .split(/[·,\n]/)
                .map((w) => w.trim())
                .filter(Boolean)
                .map((w, j) => (
                  <span
                    key={j}
                    className="text-[11px] font-semibold rounded-[5px] px-2.5 py-0.5"
                    style={{ background: '#F7F9FA', border: `1px solid ${c.border}`, color: c.text }}
                  >
                    {w}
                  </span>
                ))}
            </div>
          ) : (
            <div className="text-[14px] leading-[1.7]" style={{ color: c.text }}>
              {block.content.split('\n').map((ln, j) =>
                ln.trim() ? (
                  <p key={j} className={j > 0 ? 'mt-1.5' : ''}>
                    {renderInline(ln)}
                  </p>
                ) : null
              )}
            </div>
          )}
        </div>
      );
    }
    case 'image':
      return (
        <figure key={idx} className="my-4 mx-0">
          <a href={block.src} target="_blank" rel="noreferrer" className="block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={block.src} alt={block.alt} className="w-full h-auto rounded-lg border border-[#DCD7C6]" loading="lazy" />
          </a>
          {block.alt && <figcaption className="text-[12px] text-[#55666E] mt-1.5">{block.alt} · tap to open</figcaption>}
        </figure>
      );
    case 'hr':
      return <hr key={idx} className="my-4 border-[#DCD7C6]" />;
    case 'code':
      return (
        <pre
          key={idx}
          className="bg-[#F7F9FA] border border-[#DCD7C6] rounded-lg p-3 my-3 text-[12px] overflow-x-auto"
        >
          <code>{block.content}</code>
        </pre>
      );
    case 'table':
      return (
        <div key={idx} className="my-3 overflow-x-auto">
          <table className="min-w-full text-[12px] border border-[#DCD7C6]">
            <thead className="bg-[#F7F9FA]">
              <tr>
                {block.rows[0].map((cell, j) => (
                  <th key={j} className="px-3 py-2 text-left font-bold border-b border-[#DCD7C6]">
                    {renderInline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.slice(1).map((row, j) => (
                <tr key={j} className="border-b border-[#DCD7C6]">
                  {row.map((cell, k) => (
                    <td key={k} className="px-3 py-2">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}
