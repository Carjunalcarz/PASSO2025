#!/usr/bin/env node

/**
 * Machinery Tables Appwrite Setup Script
 * Creates two related collections:
 * 1. machinery_types
 * 2. machinery_rates
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
        const envPath = join(__dirname, '..', '.env');
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

console.log('🚀 Starting Machinery Tables Setup with Admin API Key...');
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

class MachineryTablesSetup {
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

    async createFloatAttribute(collectionId, key, required = false, defaultValue = 0) {
        const url = `${this.endpoint}/databases/${this.databaseId}/collections/${collectionId}/attributes/float`;
        
        console.log(`  🔢 Creating float attribute: ${key}`);
        await this.makeRequest(url, 'POST', {
            key,
            required,
            default: defaultValue,
            array: false
        });
        
        console.log(`  ✅ Created: ${key}`);
    }

    async createDatetimeAttribute(collectionId, key, required = false) {
        const url = `${this.endpoint}/databases/${this.databaseId}/collections/${collectionId}/attributes/datetime`;
        
        console.log(`  📅 Creating datetime attribute: ${key}`);
        await this.makeRequest(url, 'POST', {
            key,
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

    async setupMachineryTypes() {
        const collectionId = 'machinery_types';
        
        console.log('\n🏭 === SETTING UP MACHINERY TYPES ===');
        
        // Delete existing collection
        await this.deleteCollection(collectionId);
        await this.delay(2000);

        // Create collection
        await this.createCollection(collectionId, 'Machinery Types');
        await this.delay(1000);

        // Create attributes
        console.log('\n📝 Creating attributes...');
        
        await this.createStringAttribute(collectionId, 'name', 500, true);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'description', 500, false);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'status', 50, false);
        await this.delay(300);

        // Create indexes
        console.log('\n📇 Creating indexes...');
        
        await this.createIndex(collectionId, 'name_index', 'key', ['name']);
        await this.delay(500);
        
        await this.createIndex(collectionId, 'status_index', 'key', ['status']);
        await this.delay(500);

        console.log('✅ Machinery Types setup complete!');
    }

    async setupMachineryRates() {
        const collectionId = 'machinery_rates';
        
        console.log('\n💰 === SETTING UP MACHINERY RATES ===');
        
        // Delete existing collection
        await this.deleteCollection(collectionId);
        await this.delay(2000);

        // Create collection
        await this.createCollection(collectionId, 'Machinery Rates');
        await this.delay(1000);

        // Create attributes
        console.log('\n📝 Creating attributes...');
        
        await this.createStringAttribute(collectionId, 'name', 500, false);
        await this.delay(300);
        
        await this.createFloatAttribute(collectionId, 'rate', false, 0);
        await this.delay(300);
        
        await this.createDatetimeAttribute(collectionId, 'effectivity_date', false);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'status', 50, false);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'machinery_type_id', 50, false);
        await this.delay(300);

        // Create indexes
        console.log('\n📇 Creating indexes...');
        
        await this.createIndex(collectionId, 'machinery_type_fk_index', 'key', ['machinery_type_id']);
        await this.delay(500);
        
        await this.createIndex(collectionId, 'status_index', 'key', ['status']);
        await this.delay(500);
        
        await this.createIndex(collectionId, 'effectivity_date_index', 'key', ['effectivity_date']);
        await this.delay(500);

        console.log('✅ Machinery Rates setup complete!');
    }

    async setupAllTables() {
        try {
            // Validate configuration
            if (!this.endpoint || !this.projectId || !this.databaseId || !this.apiKey) {
                console.error('❌ Missing Appwrite configuration in .env file');
                console.error('Required: VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID, VITE_APPWRITE_DATABASE_ID, APPWRITE_API_KEY');
                process.exit(1);
            }

            console.log('\n🎯 Starting setup of all machinery tables...\n');

            // Setup tables in order (parent tables first)
            await this.setupMachineryTypes();
            await this.delay(2000);
            
            await this.setupMachineryRates();

            console.log('\n🎉 ALL MACHINERY TABLES SETUP COMPLETED SUCCESSFULLY!');
            console.log('\n📋 Summary:');
            console.log('✅ machinery_types:');
            console.log('   - Attributes: machinery_type_id (PK), name, description, status');
            console.log('   - Indexes: name_index, status_index');
            console.log('');
            console.log('✅ machinery_rates:');
            console.log('   - Attributes: name, rate, effectivity_date, status, machinery_type_id (FK)');
            console.log('   - Indexes: machinery_type_fk_index, status_index, effectivity_date_index');
            console.log('');
            console.log('🔗 Relationships:');
            console.log('   machinery_types → machinery_rates (1:N)');
            console.log('');
            console.log('🚀 You can now start using these tables!');
            console.log('\n💡 Next steps:');
            console.log('   1. Add to .env file:');
            console.log('      VITE_APPWRITE_MACHINERY_TYPES_COLLECTION_ID=machinery_types');
            console.log('      VITE_APPWRITE_MACHINERY_RATES_COLLECTION_ID=machinery_rates');

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
const setup = new MachineryTablesSetup();
setup.setupAllTables();
