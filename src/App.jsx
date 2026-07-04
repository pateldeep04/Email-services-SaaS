import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { Navbar } from "./components/Navbar.jsx";
import { Footer } from "./components/Footer.jsx";

const HomePage = lazy(() => import("./pages/HomePage.jsx").then(m => ({ default: m.HomePage })));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx").then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./pages/RegisterPage.jsx").then(m => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage.jsx").then(m => ({ default: m.DashboardPage })));
const DocumentationPage = lazy(() => import("./pages/DocumentationPage.jsx").then(m => ({ default: m.DocumentationPage })));
const TesterPage = lazy(() => import("./pages/TesterPage.jsx").then(m => ({ default: m.TesterPage })));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Navbar />
        <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Suspense fallback={
            <div className="page-loading-fallback">
              <div className="page-loading-spinner" />
              <p style={{ fontSize: "14px", fontWeight: 500 }}>Loading page...</p>
            </div>
          }>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/docs" element={<DocumentationPage />} />
              <Route path="/tester" element={<TesterPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
