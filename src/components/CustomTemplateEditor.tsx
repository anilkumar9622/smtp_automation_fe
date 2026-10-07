// import React, { useState, useEffect, useRef } from "react";
// import { Button, Select, message, Spin, Modal, Input, Layout } from "antd";
// import { getAllTemplatesService, saveTemplateService } from "../services/emailTemplateServices";

// const { Header, Content, Sider } = Layout;
// const { TextArea } = Input;

// interface Template {
//   id: number;
//   name: string;
//   title: string;
//   html: string;
// }

// const RawHtmlEditor: React.FC = () => {
//   const [templates, setTemplates] = useState<Template[]>([]);
//   const [selectedKey, setSelectedKey] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(true);
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [editHtml, setEditHtml] = useState<string>("");

//   useEffect(() => {
//     const loadTemplates = async () => {
//       try {
//         const response = await getAllTemplatesService();
//         if (response && response.length > 0) {
//           setTemplates(response);
//           setSelectedKey(response[0].name);
//         }
//       } catch (err) {
//         message.error("Failed to load templates");
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadTemplates();
//   }, []);

//   const currentTemplate = templates.find((t) => t.name === selectedKey);

//   useEffect(() => {
//     if (currentTemplate) setEditHtml(currentTemplate.html);
//   }, [currentTemplate]);

//   // Function to open preview in a completely new browser tab
//   const openInNewTab = () => {
//     const newWindow = window.open("", "_blank");
//     if (newWindow) {
//       newWindow.document.write(editHtml);
//       newWindow.document.close();
//     }
//   };

//   const handleUpdatePreview = () => {
//     setTemplates(prev => prev.map(t => t.name === selectedKey ? { ...t, html: editHtml } : t));
//     setIsModalOpen(false);
//   };

//   const handleSave = async () => {
//     if (!currentTemplate) return;
//     try {
//       await saveTemplateService({ ...currentTemplate, html: editHtml });
//       message.success("Template saved!");
//     } catch (err) {
//       message.error("Save failed");
//     }
//   };

//   if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

//   return (
//     <Layout style={{ height: "100vh", background: "#fff" }}>
//       <Header style={{ background: "#fff", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px" }}>
//         <Select
//           value={selectedKey}
//           onChange={(val) => setSelectedKey(val)}
//           style={{ width: 300 }}
//           options={templates.map((t) => ({ value: t.name, label: t.title }))}
//         />
//         <div style={{ display: "flex", gap: "10px" }}>
//           <Button onClick={openInNewTab}>Preview</Button>
//           <Button type="primary" onClick={handleSave}>Save Changes</Button>
//         </div>
//       </Header>

//       <Layout style={{ background: "#fff" }}>
//         <Content style={{ 
//           padding: "20px", 
//           overflow: "hidden", 
//           display: "flex", 
//           justifyContent: "center",
//           background: "#f0f2f5" 
//         }}>
//           {/* IFRAME: This is the magic part. 
//             It renders the HTML exactly like a browser tab would.
//           */}
//           <iframe
//             title="Email Preview"
//             srcDoc={editHtml}
//             style={{
//               width: "950px", // Slightly wider to avoid scrollbars
//               height: "100%",
//               border: "none",
//               backgroundColor: "#fff",
//               boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
//             }}
//           />
//         </Content>

//         <Sider width={200} theme="light" style={{ borderLeft: "1px solid #eee", padding: "20px" }}>
//           <Button block type="primary" ghost onClick={() => setIsModalOpen(true)}>
//             Edit HTML Code
//           </Button>
//           <p style={{ marginTop: "15px", fontSize: "12px", color: "#999" }}>
//             The preview uses an isolated iframe to prevent style distortion.
//           </p>
//         </Sider>
//       </Layout>

//       <Modal
//         title="Edit Raw HTML"
//         open={isModalOpen}
//         onOk={handleUpdatePreview}
//         onCancel={() => setIsModalOpen(false)}
//         width={1000}
//         centered
//         okText="Update Preview"
//       >
//         <TextArea
//           value={editHtml}
//           onChange={(e) => setEditHtml(e.target.value)}
//           rows={25}
//           style={{ 
//             fontFamily: "monospace", 
//             fontSize: "12px", 
//             background: "#1e1e1e", 
//             color: "#d4d4d4" 
//           }}
//         />
//       </Modal>
//     </Layout>
//   );
// };

// export default RawHtmlEditor;

import React, { useState, useEffect, useRef } from "react";
import { Button, Select, message, Spin, Modal, Input, Layout, Space, Divider, Typography, Card, Radio, Upload, Grid, Tabs } from "antd";
import { PlusOutlined, CodeOutlined, EyeOutlined, SaveOutlined, EditOutlined, LinkOutlined, PictureOutlined, UploadOutlined } from "@ant-design/icons";
import { getAllTemplatesService, saveTemplateService, uploadImageService, listImageGalleryService } from "../services/emailTemplateServices";
import { PROPERTY_OPTIONS, PROPERTY_VARIANTS } from "../app-constant/propertyCodes";

