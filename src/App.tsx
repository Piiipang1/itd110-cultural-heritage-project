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

import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC PAGES */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/public-listings" element={<PublicListings />} />

        {/* PROTECTED ADMIN PAGES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/heritage-records"
          element={
            <ProtectedRoute>
              <MainLayout>
                <HeritageRecords />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-heritage"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AddHeritage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-heritage/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <EditHeritage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/custodians"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Custodians />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/festivals"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Festivals />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Reports />
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;