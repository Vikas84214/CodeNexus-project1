import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";

// Components
import Layout from "@/components/layout";

// Pages
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Problems from "@/pages/problems";
import ProblemWorkspace from "@/pages/problem-workspace";
import Submissions from "@/pages/submissions";
import Contests from "@/pages/contests";
import ContestDetail from "@/pages/contest-detail";
import Dashboard from "@/pages/dashboard";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";
import Login from "@/pages/login";
import Register from "@/pages/register";

const queryClient = new QueryClient();

function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Force dark mode as default
    document.documentElement.classList.add('dark');
  }, []);
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Layout><Home /></Layout>} />
      <Route path="/problems" component={() => <Layout><Problems /></Layout>} />
      <Route path="/problems/:id" component={() => <Layout><ProblemWorkspace /></Layout>} />
      <Route path="/submissions" component={() => <Layout><Submissions /></Layout>} />
      <Route path="/contests" component={() => <Layout><Contests /></Layout>} />
      <Route path="/contests/:id" component={() => <Layout><ContestDetail /></Layout>} />
      <Route path="/dashboard" component={() => <Layout><Dashboard /></Layout>} />
      <Route path="/leaderboard" component={() => <Layout><Leaderboard /></Layout>} />
      <Route path="/profile/:id" component={() => <Layout><Profile /></Layout>} />
      <Route path="/login" component={() => <Login />} />
      <Route path="/register" component={() => <Register />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
