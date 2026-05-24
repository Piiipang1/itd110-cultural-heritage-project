import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddHeritage from "./pages/AddHeritage";
import HeritageRecords from "./pages/HeritageRecords";
import EditHeritage from "./pages/EditHeritage";
import Custodians from "./pages/Custodians";
import Festivals from "./pages/Festivals";
import PublicListings from "./pages/PublicListings";
import Reports from "./pages/Reports";

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
        <Route path="/custodians" element={<Custodians />} />
        <Route path="/festivals" element={<Festivals />} />
        <Route path="/public-listings" element={<PublicListings />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;