import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: "STUDENT_RESEARCHER" | "MENTOR" | "ADMIN";
  academicLevel?: string | null;
  intendedFieldOfStudy?: string | null;
  researchInterests?: string[];
  skillTags?: string[];
  currentJourneyStage?: string | null;
};

export const useCurrentUser = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener BEFORE getting session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const user = session?.user;
  const authUser: AuthUser | null = user
    ? {
        id: user.id,
        email: user.email || "",
        fullName: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        role: (user.user_metadata?.role as AuthUser["role"]) || "STUDENT_RESEARCHER",
        academicLevel: user.user_metadata?.academic_level,
        intendedFieldOfStudy: user.user_metadata?.intended_field_of_study,
        researchInterests: user.user_metadata?.research_interests,
        skillTags: user.user_metadata?.skill_tags,
        currentJourneyStage: user.user_metadata?.current_journey_stage,
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
