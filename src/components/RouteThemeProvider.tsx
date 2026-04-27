import { ThemeProvider } from "next-themes";
import { useLocation } from "react-router-dom";

interface RouteThemeProviderProps {
  children: React.ReactNode;
}

const RouteThemeProvider = ({ children }: RouteThemeProviderProps) => {
  const location = useLocation();
  const isWorkspaceRoute =
    location.pathname.startsWith("/lojista") || location.pathname.startsWith("/admin");

  return (
    <ThemeProvider
      key={isWorkspaceRoute ? "workspace-theme" : "public-theme"}
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      forcedTheme={isWorkspaceRoute ? undefined : "light"}
    >
      {children}
    </ThemeProvider>
  );
};

export default RouteThemeProvider;
