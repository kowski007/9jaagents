import { useToast as useBaseToast } from "@/hooks/use-toast";

interface EnhancedToastOptions {
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export function useToastEnhanced() {
  const { toast } = useBaseToast();

  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default",
      duration: 3000,
    });
  };

  const showError = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "destructive",
      duration: 5000,
    });
  };

  const showWarning = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default",
      duration: 4000,
    });
  };

  const showInfo = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default",
      duration: 3000,
    });
  };

  const showCustom = ({ title, description, type = 'info', duration = 3000 }: EnhancedToastOptions) => {
    toast({
      title,
      description,
      variant: type === 'error' ? "destructive" : "default",
      duration,
    });
  };

  return {
    toast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showCustom,
  };
}