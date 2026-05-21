import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddHeritage from "./pages/AddHeritage";
import HeritageRecords from "./pages/HeritageRecords";
import EditHeritage from "./pages/EditHeritage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-heritage" element={<AddHeritage />} />
        <Route path="/heritage-records" element={<HeritageRecords />} />
        <Route path="/edit-heritage/:id" element={<EditHeritage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;