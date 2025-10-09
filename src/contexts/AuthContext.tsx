import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Models } from 'appwrite';
import { authService } from '../services/authService';

interface AuthContextType {
    user: Models.User<Models.Preferences> | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
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

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            setLoading(true);
            console.log('🚀 AuthContext: Starting authentication check...');
            
            // Set timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => {
                    console.log('⏰ AuthContext: Auth check timeout after 3 seconds');
                    reject(new Error('Auth timeout'));
                }, 3000)
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

    const register = async (email: string, password: string, name: string) => {
        try {
            console.log('📝 AuthContext: Registering...');
            const newUser = await authService.createAccount({ email, password, name });
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
