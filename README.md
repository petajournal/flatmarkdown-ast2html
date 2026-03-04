# flatmarkdown-ast2html

Renders a [flatmarkdown](https://github.com/sosuisen/flatmarkdown) JSON AST to HTML in TypeScript.

The `flatmarkdown` Rust crate exposes `markdown_to_ast()` which converts Markdown into a JSON AST. This library takes that AST and produces HTML — no Rust toolchain needed at render time.

## Install

```bash
bun add flatmarkdown-ast2html
# or
npm install flatmarkdown-ast2html
```

## Quick Start

```ts
import { renderToHtml } from 'flatmarkdown-ast2html';

// From a parsed AST object
const ast = {
  type: 'document',
  children: [
    {
      type: 'paragraph',
      children: [
        { type: 'text', value: 'Hello ' },
        { type: 'strong', children: [{ type: 'text', value: 'world' }] },
      ],
    },
  ],
};

const html = renderToHtml(ast);
// => '<p>Hello <strong>world</strong></p>\n'

// From a JSON string (e.g. directly from flatmarkdown CLI/WASM output)
const json = '{"type":"document","children":[{"type":"paragraph","children":[{"type":"text","value":"Hi"}]}]}';
const html2 = renderToHtml(json);
// => '<p>Hi</p>\n'
```

## API

### `renderToHtml(ast, options?)`

```ts
function renderToHtml(ast: AstNode | string, options?: RenderOptions): string;
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `ast` | `AstNode \| string` | Parsed AST object or JSON string |
| `options` | `RenderOptions` | Optional rendering configuration |

Returns an HTML string.

### `RenderOptions`

```ts
interface RenderOptions {
  wikilink?: WikiLinkOptions;
}
```

### `WikiLinkOptions`

Customize how `[[wikilinks]]` are rendered. This makes the output compatible with any routing library or framework.

```ts
interface WikiLinkOptions {
  tagName?: string;                // default: 'a'
  urlAttr?: string;                // default: 'href'
  urlPrefix?: string;              // default: ''
  attrs?: Record<string, string>;  // default: { 'data-wikilink': 'true' }
}
```

| Field | Default | Description |
|-------|---------|-------------|
| `tagName` | `'a'` | HTML/component tag name. Use `'Link'` for React Router, `'A'` for SolidJS, etc. |
| `urlAttr` | `'href'` | Attribute name for the URL. Use `'to'` for React Router, `'routerLink'` for Angular. |
| `urlPrefix` | `''` | String prepended to the wikilink URL value. |
| `attrs` | `{ 'data-wikilink': 'true' }` | Extra attributes on the tag. Replaces defaults when provided. |

#### Examples

**Default** — `[[page-name|label]]` renders as:

```html
<a href="page-name" data-wikilink="true">label</a>
```

**React Router**:

```ts
renderToHtml(ast, {
  wikilink: {
    tagName: 'Link',
    urlAttr: 'to',
    urlPrefix: '/wiki/',
    attrs: { className: 'wikilink', 'data-wikilink': 'true' },
  },
});
```

```html
<Link to="/wiki/page-name" className="wikilink" data-wikilink="true">label</Link>
```

**URL prefix only**:

```ts
renderToHtml(ast, {
  wikilink: { urlPrefix: '/docs/' },
});
```

```html
<a href="/docs/page-name" data-wikilink="true">label</a>
```

## HTML Output Reference

### Block Nodes

| AST `type` | HTML |
|------------|------|
| `document` | Children concatenated (no wrapper) |
| `paragraph` | `<p>…</p>` (omitted in tight lists) |
| `heading` | `<h1>`–`<h6>` based on `level` |
| `code_block` | `<pre><code class="language-{info}">…</code></pre>` |
| `block_quote` | `<blockquote>…</blockquote>` |
| `multiline_block_quote` | `<blockquote>…</blockquote>` |
| `list` (bullet) | `<ul>…</ul>` |
| `list` (ordered) | `<ol start="{start}">…</ol>` |
| `item` | `<li>…</li>` |
| `task_item` | `<li><input type="checkbox" checked="" disabled="" />…</li>` |
| `table` | `<table>…</table>` |
| `table_row` | `<tr>…</tr>` |
| `table_cell` | `<td>…</td>` or `<th>…</th>` (header row), with `align` attr |
| `thematic_break` | `<hr />` |
| `html_block` | Raw passthrough |
| `footnote_definition` | `<div class="footnote" id="fn-{name}">…</div>` |
| `description_list` | `<dl>…</dl>` |
| `description_term` | `<dt>…</dt>` |
| `description_details` | `<dd>…</dd>` |
| `alert` | `<div class="alert alert-{type}">…</div>` |
| `front_matter` | Skipped (not rendered) |

### Inline Nodes

| AST `type` | HTML |
|------------|------|
| `text` | HTML-escaped text |
| `softbreak` | `\n` |
| `linebreak` | `<br />` |
| `emph` | `<em>…</em>` |
| `strong` | `<strong>…</strong>` |
| `strikethrough` | `<del>…</del>` |
| `underline` | `<u>…</u>` |
| `highlight` | `<mark>…</mark>` |
| `superscript` | `<sup>…</sup>` |
| `subscript` | `<sub>…</sub>` |
| `spoilered_text` | `<span class="spoiler">…</span>` |
| `code` | `<code>…</code>` |
| `link` | `<a href="{url}" title="{title}">…</a>` |
| `image` | `<img src="{url}" alt="…" title="{title}" />` |
| `wikilink` | `<a href="{url}" data-wikilink="true">…</a>` (configurable) |
| `footnote_reference` | `<sup><a href="#fn-{name}">[{n}]</a></sup>` |
| `shortcode` | Emoji character directly |
| `math` (inline) | `<code class="math math-inline">…</code>` |
| `math` (display) | `<pre><code class="math math-display">…</code></pre>` |
| `html_inline` | Raw passthrough |
| `escaped` | Skipped |
| `escaped_tag` | HTML-escaped value |

## Supported AST Node Types

46 node types total, matching the `flatmarkdown` Rust crate output.

**Block (23):** `document`, `paragraph`, `heading`, `code_block`, `block_quote`, `multiline_block_quote`, `list`, `item`, `task_item`, `table`, `table_row`, `table_cell`, `thematic_break`, `html_block`, `footnote_definition`, `description_list`, `description_item`, `description_term`, `description_details`, `alert`, `front_matter`, `heex_block`, `subtext`

**Inline (23):** `text`, `softbreak`, `linebreak`, `emph`, `strong`, `strikethrough`, `underline`, `highlight`, `superscript`, `subscript`, `spoilered_text`, `code`, `link`, `image`, `footnote_reference`, `shortcode`, `math`, `html_inline`, `heex_inline`, `raw`, `escaped`, `escaped_tag`, `wikilink`

All node types are exported as individual TypeScript interfaces, plus the `AstNode` discriminated union.

## Build

```bash
bun install
bun run build   # outputs dist/ with ESM, CJS, and .d.ts
bun test        # runs vitest
```

## License

MIT
