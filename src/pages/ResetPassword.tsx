import { useState } from "react";
import "./login.css";
import { LeelaLogo, LeelaBrandTitle, PoweredByFooter } from "../components/AuthBranding";
import bg from "../assets/bg.png";
import { Link, useNavigate } from "react-router-dom";
import { changePasswordService } from "../services/authServices";
import { message } from "antd";

type Field = "email" | "currentPassword" | "newPassword" | "confirmPassword";

const getLoggedInEmail = (): string => {
    try {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user).email ?? "" : "";
    } catch {
        return "";
    }
};

const ResetPassword = () => {
    // If someone is already logged in, the account is fixed to theirs;
    // otherwise they type the username/email they log in with.
    const loggedInEmail = getLoggedInEmail();

    const [form, setForm] = useState<Record<Field, string>>({
        email: loggedInEmail,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const validateField = (field: Field, values = form): string => {
        const value = values[field];
        switch (field) {
            case "email":
                return value ? "" : "Username or email is required";
            case "currentPassword":
                return value ? "" : "Current password is required";
            case "newPassword":
                if (!value) return "New password is required";
                if (value.length < 6) return "Password must be at least 6 characters";
                if (value === values.currentPassword) return "New password must be different from the current password";
                return "";
            case "confirmPassword":
                if (!value) return "Please confirm the new password";
                if (value !== values.newPassword) return "Passwords do not match";
                return "";
        }
    };

    const handleChange = (field: Field, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleBlur = (field: Field) => {
        setErrors((prev) => ({ ...prev, [field]: validateField(field) }));
    };

    const handleSubmit = async () => {
        const fields: Field[] = ["email", "currentPassword", "newPassword", "confirmPassword"];
        const nextErrors = Object.fromEntries(fields.map((f) => [f, validateField(f)]));
        setErrors(nextErrors);
        if (Object.values(nextErrors).some(Boolean)) return;

        try {
            setLoading(true);
            const res: any = await changePasswordService(form);
            if (res.status === 200) {
                message.success(res.data?.message ?? "Password updated successfully");
                // Force a fresh login with the new password.
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/");
            } else {
                message.error(res.data?.message ?? "Something went wrong");
            }
        } catch (err: any) {
            message.error(err.response?.data?.message ?? err.message ?? "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const renderError = (field: Field) =>
        errors[field] && (
            <p className="error" style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{errors[field]}</p>
        );

    return (
        <div className="login-container">

            {/* LEFT SIDE */}
            <div className="login-left">
                <img src={bg} alt="bg" className="bg-image" />

                <div className="overlay">
                    <div className="brand">
                        <LeelaLogo />
                    </div>

                    <div className="left-text">
                        <h2>Find your sweet home</h2>
                        <p>
                            Schedule visit in just a few clicks visits in just a few clicks.
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="login-right">
                <button className="signin-btn-top" onClick={() => navigate("/")}>Sign in</button>

                <div className="form-box">
                    <LeelaBrandTitle />
                    <h2 style={{ fontSize: "20px" }}>Change Password</h2>
                    <p className="sub-text" style={{ fontSize: "13px" }}>Verify your current password to set a new one</p>

                    <label style={{ fontSize: "14px", marginTop: "30px" }}>Username or Email</label>
                    <input
                        type="text"
                        placeholder="Enter username or email"
                        value={form.email}
                        disabled={!!loggedInEmail}
                        onChange={(e) => handleChange("email", e.target.value)}
                        onBlur={() => handleBlur("email")}
                    />
                    {renderError("email")}

                    <label style={{ fontSize: "14px", marginTop: "20px" }}>Current Password</label>
                    <input
                        type="password"
                        placeholder="Enter current password"
                        value={form.currentPassword}
                        onChange={(e) => handleChange("currentPassword", e.target.value)}
                        onBlur={() => handleBlur("currentPassword")}
                    />
                    {renderError("currentPassword")}

                    <label style={{ fontSize: "14px", marginTop: "20px" }}>New Password</label>
                    <input
                        type="password"
                        placeholder="Enter new password"
                        value={form.newPassword}
                        onChange={(e) => handleChange("newPassword", e.target.value)}
                        onBlur={() => handleBlur("newPassword")}
                    />
                    {renderError("newPassword")}

                    <label style={{ fontSize: "14px", marginTop: "20px" }}>Confirm New Password</label>
                    <input
                        type="password"
                        placeholder="Re-enter new password"
                        value={form.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                        onBlur={() => handleBlur("confirmPassword")}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    />
                    {renderError("confirmPassword")}

                    <button className="login-btn" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Updating..." : "Update Password"}
                    </button>

                    <Link to="/" className="forgot-link" style={{ textAlign: "center", marginTop: "16px" }}>
                        Back to Login
                    </Link>
                </div>

                <PoweredByFooter />
            </div>
        </div>
    );
};

export default ResetPassword;
