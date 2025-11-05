#!/usr/bin/env node

/**
 * Persons Table Appwrite Setup Script
 * Creates the persons collection with all required fields
 * 
 * Schema:
 * - person_id (PK - auto generated as $id)
 * - account_id (FK)
 * - first_name
 * - middle_name
 * - last_name
 * - owner_type_id (FK)
 * - barangay_id (FK)
 * - street
 * - tin
 * - contact_no
 * - status
 * - uid
 * 
 * Requires an API key with admin permissions
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env file manually
function loadEnv() {
    try {
        const envPath = join(__dirname, '..', '..', '.env');
        const envContent = readFileSync(envPath, 'utf8');
        const env = {};
        
        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                env[key.trim()] = value;
            }
        });
        
        return env;
    } catch (error) {
        console.error('❌ Could not read .env file:', error.message);
        process.exit(1);
    }
}

const env = loadEnv();

// Configuration
const APPWRITE_ENDPOINT = env.VITE_APPWRITE_ENDPOINT;
const PROJECT_ID = env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = env.VITE_APPWRITE_DATABASE_ID;
const API_KEY = env.APPWRITE_API_KEY;

console.log('🚀 Starting Persons Table Setup with Admin API Key...');
console.log(`📍 Endpoint: ${APPWRITE_ENDPOINT}`);
console.log(`🆔 Project: ${PROJECT_ID}`);
console.log(`🗄️ Database: ${DATABASE_ID}`);
console.log(`🔑 API Key: ${API_KEY ? 'Present' : 'Missing'}`);

if (!API_KEY) {
    console.error('❌ Missing APPWRITE_API_KEY in .env file');
    console.error('💡 To get an API key:');
    console.error('   1. Go to your Appwrite console');
    console.error('   2. Login as admin');
    console.error('   3. Go to Overview → API Keys');
    console.error('   4. Create a new API key with "Database" permissions');
    console.error('   5. Add APPWRITE_API_KEY=your_key_here to your .env file');
    process.exit(1);
}

class PersonsTableSetup {
    constructor() {
        this.endpoint = APPWRITE_ENDPOINT;
        this.projectId = PROJECT_ID;
        this.databaseId = DATABASE_ID;
        this.apiKey = API_KEY;
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': this.projectId,
            'X-Appwrite-Key': this.apiKey,
        };
    }

    async makeRequest(url, method = 'GET', body = null) {
        const options = {
            method,
            headers: this.getHeaders(),
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            // Handle empty responses (like DELETE operations)
            const text = await response.text();
            if (!text || text.trim() === '') {
                return {}; // Return empty object for empty responses
            }

            try {
                return JSON.parse(text);
            } catch (parseError) {
                console.error('⚠️ Failed to parse JSON response:', text);
                throw new Error(`Invalid JSON response: ${text}`);
            }
        } catch (error) {
            if (error.message.includes('fetch is not defined')) {
                console.error('❌ This Node.js version doesn\'t have built-in fetch. Please use Node.js 18+ or install node-fetch');
                process.exit(1);
            }
            throw error;
        }
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async deleteCollection(collectionId) {
        const url = `${this.endpoint}/databases/${this.databaseId}/collections/${collectionId}`;
        
        try {
            console.log(`🗑️ Deleting existing collection: ${collectionId}...`);
            await this.makeRequest(url, 'DELETE');
            console.log(`✅ Collection ${collectionId} deleted successfully`);
        } catch (error) {
            if (error.message.includes('404')) {
                console.log(`ℹ️ Collection ${collectionId} doesn't exist, skipping deletion`);
            } else {
                throw error;
            }
        }
    }

    async createCollection(collectionId, name) {
        const url = `${this.endpoint}/databases/${this.databaseId}/collections`;
        
        console.log(`🏗️ Creating collection: ${name}...`);
        const collection = await this.makeRequest(url, 'POST', {
            collectionId,
            name,
            permissions: ['read("any")', 'write("users")'],
            documentSecurity: false
        });
        
        console.log(`✅ Collection ${collectionId} created successfully`);
        return collection;
    }

    async createStringAttribute(collectionId, key, size, required = false) {
        const url = `${this.endpoint}/databases/${this.databaseId}/collections/${collectionId}/attributes/string`;
        
        console.log(`  📝 Creating string attribute: ${key} (${size})`);
        await this.makeRequest(url, 'POST', {
            key,
            size,
            required,
            array: false
        });
        
        console.log(`  ✅ Created: ${key}`);
    }

    async createIndex(collectionId, key, type, attributes) {
        const url = `${this.endpoint}/databases/${this.databaseId}/collections/${collectionId}/indexes`;
        
        console.log(`  📇 Creating index: ${key}`);
        await this.makeRequest(url, 'POST', {
            key,
            type,
            attributes
        });
        
        console.log(`  ✅ Created index: ${key}`);
    }

    async setupPersons() {
        const collectionId = 'persons';
        
        console.log('\n👥 === SETTING UP PERSONS ===');
        
        // Delete existing collection
        await this.deleteCollection(collectionId);
        await this.delay(2000);

        // Create collection
        await this.createCollection(collectionId, 'Persons');
        await this.delay(1000);

        // Create attributes
        console.log('\n📝 Creating attributes...');
        
        // Name fields
        await this.createStringAttribute(collectionId, 'first_name', 255, true);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'middle_name', 255, false);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'last_name', 255, true);
        await this.delay(300);
        
        // Foreign key references
        await this.createStringAttribute(collectionId, 'owner_type_id', 100, false);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'barangay_id', 100, false);
        await this.delay(300);
        
        // Address and contact fields
        await this.createStringAttribute(collectionId, 'street', 500, false);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'tin', 50, false);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'contact_no', 50, false);
        await this.delay(300);
        
        // Status and UID
        await this.createStringAttribute(collectionId, 'status', 50, false);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'uid', 100, false);
        await this.delay(300);

        // Create indexes
        console.log('\n📇 Creating indexes...');
        
        // Foreign key indexes
        await this.createIndex(collectionId, 'owner_type_id_fk_index', 'key', ['owner_type_id']);
        await this.delay(500);
        
        await this.createIndex(collectionId, 'barangay_id_fk_index', 'key', ['barangay_id']);
        await this.delay(500);
        
        // Search indexes
        await this.createIndex(collectionId, 'last_name_index', 'key', ['last_name']);
        await this.delay(500);
        
        await this.createIndex(collectionId, 'first_name_index', 'key', ['first_name']);
        await this.delay(500);
        
        await this.createIndex(collectionId, 'status_index', 'key', ['status']);
        await this.delay(500);
        
        await this.createIndex(collectionId, 'uid_index', 'key', ['uid']);
        await this.delay(500);

        console.log('✅ Persons setup complete!');
    }

    async setupAllTables() {
        try {
            // Validate configuration
            if (!this.endpoint || !this.projectId || !this.databaseId || !this.apiKey) {
                console.error('❌ Missing Appwrite configuration in .env file');
                console.error('Required: VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID, VITE_APPWRITE_DATABASE_ID, APPWRITE_API_KEY');
                process.exit(1);
            }

            console.log('\n🎯 Starting setup of persons table...\n');

            await this.setupPersons();

            console.log('\n🎉 PERSONS TABLE SETUP COMPLETED SUCCESSFULLY!');
            console.log('\n📋 Summary:');
            console.log('✅ persons:');
            console.log('   - Attributes:');
            console.log('     • $id (PK - auto generated)');
            console.log('     • first_name (required)');
            console.log('     • middle_name');
            console.log('     • last_name (required)');
            console.log('     • owner_type_id (FK)');
            console.log('     • barangay_id (FK)');
            console.log('     • street');
            console.log('     • tin');
            console.log('     • contact_no');
            console.log('     • status');
            console.log('     • uid');
            console.log('   - Indexes:');
            console.log('     • owner_type_id_fk_index');
            console.log('     • barangay_id_fk_index');
            console.log('     • last_name_index');
            console.log('     • first_name_index');
            console.log('     • status_index');
            console.log('     • uid_index');
            console.log('\n🔗 Foreign Key Relationships:');
            console.log('   • owner_type_id → owner_types table');
            console.log('   • barangay_id → barangays table');
            console.log('\n💡 Note: Accounts table should have person_id FK referencing this table');
            console.log('');
            console.log('🚀 You can now start using the persons table!');
            console.log('\n💡 Next steps:');
            console.log('   1. Add to .env file:');
            console.log('      VITE_APPWRITE_PERSONS_COLLECTION_ID=persons');
            console.log('   2. Create service layer: src/pages/Users/services/person.ts');
            console.log('   3. Create hooks: src/pages/Users/hooks/usePersons.ts');
            console.log('   4. Create component: src/pages/Users/Person.tsx');

        } catch (error) {
            console.error('❌ Setup failed:', error.message);
            
            if (error.message.includes('unauthorized') || error.message.includes('401')) {
                console.error('\n💡 API Key might be invalid or missing permissions.');
                console.error('   Make sure your API key has "Database" scope permissions.');
            } else if (error.message.includes('ECONNREFUSED')) {
                console.error('\n💡 Cannot connect to Appwrite server.');
                console.error('   Make sure your Appwrite server is running at:', this.endpoint);
            }
            
            process.exit(1);
        }
    }
}

// Run the setup
const setup = new PersonsTableSetup();
setup.setupAllTables();
