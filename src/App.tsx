import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PatientProvider } from "@/context/PatientContext";
import Index from "./pages/Index.tsx";
import CheckIn from "./pages/CheckIn.tsx";
import Logs from "./pages/Logs.tsx";
import Help from "./pages/Help.tsx";
import Settings from "./pages/Settings.tsx";
import NotFound from "./pages/NotFound.tsx";
import { lazy, Suspense } from "react";

const CaregiverDashboard = lazy(() => import("./pages/CaregiverDashboard.tsx"));
const ClinicianDashboard = lazy(() => import("./pages/ClinicianDashboard.tsx"));
const Exercises = lazy(() => import("./pages/Exercises.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PatientProvider>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/checkin" element={<CheckIn />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/help" element={<Help />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/caregiver" element={<CaregiverDashboard />} />
              <Route path="/clinician" element={<ClinicianDashboard />} />
              <Route path="/exercises" element={<Exercises />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </PatientProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
