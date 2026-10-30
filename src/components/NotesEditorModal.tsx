import { useState } from "react";
import { Button, Modal } from "antd";
import { EditOutlined } from "@ant-design/icons";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "../css/NotesEditor.css";
import { toEmailHtml } from "../app-constant/notesHtml";

// Email clients ignore Quill's ql-* classes, so font / size / alignment are
// registered as inline-style attributors instead — the saved HTML then
// renders the same in Gmail/Outlook as in the editor.
//
// "Default" (no font) inherits the template's Georgia, so the note matches
// the rest of the email.
const FONTS = ["Arial", "Times New Roman", "Verdana", "Tahoma", "Trebuchet MS", "Courier New"];
const SIZES = ["12px", "14px", "16px", "18px", "20px", "24px"];

const FontStyle = Quill.import("attributors/style/font") as any;
FontStyle.whitelist = FONTS;
Quill.register(FontStyle, true);
const SizeStyle = Quill.import("attributors/style/size") as any;
SizeStyle.whitelist = SIZES;
Quill.register(SizeStyle, true);
Quill.register(Quill.import("attributors/style/align") as any, true);

const MODULES = {
  toolbar: [
    [{ font: [false, ...FONTS] }, { size: [false, ...SIZES] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link", "clean"],
  ],
};

const FORMATS = ["font", "size", "bold", "italic", "underline", "strike", "color", "background", "list", "align", "link"];

interface NotesEditorModalProps {
  open: boolean;
  value: string;
  onSave: (html: string) => void;
  onCancel: () => void;
}

export default function NotesEditorModal({ open, value, onSave, onCancel }: NotesEditorModalProps) {
  // Edits stay local until "Apply", so Cancel discards them. The parent
  // mounts this only while open, so each opening starts from `value`.
  const [draft, setDraft] = useState(value);

  return (
    <Modal
      open={open}
      title={
        <span>
          <EditOutlined /> Edit Note
        </span>
      }
      width={780}
      centered
      destroyOnHidden
      onCancel={onCancel}
      footer={[
        <Button key="clear" danger onClick={() => setDraft("")}>
          Clear
        </Button>,
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="apply" type="primary" onClick={() => onSave(toEmailHtml(draft))}>
          Apply
        </Button>,
      ]}
    >
      <div className="notes-editor">
        <ReactQuill theme="snow" value={draft} onChange={setDraft} modules={MODULES} formats={FORMATS} placeholder="Enter notes to include below Policies" />
      </div>
    </Modal>
  );
}
