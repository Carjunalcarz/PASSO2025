import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Models } from 'appwrite';
import { authService } from '../services/authService';

interface AuthContextType {
    user: Models.User<Models.Preferences> | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string, municipality?: string, role?: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [loading, setLoading] = useState(true);
    const lastRefreshRef = React.useRef<number>(0);

    useEffect(() => {
        checkAuth();
    }, []);

    // Separate effect for JWT refresh to avoid recreating interval on user state change
    useEffect(() => {
        if (!user) return; // Only set up interval if user is logged in
        
        console.log('🔄 AuthContext: Setting up JWT auto-refresh interval');
        
        // Set up automatic JWT refresh every 10 minutes (before 15 min expiry)
        const refreshInterval = setInterval(async () => {
            console.log('🔄 AuthContext: Auto-refreshing JWT...');
            try {
                await authService.refreshJWT();
                lastRefreshRef.current = Date.now();
                console.log('✅ AuthContext: JWT auto-refresh successful');
            } catch (error: any) {
                // If rate limited, skip this refresh cycle
                if (error?.message?.includes('Rate limit')) {
                    console.warn('⚠️ AuthContext: Rate limited, will retry on next interval');
                    return;
                }
                console.error('❌ AuthContext: JWT auto-refresh failed, logging out:', error);
                setUser(null);
                window.location.href = '/auth/boxed-signin';
            }
        }, 10 * 60 * 1000); // 10 minutes

        return () => {
            console.log('🧹 AuthContext: Cleaning up JWT refresh interval');
            clearInterval(refreshInterval);
        };
    }, [user]);

    const checkAuth = async () => {
        try {
            setLoading(true);
            console.log('🚀 AuthContext: Starting authentication check...');
            
            // Check if JWT exists in localStorage
            const storedJWT = localStorage.getItem('appwrite_session');
            const lastRefreshTime = lastRefreshRef.current;
            const timeSinceLastRefresh = Date.now() - lastRefreshTime;
            const MIN_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
            
            if (storedJWT && timeSinceLastRefresh > MIN_REFRESH_INTERVAL) {
                console.log('🔑 AuthContext: Found stored JWT, checking if refresh needed...');
                try {
                    await authService.refreshJWT();
                    lastRefreshRef.current = Date.now();
                    console.log('✅ AuthContext: JWT refreshed on page load');
                } catch (refreshError: any) {
                    // If rate limited, just skip refresh and try to use existing token
                    if (refreshError?.message?.includes('Rate limit')) {
                        console.warn('⚠️ AuthContext: Rate limited, skipping refresh');
                    } else {
                        console.warn('⚠️ AuthContext: JWT refresh failed on load, will try to get user anyway:', refreshError);
                    }
                }
            } else if (storedJWT) {
                console.log(`⏭️ AuthContext: Skipping refresh, last refresh was ${Math.floor(timeSinceLastRefresh / 1000)}s ago`);
            }
            
            // Set timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => {
                    console.log('⏰ AuthContext: Auth check timeout after 5 seconds');
                    reject(new Error('Auth timeout'));
                }, 5000)
            );
            
            console.log('🔍 AuthContext: Calling authService.getCurrentUser()...');
            const authPromise = authService.getCurrentUser();
            const currentUser = await Promise.race([authPromise, timeoutPromise]) as Models.User<Models.Preferences> | null;
            
            if (currentUser) {
                console.log('✅ AuthContext: User is authenticated:', {
                    id: currentUser.$id,
                    email: currentUser.email,
                    name: currentUser.name
                });
            } else {
                console.log('🟡 AuthContext: No authenticated user found');
            }
            
            setUser(currentUser);
        } catch (error: any) {
            console.error('❌ AuthContext: Auth check failed:', error);
            
            if (error.message === 'Auth timeout') {
                console.error('⏰ AuthContext: Authentication check timed out');
            } else {
                console.error('❌ AuthContext: Error details:', error);
            }
            
            setUser(null);
        } finally {
            setLoading(false);
            console.log('🏁 AuthContext: Auth check completed, loading set to false');
        }
    };

    const login = async (email: string, password: string) => {
        try {
            console.log('🔐 AuthContext: Logging in...');
            await authService.login({ email, password });
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            console.log('✅ AuthContext: Login successful');
        } catch (error) {
            console.error('❌ AuthContext: Login failed:', error);
            throw error;
        }
    };

    const register = async (email: string, password: string, name: string, municipality?: string, role?: string) => {
        try {
            console.log('📝 AuthContext: Registering...');
            const newUser = await authService.createAccount({ email, password, name, municipality, role });
            setUser(newUser);
            console.log('✅ AuthContext: Registration successful');
        } catch (error) {
            console.error('❌ AuthContext: Registration failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            console.log('🚪 AuthContext: Logging out...');
            await authService.logout();
            setUser(null);
            console.log('✅ AuthContext: Logout successful, redirecting to login');
            // Redirect to login page after successful logout
            window.location.href = '/auth/boxed-signin';
        } catch (error) {
            console.error('❌ AuthContext: Logout failed:', error);
            // Even if logout fails, clear user state and redirect for security
            setUser(null);
            window.location.href = '/auth/boxed-signin';
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
