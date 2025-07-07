import { ReactNode } from "react";
import { useLocation } from "wouter";
import Header from "./Header";
import Footer from "./Footer";
import { Toaster } from "@/components/ui/toaster";

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export default function Layout({ children, showFooter = true }: LayoutProps) {
  const [location] = useLocation();
  
  // Don't show footer on dashboard pages
  const isDashboard = location.includes('/dashboard') || location.includes('/admin');
  const shouldShowFooter = showFooter && !isDashboard;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className={"flex-1"}>
        {children}
      </main>
      {shouldShowFooter && <Footer />}
      <Toaster />
    </div>
  );
}
