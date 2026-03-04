import { describe, it, expect } from 'vitest';
import { renderToHtml } from '../src/index';
import type { AstNode } from '../src/index';

// Helper: wrap inline nodes in a document > paragraph
function doc(...children: AstNode[]): AstNode {
  return { type: 'document', children };
}

function para(...children: AstNode[]): AstNode {
  return { type: 'paragraph', children };
}

function text(value: string): AstNode {
  return { type: 'text', value };
}

// ── Basic Text ──

describe('basic text', () => {
  it('renders a simple paragraph', () => {
    const ast = doc(para(text('Hello world')));
    expect(renderToHtml(ast)).toBe('<p>Hello world</p>\n');
  });

  it('escapes HTML in text', () => {
    const ast = doc(para(text('<script>alert("xss")</script>')));
    expect(renderToHtml(ast)).toBe(
      '<p>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</p>\n',
    );
  });

  it('accepts a JSON string', () => {
    const ast = doc(para(text('hello')));
    expect(renderToHtml(JSON.stringify(ast))).toBe('<p>hello</p>\n');
  });
});

// ── Headings ──

describe('headings', () => {
  it('renders h1-h6', () => {
    for (let level = 1; level <= 6; level++) {
      const ast = doc({
        type: 'heading',
        level,
        setext: false,
        children: [text(`Heading ${level}`)],
      });
      expect(renderToHtml(ast)).toBe(`<h${level}>Heading ${level}</h${level}>\n`);
    }
  });
});

// ── Inline Formatting ──

describe('inline formatting', () => {
  it('renders emphasis', () => {
    const ast = doc(para({ type: 'emph', children: [text('italic')] }));
    expect(renderToHtml(ast)).toBe('<p><em>italic</em></p>\n');
  });

  it('renders strong', () => {
    const ast = doc(para({ type: 'strong', children: [text('bold')] }));
    expect(renderToHtml(ast)).toBe('<p><strong>bold</strong></p>\n');
  });

  it('renders strikethrough', () => {
    const ast = doc(para({ type: 'strikethrough', children: [text('struck')] }));
    expect(renderToHtml(ast)).toBe('<p><del>struck</del></p>\n');
  });

  it('renders underline', () => {
    const ast = doc(para({ type: 'underline', children: [text('underlined')] }));
    expect(renderToHtml(ast)).toBe('<p><u>underlined</u></p>\n');
  });

  it('renders highlight', () => {
    const ast = doc(para({ type: 'highlight', children: [text('marked')] }));
    expect(renderToHtml(ast)).toBe('<p><mark>marked</mark></p>\n');
  });

  it('renders superscript', () => {
    const ast = doc(para({ type: 'superscript', children: [text('sup')] }));
    expect(renderToHtml(ast)).toBe('<p><sup>sup</sup></p>\n');
  });

  it('renders subscript', () => {
    const ast = doc(para({ type: 'subscript', children: [text('sub')] }));
    expect(renderToHtml(ast)).toBe('<p><sub>sub</sub></p>\n');
  });

  it('renders spoilered text', () => {
    const ast = doc(para({ type: 'spoilered_text', children: [text('spoiler')] }));
    expect(renderToHtml(ast)).toBe('<p><span class="spoiler">spoiler</span></p>\n');
  });

  it('renders nested formatting', () => {
    const ast = doc(
      para({
        type: 'strong',
        children: [{ type: 'emph', children: [text('bold italic')] }],
      }),
    );
    expect(renderToHtml(ast)).toBe('<p><strong><em>bold italic</em></strong></p>\n');
  });
});

// ── Breaks ──

describe('breaks', () => {
  it('renders softbreak as newline', () => {
    const ast = doc(para(text('a'), { type: 'softbreak' }, text('b')));
    expect(renderToHtml(ast)).toBe('<p>a\nb</p>\n');
  });

  it('renders linebreak as <br />', () => {
    const ast = doc(para(text('a'), { type: 'linebreak' }, text('b')));
    expect(renderToHtml(ast)).toBe('<p>a<br />\nb</p>\n');
  });

  it('renders thematic break', () => {
    const ast = doc({ type: 'thematic_break' });
    expect(renderToHtml(ast)).toBe('<hr />\n');
  });
});

// ── Code ──

describe('code', () => {
  it('renders inline code', () => {
    const ast = doc(para({ type: 'code', literal: 'const x = 1' }));
    expect(renderToHtml(ast)).toBe('<p><code>const x = 1</code></p>\n');
  });

  it('escapes HTML in inline code', () => {
    const ast = doc(para({ type: 'code', literal: '<div>' }));
    expect(renderToHtml(ast)).toBe('<p><code>&lt;div&gt;</code></p>\n');
  });

  it('renders fenced code block with language', () => {
    const ast = doc({
      type: 'code_block',
      fenced: true,
      info: 'typescript',
      literal: 'const x = 1;\n',
    });
    expect(renderToHtml(ast)).toBe(
      '<pre><code class="language-typescript">const x = 1;\n</code></pre>\n',
    );
  });

  it('renders code block without language', () => {
    const ast = doc({
      type: 'code_block',
      fenced: true,
      info: '',
      literal: 'plain\n',
    });
    expect(renderToHtml(ast)).toBe('<pre><code>plain\n</code></pre>\n');
  });
});

