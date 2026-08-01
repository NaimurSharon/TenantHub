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
import {
  setGlobalCurrencySymbol,
  setGlobalDateFormat,
  DateFormatPattern,
  PropertyItem,
} from "@/lib/api/types";

interface User {
  id: number;
  name: string;
  email: string;
}

export interface CurrencyFormatOptions {
  decimal_places?: number;
  primary_group_size?: number;
  secondary_group_size?: number;
  thousand_separator?: string;
  decimal_separator?: string;
  negative_format?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  propertyId: number;
  propertyName: string;
  propertyCode: string;
  assignedProperties: PropertyItem[];
  currencySymbol: string;
  currencyFormat: CurrencyFormatOptions;
  dateFormat: DateFormatPattern;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  setPropertyId: (id: number) => void;
  setPropertyContext: (property: { id: number; name: string; code: string }) => void;
  setAssignedProperties: (properties: PropertyItem[]) => void;
  setCurrencySymbol: (symbol: string) => void;
  setCurrencyFormat: (options: CurrencyFormatOptions) => void;
  setDateFormat: (pattern: DateFormatPattern | string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      propertyId: 1,
      propertyName: "Kader Tower Building Complex",
      propertyCode: "KT-001",
      assignedProperties: [],
      currencySymbol: "$",
      currencyFormat: {
        decimal_places: 2,
        primary_group_size: 3,
        secondary_group_size: 3,
        thousand_separator: ",",
        decimal_separator: ".",
        negative_format: "Parentheses",
      },
      dateFormat: "MM/dd/yyyy",
      isAuthenticated: false,

      setAuth: (token, user) => {
        clearAndResetQueryCache();
        set({ token, user, isAuthenticated: true });
      },

      setPropertyId: (propertyId) => {
        set({ propertyId });
      },

      setPropertyContext: (prop) => {
        set({
          propertyId: prop.id,
          propertyName: prop.name,
          propertyCode: prop.code,
        });
      },

      setAssignedProperties: (assignedProperties) => set({ assignedProperties }),

      setCurrencySymbol: (symbol) => {
        setGlobalCurrencySymbol(symbol);
        set({ currencySymbol: symbol });
      },

      setCurrencyFormat: (options) => {
        set((state) => ({
          currencyFormat: { ...state.currencyFormat, ...options },
        }));
      },

      setDateFormat: (pattern) => {
        setGlobalDateFormat(pattern);
        set({ dateFormat: pattern as DateFormatPattern });
      },

      logout: () => {
        clearAndResetQueryCache();
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          propertyId: 1,
          propertyName: "Kader Tower Building Complex",
          propertyCode: "KT-001",
          assignedProperties: [],
          currencySymbol: "$",
          currencyFormat: {
            decimal_places: 2,
            primary_group_size: 3,
            secondary_group_size: 3,
            thousand_separator: ",",
            decimal_separator: ".",
            negative_format: "Parentheses",
          },
          dateFormat: "MM/dd/yyyy",
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.currencySymbol) {
          setGlobalCurrencySymbol(state.currencySymbol);
        }
        if (state?.dateFormat) {
          setGlobalDateFormat(state.dateFormat);
        }
      },
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        propertyId: state.propertyId,
        propertyName: state.propertyName,
        propertyCode: state.propertyCode,
        assignedProperties: state.assignedProperties,
        currencySymbol: state.currencySymbol,
        currencyFormat: state.currencyFormat,
        dateFormat: state.dateFormat,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
