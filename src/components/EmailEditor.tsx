import React from 'react';
import '../css/EmailEditor.css';
import Header from './Header';
import AppLayout from './AppLayout';
import Footer from './Footer';

// 1. Define the object with 'as const' for literal types
// const TEMPLATES = {
//   welcome: {
//     title: "Welcome Email",
//     content: `<h1>Welcome!</h1><p>We are glad you joined us.</p>`
//   },
//   promotion: {
//     title: "Flash Sale",
//     content: `<h1>Big Savings!</h1><p>Use code SAVE20 for a discount.</p>`
//   }
// } as const;

// 2. Derive the Key type from the object itself
// type TemplateKey = keyof typeof TEMPLATES;

const EmailEditor: React.FC = () => {
  // const [selectedKey, setSelectedKey] = useState<TemplateKey>('welcome');
  // const [htmlContent, setHtmlContent] = useState<string>(TEMPLATES.welcome.content);
  
  // Use HTMLDivElement type instead of any for better Autocomplete
  // const editorRef = useRef<HTMLDivElement>(null);

  // Sync the editor content when the template selection changes
  // useEffect(() => {
  //   if (editorRef.current) {
  //     editorRef.current.innerHTML = htmlContent;
  //   }
  // }, [selectedKey, htmlContent]);

  // const handleTemplateChange = (key: string) => {
  //   // Cast key to TemplateKey to safely index the object
  //   const k = key as TemplateKey;
  //   setSelectedKey(k);
  //   setHtmlContent(TEMPLATES[k].content);
  // };

  // const handleSave = () => {
  //   if (editorRef.current) {
  //     const updatedHTML = editorRef.current.innerHTML;
  //     console.log("Saving Template:", updatedHTML);
  //     alert("Template saved! Check the console for the final HTML string.");
  //   }
  // };
// const [mobileOpen, setMobileOpen] = useState(false); 


  return (
    <>
     <div className="app">
        <div className="glass-header">
        <Header 
          // toggleSidebar={() => setMobileOpen((p) => !p)} 
        />
      </div>
        <div className="app-layout" style={{paddingTop: "64px"}}>
          {/* <TaskProvider> */}
          <AppLayout  />
          {/* </TaskProvider> */}
        </div>
        <Footer />
      </div></>


  );
};

export default EmailEditor;