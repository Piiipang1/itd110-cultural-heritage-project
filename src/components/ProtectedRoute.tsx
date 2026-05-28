import { Navigate } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return auth.currentUser ? children : <Navigate to="/" />;
}

export default ProtectedRoute;