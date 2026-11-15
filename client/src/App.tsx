import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Search from "./pages/Search.tsx";
import Menu from "./pages/Menu.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import RestaurantDetail from "./pages/RestaurantDetail.tsx";
import BookingConfirmation from "./pages/BookingConfirmation.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import NotFound from "./pages/NotFound.tsx";
import OwnerDashboard from "./pages/owner/OwnerDashboard.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import Layout from "./components/Layout.tsx";
import { Toaster } from "react-hot-toast";

export default function App() {
    return (
        <>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: "#1E1A13",
                        color: "#EFE7D6",
                        fontFamily: "Manrope, sans-serif",
                        fontSize: "12.5px",
                        letterSpacing: "0.01em",
                        borderRadius: "10px",
                        border: "1px solid rgba(201, 162, 39, 0.35)",
                        boxShadow: "0 16px 40px -12px rgba(0,0,0,0.7)",
                    },
                }}
            />
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/restaurant/:slug" element={<RestaurantDetail />} />
                    <Route
                        path="/booking/:slug"
                        element={
                            <ProtectedRoute>
                                <BookingConfirmation />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/owner/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={["owner"]}>
                                <OwnerDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </>
    );
}