const { Header, Content, Sider } = Layout;
const { TextArea } = Input;
const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

interface Template {
  id?: number;
  name: string;
  title: string;
  subject?: string;
  html: string;
  property_code?: string;
  property_name?: string;
}

const ModernEmailEditor: React.FC = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md; // narrower than antd's md breakpoint (768px)

  // Only a super admin can create brand-new templates or touch raw source
  // code — admins/property operators can still edit content inline and
  // save, just not those two actions. The backend enforces the same rule
  // independently (see EmailTemplate.controller.ts), so hiding these
  // buttons is a UX nicety, not the actual security boundary.
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const isPropertyOperator = currentUser?.role === "PROPERTY_OPERATOR";

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  
  // Modals State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  
  // Editor & New Template State
  const [editHtml, setEditHtml] = useState<string>("");
  const [notesText, setNotesText] = useState<string>("");
  const [newTemplate, setNewTemplate] = useState<Template>({
    name: "",
    title: "",
    subject: "",
    html: "<html><body><h1>New Template</h1></body></html>"
  });
  // Which customer/agent variant the new template is for — only meaningful
  // once a property is picked below (see applyPropertyAndVariant).
  const [newVariant, setNewVariant] = useState<"customer" | "agent">("customer");

  // Each property has its own customer/agent template pair, named
  // "<code>_for_<variant>" (matching the backend's buildTemplateName), so
  // picking a property + variant auto-fills name/title/property_name —
  // still editable afterward if you want a custom internal name.
  const applyPropertyAndVariant = (propertyCode?: string, variant: "customer" | "agent" = newVariant) => {
    const property = PROPERTY_OPTIONS.find((p) => p.code === propertyCode);
    if (!property) return;
    setNewTemplate((prev) => ({
      ...prev,
      property_code: property.code,
      property_name: property.name,
      name: `${property.code.toLowerCase()}_for_${variant}`,
      title: `${property.name} - ${variant === "customer" ? "Customer" : "Agent"} Booking`,
    }));
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await getAllTemplatesService();
      if (response && response.length > 0) {
        setTemplates(response);
        setSelectedKey(response[0].name);
      }
    } catch (err) {
      message.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const currentTemplate = templates.find((t) => t.name === selectedKey);

  // Ref to the live preview iframe, used to read/write the content the user
  // edits directly on the rendered template (instead of only via raw HTML).
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Mirrors notesText so the iframe's onLoad handler always sees the latest
  // value, even when it fires before the state update has re-rendered.
  const notesTextRef = useRef<string>("");
  const [notesAnchorMissing, setNotesAnchorMissing] = useState(false);

  useEffect(() => {
    if (!currentTemplate) return;
    const notes = readNotesFromHtml(currentTemplate.html);
    notesTextRef.current = notes;
    setNotesText(notes);
    setEditHtml(currentTemplate.html);
  }, [currentTemplate]);

  // NOTES block — free text entered from the side panel (not editable in the
  // preview itself) that renders right after the Policies section. It's
  // stored inside the template HTML, so the backend sends it as-is with no
  // extra merge data; when the notes are empty the block is removed entirely.
  const NOTES_BLOCK_SELECTOR = "[data-template-notes-block]";
  const NOTES_CONTENT_SELECTOR = "[data-template-notes-content]";

  const readNotesFromHtml = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const content = doc.querySelector(NOTES_CONTENT_SELECTOR);
    if (!content) return "";
    content.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
    return content.textContent || "";
  };

  // The element the NOTES block goes after: the paragraph/div wrapping the
  // {{policiesBlock}} merge tag (frozen into a span by freezeMergeTags), so
  // the block sits inside the same padded section, below the policies.
  const findPoliciesAnchor = (doc: Document): Element | null => {
    const tag = doc.querySelector('[data-merge-tag="policiesBlock"]');
    if (!tag) return null;
    const parent = tag.parentElement;
    return parent?.tagName === "P" ? parent : tag;
  };

  const syncNotesBlock = (doc: Document, value: string) => {
    const existing = doc.querySelector(NOTES_BLOCK_SELECTOR);
    const anchor = existing ? null : findPoliciesAnchor(doc);
    setNotesAnchorMissing(!existing && !anchor);

    if (!value.trim()) {
      existing?.remove();
      return;
    }

    let block = existing;
    if (!block) {
      if (!anchor) return;
      block = doc.createElement("div");
      block.setAttribute("data-template-notes-block", "true");
      block.setAttribute("contenteditable", "false");
      block.setAttribute("style", "margin-top:32px;");
      block.innerHTML =
        '<div style="font-size:18px;font-weight:bold;">NOTE</div>' +
        '<div data-template-notes-content="true" style="line-height:1.9;color:#6a6a6a;"></div>';
      anchor.after(block);
    }

    const content = block.querySelector(NOTES_CONTENT_SELECTOR);
    if (!content) return;
    content.textContent = "";
    value.split(/\r?\n/).forEach((line, i) => {
      if (i > 0) content.appendChild(doc.createElement("br"));
      content.appendChild(doc.createTextNode(line));
    });
  };

  // Updates the live preview in place (no iframe reload), so any unsaved
  // inline edits made directly on the template are kept.
  const handleNotesChange = (value: string) => {
    notesTextRef.current = value;
    setNotesText(value);
    const doc = iframeRef.current?.contentDocument;
    if (doc) syncNotesBlock(doc, value);
  };

  // "Edit Link" modal state — opened when the user clicks a link/button
  // (URL) or a phone number (tel:) inside the preview.
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkEditId, setLinkEditId] = useState<string>("");
  const [linkType, setLinkType] = useState<"url" | "email">("url");
  const [linkValue, setLinkValue] = useState<string>("");
  const [linkText, setLinkText] = useState<string>("");
  const [linkOriginalText, setLinkOriginalText] = useState<string>("");

  // The Leela DISCOVERY card's CTA link is a merge tag ({{discovery_cta_href}})
  // whose real destination is decided per-email by the backend based on
  // membership status — so instead of one URL field, it needs a separate
  // URL for each state. Those two URLs are stored as data-join-href /
  // data-login-href attributes on the anchor itself (read by the backend
  // at send time), edited here via tabs instead of the plain URL field.
  const [linkIsDiscoveryCta, setLinkIsDiscoveryCta] = useState(false);
  const [discoveryJoinUrl, setDiscoveryJoinUrl] = useState<string>("");
  const [discoveryLoginUrl, setDiscoveryLoginUrl] = useState<string>("");

  // "Edit Image" modal state — opened when the user clicks a logo, banner,
  // or thumbnail image (that isn't already part of a link) in the preview.
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageEditId, setImageEditId] = useState<string>("");
  const [imageSrc, setImageSrc] = useState<string>("");
  const [imageUploading, setImageUploading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<{ fileId: string; name: string; url: string }[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  // Load the Drive gallery each time the modal opens, so newly uploaded
  // images (including the one just uploaded in this same session) show up
  // for reuse instead of triggering a duplicate upload.
  useEffect(() => {
    if (!imageModalOpen) return;
    setGalleryLoading(true);
    listImageGalleryService()
      .then(setGalleryImages)
      .catch((err) => message.error(err.message || "Failed to load gallery"))
      .finally(() => setGalleryLoading(false));
  }, [imageModalOpen]);

  // Merge tags that stay directly editable in the preview even though
  // every other {{tag}} is frozen (see freezeMergeTags below) — these two
  // are effectively free-text signature fields, not data pulled from the
  // parsed PDF, so editing them in place is safe.
  const EDITABLE_MERGE_TAGS = new Set(["manager_name", "manager_title"]);
  const MERGE_TAG_REGEX = /\{\{\s*([\w.]+)\s*\}\}/g;

  // Wraps every {{merge_tag}} text occurrence (other than the exceptions
  // above) in a contenteditable="false" span. Nested contenteditable="false"
  // elements are the standard way to create non-editable "islands" inside
  // a designMode/contentEditable region — the browser won't place a caret
  // inside them or let their text be altered, while everything else in the
  // document stays freely editable.
  const freezeMergeTags = (doc: Document) => {
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (MERGE_TAG_REGEX.test(node.nodeValue || "")) textNodes.push(node as Text);
      MERGE_TAG_REGEX.lastIndex = 0;
    }

    textNodes.forEach((textNode) => {
      const text = textNode.nodeValue || "";
      const frag = doc.createDocumentFragment();
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      MERGE_TAG_REGEX.lastIndex = 0;
      while ((match = MERGE_TAG_REGEX.exec(text))) {
        const [full, key] = match;
        if (match.index > lastIndex) {
          frag.appendChild(doc.createTextNode(text.slice(lastIndex, match.index)));
        }
        if (EDITABLE_MERGE_TAGS.has(key)) {
          frag.appendChild(doc.createTextNode(full));
        } else {
          const span = doc.createElement("span");
          span.setAttribute("contenteditable", "false");
          span.setAttribute("data-merge-tag", key);
          span.textContent = full;
          frag.appendChild(span);
        }
        lastIndex = match.index + full.length;
      }
      if (lastIndex < text.length) {
        frag.appendChild(doc.createTextNode(text.slice(lastIndex)));
      }
      textNode.parentNode?.replaceChild(frag, textNode);
    });
  };

  // Reads back whatever the user has typed directly into the preview.
  // Works on a detached clone so editor-only affordances — the frozen
  // merge-tag spans and the injected hover-style <style> tag — are
  // stripped out for the saved/exported HTML, without disturbing the
  // live, still-frozen/hover-styled preview.
  const captureIframeHtml = (): string => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return editHtml;
    const clone = doc.documentElement.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("span[data-merge-tag]").forEach((span) => {
      span.replaceWith(span.textContent || "");
    });
    clone.querySelectorAll("[data-studio-only]").forEach((el) => el.remove());
    return `<!DOCTYPE html>\n${clone.outerHTML}`;
  };

  // Visually distinguishes, on hover, what a click will actually do —
  // otherwise a rendered email template gives no clue which parts are
  // plain editable text versus a link/image/frozen field with its own
  // modal. Injected once per fresh iframe document.
  const injectHoverStyles = (doc: Document) => {
    const style = doc.createElement("style");
    style.setAttribute("data-studio-only", "true");
    style.textContent = `
      a:hover { outline: 2px dashed #1890ff; outline-offset: 2px; cursor: pointer !important; background: rgba(24,144,255,0.06); }
      img:hover { outline: 2px dashed #52c41a; outline-offset: 2px; cursor: pointer !important; }
      a:hover img { outline: 2px dashed #1890ff; }
      [data-merge-tag]:hover { outline: 2px dashed #bfbfbf; cursor: not-allowed !important; background: rgba(0,0,0,0.05); }
      [data-template-notes-block]:hover { outline: 2px dashed #bfbfbf; outline-offset: 4px; cursor: not-allowed !important; background: rgba(0,0,0,0.03); }
      [data-template-notes-block] *:hover { outline: none !important; background: transparent !important; cursor: not-allowed !important; }
      p:hover, h1:hover, h2:hover, h3:hover, h4:hover, li:hover, span:hover:not([data-merge-tag]) {
        outline: 1px dashed rgba(24,144,255,0.35);
        outline-offset: 2px;
        background: rgba(24,144,255,0.05);
        cursor: text;
      }
      ${isPropertyOperator ? `
      [data-locked-section] { cursor: not-allowed !important; }
      [data-locked-section]:hover {
        outline: 2px dashed #bfbfbf !important;
        outline-offset: 2px;
        background: rgba(0,0,0,0.04) !important;
        cursor: not-allowed !important;
      }
      [data-locked-section] *:hover { outline: none !important; background: transparent !important; cursor: not-allowed !important; }
      ` : ""}
    `;
    doc.head.appendChild(style);
  };

  // Makes the rendered preview directly editable in place, and intercepts
  // clicks on links/phone numbers to open an "Edit Link" modal instead of
  // just letting the user type over them (which would lose the href).
  //
  // The iframe itself fills a fixed-size box (see JSX below) and scrolls
  // internally via its own native scrollbar for content taller than that —
  // this is standard iframe behavior and doesn't depend on getting flexbox
  // sizing right in every ancestor, unlike trying to resize the iframe to
  // match content and scroll the outer page.
  const enableInlineEditing = () => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    try {
      doc.designMode = "on";
    } catch {
      // Some browsers may restrict this on cross-origin/srcDoc edge cases; ignore.
    }

    freezeMergeTags(doc);
    syncNotesBlock(doc, notesTextRef.current);

    // Corporate-standard sections (marked data-locked-section in the
    // template HTML — the greeting/intro paragraph, the Discovery
    // programme description) stay visible but read-only for property
    // operators; admins/superadmin keep full inline-edit access to them.
    // Enforced again server-side on save, so this is a UI convenience, not
    // the only guard.
    if (isPropertyOperator) {
      doc.querySelectorAll("[data-locked-section]").forEach((el) => {
        el.setAttribute("contenteditable", "false");
      });
    }

    if ((doc as any).__linkHandlerAttached) return;
    (doc as any).__linkHandlerAttached = true;

    injectHoverStyles(doc);

    // Prevent designMode from placing a text caret / resize handles inside
    // the link or image on mousedown.
    doc.addEventListener("mousedown", (e) => {
      const t = e.target as HTMLElement;
      if (t?.closest("a") || t?.closest("img")) {
        e.preventDefault();
      }
    }, true);

    doc.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      const img = target.closest("img") as HTMLImageElement | null;

      // An <img> that isn't wrapped in a link (logo/banner/thumbnail) gets
      // its own "Edit Image" modal. Images inside a link (e.g. social
      // icons) fall through to the link modal below.
      if (img && !anchor) {
        e.preventDefault();
        e.stopPropagation();

        if (!img.dataset.editId) {
          img.dataset.editId = `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        }
        setImageEditId(img.dataset.editId);
        setImageSrc(img.getAttribute("src") || "");
        setImageModalOpen(true);
        return;
      }

      if (!anchor) return;
      e.preventDefault();
      e.stopPropagation();

      if (!anchor.dataset.editId) {
        anchor.dataset.editId = `link-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      }
      const href = anchor.getAttribute("href") || "";
      const hrefLower = href.trim().toLowerCase();
      const isTel = hrefLower.startsWith("tel:");
      const isMailto = hrefLower.startsWith("mailto:");
      const text = anchor.textContent || "";
      // Buttons like "CONTACT ME" are always meant to open an email, even
      // before they've been pointed at a real mailto: link (their href is
      // still just the "#" placeholder at that point) — recognize them by
      // their label so the modal goes straight to an email-only form.
      const looksLikeContact = !isTel && /contact/i.test(text);

      // Just one generic "url" field for everything else (including
      // existing tel: links, shown with their scheme intact — no separate
      // Website URL / Phone Number toggle).
      const type: "url" | "email" = isMailto || looksLikeContact ? "email" : "url";

      const rawValue = type === "email" ? href.replace(/^mailto:/i, "") : href;

      // Leela DISCOVERY CTA — its href is always the {{discovery_cta_href}}
      // merge tag, resolved per-email by the backend. Give it its own
      // tabbed Join/Login URL editor instead of the plain URL field.
      const isDiscoveryCta = href.trim() === "{{discovery_cta_href}}";
      setLinkIsDiscoveryCta(isDiscoveryCta);
      if (isDiscoveryCta) {
        setDiscoveryJoinUrl(anchor.getAttribute("data-join-href") || "https://www.theleela.com/discovery/enroll");
        setDiscoveryLoginUrl(anchor.getAttribute("data-login-href") || "https://www.theleela.com/discovery/login");
      }

      setLinkEditId(anchor.dataset.editId);
      setLinkType(type);
      setLinkValue(rawValue === "#" ? "" : rawValue);
      setLinkText(text);
      setLinkOriginalText(text);
      setLinkModalOpen(true);
    }, true);
  };

  const handleImageSave = () => {
    const doc = iframeRef.current?.contentDocument;
    const el = doc?.querySelector(`[data-edit-id="${imageEditId}"]`) as HTMLImageElement | null;
    if (el && imageSrc.trim()) {
      el.setAttribute("src", imageSrc.trim());
    }
    setImageModalOpen(false);
  };

  const handleLinkSave = () => {
    const doc = iframeRef.current?.contentDocument;
    const el = doc?.querySelector(`[data-edit-id="${linkEditId}"]`) as HTMLAnchorElement | null;
    if (el && linkIsDiscoveryCta) {
      // href/text stay as the merge tags ({{discovery_cta_href}} /
      // {{discovery_cta_text}}) — only the two per-state destination URLs
      // change, stored as data attributes the backend reads at send time.
      el.setAttribute("data-join-href", discoveryJoinUrl.trim());
      el.setAttribute("data-login-href", discoveryLoginUrl.trim());
      setLinkModalOpen(false);
      return;
    }
    if (el) {
      const trimmedValue = linkValue.trim();
      const finalHref = !trimmedValue
        // An empty field (e.g. the user opened a still-unconfigured "#"
        // button and saved without typing a URL) must fall back to a safe
        // placeholder — otherwise this produces a bare "https://" with no
        // domain, which Outlook's renderer displays as literal visible
        // text glued onto the button label instead of a normal, silent
        // placeholder link.
        ? "#"
        : linkType === "email"
        ? `mailto:${trimmedValue.replace(/^mailto:/i, "")}`
        // Generic scheme detection (http:, https:, tel:, mailto:, #, ...)
        // so an existing tel: link (or anything else with an explicit
        // scheme) round-trips untouched; a bare domain gets https://.
        : /^[a-z][a-z0-9+.-]*:|^#/i.test(trimmedValue)
        ? trimmedValue
        : `https://${trimmedValue}`;
      el.setAttribute("href", finalHref);
      if (linkText !== linkOriginalText) {
        el.textContent = linkText;
      }
    }
    setLinkModalOpen(false);
  };

  // Handle Creation of New Template
  const handleCreateNew = async () => {
    if (!newTemplate.name || !newTemplate.title) {
      return message.warning("Name and Title are required");
    }
    try {
      setLoading(true);
      await saveTemplateService(newTemplate);
      message.success("New template created!");
      setIsCreateModalOpen(false);
      await fetchTemplates(); // Refresh list
      setSelectedKey(newTemplate.name); // Switch to new one
    } catch (err: any) {
      message.error(err.message || "Creation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExisting = async () => {
    if (!currentTemplate) return;
    // Pick up any content the user typed directly into the preview before saving.
    const latestHtml = captureIframeHtml();
    try {
      await saveTemplateService({ ...currentTemplate, html: latestHtml });
      message.success("Changes saved successfully");
      // Update local state to reflect changes in preview
      setEditHtml(latestHtml);
      setTemplates(prev => prev.map(t => t.name === selectedKey ? { ...t, html: latestHtml } : t));
    } catch (err: any) {
      message.error(err.message || "Save failed");
    }
  };

  const openInNewTab = () => {
    const latestHtml = captureIframeHtml();
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(latestHtml);
      newWindow.document.close();
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", width: "100%" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ height: "100%", width: "100%", minHeight: 0, background: "#f8f9fa", overflowY: isMobile ? "auto" : "hidden" }}>
      {/* MODERN HEADER */}
      <Header style={{
        background: "#fff",
        padding: isMobile ? "12px 16px" : "0 24px",
        height: isMobile ? "auto" : "64px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: isMobile ? 12 : 0,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        zIndex: 10
      }}>
        <Space size="large" wrap style={{ width: isMobile ? "100%" : "auto" }}>
          <Title
            level={5}
            style={{
              margin: 0,
              whiteSpace: "nowrap",
              fontWeight: 700,
              background: "linear-gradient(135deg, #f0913a 0%, #e0701f 45%, #c9973f 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Email Template Studio
          </Title>
          <Select
            value={selectedKey}
            onChange={(val) => setSelectedKey(val)}
            style={{ width: isMobile ? "100%" : 280, minWidth: isMobile ? 200 : undefined }}
            placeholder="Select a template"
            options={templates.map((t) => ({ value: t.name, label: t.title }))}
          />
          {isSuperAdmin && (
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create New
            </Button>
          )}
        </Space>

        <Space wrap style={{ width: isMobile ? "100%" : "auto" }}>
          <Button icon={<EyeOutlined />} onClick={openInNewTab}>Browser Preview</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveExisting}>
            Save Changes
          </Button>
        </Space>
      </Header>

      {(() => {
        // Extracted so mobile can render these in plain stacked <div>s
        // (normal document flow) instead of nesting antd's Layout/Sider
        // inside another dynamically-flex-directioned Layout, which was
        // collapsing the preview to near-zero width on mobile — flexbox
        // "stretch" sizing across two nested column-direction containers
        // doesn't propagate reliably here.
        const previewCanvas = (
          <>
            <div style={{ width: isMobile ? "100%" : "920px", marginBottom: "12px", flexShrink: 0, boxSizing: "border-box" }}>
              <Text type="secondary">
                <EditOutlined /> Click directly into the text below to edit it. <LinkOutlined /> Click a link or phone number to change its destination. <PictureOutlined /> Click a logo, banner, or thumbnail to swap its image. Then hit "Save Changes".
              </Text>
            </div>
            <div style={{
              width: isMobile ? "100%" : "920px",
              flex: isMobile ? "0 0 auto" : 1,
              height: isMobile ? "70vh" : undefined,
              minHeight: isMobile ? 320 : 0,
              boxSizing: "border-box",
              background: "#fff",
              borderRadius: "8px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
              overflow: "hidden"
            }}>
              {/* Fixed-size box; the iframe fills it and scrolls internally via
                 its own native scrollbar for content taller than the box
                 (e.g. to reach the footer), rather than the outer page scrolling. */}
              <iframe
                ref={iframeRef}
                key={selectedKey + editHtml.length} // Force refresh on change
                title="Preview"
                srcDoc={editHtml}
                onLoad={enableInlineEditing}
                style={{ width: "100%", height: "100%", border: "none", display: "block" }}
              />
            </div>
          </>
        );

        const infoSidebar = (
          <>
            <Card size="small" title="Template Info" bordered={false}>
              <Text type="secondary">Internal Name:</Text>
              <p><strong>{currentTemplate?.name}</strong></p>
              <Divider style={{ margin: "12px 0" }} />
              <Text type="secondary">Property:</Text>
              <p>
                {currentTemplate?.property_name
                  ? `${currentTemplate.property_name} (${currentTemplate.property_code})`
                  : "Not property-specific"}
              </p>
              <Divider style={{ margin: "12px 0" }} />
              <Text type="secondary">Subject Line:</Text>
              <p>{currentTemplate?.subject || "No subject set"}</p>
            </Card>

            <Card size="small" title="Note" bordered={false} style={{ marginTop: 16 }}>
              <Text type="secondary">Appears below the Policies section of the template. Leave empty to hide it.</Text>
              <TextArea
                aria-label="Template notes"
                placeholder="Enter notes to include below Policies"
                value={notesText}
                onChange={(e) => handleNotesChange(e.target.value)}
                autoSize={{ minRows: 4, maxRows: 10 }}
                style={{ marginTop: 10 }}
              />
              {notesAnchorMissing && (
                <Text type="warning" style={{ display: "block", marginTop: 8, fontSize: 12 }}>
                  This template has no {"{{policiesBlock}}"} section, so notes can't be placed.
                </Text>
              )}
            </Card>

            {isSuperAdmin && (
              <Button
                block
                type="primary"
                size="middle"
                icon={<CodeOutlined />}
                style={{ marginTop: "20px" }}
                onClick={() => {
                  // Sync the modal with whatever was just edited inline on the preview.
                  setEditHtml(captureIframeHtml());
                  setIsEditModalOpen(true);
                }}
              >
                Edit Source Code
              </Button>
            )}
          </>
        );

        if (isMobile) {
          return (
            <div style={{ width: "100%", boxSizing: "border-box" }}>
              <div style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}>
                {previewCanvas}
              </div>
              <div style={{ width: "100%", boxSizing: "border-box", borderTop: "1px solid #f0f0f0", padding: "20px" }}>
                {infoSidebar}
              </div>
            </div>
          );
        }

        return (
          <Layout style={{ height: "calc(100% - 64px)", minHeight: 0 }}>
            <Content style={{ padding: "30px", minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center" }}>
              {previewCanvas}
            </Content>
            <Sider width={300} theme="light" style={{ borderLeft: "1px solid #f0f0f0", padding: "20px" }}>
              {infoSidebar}
            </Sider>
          </Layout>
        );
      })()}

      {/* MODAL: CREATE NEW TEMPLATE */}
      <Modal
        title="Create New Email Template"
        open={isCreateModalOpen}
        onOk={handleCreateNew}
        onCancel={() => setIsCreateModalOpen(false)}
        okText="Create & Edit"
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Property (optional)</Text>
            <Select
              allowClear
              placeholder="Not property-specific"
              style={{ width: '100%' }}
              value={newTemplate.property_code || undefined}
              options={PROPERTY_OPTIONS.map((p) => ({ value: p.code, label: `${p.name} (${p.code})` }))}
              onChange={(code) => applyPropertyAndVariant(code)}
              onClear={() => setNewTemplate((prev) => ({ ...prev, property_code: undefined, property_name: undefined }))}
            />
          </div>
          {newTemplate.property_code && (
            <div>
              <Text strong>Variant</Text>
              <div style={{ marginTop: 6 }}>
                <Radio.Group
                  value={newVariant}
                  onChange={(e) => {
                    setNewVariant(e.target.value);
                    applyPropertyAndVariant(newTemplate.property_code, e.target.value);
                  }}
                >
                  {PROPERTY_VARIANTS.map((v) => (
                    <Radio.Button key={v.value} value={v.value}>{v.label}</Radio.Button>
                  ))}
                </Radio.Group>
              </div>
            </div>
          )}
          <div>
            <Text strong>Internal Unique Name</Text>
            <Input
              placeholder="e.g., booking_confirmation_2024"
              value={newTemplate.name}
              onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
            />
          </div>
          <div>
            <Text strong>Display Title</Text>
            <Input 
              placeholder="e.g., Guest Booking Template" 
              value={newTemplate.title}
              onChange={e => setNewTemplate({...newTemplate, title: e.target.value})}
            />
          </div>
          <div>
            <Text strong>Email Subject</Text>
            <Input 
              placeholder="The subject line the user sees" 
              value={newTemplate.subject}
              onChange={e => setNewTemplate({...newTemplate, subject: e.target.value})}
            />
          </div>
        </Space>
      </Modal>

      {/* MODAL: SOURCE CODE EDITOR */}
      <Modal
        title={<span><CodeOutlined /> Editing: {currentTemplate?.title}</span>}
        open={isEditModalOpen}
        onOk={() => {
            // Update the preview instantly
            setTemplates(prev => prev.map(t => t.name === selectedKey ? { ...t, html: editHtml } : t));
            setIsEditModalOpen(false);
        }}
        onCancel={() => setIsEditModalOpen(false)}
        width={1100}
        okText="Update Preview"
        centered
      >
        <TextArea
          value={editHtml}
          onChange={(e) => setEditHtml(e.target.value)}
          rows={25}
          spellCheck={false}
          style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: "13px",
            background: "#1e1e1e",
            color: "#d4d4d4",
            borderRadius: "8px",
            padding: "20px"
          }}
        />
      </Modal>

      {/* MODAL: EDIT LINK / PHONE NUMBER */}
      <Modal
        title={<span><LinkOutlined /> Edit Link</span>}
        open={linkModalOpen}
        onOk={handleLinkSave}
        onCancel={() => setLinkModalOpen(false)}
        okText="Save Link"
      >
        {linkIsDiscoveryCta ? (
          // Leela DISCOVERY CTA: separate destination URLs for a guest who
          // isn't enrolled yet (Join Now) vs. one who already is (Login) —
          // the backend picks the right one per email; text/href here stay
          // as merge tags.
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Text type="secondary">
              This button's label and link automatically switch based on whether the guest already has a Leela DISCOVERY membership. Set the destination for each case below.
            </Text>
            <Tabs
              items={[
                {
                  key: "join",
                  label: "Join Now",
                  children: (
                    <div>
                      <Text strong>URL for guests without a membership</Text>
                      <Input
                        placeholder="e.g. https://www.theleela.com/discovery/enroll"
                        value={discoveryJoinUrl}
                        onChange={(e) => setDiscoveryJoinUrl(e.target.value)}
                      />
                    </div>
                  ),
                },
                {
                  key: "login",
                  label: "Login",
                  children: (
                    <div>
                      <Text strong>URL for guests who already have a membership</Text>
                      <Input
                        placeholder="e.g. https://www.theleela.com/discovery/login"
                        value={discoveryLoginUrl}
                        onChange={(e) => setDiscoveryLoginUrl(e.target.value)}
                      />
                    </div>
                  ),
                },
              ]}
            />
          </Space>
        ) : linkType === "email" ? (
          // Contact-style buttons (e.g. "CONTACT ME") are always meant to
          // open an email, so skip the link-type choice entirely — but the
          // button's visible label should still be editable here too.
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <div>
              <Text strong>Email Address</Text>
              <Input
                type="email"
                placeholder="e.g. reservations@theleela.com"
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
              />
            </div>
            <div>
              <Text strong>Link Text</Text>
              <Input
                placeholder="e.g. CONTACT ME"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
            </div>
          </Space>
        ) : (
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <div>
              <Text strong>URL</Text>
              <Input
                placeholder="e.g. https://www.theleela.com/directions"
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
              />
            </div>
            <div>
              <Text strong>Link Text</Text>
              <Input
                placeholder="e.g. HOTEL DIRECTIONS"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
            </div>
          </Space>
        )}
      </Modal>

      {/* MODAL: EDIT IMAGE (logo / banner / thumbnail) */}
      <Modal
        title={<span><PictureOutlined /> Edit Image</span>}
        open={imageModalOpen}
        onOk={handleImageSave}
        onCancel={() => setImageModalOpen(false)}
        okText="Save Image"
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <div>
            <Upload
              showUploadList={false}
              accept="image/*"
              beforeUpload={(file) => {
                // The backend auto-compresses anything over 4MB down to
                // size (see compressImage.ts) rather than rejecting it, but
                // that does mean trading some quality/dimensions for size —
                // so an oversized file needs the user's OK before that
                // happens instead of silently mangling their upload.
                const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
                if (file.size <= MAX_UPLOAD_BYTES) return true;

                return new Promise<boolean | typeof Upload.LIST_IGNORE>((resolve) => {
                  Modal.confirm({
                    title: "Image is larger than 4MB",
                    content: `This image is ${(file.size / (1024 * 1024)).toFixed(1)}MB. It will be automatically compressed to fit under 4MB, keeping its original dimensions where possible. Continue?`,
                    okText: "Reduce and upload",
                    cancelText: "Cancel",
                    onOk: () => resolve(true),
                    onCancel: () => resolve(Upload.LIST_IGNORE),
                  });
                });
              }}
              customRequest={async (options) => {
                const { file, onSuccess, onError } = options;
                setImageUploading(true);
                try {
                  const result = await uploadImageService(file as File);
                  setImageSrc(result.url);
                  // Show it in the gallery immediately, without waiting on a refetch.
                  setGalleryImages((prev) => [
                    { fileId: result.fileId, name: (file as File).name, url: result.url },
                    ...prev,
                  ]);
                  if (result.compression?.wasCompressed) {
                    const { originalBytes, finalBytes, resized, quality, width, height } = result.compression;
                    const toMB = (b: number) => (b / (1024 * 1024)).toFixed(1);
                    message.success(
                      `Image uploaded — compressed from ${toMB(originalBytes)}MB to ${toMB(finalBytes)}MB` +
                        (resized ? ` (resized to ${width}×${height}, quality ${quality}%)` : ` (quality ${quality}%, dimensions kept)`)
                    );
                  } else {
                    message.success("Image uploaded to Google Drive");
                  }
                  onSuccess?.(result);
                } catch (err: any) {
                  message.error(err.message || "Upload failed");
                  onError?.(err);
                } finally {
                  setImageUploading(false);
                }
              }}
            >
              <Button icon={<UploadOutlined />} loading={imageUploading} block>
                {imageUploading ? "Uploading..." : "Upload from your computer"}
              </Button>
            </Upload>
          </div>

          <div>
            <Text strong>Or choose from gallery</Text>
            <div
              style={{
                marginTop: 6,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                gap: 8,
                maxHeight: 220,
                overflowY: "auto",
                border: "1px solid #f0f0f0",
                borderRadius: 8,
                padding: 8,
              }}
            >
              {galleryLoading && <Spin size="small" />}
              {!galleryLoading && galleryImages.length === 0 && (
                <Text type="secondary" style={{ fontSize: 12 }}>No images uploaded yet.</Text>
              )}
              {galleryImages.map((img) => (
                <div
                  key={img.fileId}
                  onClick={() => setImageSrc(img.url)}
                  title={img.name}
                  style={{
                    cursor: "pointer",
                    border: imageSrc === img.url ? "2px solid #1890ff" : "1px solid #f0f0f0",
                    borderRadius: 6,
                    padding: 2,
                    height: 70,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    // lh3.googleusercontent.com rate-limits (429) requests
                    // that carry a Referer header, which browsers send by
                    // default for <img> tags but curl doesn't — hence why
                    // this worked in manual API testing but not on-screen.
                    referrerPolicy="no-referrer"
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {imageSrc.trim() && (
            <div>
              <Text strong>Selected</Text>
              <div style={{ marginTop: 6, border: "1px solid #f0f0f0", borderRadius: 8, padding: 8, textAlign: "center" }}>
                <img
                  src={imageSrc}
                  referrerPolicy="no-referrer"
                  style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain" }}
                />
              </div>
            </div>
          )}
        </Space>
      </Modal>
    </Layout>
  );
};

export default ModernEmailEditor;
