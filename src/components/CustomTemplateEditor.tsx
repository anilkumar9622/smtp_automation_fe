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
import { Button, Select, message, Spin, Modal, Input, Layout, Space, Divider, Typography, Card, Radio } from "antd";
import { PlusOutlined, CodeOutlined, EyeOutlined, SaveOutlined, EditOutlined, LinkOutlined, PictureOutlined } from "@ant-design/icons";
import { getAllTemplatesService, saveTemplateService } from "../services/emailTemplateServices";

const { Header, Content, Sider } = Layout;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface Template {
  id?: number;
  name: string;
  title: string;
  subject?: string;
  html: string;
}

const ModernEmailEditor: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  
  // Modals State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  
  // Editor & New Template State
  const [editHtml, setEditHtml] = useState<string>("");
  const [newTemplate, setNewTemplate] = useState<Template>({
    name: "",
    title: "",
    subject: "",
    html: "<html><body><h1>New Template</h1></body></html>"
  });

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

  useEffect(() => {
    if (currentTemplate) setEditHtml(currentTemplate.html);
  }, [currentTemplate]);

  // Ref to the live preview iframe, used to read/write the content the user
  // edits directly on the rendered template (instead of only via raw HTML).
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // "Edit Link" modal state — opened when the user clicks a link/button
  // (URL) or a phone number (tel:) inside the preview.
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkEditId, setLinkEditId] = useState<string>("");
  const [linkType, setLinkType] = useState<"url" | "tel">("url");
  const [linkValue, setLinkValue] = useState<string>("");
  const [linkText, setLinkText] = useState<string>("");
  const [linkOriginalText, setLinkOriginalText] = useState<string>("");

  // "Edit Image" modal state — opened when the user clicks a logo, banner,
  // or thumbnail image (that isn't already part of a link) in the preview.
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageEditId, setImageEditId] = useState<string>("");
  const [imageSrc, setImageSrc] = useState<string>("");
  const [imageAlt, setImageAlt] = useState<string>("");

  // Reads back whatever the user has typed directly into the preview.
  const captureIframeHtml = (): string => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return editHtml;
    return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
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

    if ((doc as any).__linkHandlerAttached) return;
    (doc as any).__linkHandlerAttached = true;

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
        setImageAlt(img.getAttribute("alt") || "");
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
      const isTel = href.trim().toLowerCase().startsWith("tel:");
      const text = anchor.textContent || "";

      setLinkEditId(anchor.dataset.editId);
      setLinkType(isTel ? "tel" : "url");
      setLinkValue(isTel ? href.slice(4) : href);
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
      el.setAttribute("alt", imageAlt);
    }
    setImageModalOpen(false);
  };

  const handleLinkSave = () => {
    const doc = iframeRef.current?.contentDocument;
    const el = doc?.querySelector(`[data-edit-id="${linkEditId}"]`) as HTMLAnchorElement | null;
    if (el) {
      const finalHref =
        linkType === "tel"
          ? `tel:${linkValue.replace(/[^\d+]/g, "")}`
          : /^(https?:\/\/|mailto:|#)/i.test(linkValue.trim())
          ? linkValue.trim()
          : `https://${linkValue.trim()}`;
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

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <Layout style={{ height: "100%", minHeight: 0, background: "#f8f9fa" }}>
      {/* MODERN HEADER */}
      <Header style={{ 
        background: "#fff", 
        padding: "0 24px", 
        height: "64px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        zIndex: 10
      }}>
        <Space size="large">
          <Title level={4} style={{ margin: 0, color: "#1890ff" }}>Email Studio</Title>
          <Select
            value={selectedKey}
            onChange={(val) => setSelectedKey(val)}
            style={{ width: 280 }}
            placeholder="Select a template"
            options={templates.map((t) => ({ value: t.name, label: t.title }))}
          />
          <Button 
            type="dashed" 
            icon={<PlusOutlined />} 
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create New
          </Button>
        </Space>

        <Space>
          <Button icon={<EyeOutlined />} onClick={openInNewTab}>Browser Preview</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveExisting}>
            Save Changes
          </Button>
        </Space>
      </Header>

      <Layout style={{ height: "calc(100% - 64px)", minHeight: 0 }}>
        {/* PREVIEW CANVAS */}
        <Content style={{ padding: "30px", minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "920px", minWidth: "920px", marginBottom: "12px", flexShrink: 0 }}>
            <Text type="secondary">
              <EditOutlined /> Click directly into the text below to edit it. <LinkOutlined /> Click a link or phone number to change its destination. <PictureOutlined /> Click a logo, banner, or thumbnail to swap its image. Then hit "Save Changes".
            </Text>
          </div>
          <div style={{
            width: "920px",
            minWidth: "920px",
            flex: 1,
            minHeight: 0,
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
        </Content>

        {/* INFO SIDEBAR */}
        <Sider width={300} theme="light" style={{ borderLeft: "1px solid #f0f0f0", padding: "20px" }}>
          <Card size="small" title="Template Info" bordered={false}>
            <Text type="secondary">Internal Name:</Text>
            <p><strong>{currentTemplate?.name}</strong></p>
            <Divider style={{ margin: "12px 0" }} />
            <Text type="secondary">Subject Line:</Text>
            <p>{currentTemplate?.subject || "No subject set"}</p>
          </Card>

          {/* <Button
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
          </Button> */}
        </Sider>
      </Layout>

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
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <div>
            <Text strong>Link Type</Text>
            <div style={{ marginTop: 6 }}>
              <Radio.Group value={linkType} onChange={(e) => setLinkType(e.target.value)}>
                <Radio.Button value="url">Website URL</Radio.Button>
                <Radio.Button value="tel">Phone Number</Radio.Button>
              </Radio.Group>
            </div>
          </div>
          <div>
            <Text strong>{linkType === "tel" ? "Phone Number" : "URL"}</Text>
            <Input
              placeholder={linkType === "tel" ? "e.g. +91 98765 43210" : "e.g. https://www.theleela.com/directions"}
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
            <Text strong>Image URL</Text>
            <Input
              placeholder="e.g. https://i.postimg.cc/xxxxx/new-image.jpg"
              value={imageSrc}
              onChange={(e) => setImageSrc(e.target.value)}
            />
          </div>
          <div>
            <Text strong>Alt Text</Text>
            <Input
              placeholder="Short description of the image"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
            />
          </div>
          {imageSrc.trim() && (
            <div>
              <Text strong>Preview</Text>
              <div style={{ marginTop: 6, border: "1px solid #f0f0f0", borderRadius: 8, padding: 8, textAlign: "center" }}>
                <img
                  src={imageSrc}
                  alt={imageAlt}
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