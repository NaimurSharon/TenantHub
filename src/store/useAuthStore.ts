/**
 * Auth store — persists token + user info via Zustand.
 */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  propertyId: number;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  setPropertyId: (id: number) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      propertyId: 1,
      isAuthenticated: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      setPropertyId: (propertyId) => set({ propertyId }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        propertyId: state.propertyId,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
