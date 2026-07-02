import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "./app/lib/AuthContext";
import App from "./app/App.tsx";
import LoginPage from "./app/pages/LoginPage.tsx";
import SignupPage from "./app/pages/SignupPage.tsx";
import DashboardPage from "./app/pages/DashboardPage.tsx";
import ProjectSelectPage from "./app/pages/ProjectSelectPage.tsx";
import SimulationPage from "./app/pages/SimulationPage.tsx";
import ScorePage from "./app/pages/ScorePage.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectSelectPage />} />
        <Route path="/simulation/:projectId" element={<SimulationPage />} />
        <Route path="/score" element={<ScorePage />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
