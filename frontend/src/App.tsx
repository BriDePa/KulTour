import { Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import LandingPage from "@/pages/LandingPage";
import ExplorePage from "@/pages/ExplorePage";
import EventDetailPage from "@/pages/EventDetailPage";
import PlaceDetailPage from "@/pages/PlaceDetailPage";
import SuggestionsPage from "@/pages/SuggestionsPage";
import DashboardPage from "@/pages/DashboardPage";
import MapPage from "@/pages/MapPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFoundPage from "@/pages/NotFoundPage";
import OfflineIndicator from "@/components/shared/OfflineIndicator";
import PWAInstallBanner from "@/components/shared/PWAInstallBanner";
import ToastContainer from "@/components/shared/ToastContainer";
import AuthModal from "@/components/shared/AuthModal";

function App() {
  return (
    <>
      {/* ─── Globales ─── */}
      <OfflineIndicator />
      <PWAInstallBanner />
      <ToastContainer />
      <AuthModal />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<Layout />}>
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/places/:id" element={<PlaceDetailPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/suggestions" element={<SuggestionsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