// ── Links and Images ──

describe('links and images', () => {
  it('renders a link', () => {
    const ast = doc(
      para({
        type: 'link',
        url: 'https://example.com',
        title: '',
        children: [text('click me')],
      }),
    );
    expect(renderToHtml(ast)).toBe('<p><a href="https://example.com">click me</a></p>\n');
  });

  it('renders a link with title', () => {
    const ast = doc(
      para({
        type: 'link',
        url: 'https://example.com',
        title: 'Example',
        children: [text('click')],
      }),
    );
    expect(renderToHtml(ast)).toBe(
      '<p><a href="https://example.com" title="Example">click</a></p>\n',
    );
  });

  it('renders an image', () => {
    const ast = doc(
      para({
        type: 'image',
        url: 'img.png',
        title: '',
        children: [text('alt text')],
      }),
    );
    expect(renderToHtml(ast)).toBe('<p><img src="img.png" alt="alt text" /></p>\n');
  });

  it('renders an image with title', () => {
    const ast = doc(
      para({
        type: 'image',
        url: 'img.png',
        title: 'Photo',
        children: [text('alt')],
      }),
    );
    expect(renderToHtml(ast)).toBe(
      '<p><img src="img.png" alt="alt" title="Photo" /></p>\n',
    );
  });
});

// ── Wikilinks ──

describe('wikilinks', () => {
  it('renders default wikilink', () => {
    const ast = doc(
      para({
        type: 'wikilink',
        url: 'page-name',
        children: [text('label')],
      }),
    );
    expect(renderToHtml(ast)).toBe(
      '<p><a href="page-name" data-wikilink="true">label</a></p>\n',
    );
  });

  it('renders wikilink with custom options', () => {
    const ast = doc(
      para({
        type: 'wikilink',
        url: 'page',
        children: [text('label')],
      }),
    );
    const html = renderToHtml(ast, {
      wikilink: {
        tagName: 'Link',
        urlAttr: 'to',
        urlPrefix: '/wiki/',
        attrs: { className: 'wikilink', 'data-wikilink': 'true' },
      },
    });
    expect(html).toBe(
      '<p><Link to="/wiki/page" className="wikilink" data-wikilink="true">label</Link></p>\n',
    );
  });

  it('renders wikilink with only urlPrefix', () => {
    const ast = doc(
      para({
        type: 'wikilink',
        url: 'page',
        children: [text('page')],
      }),
    );
    const html = renderToHtml(ast, {
      wikilink: { urlPrefix: '/docs/' },
    });
    expect(html).toBe(
      '<p><a href="/docs/page" data-wikilink="true">page</a></p>\n',
    );
  });

  it('renders wikilink with custom attrs replacing defaults', () => {
    const ast = doc(
      para({
        type: 'wikilink',
        url: 'page',
        children: [text('page')],
      }),
    );
    const html = renderToHtml(ast, {
      wikilink: { attrs: { class: 'wiki' } },
    });
    // custom attrs replaces default data-wikilink
    expect(html).toBe('<p><a href="page" class="wiki">page</a></p>\n');
  });
});

// ── Lists ──

describe('lists', () => {
  it('renders unordered list', () => {
    const ast = doc({
      type: 'list',
      list_type: 'bullet',
      start: null,
      tight: true,
      delimiter: 'period',
      children: [
        { type: 'item', list_type: 'bullet', start: 1, tight: true, children: [para(text('one'))] },
        { type: 'item', list_type: 'bullet', start: 2, tight: true, children: [para(text('two'))] },
      ],
    });
    const html = renderToHtml(ast);
    expect(html).toBe('<ul>\n<li>one\n</li>\n<li>two\n</li>\n</ul>\n');
  });

  it('renders ordered list', () => {
    const ast = doc({
      type: 'list',
      list_type: 'ordered',
      start: 1,
      tight: true,
      delimiter: 'period',
      children: [
        { type: 'item', list_type: 'ordered', start: 1, tight: true, children: [para(text('first'))] },
        { type: 'item', list_type: 'ordered', start: 2, tight: true, children: [para(text('second'))] },
      ],
    });
    const html = renderToHtml(ast);
    expect(html).toBe('<ol>\n<li>first\n</li>\n<li>second\n</li>\n</ol>\n');
  });

  it('renders ordered list with custom start', () => {
    const ast = doc({
      type: 'list',
      list_type: 'ordered',
      start: 5,
      tight: true,
      delimiter: 'period',
      children: [
        { type: 'item', list_type: 'ordered', start: 5, tight: true, children: [para(text('five'))] },
      ],
    });
    const html = renderToHtml(ast);
    expect(html).toBe('<ol start="5">\n<li>five\n</li>\n</ol>\n');
  });

  it('renders loose list with <p> tags', () => {
    const ast = doc({
      type: 'list',
      list_type: 'bullet',
      start: null,
      tight: false,
      delimiter: 'period',
      children: [
        { type: 'item', list_type: 'bullet', start: 1, tight: false, children: [para(text('one'))] },
        { type: 'item', list_type: 'bullet', start: 2, tight: false, children: [para(text('two'))] },
      ],
    });
    const html = renderToHtml(ast);
    expect(html).toBe('<ul>\n<li><p>one</p>\n</li>\n<li><p>two</p>\n</li>\n</ul>\n');
  });
});

