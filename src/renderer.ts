import type { AstNode, RenderOptions } from './types';

interface RenderContext {
  options: RenderOptions;
  inHeaderRow: boolean;
  tableAlignments: string[];
  cellIndex: number;
  tightList: boolean;
}

function defaultContext(options: RenderOptions = {}): RenderContext {
  return {
    options,
    inHeaderRow: false,
    tableAlignments: [],
    cellIndex: 0,
    tightList: false,
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderChildren(node: { children?: AstNode[] }, ctx: RenderContext): string {
  if (!node.children) return '';
  return node.children.map((child) => renderNode(child, ctx)).join('');
}

function extractText(node: AstNode): string {
  if (node.type === 'text') return node.value;
  if ('children' in node && node.children) {
    return node.children.map(extractText).join('');
  }
  return '';
}

function renderNode(node: AstNode, ctx: RenderContext): string {
  switch (node.type) {
    // ── Block Nodes ──

    case 'document':
      return renderChildren(node, ctx);

    case 'paragraph': {
      const inner = renderChildren(node, ctx);
      if (ctx.tightList) return `${inner}\n`;
      return `<p>${inner}</p>\n`;
    }

    case 'heading': {
      const tag = `h${node.level}`;
      return `<${tag}>${renderChildren(node, ctx)}</${tag}>\n`;
    }

    case 'code_block': {
      const info = node.info;
      const cls = info ? ` class="language-${escapeHtml(info)}"` : '';
      return `<pre><code${cls}>${escapeHtml(node.literal)}</code></pre>\n`;
    }

    case 'block_quote':
      return `<blockquote>\n${renderChildren(node, ctx)}</blockquote>\n`;

    case 'multiline_block_quote':
      return `<blockquote>\n${renderChildren(node, ctx)}</blockquote>\n`;

    case 'list': {
      if (node.list_type === 'ordered') {
        const startAttr = node.start != null && node.start !== 1 ? ` start="${node.start}"` : '';
        return `<ol${startAttr}>\n${renderChildren(node, ctx)}</ol>\n`;
      }
      return `<ul>\n${renderChildren(node, ctx)}</ul>\n`;
    }

    case 'item': {
      const childCtx: RenderContext = { ...ctx, tightList: node.tight };
      return `<li>${renderChildren(node, childCtx)}</li>\n`;
    }

    case 'task_item': {
      const checked = node.symbol != null ? ' checked=""' : '';
      const childCtx: RenderContext = { ...ctx, tightList: true };
      return `<li><input type="checkbox"${checked} disabled="" />${renderChildren(node, childCtx)}</li>\n`;
    }

    case 'table': {
      const childCtx: RenderContext = { ...ctx, tableAlignments: node.alignments };
      return `<table>\n${renderChildren(node, childCtx)}</table>\n`;
    }

    case 'table_row': {
      const cells = (node.children || []).map((cell, i) => {
        const cellCtx: RenderContext = {
          ...ctx,
          inHeaderRow: node.header,
          cellIndex: i,
        };
        return renderNode(cell, cellCtx);
      });
      return `<tr>\n${cells.join('')}</tr>\n`;
    }

    case 'table_cell': {
      const tag = ctx.inHeaderRow ? 'th' : 'td';
      const alignment = ctx.tableAlignments[ctx.cellIndex];
      const alignAttr =
        alignment && alignment !== 'none' ? ` align="${alignment}"` : '';
      return `<${tag}${alignAttr}>${renderChildren(node, ctx)}</${tag}>\n`;
    }

    case 'thematic_break':
      return '<hr />\n';

    case 'html_block':
      return node.literal;

    case 'footnote_definition':
      return `<div class="footnote" id="fn-${escapeHtml(node.name)}">\n${renderChildren(node, ctx)}</div>\n`;

    case 'description_list':
      return `<dl>\n${renderChildren(node, ctx)}</dl>\n`;

    case 'description_item':
      return renderChildren(node, ctx);

    case 'description_term':
      return `<dt>${renderChildren(node, ctx)}</dt>\n`;

    case 'description_details':
      return `<dd>${renderChildren(node, ctx)}</dd>\n`;

    case 'alert':
      return `<div class="alert alert-${escapeHtml(node.alert_type)}">\n${renderChildren(node, ctx)}</div>\n`;

    case 'front_matter':
      return '';

    case 'heex_block':
      return renderChildren(node, ctx);

    case 'subtext':
      return renderChildren(node, ctx);

    // ── Inline Nodes ──

    case 'text':
      return escapeHtml(node.value);

    case 'softbreak':
      return '\n';

    case 'linebreak':
      return '<br />\n';

    case 'emph':
      return `<em>${renderChildren(node, ctx)}</em>`;

    case 'strong':
      return `<strong>${renderChildren(node, ctx)}</strong>`;

    case 'strikethrough':
      return `<del>${renderChildren(node, ctx)}</del>`;

    case 'underline':
      return `<u>${renderChildren(node, ctx)}</u>`;

    case 'highlight':
      return `<mark>${renderChildren(node, ctx)}</mark>`;

    case 'superscript':
      return `<sup>${renderChildren(node, ctx)}</sup>`;

    case 'subscript':
      return `<sub>${renderChildren(node, ctx)}</sub>`;

    case 'spoilered_text':
      return `<span class="spoiler">${renderChildren(node, ctx)}</span>`;

    case 'code':
      return `<code>${escapeHtml(node.literal)}</code>`;

    case 'link': {
      const titleAttr = node.title ? ` title="${escapeHtml(node.title)}"` : '';
      return `<a href="${escapeHtml(node.url)}"${titleAttr}>${renderChildren(node, ctx)}</a>`;
    }

    case 'image': {
      const alt = extractText(node);
      const titleAttr = node.title ? ` title="${escapeHtml(node.title)}"` : '';
      return `<img src="${escapeHtml(node.url)}" alt="${escapeHtml(alt)}"${titleAttr} />`;
    }

    case 'wikilink': {
      const opts = ctx.options.wikilink;
      const tagName = opts?.tagName ?? 'a';
      const urlAttr = opts?.urlAttr ?? 'href';
      const urlPrefix = opts?.urlPrefix ?? '';
      const extraAttrs = opts?.attrs ?? { 'data-wikilink': 'true' };

      const url = `${urlPrefix}${node.url}`;
      let attrStr = `${urlAttr}="${escapeHtml(url)}"`;
      for (const [key, val] of Object.entries(extraAttrs)) {
        attrStr += ` ${key}="${escapeHtml(val)}"`;
      }
      return `<${tagName} ${attrStr}>${renderChildren(node, ctx)}</${tagName}>`;
    }

    case 'footnote_reference':
      return `<sup><a href="#fn-${escapeHtml(node.name)}">[${node.ix + 1}]</a></sup>`;

    case 'shortcode':
      return node.emoji;

    case 'math': {
      if (node.display_math) {
        return `<pre><code class="math math-display">${escapeHtml(node.literal)}</code></pre>\n`;
      }
      return `<code class="math math-inline">${escapeHtml(node.literal)}</code>`;
    }

    case 'html_inline':
      return node.value;

    case 'heex_inline':
      return node.value;

    case 'raw':
      return node.value;

    case 'escaped':
      return '';

    case 'escaped_tag':
      return escapeHtml(node.value);

    default: {
      const _exhaustive: never = node;
      return '';
    }
  }
}

/**
 * Render a flatmarkdown AST to HTML.
 *
 * @param ast - Either a parsed AstNode object or a JSON string of the AST
 * @param options - Rendering options (e.g. wikilink customization)
 * @returns HTML string
 */
export function renderToHtml(ast: AstNode | string, options?: RenderOptions): string {
  const node: AstNode = typeof ast === 'string' ? JSON.parse(ast) : ast;
  return renderNode(node, defaultContext(options));
}
