import React, { useEffect, useState, useMemo } from "react";
import { Button, message, Select, Spin } from "antd";
import { BlockManager, BasicType, AdvancedType, JsonToMjml } from "easy-email-core";
import { EmailEditor, EmailEditorProvider } from "easy-email-editor";
// ✅ Fix 1: Use type-only imports for interfaces/types
import type { IEmailTemplate } from "easy-email-editor";
import { StandardLayout } from "easy-email-extensions";
import type { ExtensionProps } from "easy-email-extensions";

import mjml from "mjml-browser";

// CSS Imports
import "easy-email-editor/lib/style.css";
import "easy-email-extensions/lib/style.css";
import "@arco-themes/react-easy-email-theme/css/arco.css";

import {
  getAllTemplatesService,
  saveTemplateService,
} from "../services/emailTemplateServices";

type Template = {
  id: number;
  name: string;
  title: string;
  subject?: string;
  design: any;
  html: string;
};

const categories: ExtensionProps["categories"] = [
  {
    label: "Content",
    active: true,
    blocks: [
      { type: AdvancedType.TEXT },
      { type: AdvancedType.IMAGE, payload: { attributes: { padding: "0px 0px 0px 0px" } } },
      { type: AdvancedType.BUTTON },
      { type: AdvancedType.SOCIAL },
      { type: AdvancedType.DIVIDER },
      { type: AdvancedType.SPACER },
      { type: AdvancedType.HERO },
      { type: AdvancedType.WRAPPER },
    ],
  },
  {
    label: "Layout",
    active: true,
    displayType: "column",
    blocks: [
      {
        title: "2 columns",
        payload: [["50%", "50%"], ["33%", "67%"], ["67%", "33%"], ["25%", "75%"]],
      },
      {
        title: "3 columns",
        payload: [["33.33%", "33.33%", "33.33%"], ["25%", "50%", "25%"]],
      },
    ],
  },
];

const htmlToEasyEmailContent = (html: string) =>
  BlockManager.getBlockByType(BasicType.PAGE)!.create({
    attributes: {
      "background-color": "#f4f4f4",
    },
    children: [
      BlockManager.getBlockByType(BasicType.SECTION)!.create({
        attributes: {
          padding: "0px",
          "text-align": "center",
        },
        children: [
          BlockManager.getBlockByType(BasicType.COLUMN)!.create({
            attributes: {
              padding: "0px",
            },
            children: [
              BlockManager.getBlockByType(BasicType.RAW)!.create({
                data: {
                  value: {
                    content: `
                      <div style="width:100%;text-align:center;">
                        <div style="display:inline-block; max-width:600px; width:100%; text-align:left;">
                          ${html}
                        </div>
                      </div>
                    `,
                  },
                },
              }),
            ],
          }),
        ],
      }),
    ],
  });

const TemplateEditor2: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await getAllTemplatesService();
        setTemplates(data || []);
        if (data?.length > 0) setSelectedKey(data[0].name);
      } catch {
        message.error("Failed to load templates");
      } finally {
        setLoading(false);
      }
    };
    loadTemplates();
  }, []);

  const selectedTemplate = useMemo(() => 
    templates.find((t) => t.name === selectedKey), 
    [templates, selectedKey]
  );

  const initialValues = useMemo(() => {
    if (selectedTemplate) {
      return {
        subject: selectedTemplate.subject || selectedTemplate.title,
        subTitle: "",
        content: selectedTemplate.design || htmlToEasyEmailContent(selectedTemplate.html),
      };
    }
    return {
      subject: "New Template",
      subTitle: "",
      content: BlockManager.getBlockByType(BasicType.PAGE)!.create({}),
    };
  }, [selectedTemplate]);

  const handleSave = async (values: IEmailTemplate) => {
    try {
      const mjmlString = JsonToMjml({
        data: values.content,
        mode: "production",
        context: values.content,
      });
      
      const { html } = mjml(mjmlString, { validationLevel: "soft" });

      await saveTemplateService({
        name: selectedKey,
        title: selectedTemplate?.title || "Template",
        subject: values.subject,
        html,
        design: values.content,
      });

      message.success("Template saved!");
    } catch (err) {
      console.error(err);
      message.error("Save failed");
    }
  };

  if (loading) return <Spin size="large" style={{ margin: "40px auto", display: "block" }} />;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 16px", background: "#fff", borderBottom: "1px solid #e8e8e8" }}>
        <Select
          value={selectedKey}
          onChange={(val) => setSelectedKey(val)}
          style={{ width: 300 }}
          options={templates.map((t) => ({ value: t.name, label: t.title }))}
        />
      </div>

      <EmailEditorProvider
        key={selectedKey}
        data={initialValues}
        onSubmit={handleSave}
        // ✅ Fix 2: 'height' is a required prop
        height="calc(100vh - 56px)"
      >
        {({ submit }: any) => (
          <>
            <StandardLayout
              compact={false}
              categories={categories}
            >
              <EmailEditor />
            </StandardLayout>

            <div style={{ position: "fixed", top: 14, right: 20, zIndex: 1000 }}>
              <Button type="primary" onClick={() => submit()}>
                Save Changes
              </Button>
            </div>
          </>
        )}
      </EmailEditorProvider>
    </div>
  );
};

export default TemplateEditor2;