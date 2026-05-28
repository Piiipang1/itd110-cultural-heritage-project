import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { Link, useNavigate } from "react-router-dom";
import { FaLandmark } from "react-icons/fa";

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
    } catch {
      setMessage("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="mx-auto bg-[#3E2F26] text-[#F4D58D] w-20 h-20 rounded-full flex items-center justify-center mb-4">
            <FaLandmark className="text-4xl" />
          </div>

          <h1 className="text-3xl font-bold text-[#3E2F26]">
            Cultural Heritage DB
          </h1>
          <p className="text-gray-500 mt-2">Admin Portal Login</p>
        </div>

        {message && (
          <div className="mb-5 bg-red-100 text-red-700 px-4 py-3 rounded-xl text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#556B2F] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#556B2F] outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#556B2F] hover:bg-[#445523] text-white py-3 rounded-xl font-semibold shadow transition"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          No account yet?{" "}
          <Link to="/register" className="text-[#556B2F] font-semibold hover:underline">
            Register
          </Link>
        </p>

        <p className="text-center text-sm mt-3">
          <Link to="/public-listings" className="text-[#3E2F26] hover:underline">
            View Public Listings
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;