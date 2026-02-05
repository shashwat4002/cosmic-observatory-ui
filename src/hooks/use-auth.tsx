import { useEffect, useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

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
  profilePhotoUrl?: string | null;
};

type AuthResponse = {
  user: AuthUser;
};

export const useCurrentUser = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get<AuthResponse>("/auth/me");
      setUser(response.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    data: { user },
    isLoading,
    refetch: fetchUser,
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
      const response = await api.post<AuthResponse>("/auth/login", {
        email: input.email,
        password: input.password,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  const register = useMutation({
    mutationFn: async (input: RegisterInput) => {
      const response = await api.post<AuthResponse>("/auth/register", {
        email: input.email,
        password: input.password,
        fullName: input.fullName,
        academicLevel: input.academicLevel,
        intendedFieldOfStudy: input.intendedFieldOfStudy,
        researchInterests: input.researchInterests,
        skillTags: input.skillTags,
        role: input.role || "STUDENT_RESEARCHER",
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["currentUser"] });
    },
  });

  return { login, register, logout };
};
