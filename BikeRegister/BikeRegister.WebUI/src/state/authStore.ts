import { create } from 'zustand';
import type { AppUser } from '../types';
import { persist } from 'zustand/middleware';

interface AuthState {
    user: AppUser | null;
    accessToken: string | null;
    refreshToken: string | undefined;
    setUser: (user: AppUser | null) => void;
    setAccessToken: (token: string | null) => void;
    setRefreshToken: (token: string | undefined) => void;
    logout: () => void;
    login: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
    (set) => ({
        user: null,
        setUser: (user: AppUser | null) => set({ user }),
        accessToken: null,
        setAccessToken: (token: string | null) => set({ accessToken: token }),
        refreshToken: undefined,
        setRefreshToken: (token: string | undefined) => set({ refreshToken: token }),
        logout: () => set({ user: null, accessToken: null, refreshToken: undefined }),
        login: (accessToken: string, refreshToken: string) => set({ accessToken, refreshToken }),
    }),
    {
        name: 'auth-storage',
    }
))