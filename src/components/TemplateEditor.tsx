

import React, { useEffect, useState, useRef } from "react";
import { EmailEditor, type EditorRef } from "react-email-editor";
import { Button, message, Select, Spin } from "antd";
import {
  getAllTemplatesService,
  saveTemplateService,
} from "../services/emailTemplateServices";
import "../css/EmailEditor.css";
// import { Width } from "easy-email-extensions";

type Template = {
  id: number;
  name: string;
  title: string;
  subject?: string;
  design: any; // Unlayer uses a JSON 'design' object
  html: string;
};

const TemplateEditor: React.FC = () => {
 const emailEditorRef = useRef<EditorRef>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [loading, setLoading] = useState(true);
  console.log({templates})
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await getAllTemplatesService();
       
        const templateData = response || [];
        setTemplates(templateData);
        
        if (templateData.length > 0) {
          setSelectedKey(templateData[0].name);
        }
      } catch (err) {
        message.error("Failed to load templates");
      } finally {
        setLoading(false);
      }
    };
    loadTemplates();
  }, []);

 
const onEditorLoad = () => {
  const selected = templates.find((t) => t.name === selectedKey);

  if (selected && emailEditorRef.current?.editor) {
    emailEditorRef.current.editor.loadDesign({
      body: {
        values: {
          backgroundColor: "#ddd", // The blue frame background
          contentWidth: "900px",      // Forces the white area to 900px
        },
        rows: [
          {
            cells: [1],
            columns: [
              {
                values: {
                  padding: "0px",
                  backgroundColor: "#ffffff",
                },
                contents: [
                  {
                    type: "html",
                    values: {
                      // We wrap the HTML in a div that stops the sidebar from shrinking
                      html: `
                        <div style="width: 900px; margin: 0 auto; min-width: 900px;">
                          ${selected.html}
                        </div>
                      `,
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    });
  }
};
const handleSave = () => {
    const unlayer = emailEditorRef.current?.editor;
    unlayer?.exportHtml(async (data:any) => {
      const { design, html } = data;
      const selected = templates.find((t) => t.name === selectedKey);

      try {
        await saveTemplateService({
          name: selectedKey,
          title: selected?.title || "Template",
          subject: selected?.subject,
          html: html, 
          design: design,
        });
        message.success("Template updated!");
      } catch (err: any) {
        message.error("Save failed");
      }
    });
  };
  if (loading) return <Spin size="large" />;

  return (
    <div className="email-container" style={{ height:"auto", display: "flex", flexDirection: "column" }}>
     <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
        <Select
          value={selectedKey}
          onChange={(val) => setSelectedKey(val)}
          style={{ width: 300 }}
          options={templates.map((t) => ({ value: t.name, label: t.title }))}
        />
        <Button type="primary" onClick={handleSave}>Save Changes</Button>
      </div>

      <div >
  {EmailEditor ? (
  
<div   style={{ flex: 1,  }}>
  <EmailEditor
    ref={emailEditorRef}
    onLoad={onEditorLoad}
    minHeight="calc(100vh - 60px)"
    style={{ width: "" }}
  />
</div>

  ) : (
    <p>Loading Editor...</p>
  )}
</div>
<style>
  {
    `
   
.email-container .unlayer-editor {
  min-width: 1000px !important; 
  overflow-x: auto !important;
}


.email-editor-wrapper {
  width: 100%;
  overflow-x: auto;
  background-color: #f4f4f4;
}
    
    `
  }
</style>
    </div>
  );
};

export default TemplateEditor;