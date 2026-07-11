/**
 * Auth store — persists token + user info via Zustand.
 *
 * Cache isolation contract:
 *   Every call to setAuth (login) and logout triggers clearAndResetQueryCache()
 *   to guarantee that query data from a previous session — including the
 *   reviewer sandbox mock — never leaks into a new account's session.
 */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearAndResetQueryCache } from "@/lib/queryClient";

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

      setAuth: (token, user) => {
        // Wipe all cached data from the previous session BEFORE storing new
        // credentials, so no stale data from another account is ever served.
        clearAndResetQueryCache();
        set({ token, user, isAuthenticated: true });
      },

      setPropertyId: (propertyId) => set({ propertyId }),

      logout: () => {
        // Wipe cache immediately on logout so the next user starts fresh.
        clearAndResetQueryCache();
        set({ token: null, user: null, isAuthenticated: false });
      },
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