// ── Task Lists ──

describe('task lists', () => {
  it('renders checked task item', () => {
    const ast = doc({
      type: 'list',
      list_type: 'bullet',
      start: null,
      tight: true,
      delimiter: 'period',
      children: [
        { type: 'task_item', symbol: 'x', children: [para(text('done'))] },
      ],
    });
    const html = renderToHtml(ast);
    expect(html).toContain('<input type="checkbox" checked="" disabled="" />done');
  });

  it('renders unchecked task item', () => {
    const ast = doc({
      type: 'list',
      list_type: 'bullet',
      start: null,
      tight: true,
      delimiter: 'period',
      children: [
        { type: 'task_item', symbol: null, children: [para(text('todo'))] },
      ],
    });
    const html = renderToHtml(ast);
    expect(html).toContain('<input type="checkbox" disabled="" />todo');
  });
});

// ── Tables ──

describe('tables', () => {
  it('renders a basic table', () => {
    const ast = doc({
      type: 'table',
      alignments: ['none', 'none'],
      num_columns: 2,
      num_rows: 2,
      children: [
        {
          type: 'table_row',
          header: true,
          children: [
            { type: 'table_cell', children: [text('A')] },
            { type: 'table_cell', children: [text('B')] },
          ],
        },
        {
          type: 'table_row',
          header: false,
          children: [
            { type: 'table_cell', children: [text('1')] },
            { type: 'table_cell', children: [text('2')] },
          ],
        },
      ],
    });
    const html = renderToHtml(ast);
    expect(html).toContain('<th>A</th>');
    expect(html).toContain('<th>B</th>');
    expect(html).toContain('<td>1</td>');
    expect(html).toContain('<td>2</td>');
  });

  it('renders table with alignment', () => {
    const ast = doc({
      type: 'table',
      alignments: ['left', 'center', 'right'],
      num_columns: 3,
      num_rows: 2,
      children: [
        {
          type: 'table_row',
          header: true,
          children: [
            { type: 'table_cell', children: [text('L')] },
            { type: 'table_cell', children: [text('C')] },
            { type: 'table_cell', children: [text('R')] },
          ],
        },
        {
          type: 'table_row',
          header: false,
          children: [
            { type: 'table_cell', children: [text('1')] },
            { type: 'table_cell', children: [text('2')] },
            { type: 'table_cell', children: [text('3')] },
          ],
        },
      ],
    });
    const html = renderToHtml(ast);
    expect(html).toContain('<th align="left">L</th>');
    expect(html).toContain('<th align="center">C</th>');
    expect(html).toContain('<th align="right">R</th>');
    expect(html).toContain('<td align="left">1</td>');
    expect(html).toContain('<td align="center">2</td>');
    expect(html).toContain('<td align="right">3</td>');
  });
});

// ── Block Quotes ──

describe('block quotes', () => {
  it('renders a block quote', () => {
    const ast = doc({
      type: 'block_quote',
      children: [para(text('quoted'))],
    });
    expect(renderToHtml(ast)).toBe('<blockquote>\n<p>quoted</p>\n</blockquote>\n');
  });

  it('renders nested block quotes', () => {
    const ast = doc({
      type: 'block_quote',
      children: [
        {
          type: 'block_quote',
          children: [para(text('nested'))],
        },
      ],
    });
    expect(renderToHtml(ast)).toBe(
      '<blockquote>\n<blockquote>\n<p>nested</p>\n</blockquote>\n</blockquote>\n',
    );
  });
});

// ── Footnotes ──

