import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "@/components/layout/Layout";
import OfflineIndicator from "@/components/shared/OfflineIndicator";
import PWAInstallBanner from "@/components/shared/PWAInstallBanner";
import ToastContainer from "@/components/shared/ToastContainer";
import AuthModal from "@/components/shared/AuthModal";

const LazyLandingPage = lazy(() => import("@/pages/LandingPage"));
const LazyExplorePage = lazy(() => import("@/pages/ExplorePage"));
const LazyEventDetailPage = lazy(() => import("@/pages/EventDetailPage"));
const LazyPlaceDetailPage = lazy(() => import("@/pages/PlaceDetailPage"));
const LazyProfilePage = lazy(() => import("@/pages/ProfilePage"));
const LazyNotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const LazyMapPage = lazy(() => import("@/pages/MapPage"));
const LazyDashboardPage = lazy(() => import("@/pages/DashboardPage"));
const LazySuggestionsPage = lazy(() => import("@/pages/SuggestionsPage"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <>
      <OfflineIndicator />
      <PWAInstallBanner />
      <ToastContainer />
      <AuthModal />

      <Routes>
        <Route path="/" element={<Suspense fallback={<PageLoader />}><LazyLandingPage /></Suspense>} />
        <Route element={<Layout />}>
          <Route path="/explore" element={<Suspense fallback={<PageLoader />}><LazyExplorePage /></Suspense>} />
          <Route path="/events/:id" element={<Suspense fallback={<PageLoader />}><LazyEventDetailPage /></Suspense>} />
          <Route path="/places/:id" element={<Suspense fallback={<PageLoader />}><LazyPlaceDetailPage /></Suspense>} />
          <Route path="/map" element={<Suspense fallback={<PageLoader />}><LazyMapPage /></Suspense>} />
          <Route path="/suggestions" element={<Suspense fallback={<PageLoader />}><LazySuggestionsPage /></Suspense>} />
          <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><LazyDashboardPage /></Suspense>} />
          <Route path="/profile" element={<Suspense fallback={<PageLoader />}><LazyProfilePage /></Suspense>} />
        </Route>
        <Route path="*" element={<Suspense fallback={<PageLoader />}><LazyNotFoundPage /></Suspense>} />
      </Routes>
    </>
  );
}

export default App;