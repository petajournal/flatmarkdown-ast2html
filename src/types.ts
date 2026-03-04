// Re-export all AST types from flatmarkdown-ast
export type {
  AstNode,
  DocumentNode,
  ParagraphNode,
  HeadingNode,
  CodeBlockNode,
  BlockQuoteNode,
  MultilineBlockQuoteNode,
  ListNode,
  ItemNode,
  TaskItemNode,
  TableNode,
  TableRowNode,
  TableCellNode,
  ThematicBreakNode,
  HtmlBlockNode,
  FootnoteDefinitionNode,
  DescriptionListNode,
  DescriptionItemNode,
  DescriptionTermNode,
  DescriptionDetailsNode,
  AlertNode,
  FrontMatterNode,
  HeexBlockNode,
  SubtextNode,
  TextNode,
  SoftbreakNode,
  LinebreakNode,
  EmphNode,
  StrongNode,
  StrikethroughNode,
  UnderlineNode,
  HighlightNode,
  SuperscriptNode,
  SubscriptNode,
  SpoileredTextNode,
  CodeNode,
  LinkNode,
  ImageNode,
  FootnoteReferenceNode,
  ShortcodeNode,
  MathNode,
  HtmlInlineNode,
  HeexInlineNode,
  RawNode,
  EscapedNode,
  EscapedTagNode,
  WikilinkNode,
} from 'flatmarkdown-ast';

// ── Render Options (specific to ast2html) ──

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
