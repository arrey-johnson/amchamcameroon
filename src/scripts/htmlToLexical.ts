/**
 * HTML → Payload Lexical JSON converter for Joomla migration imports.
 * Uses cheerio so Word/email junk (span/style/mso-*) does not leak as visible text.
 */

import * as cheerio from "cheerio";
import type { AnyNode, Element } from "domhandler";

type LexNode = Record<string, unknown>;

function textNode(text: string, format = 0): LexNode {
  return { type: "text", text, format, style: "", mode: "normal", detail: 0, version: 1 };
}

function decodeEntities(s: string): string {
  return s
    .replace(/\u00a0/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&rdquo;/gi, '"')
    .replace(/&ldquo;/gi, '"')
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function cleanText(s: string): string {
  return decodeEntities(s).replace(/\s+/g, " ");
}

function paragraphFromChildren(children: LexNode[]): LexNode | null {
  const filtered = children.filter((c) => {
    if (c.type === "text") return Boolean(String(c.text || "").trim());
    return true;
  });
  if (filtered.length === 0) return null;
  // Merge adjacent text nodes with the same format
  const merged: LexNode[] = [];
  for (const child of filtered) {
    const prev = merged[merged.length - 1];
    if (
      prev?.type === "text" &&
      child.type === "text" &&
      prev.format === child.format
    ) {
      prev.text = `${String(prev.text)}${String(child.text)}`;
    } else {
      merged.push({ ...child });
    }
  }
  return {
    type: "paragraph",
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    textFormat: 0,
    children: merged,
  };
}

function inlineFromNodes($: cheerio.CheerioAPI, nodes: AnyNode[], format = 0): LexNode[] {
  const out: LexNode[] = [];

  for (const node of nodes) {
    if (node.type === "text") {
      const t = cleanText((node as { data?: string }).data || "");
      if (t) out.push(textNode(t, format));
      continue;
    }
    if (node.type !== "tag") continue;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    if (tag === "br") {
      out.push(textNode("\n", format));
      continue;
    }
    if (tag === "script" || tag === "style" || tag === "img") continue;

    if (tag === "a") {
      const href = (el.attribs.href || "").trim();
      const label = cleanText($(el).text()).trim() || href;
      if (!label) continue;
      // Skip empty/javascript/anchor-only junk from old Word HTML
      if (!href || href === "#" || href.toLowerCase().startsWith("javascript:")) {
        out.push(textNode(label, format));
        continue;
      }
      out.push({
        type: "link",
        version: 3,
        fields: {
          url: href,
          newTab: href.startsWith("http"),
          linkType: "custom",
        },
        direction: "ltr",
        format: "",
        indent: 0,
        children: [textNode(label)],
      });
      continue;
    }

    let nextFormat = format;
    if (tag === "strong" || tag === "b") nextFormat = format | 1;
    if (tag === "em" || tag === "i") nextFormat = format | 2;

    // span, font, o:p, and other wrappers: keep text, drop attributes
    out.push(...inlineFromNodes($, el.children || [], nextFormat));
  }

  return out;
}

function listFromElement($: cheerio.CheerioAPI, el: Element, ordered: boolean): LexNode | null {
  const items: LexNode[] = [];
  $(el)
    .children("li")
    .each((_, li) => {
      const children = inlineFromNodes($, (li as Element).children || []);
      const text = cleanText($(li).text()).trim();
      const kids =
        children.length > 0
          ? children
          : text
            ? [textNode(text)]
            : [];
      if (kids.length === 0) return;
      items.push({
        type: "listitem",
        value: items.length + 1,
        format: "",
        indent: 0,
        version: 1,
        direction: "ltr",
        children: kids,
      });
    });
  if (items.length === 0) return null;
  return {
    type: "list",
    listType: ordered ? "number" : "bullet",
    start: 1,
    tag: ordered ? "ol" : "ul",
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: items,
  };
}

function blocksFromNodes($: cheerio.CheerioAPI, nodes: AnyNode[]): LexNode[] {
  const blocks: LexNode[] = [];
  let inlineBuffer: AnyNode[] = [];

  const flushInline = () => {
    if (inlineBuffer.length === 0) return;
    const children = inlineFromNodes($, inlineBuffer);
    const para = paragraphFromChildren(children);
    if (para) blocks.push(para);
    inlineBuffer = [];
  };

  for (const node of nodes) {
    if (node.type === "text") {
      const t = cleanText((node as { data?: string }).data || "");
      if (t.trim()) inlineBuffer.push(node);
      continue;
    }
    if (node.type !== "tag") continue;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    if (tag === "script" || tag === "style" || tag === "img") continue;

    if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4") {
      flushInline();
      const children = inlineFromNodes($, el.children || []);
      const plain = cleanText($(el).text()).trim();
      const kids = children.length > 0 ? children : plain ? [textNode(plain)] : [];
      if (kids.length > 0) {
        blocks.push({
          type: "heading",
          tag: tag === "h1" || tag === "h4" ? (tag === "h1" ? "h2" : "h3") : tag,
          format: "",
          indent: 0,
          version: 1,
          direction: "ltr",
          children: kids,
        });
      }
      continue;
    }

    if (tag === "p") {
      flushInline();
      const para = paragraphFromChildren(inlineFromNodes($, el.children || []));
      if (para) blocks.push(para);
      continue;
    }

    if (tag === "ul" || tag === "ol") {
      flushInline();
      const list = listFromElement($, el, tag === "ol");
      if (list) blocks.push(list);
      continue;
    }

    if (tag === "br") {
      // Treat hard breaks between blocks as paragraph separators when buffered
      flushInline();
      continue;
    }

    if (
      tag === "div" ||
      tag === "section" ||
      tag === "article" ||
      tag === "blockquote" ||
      tag === "td" ||
      tag === "th" ||
      tag === "tr" ||
      tag === "table" ||
      tag === "tbody" ||
      tag === "thead"
    ) {
      flushInline();
      blocks.push(...blocksFromNodes($, el.children || []));
      continue;
    }

    // Inline-ish wrappers (span, font, strong at top level, etc.)
    inlineBuffer.push(el);
  }

  flushInline();
  return blocks;
}

/** Convert a chunk of article HTML into Lexical editor state. */
export function htmlToLexical(html: string): { root: LexNode } {
  const $ = cheerio.load(`<div id="__root">${html || ""}</div>`, {
    xml: false,
  });

  // Drop chrome / empty Word leftovers
  $("#__root").find("script, style, noscript, img, .article-info, .pager, .jsn-article-toolbar, .icons, .page-header").remove();
  $("#__root").find("o\\:p").each((_, el) => {
    $(el).replaceWith($(el).html() || "");
  });

  const rootEl = $("#__root").get(0) as Element | undefined;
  let blocks = blocksFromNodes($, rootEl?.children || []);

  // Drop empty / whitespace-only paragraphs
  blocks = blocks.filter((b) => {
    if (b.type !== "paragraph") return true;
    const text = ((b.children as LexNode[]) || [])
      .map((c) => (c.type === "text" ? String(c.text || "") : ""))
      .join("")
      .trim();
    return text.length > 0;
  });

  if (blocks.length === 0) {
    const plain = cleanText($("#__root").text()).trim();
    if (plain) {
      const para = paragraphFromChildren([textNode(plain)]);
      if (para) blocks.push(para);
    }
  }

  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children: blocks,
    },
  };
}

/** First ~240 chars of plain text for excerpts. */
export function htmlToExcerpt(html: string, max = 240): string {
  const $ = cheerio.load(html || "");
  const plain = cleanText($.text()).trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max).replace(/\s+\S*$/, "")}…`;
}
