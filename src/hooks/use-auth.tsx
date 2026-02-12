import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "moderator" | "user";
  academicLevel?: string | null;
  intendedFieldOfStudy?: string | null;
  researchInterests?: string[];
  skillTags?: string[];
  currentJourneyStage?: string | null;
};

export const useCurrentUser = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [role, setRole] = useState<AuthUser["role"]>("user");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session?.user) {
          setProfile(null);
          setRole("user");
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session?.user) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch profile and role from DB when session changes
  useEffect(() => {
    if (!session?.user) return;

    const fetchProfileAndRole = async () => {
      const [profileRes, roleRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", session.user.id).single(),
        supabase.from("user_roles").select("role").eq("user_id", session.user.id).single(),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (roleRes.data) setRole(roleRes.data.role as AuthUser["role"]);
      setLoading(false);
    };

    fetchProfileAndRole();
  }, [session?.user?.id]);

  const user = session?.user;
  const authUser: AuthUser | null = user
    ? {
        id: user.id,
        email: user.email || "",
        fullName: (profile?.full_name as string) || user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        role,
        academicLevel: profile?.academic_level as string | null,
        intendedFieldOfStudy: profile?.intended_field_of_study as string | null,
        researchInterests: profile?.research_interests as string[] | undefined,
        skillTags: profile?.skill_tags as string[] | undefined,
        currentJourneyStage: profile?.current_journey_stage as string | null,
      }
    : null;

  return {
    data: { user: authUser },
    isLoading: loading,
    session,
  };
};

type LoginInput = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

type RegisterInput = {
  email: string;
  password: string;
  fullName: string;
  academicLevel?: string;
  intendedFieldOfStudy?: string;
  researchInterests?: string[];
  skillTags?: string[];
  role?: "STUDENT_RESEARCHER" | "MENTOR";
};

export const useAuthActions = () => {
  const queryClient = useQueryClient();

  const login = useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  const register = useMutation({
    mutationFn: async (input: RegisterInput) => {
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: input.fullName,
            academic_level: input.academicLevel,
            intended_field_of_study: input.intendedFieldOfStudy,
            research_interests: input.researchInterests,
            skill_tags: input.skillTags,
            role: input.role || "STUDENT_RESEARCHER",
          },
        },
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["currentUser"] });
    },
  });

  return { login, register, logout };
};
