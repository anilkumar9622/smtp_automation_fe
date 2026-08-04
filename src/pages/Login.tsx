import { useState } from "react";
import "./Login.css";
import logo from "../assets/logo.png";
import bg from "../assets/bg.png";
import { Link, useNavigate } from "react-router-dom";
import { loginService } from "../services/authServices";
import { message } from "antd";
const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
    }>({});
    console.log({ errors, email, password })
    const validateEmail = () => {
        let error = "";

        // Staff log in with a short username (e.g. "tlpj"), not necessarily
        // a real email address, so this only checks presence, not format.
        if (!email) {
            error = "Username or email is required";
        }

        setErrors((prev) => ({ ...prev, email: error }));
    };

    const validatePassword = () => {
        let error = "";

        if (!password) {
            error = "Password is required";
        } else if (password.length < 6) {
            error = "Password must be at least 6 characters";
        }

        setErrors((prev) => ({ ...prev, password: error }));
    };
    const handleLogin = async () => {
        try {
            validateEmail();
            validatePassword();

            if (!email || !password) return;

            if (errors.email || errors.password) return;
            const res: any = await loginService({ email, password });
            // console.log({ res })
            if (res.status === 200) {
                message.success("Login successful");
                navigate("/template");

            } else {
                message.error(res.message ?? "Something went wrong");
            }

            // ✅ redirect to template page

        } catch (err: any) {
            console.log({ err })
            message.error(err.response.data.message ?? err.message ?? "Something went wrong");
        }
    };
    return (
        <div className="login-container">

            {/* LEFT SIDE */}
            <div className="login-left">
                <img src={bg} alt="bg" className="bg-image" />

                <div className="overlay">
                    <div className="brand">
                        <img src={logo} alt="logo" width={200} height={30} />
                        {/* <span>TechinfoAK</span> */}
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
                <button className="signin-btn-top">Sign in</button>

                <div className="form-box">
                    <h2 style={{ fontSize: "20px" }}>Welcome Back</h2>
                    <p className="sub-text" style={{ fontSize: "13px" }}>Sign in your account</p>

                    <label style={{ fontSize: "14px", marginTop: "30px" }}>Username or Email</label>
                    <input
                        type="text"
                        placeholder="Enter username or email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={validateEmail}
                    />
                    {errors.email && <p className="error" style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{errors.email}</p>}

                    <label style={{ fontSize: "14px", marginTop: "20px" }}>Password</label>
                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={validatePassword}
                    />
                    {errors.password && <p className="error" style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{errors.password}</p>}



                    <Link to="/template" style={{ cursor: "pointer" }}> <button className="login-btn"
                        onClick={handleLogin}
                    >Login</button></Link>

                    {/* <div className="divider">Instant Login</div>

                    <div className="social-login">
                        <button>Google</button>
                        <button>Facebook</button>
                    </div>

                    <p className="register" style={{ fontSize: "14px" }}>
                        Don’t have any account? <span>Register</span>
                    </p> */}
                </div>
            </div>
        </div>
    );
};

export default Login;