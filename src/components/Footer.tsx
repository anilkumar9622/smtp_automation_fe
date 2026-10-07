export default function Footer() {
  return (
    <footer className="app-footer">
      <span className="app-footer-label">Powered by</span>
      <span className="app-footer-brand">TechinfoAK Pvt. Ltd.</span>
      <style>
        {`
.app-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 12px;
  color: #8c7a68;
  background: #fff;
  border-top: 1px solid #f3dcc2;
}

.app-footer-brand {
  font-weight: 600;
  background: linear-gradient(135deg, #f0913a 0%, #e0701f 45%, #c9973f 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
        `}
      </style>
    </footer>
  );
}
