import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/Home";
import Landing from "@/pages/Landing";
import Marketplace from "@/pages/Marketplace";
import Dashboard from "@/pages/Dashboard";
import SellerDashboard from "@/pages/SellerDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import EnhancedAdminDashboard from "@/pages/EnhancedAdminDashboard";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import ListAgent from "@/pages/CreateAgent";
import Checkout from "@/pages/Checkout";
import NotFound from "@/pages/not-found";
import RoleBasedRedirect from "@/components/RoleBasedRedirect";
import NotificationsPage from "@/pages/NotificationsPage";
import AboutPage from "@/pages/AboutPage";
import TermsPage from "@/pages/TermsPage";
import ImprovedMarketplace from "@/pages/ImprovedMarketplace";
import PointsPage from "@/pages/PointsPage";
import ReferralPage from "@/pages/ReferralPage";
import LeaderboardPage from "@/pages/LeaderboardPage";
import WalletPage from "@/pages/WalletPage";
import SellerWalletPage from "@/pages/SellerWalletPage";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <>
      <RoleBasedRedirect />
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/marketplace" component={ImprovedMarketplace} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/seller-dashboard" component={SellerDashboard} />
        <Route path="/admin" component={SuperAdminDashboard} />
        <Route path="/admin-enhanced" component={EnhancedAdminDashboard} />
        <Route path="/list-agent" component={ListAgent} />
        <Route path="/create-agent" component={ListAgent} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/notifications" component={NotificationsPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/points" component={PointsPage} />
        <Route path="/referrals" component={ReferralPage} />
        <Route path="/leaderboard" component={LeaderboardPage} />
        <Route path="/wallet" component={WalletPage} />
        <Route path="/seller-wallet" component={SellerWalletPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;