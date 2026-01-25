import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  email: string;
  companyName: string;
  contactName: string;
  phone: string;
  cnpj?: string;
  city?: string;
  state?: string;
  role: "dealer" | "admin" | "user";
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  companyName: string;
  contactName: string;
  phone: string;
  cnpj?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      // Fetch profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      // Fetch user role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      const userProfile: UserProfile = {
        id: userId,
        email: email,
        companyName: profile?.company_name || "",
        contactName: profile?.company_name || "", // Using company_name as fallback
        phone: profile?.phone || "",
        cnpj: profile?.cnpj || undefined,
        city: profile?.city || undefined,
        state: profile?.state || undefined,
        role: (roleData?.role as "dealer" | "admin" | "user") || "dealer",
      };

      setUser(userProfile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Defer Supabase calls with setTimeout to prevent deadlock
          setTimeout(() => {
            fetchUserProfile(session.user.id, session.user.email || "");
          }, 0);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email || "");
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          return { success: false, error: "Email ou senha inválidos" };
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        await fetchUserProfile(data.user.id, data.user.email || "");
        return { success: true };
      }

      return { success: false, error: "Erro desconhecido" };
    } catch (error: any) {
      return { success: false, error: error.message || "Erro ao fazer login" };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            company_name: data.companyName,
            contact_name: data.contactName,
            phone: data.phone,
            cnpj: data.cnpj,
          }
        }
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          return { success: false, error: "Este email já está cadastrado" };
        }
        return { success: false, error: error.message };
      }

      if (authData.user) {
        // Update profile with additional data
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            company_name: data.companyName,
            phone: data.phone,
            cnpj: data.cnpj,
          })
          .eq("user_id", authData.user.id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
        }

        await fetchUserProfile(authData.user.id, authData.user.email || "");
        return { success: true };
      }

      return { success: false, error: "Erro desconhecido" };
    } catch (error: any) {
      return { success: false, error: error.message || "Erro ao criar conta" };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        login,
        register,
        logout,
        isAuthenticated: !!session,
        isLoading,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
