import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { Link, useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await signInWithEmailAndPassword(auth, email.trim(), password.trim());
            navigate("/dashboard");
        } catch (error: any) {
            if (error.code === "auth/too-many-requests") {
                setMessage("Too many failed login attempts. Please wait a few minutes and try again.");
            } else if (error.code === "auth/invalid-credential") {
                setMessage("Invalid email or password.");
            } else {
                setMessage(error.message);
            }
        }
    };

    return (
        <div>
            <h1>Login</h1>

            <form onSubmit={handleLogin}>
                <input
                type="email"
                placeholder="Example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)} required
                />

                <input
                type="password"
                placeholder="Your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} required
                />

                <button type="submit">Login</button>
            </form>

            <p>{message}</p>
            <p>
                No account yet? <Link to="/Register">Register</Link>
            </p>
            <div style={{ marginTop: "1.5rem", borderTop: "1px solid #ddd", paddingTop: "1rem", textAlign: "center" }}>
                <Link to="/public-listings" style={{ fontSize: "1rem", fontWeight: "bold", textDecoration: "none", color: "#556B2F" }}>
                    🏛️ Explore Public Heritage Directory
                </Link>
            </div>
        </div>
    );
}

export default Login;