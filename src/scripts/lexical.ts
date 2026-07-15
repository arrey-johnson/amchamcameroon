/** Minimal helpers to build Lexical rich-text state for seeding. */

type Block = { h2: string } | { h3: string } | { p: string } | { ul: string[] };

function textNode(text: string) {
  return { type: "text", text, format: 0, style: "", mode: "normal", detail: 0, version: 1 };
}

function paragraph(text: string) {
  return {
    type: "paragraph",
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr" as const,
    textFormat: 0,
    children: [textNode(text)],
  };
}

function heading(text: string, tag: "h2" | "h3") {
  return {
    type: "heading",
    tag,
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr" as const,
    children: [textNode(text)],
  };
}

function list(items: string[]) {
  return {
    type: "list",
    listType: "bullet",
    start: 1,
    tag: "ul",
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr" as const,
    children: items.map((text, i) => ({
      type: "listitem",
      value: i + 1,
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: [textNode(text)],
    })),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lex(blocks: Block[]): any {
  const children = blocks.map((b) => {
    if ("h2" in b) return heading(b.h2, "h2");
    if ("h3" in b) return heading(b.h3, "h3");
    if ("ul" in b) return list(b.ul);
    return paragraph(b.p);
  });
  return {
    root: { type: "root", format: "", indent: 0, version: 1, direction: "ltr", children },
  };
}
