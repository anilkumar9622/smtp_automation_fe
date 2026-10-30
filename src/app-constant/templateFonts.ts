// Keeps every template in one typeface — Georgia, the templates' own font.
//
// Georgia/Arial/Helvetica are what the templates themselves use, and any
// leftover Kohinoor stack is turned back into Georgia by the backend's
// applyBrandFont (backend utils/brandFont.ts), so those are fine.
// Anything else inline (Verdana, Calibri, Segoe UI, ...) almost always came
// from text pasted into the preview from Word/Outlook/a web page, and shows
// up as a different font in the sent email. These helpers strip it out.
//
// The NOTE block is exempt: its fonts are picked deliberately in the
// rich-text Note editor.

const BRAND_COMPATIBLE_FONT = /kohinoor|georgia|arial|helvetica/i;
const NOTES_BLOCK_SELECTOR = "[data-template-notes-block]";
const INTRO_SECTION_SELECTOR = '[data-locked-section="intro"]';

// Edits the style attribute as a string rather than via el.style: going
// through CSSOM re-serializes the whole attribute and silently drops
// email-client properties it doesn't know (mso-*, etc.).
const removeDeclarations = (style: string, shouldRemove: (prop: string, value: string) => boolean): string =>
  style
    .split(";")
    .filter((decl) => {
      const i = decl.indexOf(":");
      if (i === -1) return decl.trim() !== "";
      return !shouldRemove(decl.slice(0, i).trim().toLowerCase(), decl.slice(i + 1).trim());
    })
    .join(";")
    .trim();

const setStyle = (el: Element, style: string) => {
  if (style) el.setAttribute("style", style);
  else el.removeAttribute("style");
};

const unwrap = (el: Element) => {
  el.replaceWith(...Array.from(el.childNodes));
};

// The Greeting section is meant to be plain paragraphs, so pasted
// formatting there is removed outright: inline styles, <font>/<span>
// wrappers, and pasted <div>s (which also block side-panel editing).
const cleanIntroSection = (root: ParentNode) => {
  root.querySelectorAll(INTRO_SECTION_SELECTOR).forEach((section) => {
    section.querySelectorAll("[style]").forEach((el) => el.removeAttribute("style"));
    section.querySelectorAll("font, span:not([data-merge-tag])").forEach(unwrap);
    // Leaf divs become paragraphs; wrapper divs are flattened.
    Array.from(section.querySelectorAll("div")).reverse().forEach((div) => {
      if (div.querySelector("p, div, table")) {
        unwrap(div);
      } else {
        const p = div.ownerDocument.createElement("p");
        p.append(...Array.from(div.childNodes));
        div.replaceWith(p);
      }
    });
  });
};

export const normalizeTemplateFonts = (root: ParentNode) => {
  root.querySelectorAll("body [style]").forEach((el) => {
    if (el.closest(NOTES_BLOCK_SELECTOR)) return;
    const style = el.getAttribute("style") || "";
    if (!/font-family/i.test(style)) return;
    setStyle(el, removeDeclarations(style, (prop, value) => prop === "font-family" && !BRAND_COMPATIBLE_FONT.test(value)));
  });

  root.querySelectorAll("body font").forEach((font) => {
    if (font.closest(NOTES_BLOCK_SELECTOR)) return;
    font.removeAttribute("face");
    font.removeAttribute("size");
  });

  cleanIntroSection(root);
};
