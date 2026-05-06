'use client';

/**
 * Lightweight markdown renderer (no external deps).
 * Supports: H1-H4, **bold**, *italic*, `code`, lists, blockquotes, tables, hr.
 * Good enough for the canon content. Replace with `react-markdown` if needed.
 */

interface MarkdownContentProps {
  markdown: string;
}

export function MarkdownContent({ markdown }: MarkdownContentProps) {
  if (!markdown) return null;

  const blocks = parseMarkdown(markdown);

  return (
    <div className="markdown-content text-[14px] leading-relaxed text-gray-800">
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
  | { type: 'hr' }
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

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ type: 'blockquote', content: quoteLines.join(' ') });
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

function renderInline(text: string): React.ReactNode {
  // Process bold, italic, code, links inline
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold **text**
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)/);
    if (boldMatch) {
      const [, before, content, after] = boldMatch;
      if (before) parts.push(<span key={key++}>{before}</span>);
      parts.push(<strong key={key++} className="font-bold">{content}</strong>);
      remaining = after;
      continue;
    }
    // Italic *text*
    const italicMatch = remaining.match(/^(.*?)\*(.+?)\*(.*)/);
    if (italicMatch) {
      const [, before, content, after] = italicMatch;
      if (before) parts.push(<span key={key++}>{before}</span>);
      parts.push(<em key={key++} className="italic">{content}</em>);
      remaining = after;
      continue;
    }
    // Code `text`
    const codeMatch = remaining.match(/^(.*?)`([^`]+?)`(.*)/);
    if (codeMatch) {
      const [, before, content, after] = codeMatch;
      if (before) parts.push(<span key={key++}>{before}</span>);
      parts.push(
        <code key={key++} className="bg-gray-100 text-[var(--tss-navy)] px-1 py-0.5 rounded text-[12px]">
          {content}
        </code>
      );
      remaining = after;
      continue;
    }
    // Plain text
    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }

  return parts;
}

function renderBlock(block: Block, idx: number): React.ReactNode {
  switch (block.type) {
    case 'h1':
      return (
        <h1 key={idx} className="text-2xl font-bold mt-6 mb-3 text-[var(--tss-navy)]">
          {renderInline(block.content)}
        </h1>
      );
    case 'h2':
      return (
        <h2 key={idx} className="text-xl font-bold mt-5 mb-2 text-[var(--tss-navy)]">
          {renderInline(block.content)}
        </h2>
      );
    case 'h3':
      return (
        <h3 key={idx} className="text-lg font-bold mt-4 mb-2 text-gray-800">
          {renderInline(block.content)}
        </h3>
      );
    case 'h4':
      return (
        <h4 key={idx} className="text-base font-bold mt-3 mb-1.5 text-gray-700">
          {renderInline(block.content)}
        </h4>
      );
    case 'p':
      return (
        <p key={idx} className="my-2 leading-relaxed">
          {renderInline(block.content)}
        </p>
      );
    case 'ul':
      return (
        <ul key={idx} className="list-disc pl-5 my-2 space-y-1">
          {block.items.map((it, j) => (
            <li key={j}>{renderInline(it)}</li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol key={idx} className="list-decimal pl-5 my-2 space-y-1">
          {block.items.map((it, j) => (
            <li key={j}>{renderInline(it)}</li>
          ))}
        </ol>
      );
    case 'blockquote':
      return (
        <blockquote
          key={idx}
          className="border-l-4 border-[var(--tss-gold,#d4a017)] pl-4 my-3 italic text-gray-700"
        >
          {renderInline(block.content)}
        </blockquote>
      );
    case 'hr':
      return <hr key={idx} className="my-4 border-gray-200" />;
    case 'code':
      return (
        <pre
          key={idx}
          className="bg-gray-50 border border-gray-200 rounded-lg p-3 my-3 text-[12px] overflow-x-auto"
        >
          <code>{block.content}</code>
        </pre>
      );
    case 'table':
      return (
        <div key={idx} className="my-3 overflow-x-auto">
          <table className="min-w-full text-[12px] border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {block.rows[0].map((cell, j) => (
                  <th key={j} className="px-3 py-2 text-left font-bold border-b border-gray-200">
                    {renderInline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.slice(1).map((row, j) => (
                <tr key={j} className="border-b border-gray-100">
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
