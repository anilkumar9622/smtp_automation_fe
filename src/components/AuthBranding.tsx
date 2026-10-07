import techinfoakLogo from "../assets/logo.png";

// The Leela logo lives in /public (also used by the CMS header), so it's
// referenced by URL rather than imported.
export const LEELA_LOGO_SRC = "/logo.png";

// One standard size for the Leela logo everywhere it appears (dashboard
// header, login / change-password pages) — change it here only.
export const LEELA_LOGO_HEIGHT = 52;

export const LeelaLogo = ({ className }: { className?: string }) => (
    <img
        src={LEELA_LOGO_SRC}
        alt="The Leela Palaces, Hotels and Resorts"
        className={className}
        style={{ height: LEELA_LOGO_HEIGHT, width: "auto", display: "block" }}
    />
);

// Leela brand block shown above the login / change-password forms.
export const LeelaBrandTitle = () => (
    <div className="leela-brand-title">
        <LeelaLogo />
        <span className="leela-brand-caption">Email Template Studio</span>
    </div>
);

export const PoweredByFooter = () => (
    <footer className="powered-by">
        <span>Powered by</span>
        <img src={techinfoakLogo} alt="" aria-hidden="true" style={{ height: 16, width: "auto" }} />
        <strong>TechinfoAK Pvt. Ltd.</strong>
    </footer>
);
