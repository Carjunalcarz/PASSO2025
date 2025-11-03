import { Client, Account, Databases, Storage, Teams, Functions } from 'appwrite';
// Note: Tables API is available in newer Appwrite versions
// Uncomment below if you want to use Tables API instead of Databases
// import { Tables } from 'appwrite';

// Appwrite configuration
export const appwriteConfig = {
    endpoint: (import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/['"]/g, ''),
    projectId: (import.meta.env.VITE_APPWRITE_PROJECT_ID || '').replace(/['"]/g, ''),
    databaseId: (import.meta.env.VITE_APPWRITE_DATABASE_ID || '').replace(/['"]/g, ''),
    storageId: (import.meta.env.VITE_APPWRITE_STORAGE_ID || '').replace(/['"]/g, ''),
};

// Detailed configuration validation
console.log('🔧 Appwrite Config loaded:', {
    endpoint: appwriteConfig.endpoint,
    projectId: appwriteConfig.projectId,
    databaseId: appwriteConfig.databaseId,
    storageId: appwriteConfig.storageId,
});

console.log('🔍 Configuration validation:');
console.log('📍 Endpoint exists:', !!appwriteConfig.endpoint, '→', appwriteConfig.endpoint || 'MISSING');
console.log('🆔 Project ID exists:', !!appwriteConfig.projectId, '→', appwriteConfig.projectId || 'MISSING');
console.log('🗄️ Database ID exists:', !!appwriteConfig.databaseId, '→', appwriteConfig.databaseId || 'MISSING');
console.log('📦 Storage ID exists:', !!appwriteConfig.storageId, '→', appwriteConfig.storageId || 'MISSING');

// Check for common configuration issues
if (!appwriteConfig.endpoint) {
    console.error('🔴 CRITICAL: VITE_APPWRITE_ENDPOINT is missing or empty!');
}
if (!appwriteConfig.projectId) {
    console.error('🔴 CRITICAL: VITE_APPWRITE_PROJECT_ID is missing or empty!');
}
if (appwriteConfig.endpoint && !appwriteConfig.endpoint.startsWith('http')) {
    console.error('🔴 ERROR: Endpoint should start with http:// or https://');
}

// Show raw environment variables for debugging
console.log('🔍 Raw environment variables:');
console.log('VITE_APPWRITE_ENDPOINT:', import.meta.env.VITE_APPWRITE_ENDPOINT);
console.log('VITE_APPWRITE_PROJECT_ID:', import.meta.env.VITE_APPWRITE_PROJECT_ID);
console.log('VITE_APPWRITE_DATABASE_ID:', import.meta.env.VITE_APPWRITE_DATABASE_ID);
console.log('VITE_APPWRITE_STORAGE_ID:', import.meta.env.VITE_APPWRITE_STORAGE_ID);

// Health check removed - causes CORS errors in production
// Authentication will validate connectivity when needed

// Initialize Appwrite client
console.log('🔧 Initializing Appwrite client...');
export const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);

// For cross-origin requests, try to restore session from localStorage
if (typeof window !== 'undefined') {
    console.log('🔧 Checking for stored session...');
    const storedSession = localStorage.getItem('appwrite_session');
    if (storedSession) {
        console.log('📦 Found stored session, setting JWT...');
        client.setJWT(storedSession);
    }
}

console.log('✅ Appwrite client initialized with:', {
    endpoint: appwriteConfig.endpoint,
    projectId: appwriteConfig.projectId
});

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const teams = new Teams(client);
export const functions = new Functions(client);

export default client;
