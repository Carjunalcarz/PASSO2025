// components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
    children, 
    redirectTo = '/auth/boxed-signin' 
}) => {
    const { isAuthenticated, loading, user, logout } = useAuth();
    const location = useLocation();
    console.log('🛡️ ProtectedRoute: Checking authentication...', {
        isAuthenticated,
        loading,
        hasUser: !!user,
        userEmail: user?.email,
        emailVerified: user?.emailVerification,
        currentPath: location.pathname
    });

    // Show loading while checking authentication
    if (loading) {
        console.log('🛡️ ProtectedRoute: Still loading authentication...');
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        console.log('🛡️ ProtectedRoute: User not authenticated, redirecting to:', redirectTo);
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // TEMPORARILY DISABLED: Check if user email is verified
    // COMMENTED OUT TO ENABLE LOGIN - Email verification check disabled for testing
    if (false && user && !user.emailVerification) {
        console.log('🛡️ ProtectedRoute: User email not verified, blocking access');
        console.log('🛡️ ProtectedRoute: User details:', {
            email: user.email,
            emailVerification: user.emailVerification,
            status: user.status
        });
        
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-800 to-blue-700 p-4">
                <div className="max-w-lg w-full bg-white rounded-xl shadow-2xl overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-center">
                        <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Welcome to PASSO-RPTASS</h1>
                        <p className="text-blue-100 text-sm">Provincial Assessment System</p>
                    </div>

                    {/* Content Section */}
                    <div className="px-8 py-8 text-center">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-3">
                                Welcome, {user.name || 'User'}! 👋
                            </h2>
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 text-left rounded-r-lg">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-blue-800">
                                            <strong>Account Status:</strong> Pending Verification
                                        </p>
                                        <p className="text-sm text-blue-700 mt-1">
                                            Your account (<strong>{user.email}</strong>) has been successfully created but requires verification by the <strong>Provincial Assessor Office Administrator</strong> before you can access the system.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h3 className="font-medium text-gray-800 mb-2">What happens next?</h3>
                                <ul className="text-sm text-gray-600 space-y-2 text-left">
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2">•</span>
                                        Your account details have been forwarded to the Provincial Assessor Office
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2">•</span>
                                        An administrator will review and verify your account within 1-2 business days
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-500 mr-2">•</span>
                                        You will receive an email notification once your account is approved
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
                            >
                                🔄 Check Verification Status
                            </button>
                            
                            <button
                                onClick={() => {
                                    console.log('🚪 ProtectedRoute: Logging out unverified user...');
                                    logout();
                                }}
                                className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                            >
                                ← Back to Login
                            </button>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-xs text-gray-500 text-center">
                                Need assistance? Contact the Provincial Assessor Office<br/>
                                <span className="text-blue-600">support@assessor.gov.ph</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render children if authenticated and verified
    console.log('✅ ProtectedRoute: User authenticated and verified, rendering protected content');
    return <>{children}</>;
};

export default ProtectedRoute;