describe('footnotes', () => {
  it('renders footnote reference', () => {
    const ast = doc(
      para(
        text('text'),
        { type: 'footnote_reference', name: 'note1', ref_num: 0, ix: 0 },
      ),
    );
    expect(renderToHtml(ast)).toContain('<sup><a href="#fn-note1">[1]</a></sup>');
  });

  it('renders footnote definition', () => {
    const ast = doc({
      type: 'footnote_definition',
      name: 'note1',
      children: [para(text('Footnote content'))],
    });
    const html = renderToHtml(ast);
    expect(html).toContain('id="fn-note1"');
    expect(html).toContain('Footnote content');
  });
});

// ── Math ──

describe('math', () => {
  it('renders inline math', () => {
    const ast = doc(
      para({
        type: 'math',
        dollar_math: false,
        display_math: false,
        literal: 'x^2 + y^2',
      }),
    );
    expect(renderToHtml(ast)).toContain(
      '<code class="math math-inline">x^2 + y^2</code>',
    );
  });

  it('renders display math', () => {
    const ast = doc({
      type: 'math',
      dollar_math: false,
      display_math: true,
      literal: 'E = mc^2',
    });
    expect(renderToHtml(ast)).toContain(
      '<code class="math math-display">E = mc^2</code>',
    );
  });
});

// ── Shortcodes ──

describe('shortcodes', () => {
  it('renders shortcode as emoji', () => {
    const ast = doc(para({ type: 'shortcode', code: 'rabbit', emoji: '\u{1F430}' }));
    expect(renderToHtml(ast)).toContain('\u{1F430}');
  });
});

// ── HTML Passthrough ──

describe('html passthrough', () => {
  it('renders html_block as raw', () => {
    const ast = doc({
      type: 'html_block',
      block_type: 6,
      literal: '<div class="custom">content</div>\n',
    });
    expect(renderToHtml(ast)).toBe('<div class="custom">content</div>\n');
  });

  it('renders html_inline as raw', () => {
    const ast = doc(
      para(
        text('before '),
        { type: 'html_inline', value: '<span class="x">' },
        text('inside'),
        { type: 'html_inline', value: '</span>' },
        text(' after'),
      ),
    );
    const html = renderToHtml(ast);
    expect(html).toBe(
      '<p>before <span class="x">inside</span> after</p>\n',
    );
  });
});

// ── Alerts ──

describe('alerts', () => {
  it('renders an alert', () => {
    const ast = doc({
      type: 'alert',
      alert_type: 'warning',
      title: null,
      children: [para(text('Be careful'))],
    });
    const html = renderToHtml(ast);
    expect(html).toContain('class="alert alert-warning"');
    expect(html).toContain('Be careful');
  });
});

// ── Front Matter ──

describe('front matter', () => {
  it('skips front matter', () => {
    const ast = doc(
      { type: 'front_matter', value: 'title: Hello' },
      para(text('content')),
    );
    expect(renderToHtml(ast)).toBe('<p>content</p>\n');
  });
});

// ── Escaped ──

describe('escaped', () => {
  it('renders escaped as empty', () => {
    const ast = doc(para({ type: 'escaped' }));
    expect(renderToHtml(ast)).toBe('<p></p>\n');
  });

  it('renders escaped_tag as escaped text', () => {
    const ast = doc(para({ type: 'escaped_tag', value: 'script' }));
    expect(renderToHtml(ast)).toBe('<p>script</p>\n');
  });
});

// ── Description Lists ──

describe('description lists', () => {
  it('renders a description list', () => {
    const ast = doc({
      type: 'description_list',
      children: [
        {
          type: 'description_item',
          children: [
            { type: 'description_term', children: [text('Term')] },
            { type: 'description_details', children: [para(text('Definition'))] },
          ],
        },
      ],
    });
    const html = renderToHtml(ast);
    expect(html).toContain('<dl>');
    expect(html).toContain('<dt>Term</dt>');
    expect(html).toContain('<dd><p>Definition</p>');
    expect(html).toContain('</dl>');
  });
});

// ── Nested Structures ──

describe('nested structures', () => {
  it('renders a complex document', () => {
    const ast: AstNode = {
      type: 'document',
      children: [
        { type: 'heading', level: 1, setext: false, children: [text('Title')] },
        para(
          text('Some '),
          { type: 'strong', children: [text('bold')] },
          text(' and '),
          { type: 'emph', children: [text('italic')] },
          text(' text.'),
        ),
        {
          type: 'list',
          list_type: 'bullet',
          start: null,
          tight: true,
          delimiter: 'period',
          children: [
            {
              type: 'item',
              list_type: 'bullet',
              start: 1,
              tight: true,
              children: [
                para(text('item with ')),
                {
                  type: 'list',
                  list_type: 'bullet',
                  start: null,
                  tight: true,
                  delimiter: 'period',
                  children: [
                    {
                      type: 'item',
                      list_type: 'bullet',
                      start: 1,
                      tight: true,
                      children: [para(text('nested'))],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    const html = renderToHtml(ast);
    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
    expect(html).toContain('<ul>');
    expect(html).toContain('nested');
  });
});
