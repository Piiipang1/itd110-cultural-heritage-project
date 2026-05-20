import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { Link, useNavigate } from "react-router-dom";

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            console.log("User registered successfully");
            setMessage("Account created!");
            navigate("/dashboard");
        } catch (error: any){
            setMessage(error.message);
        }
    };

    return (
        <div>
            <h1>Register</h1>

            <form onSubmit={handleRegister}>
                <input  type="email" placeholder="Example@gmail.com" onChange={(e) => setEmail(e.target.value)} required/>

                <input  type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required/>

                <button type="submit">Register</button>
            </form>

            <p>{message}</p>

            <p>
                Already have an account? <Link to="/">Login</Link>
            </p>
        </div>
    );
}

export default Register;