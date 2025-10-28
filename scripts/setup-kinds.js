#!/usr/bin/env node

/**
 * Kinds Tables Appwrite Setup Script
 * Creates two related collections:
 * 1. kinds
 * 2. sub_kinds
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

console.log('🚀 Starting Kinds Tables Setup with Admin API Key...');
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

class KindsTablesSetup {
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

    async setupKinds() {
        const collectionId = 'kinds';
        
        console.log('\n📚 === SETTING UP KINDS ===');
        
        // Delete existing collection
        await this.deleteCollection(collectionId);
        await this.delay(2000);

        // Create collection
        await this.createCollection(collectionId, 'Kinds');
        await this.delay(1000);

        // Create attributes
        console.log('\n📝 Creating attributes...');
        
        await this.createStringAttribute(collectionId, 'name', 255, true);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'description', 500, false);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'status', 50, false);
        await this.delay(300);

        // Create indexes
        console.log('\n📇 Creating indexes...');
        
        await this.createIndex(collectionId, 'status_index', 'key', ['status']);
        await this.delay(500);
        
        await this.createIndex(collectionId, 'name_index', 'key', ['name']);
        await this.delay(500);

        console.log('✅ Kinds setup complete!');
    }

    async setupSubKinds() {
        const collectionId = 'sub_kinds';
        
        console.log('\n📂 === SETTING UP SUB-KINDS ===');
        
        // Delete existing collection
        await this.deleteCollection(collectionId);
        await this.delay(2000);

        // Create collection
        await this.createCollection(collectionId, 'Sub-Kinds');
        await this.delay(1000);

        // Create attributes
        console.log('\n📝 Creating attributes...');
        
        await this.createStringAttribute(collectionId, 'name', 255, true);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'description', 500, false);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'status', 50, false);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'kind_id', 100, true);
        await this.delay(300);

        // Create indexes
        console.log('\n📇 Creating indexes...');
        
        await this.createIndex(collectionId, 'kind_id_fk_index', 'key', ['kind_id']);
        await this.delay(500);
        
        await this.createIndex(collectionId, 'status_index', 'key', ['status']);
        await this.delay(500);
        
        await this.createIndex(collectionId, 'name_index', 'key', ['name']);
        await this.delay(500);

        console.log('✅ Sub-Kinds setup complete!');
    }

    async setupAllTables() {
        try {
            // Validate configuration
            if (!this.endpoint || !this.projectId || !this.databaseId || !this.apiKey) {
                console.error('❌ Missing Appwrite configuration in .env file');
                console.error('Required: VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID, VITE_APPWRITE_DATABASE_ID, APPWRITE_API_KEY');
                process.exit(1);
            }

            console.log('\n🎯 Starting setup of all kinds tables...\n');

            // Setup tables in order (parent tables first)
            await this.setupKinds();
            await this.delay(2000);
            
            await this.setupSubKinds();

            console.log('\n🎉 ALL KINDS TABLES SETUP COMPLETED SUCCESSFULLY!');
            console.log('\n📋 Summary:');
            console.log('✅ kinds:');
            console.log('   - Attributes: $id (PK - auto), name, description, status');
            console.log('   - Indexes: status_index, name_index');
            console.log('');
            console.log('✅ sub_kinds:');
            console.log('   - Attributes: $id (PK - auto), name, description, status, kind_id (FK)');
            console.log('   - Indexes: kind_id_fk_index, status_index, name_index');
            console.log('');
            console.log('🔗 Relationships:');
            console.log('   kinds.$id → sub_kinds.kind_id (1:N)');
            console.log('');
            console.log('🚀 You can now start using these tables!');
            console.log('\n💡 Next steps:');
            console.log('   1. Add to .env file:');
            console.log('      VITE_APPWRITE_KINDS_COLLECTION_ID=kinds');
            console.log('      VITE_APPWRITE_SUB_KINDS_COLLECTION_ID=sub_kinds');

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
const setup = new KindsTablesSetup();
setup.setupAllTables();
