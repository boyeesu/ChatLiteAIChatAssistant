import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { queryClient } from "./lib/queryClient";
import { WidgetProvider } from "@/context/WidgetContext";
import { Toaster } from "@/components/ui/toaster";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <WidgetProvider>
      <App />
      <Toaster />
    </WidgetProvider>
  </QueryClientProvider>
);
