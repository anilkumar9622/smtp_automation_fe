// HTML helpers for the template NOTE block (see components/NotesEditorModal.tsx).

export const isEmptyNote = (html: string): boolean => {
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  return !doc.body.textContent?.trim();
};

// Quill 2 writes every list as <ol><li data-list="bullet|ordered">, with a
// helper <span class="ql-ui"> — rewrite to plain <ul>/<ol> with inline
// spacing so email clients show proper bullets/numbers.
export const toEmailHtml = (quillHtml: string): string => {
  if (isEmptyNote(quillHtml)) return "";
  const doc = new DOMParser().parseFromString(`<div>${quillHtml}</div>`, "text/html");
  const root = doc.body.firstElementChild as HTMLElement;

  root.querySelectorAll(".ql-ui").forEach((el) => el.remove());

  root.querySelectorAll("ol").forEach((ol) => {
    const fragment = doc.createDocumentFragment();
    let list: HTMLElement | null = null;
    let listTag = "";
    Array.from(ol.children).forEach((li) => {
      const tag = li.getAttribute("data-list") === "bullet" ? "ul" : "ol";
      if (tag !== listTag) {
        list = doc.createElement(tag);
        list.setAttribute("style", "margin:0;padding-left:24px;");
        fragment.appendChild(list);
        listTag = tag;
      }
      li.removeAttribute("data-list");
      list!.appendChild(li);
    });
    ol.replaceWith(fragment);
  });

  root.querySelectorAll("p").forEach((p) => {
    (p as HTMLElement).style.margin = "0";
  });

  return root.innerHTML;
};
