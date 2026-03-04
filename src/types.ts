// ── Block Nodes ──

export interface DocumentNode {
  type: 'document';
  children?: AstNode[];
}

export interface ParagraphNode {
  type: 'paragraph';
  children?: AstNode[];
}

export interface HeadingNode {
  type: 'heading';
  level: number;
  setext: boolean;
  children?: AstNode[];
}

export interface CodeBlockNode {
  type: 'code_block';
  fenced: boolean;
  info: string;
  literal: string;
}

export interface BlockQuoteNode {
  type: 'block_quote';
  children?: AstNode[];
}

export interface MultilineBlockQuoteNode {
  type: 'multiline_block_quote';
  children?: AstNode[];
}

export interface ListNode {
  type: 'list';
  list_type: string;
  start: number | null;
  tight: boolean;
  delimiter: string;
  children?: AstNode[];
}

export interface ItemNode {
  type: 'item';
  list_type: string;
  start: number;
  tight: boolean;
  children?: AstNode[];
}

export interface TaskItemNode {
  type: 'task_item';
  symbol: string | null;
  children?: AstNode[];
}

export interface TableNode {
  type: 'table';
  alignments: string[];
  num_columns: number;
  num_rows: number;
  children?: AstNode[];
}

export interface TableRowNode {
  type: 'table_row';
  header: boolean;
  children?: AstNode[];
}

export interface TableCellNode {
  type: 'table_cell';
  children?: AstNode[];
}

export interface ThematicBreakNode {
  type: 'thematic_break';
}

export interface HtmlBlockNode {
  type: 'html_block';
  block_type: number;
  literal: string;
}

export interface FootnoteDefinitionNode {
  type: 'footnote_definition';
  name: string;
  children?: AstNode[];
}

export interface DescriptionListNode {
  type: 'description_list';
  children?: AstNode[];
}

export interface DescriptionItemNode {
  type: 'description_item';
  children?: AstNode[];
}

export interface DescriptionTermNode {
  type: 'description_term';
  children?: AstNode[];
}

export interface DescriptionDetailsNode {
  type: 'description_details';
  children?: AstNode[];
}

export interface AlertNode {
  type: 'alert';
  alert_type: string;
  title: string | null;
  children?: AstNode[];
}

export interface FrontMatterNode {
  type: 'front_matter';
  value: string;
}

export interface HeexBlockNode {
  type: 'heex_block';
  children?: AstNode[];
}

export interface SubtextNode {
  type: 'subtext';
  children?: AstNode[];
}

// ── Inline Nodes ──

export interface TextNode {
  type: 'text';
  value: string;
}

export interface SoftbreakNode {
  type: 'softbreak';
}

export interface LinebreakNode {
  type: 'linebreak';
}

export interface EmphNode {
  type: 'emph';
  children?: AstNode[];
}

export interface StrongNode {
  type: 'strong';
  children?: AstNode[];
}

export interface StrikethroughNode {
  type: 'strikethrough';
  children?: AstNode[];
}

export interface UnderlineNode {
  type: 'underline';
  children?: AstNode[];
}

export interface HighlightNode {
  type: 'highlight';
  children?: AstNode[];
}

export interface SuperscriptNode {
  type: 'superscript';
  children?: AstNode[];
}

export interface SubscriptNode {
  type: 'subscript';
  children?: AstNode[];
}

export interface SpoileredTextNode {
  type: 'spoilered_text';
  children?: AstNode[];
}

export interface CodeNode {
  type: 'code';
  literal: string;
}

export interface LinkNode {
  type: 'link';
  url: string;
  title: string;
  children?: AstNode[];
}

export interface ImageNode {
  type: 'image';
  url: string;
  title: string;
  children?: AstNode[];
}

export interface FootnoteReferenceNode {
  type: 'footnote_reference';
  name: string;
  ref_num: number;
  ix: number;
}

export interface ShortcodeNode {
  type: 'shortcode';
  code: string;
  emoji: string;
}

export interface MathNode {
  type: 'math';
  dollar_math: boolean;
  display_math: boolean;
  literal: string;
}

export interface HtmlInlineNode {
  type: 'html_inline';
  value: string;
}

export interface HeexInlineNode {
  type: 'heex_inline';
  value: string;
}

export interface RawNode {
  type: 'raw';
  value: string;
}

export interface EscapedNode {
  type: 'escaped';
}

export interface EscapedTagNode {
  type: 'escaped_tag';
  value: string;
}

export interface WikilinkNode {
  type: 'wikilink';
  url: string;
  children?: AstNode[];
}

// ── Union Type ──

export type AstNode =
  // Block
  | DocumentNode
  | ParagraphNode
  | HeadingNode
  | CodeBlockNode
  | BlockQuoteNode
  | MultilineBlockQuoteNode
  | ListNode
  | ItemNode
  | TaskItemNode
  | TableNode
  | TableRowNode
  | TableCellNode
  | ThematicBreakNode
  | HtmlBlockNode
  | FootnoteDefinitionNode
  | DescriptionListNode
  | DescriptionItemNode
  | DescriptionTermNode
  | DescriptionDetailsNode
  | AlertNode
  | FrontMatterNode
  | HeexBlockNode
  | SubtextNode
  // Inline
  | TextNode
  | SoftbreakNode
  | LinebreakNode
  | EmphNode
  | StrongNode
  | StrikethroughNode
  | UnderlineNode
  | HighlightNode
  | SuperscriptNode
  | SubscriptNode
  | SpoileredTextNode
  | CodeNode
  | LinkNode
  | ImageNode
  | FootnoteReferenceNode
  | ShortcodeNode
  | MathNode
  | HtmlInlineNode
  | HeexInlineNode
  | RawNode
  | EscapedNode
  | EscapedTagNode
  | WikilinkNode;

// ── Render Options ──

export interface WikiLinkOptions {
  /** Tag name. Default: 'a'. Use 'Link' for React Router, etc. */
  tagName?: string;
  /** URL attribute name. Default: 'href'. Use 'to' for React Router, etc. */
  urlAttr?: string;
  /** Prefix prepended to the wikilink url. Default: '' */
  urlPrefix?: string;
  /** Extra attributes added to the tag. Default: { 'data-wikilink': 'true' } */
  attrs?: Record<string, string>;
}

export interface RenderOptions {
  wikilink?: WikiLinkOptions;
}
