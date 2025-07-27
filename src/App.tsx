import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ChatList from "./pages/ChatList";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import SendMoney from "./pages/SendMoney";
import PayHub from "./pages/PayHub";
import Services from "./pages/Services";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<ChatList />} />
            <Route path="/chat/:chatId" element={<Chat />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pay/send" element={<SendMoney />} />
            <Route path="/pay" element={<PayHub />} />
            <Route path="/services" element={<Services />} />
            <Route path="/settings" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Settings Coming Soon</h1></div>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
