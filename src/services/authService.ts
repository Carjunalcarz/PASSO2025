import { account, appwriteConfig } from '../lib/appwrite';
import { ID, Models } from 'appwrite';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    name: string;
    municipality?: string;
    role?: string;
}

class AuthService {
    // Create a new account
    async createAccount({ email, password, name, municipality, role }: RegisterCredentials): Promise<Models.User<Models.Preferences>> {
        try {
            const newAccount = await account.create(ID.unique(), email, password, name);
            if (newAccount) {
                // Login to create session
                await account.createEmailPasswordSession(email, password);
                
                // Update user preferences with municipality and role
                if (municipality || role) {
                    const preferences: Record<string, any> = {};
                    if (municipality) preferences.municipality = municipality;
                    if (role) preferences.role = role;
                    
                    // Update user preferences
                    await account.updatePrefs(preferences);
                    console.log('✅ User preferences updated:', preferences);
                }
                
                return await account.get();
            }
            return newAccount;
        } catch (error) {
            console.error('Create account error:', error);
            throw error;
        }
    }

    // Login user
    async login({ email, password }: LoginCredentials): Promise<Models.Session> {
        try {
            console.log('🔐 AuthService: Attempting login for:', email);
            console.log('🔐 AuthService: Using endpoint:', appwriteConfig.endpoint);
            console.log('🔐 AuthService: Using project ID:', appwriteConfig.projectId);
            
            const startTime = Date.now();
            const session = await account.createEmailPasswordSession(email, password);
            const endTime = Date.now();
            
            console.log(`✅ AuthService: Login successful in ${endTime - startTime}ms`);
            console.log('✅ AuthService: Session created:', {
                sessionId: session.$id,
                userId: session.userId,
                provider: session.provider,
                expire: session.expire
            });
            
            // Create JWT for cross-origin authentication
            console.log('🔑 AuthService: Creating JWT for cross-origin auth...');
            try {
                const jwt = await account.createJWT();
                console.log('✅ AuthService: JWT created successfully');
                
                // Store JWT in localStorage for cross-origin requests
                localStorage.setItem('appwrite_session', jwt.jwt);
                console.log('💾 AuthService: JWT stored in localStorage');
                
                // Update client with JWT
                const { client } = await import('../lib/appwrite');
                client.setJWT(jwt.jwt);
                console.log('🔧 AuthService: Client updated with JWT');
            } catch (jwtError: any) {
                console.error('❌ AuthService: JWT creation failed:', jwtError);
                console.warn('⚠️ Falling back to cookie-based auth (may not work cross-origin)');
            }
            
            // Verify session by getting user data
            console.log('🔍 AuthService: Verifying session...');
            try {
                const userData = await account.get();
                console.log('✅ AuthService: Verified user data:', {
                    userId: userData.$id,
                    email: userData.email,
                    emailVerification: userData.emailVerification,
                    status: userData.status
                });
            } catch (verifyError: any) {
                console.error('❌ AuthService: Session verification failed:', verifyError);
                console.error('❌ This likely means authentication is not working');
            }
            
            return session;
        } catch (error: any) {
            console.error('❌ AuthService: Login failed:', error);
            console.error('❌ AuthService: Login error details:', {
                email: email,
                errorType: error.type,
                errorCode: error.code,
                errorMessage: error.message,
                errorName: error.name
            });
            
            // Provide specific error guidance
            if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
                console.error('🔴 AuthService: Network connectivity issue detected');
                console.error('🔴 AuthService: Possible causes:');
                console.error('   1. Appwrite server is not running');
                console.error('   2. Wrong endpoint URL');
                console.error('   3. Network/firewall blocking connection');
                console.error('   4. CORS configuration issue');
                throw new Error(`Network error: Cannot connect to Appwrite server at ${appwriteConfig.endpoint}`);
            }
            
            throw error;
        }
    }

    // Get current user
    async getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
        try {
            console.log('🔍 AuthService: Attempting to get current user...');
            console.log('🔍 AuthService: Making request to account.get()');
            
            const startTime = Date.now();
            const user = await account.get();
            const endTime = Date.now();
            
            console.log(`✅ AuthService: Successfully got user in ${endTime - startTime}ms:`, user);
            console.log('✅ AuthService: User details:', {
                id: user.$id,
                email: user.email,
                name: user.name,
                emailVerification: user.emailVerification,
                status: user.status
            });
            return user;
        } catch (error: any) {
            console.error('❌ AuthService: Get current user error:', error);
            console.error('❌ AuthService: Error details:', {
                name: error.name,
                message: error.message,
                code: error.code,
                type: error.type,
                response: error.response,
            });
            
            // Detailed error analysis
            if (error.code === 401 || error.type === 'general_unauthorized_scope') {
                console.log('🟡 AuthService: No active session found (this is normal for new users)');
            } else if (error.message?.includes('fetch')) {
                console.error('🔴 AuthService: Network error - cannot reach Appwrite server');
            } else if (error.message?.includes('CORS')) {
                console.error('🔴 AuthService: CORS error - check web platform configuration in Appwrite');
            } else {
                console.error('🔴 AuthService: Unknown error type');
            }
            
            return null;
        }
    }

    // Logout user
    async logout(): Promise<void> {
        try {
            await account.deleteSessions();
            // Clear stored JWT
            localStorage.removeItem('appwrite_session');
            console.log('✅ AuthService: JWT cleared from localStorage');
        } catch (error) {
            console.error('Logout error:', error);
            // Clear JWT anyway
            localStorage.removeItem('appwrite_session');
            throw error;
        }
    }

    // Get user sessions
    async getSessions(): Promise<Models.SessionList> {
        try {
            return await account.listSessions();
        } catch (error) {
            console.error('Get sessions error:', error);
            throw error;
        }
    }

    // Delete specific session
    async deleteSession(sessionId: string): Promise<void> {
        try {
            await account.deleteSession(sessionId);
        } catch (error) {
            console.error('Delete session error:', error);
            throw error;
        }
    }

    // Update user name
    async updateName(name: string): Promise<Models.User<Models.Preferences>> {
        try {
            return await account.updateName(name);
        } catch (error) {
            console.error('Update name error:', error);
            throw error;
        }
    }

    // Update user email
    async updateEmail(email: string, password: string): Promise<Models.User<Models.Preferences>> {
        try {
            return await account.updateEmail(email, password);
        } catch (error) {
            console.error('Update email error:', error);
            throw error;
        }
    }

    // Update user password
    async updatePassword(newPassword: string, oldPassword: string): Promise<Models.User<Models.Preferences>> {
        try {
            return await account.updatePassword(newPassword, oldPassword);
        } catch (error) {
            console.error('Update password error:', error);
            throw error;
        }
    }
}

export const authService = new AuthService();
export default authService;
