import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
    };

    return (
        <div>
            <h1>Cultural Heritage Dashboard</h1>
            <p>Welcome to the system</p>

            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default Dashboard;