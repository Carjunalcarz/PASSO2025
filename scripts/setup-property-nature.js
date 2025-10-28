#!/usr/bin/env node

/**
 * Property Nature Table Appwrite Setup Script
 * Creates the property_nature collection with:
 * - property_nature_id (PK, auto-generated)
 * - building_part_rate_id (FK)
 * - building_depreciation_id (FK)
 * - machinery_type_id (FK)
 * - product_id (FK)
 * - subclass_id (FK)
 * - subkind_id (FK)
 * - name
 * - status
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

console.log('🚀 Starting Property Nature Table Setup with Admin API Key...');
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

class PropertyNatureTableSetup {
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
        
        console.log(`  📝 Creating string attribute: ${key} (size: ${size}, required: ${required})`);
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

    async setupPropertyNature() {
        const collectionId = 'property_nature';
        
        console.log('\n🏢 === SETTING UP PROPERTY NATURE TABLE ===');
        
        // Delete existing collection
        await this.deleteCollection(collectionId);
        await this.delay(2000);

        // Create collection
        await this.createCollection(collectionId, 'Property Nature');
        await this.delay(1000);

        // Create attributes
        console.log('\n📝 Creating attributes...');
        
        // Note: property_nature_id is auto-generated as $id by Appwrite
        console.log('  ℹ️ property_nature_id will be auto-generated as $id (Primary Key)');
        
        // Foreign Keys
        await this.createStringAttribute(collectionId, 'building_part_rate_id', 100, false);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'building_depreciation_id', 100, false);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'machinery_type_id', 100, false);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'product_id', 100, false);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'subclass_id', 100, false);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'subkind_id', 100, false);
        await this.delay(300);
        
        // Regular fields
        await this.createStringAttribute(collectionId, 'name', 500, true);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'status', 50, false);
        await this.delay(300);

        // Create indexes
        console.log('\n📇 Creating indexes...');
        
        await this.createIndex(collectionId, 'name_index', 'key', ['name']);
        await this.delay(500);
        
        await this.createIndex(collectionId, 'status_index', 'key', ['status']);
        await this.delay(500);
        
        // Foreign key indexes
        await this.createIndex(collectionId, 'building_part_rate_index', 'key', ['building_part_rate_id']);
        await this.delay(500);
        
        await this.createIndex(collectionId, 'building_depreciation_index', 'key', ['building_depreciation_id']);
        await this.delay(500);
        
        await this.createIndex(collectionId, 'machinery_type_index', 'key', ['machinery_type_id']);
        await this.delay(500);
        
        await this.createIndex(collectionId, 'product_index', 'key', ['product_id']);
        await this.delay(500);
        
        await this.createIndex(collectionId, 'subclass_index', 'key', ['subclass_id']);
        await this.delay(500);
        
        await this.createIndex(collectionId, 'subkind_index', 'key', ['subkind_id']);
        await this.delay(500);

        console.log('\n✅ Property Nature table setup complete!');
        console.log('\n📋 Collection Details:');
        console.log('   - Collection ID: property_nature');
        console.log('   - Primary Key: $id (auto-generated)');
        console.log('   - Foreign Keys: building_part_rate_id, building_depreciation_id, machinery_type_id, product_id, subclass_id, subkind_id');
        console.log('   - Fields: name, status');
        console.log('   - Auto Fields: $id, $createdAt, $updatedAt');
        console.log('\n💡 Add this to your .env file:');
        console.log('   VITE_APPWRITE_PROPERTY_NATURE_COLLECTION_ID=property_nature');
    }

    async run() {
        try {
            await this.setupPropertyNature();
            console.log('\n🎉 All done! Property Nature table is ready to use.');
        } catch (error) {
            console.error('\n❌ Setup failed:', error.message);
            console.error('Full error:', error);
            process.exit(1);
        }
    }
}

// Run the setup
const setup = new PropertyNatureTableSetup();
setup.run();
