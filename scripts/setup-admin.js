#!/usr/bin/env node

/**
 * Admin Appwrite Collection Setup Script
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
const API_KEY = env.APPWRITE_API_KEY; // Add this to your .env file
const COLLECTION_ID = 'property_assessments';

console.log('🚀 Starting Appwrite Collection Setup with Admin API Key...');
console.log(`📍 Endpoint: ${APPWRITE_ENDPOINT}`);
console.log(`🆔 Project: ${PROJECT_ID}`);
console.log(`🗄️ Database: ${DATABASE_ID}`);
console.log(`🔑 API Key: ${API_KEY ? 'Present' : 'Missing'}`);

if (!API_KEY) {
    console.error('❌ Missing APPWRITE_API_KEY in .env file');
    console.error('💡 To get an API key:');
    console.error('   1. Go to http://192.168.2.3');
    console.error('   2. Login as admin');
    console.error('   3. Go to Overview → API Keys');
    console.error('   4. Create a new API key with "Database" permissions');
    console.error('   5. Add APPWRITE_API_KEY=your_key_here to your .env file');
    process.exit(1);
}

class AdminAppwriteSetup {
    constructor() {
        this.endpoint = APPWRITE_ENDPOINT;
        this.projectId = PROJECT_ID;
        this.databaseId = DATABASE_ID;
        this.apiKey = API_KEY;
        this.collectionId = COLLECTION_ID;
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': this.projectId,
            'X-Appwrite-Key': this.apiKey, // Use API key for admin access
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

            return response.json();
        } catch (error) {
            if (error.message.includes('fetch is not defined')) {
                console.error('❌ This Node.js version doesn\'t have built-in fetch. Please use Node.js 18+ or install node-fetch');
                process.exit(1);
            }
            throw error;
        }
    }

    async deleteCollection() {
        const url = `${this.endpoint}/databases/${this.databaseId}/collections/${this.collectionId}`;
        
        try {
            console.log('🗑️ Deleting existing collection...');
            await this.makeRequest(url, 'DELETE');
            console.log('✅ Collection deleted successfully');
        } catch (error) {
            if (error.message.includes('404')) {
                console.log('ℹ️ Collection doesn\'t exist, skipping deletion');
            } else {
                throw error;
            }
        }
    }

    async createCollection() {
        const url = `${this.endpoint}/databases/${this.databaseId}/collections`;
        
        console.log('🏗️ Creating new collection...');
        const collection = await this.makeRequest(url, 'POST', {
            collectionId: this.collectionId,
            name: 'Property Assessments',
            permissions: ['read("any")', 'write("users")'],
            documentSecurity: false
        });
        
        console.log('✅ Collection created successfully');
        return collection;
    }

    async createStringAttribute(key, size, required = false) {
        const url = `${this.endpoint}/databases/${this.databaseId}/collections/${this.collectionId}/attributes/string`;
        
        console.log(`📝 Creating string attribute: ${key} (${size})`);
        await this.makeRequest(url, 'POST', {
            key,
            size,
            required,
            array: false
        });
        
        console.log(`✅ Created: ${key}`);
    }

    async createFloatAttribute(key, required = false, defaultValue = 0) {
        const url = `${this.endpoint}/databases/${this.databaseId}/collections/${this.collectionId}/attributes/float`;
        
        console.log(`🔢 Creating float attribute: ${key}`);
        await this.makeRequest(url, 'POST', {
            key,
            required,
            default: defaultValue,
            array: false
        });
        
        console.log(`✅ Created: ${key}`);
    }

    async createIndex(key, type, attributes) {
        const url = `${this.endpoint}/databases/${this.databaseId}/collections/${this.collectionId}/indexes`;
        
        console.log(`📇 Creating index: ${key}`);
        await this.makeRequest(url, 'POST', {
            key,
            type,
            attributes
        });
        
        console.log(`✅ Created index: ${key}`);
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async setupCollection() {
        try {
            // Validate configuration
            if (!this.endpoint || !this.projectId || !this.databaseId || !this.apiKey) {
                console.error('❌ Missing Appwrite configuration in .env file');
                console.error('Required: VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID, VITE_APPWRITE_DATABASE_ID, APPWRITE_API_KEY');
                process.exit(1);
            }

            // Step 1: Delete existing collection
            await this.deleteCollection();
            await this.delay(2000);

            // Step 2: Create new collection
            await this.createCollection();
            await this.delay(1000);

            // Step 3: Create string attributes
            console.log('\n📝 Creating string attributes...');
            const stringAttributes = [
                { key: 'tdn', size: 50, required: false  },
                { key: 'pin', size: 50, required: false },
                { key: 'name', size: 1000, required: false },
                { key: 'csv_id', size: 100, required: true },
                { key: 'classification', size: 100, required: false },
                { key: 'taxability', size: 50, required: false },
                { key: 'mun_code', size: 100, required: false },
                { key: 'municipality', size: 100, required: false },
                { key: 'kind', size: 100, required: false },
                { key: 'ass_level', size: 50, required: false },
                { key: 'sub_class', size: 100, required: false },
                { key: 'trans_cd', size: 100, required: false },
                { key: 'tax_beg_yr', size: 100, required: false },
                { key: 'eff_date', size: 100, required: false },
                { key: 'owner_no', size: 100, required: false },
                { key: 'bcode', size: 100, required: false },
                { key: 'barangay', size: 100, required: false },
                { key: 'gr_code', size: 100, required: false },
                { key: 'gr', size: 100, required: false },
                { key: 'date_input', size: 100, required: false },
                { key: 'inputed_by', size: 100, required: false },
            ];

            for (const attr of stringAttributes) {
                await this.createStringAttribute(attr.key, attr.size, attr.required);
                await this.delay(300);
            }

            // Step 4: Create numeric attributes
            console.log('\n🔢 Creating numeric attributes...');
            const numericAttributes = [
                { key: 'market_val', required: false },
                { key: 'ass_value', required: false },
                { key: 'area', required: false },
                { key: 'unit_value', required: false }
            ];

            for (const attr of numericAttributes) {
                await this.createFloatAttribute(attr.key, attr.required, 0);
                await this.delay(300);
            }

            // Step 5: Create indexes (no unique constraints to allow duplicate imports)
            console.log('\n📇 Creating indexes...');
            const indexes = [
                { key: 'tdn_index', type: 'key', attributes: ['tdn'] },
                { key: 'csv_id_index', type: 'key', attributes: ['csv_id'] },
                { key: 'municipality_index', type: 'key', attributes: ['municipality'] },
                { key: 'mun_code_index', type: 'key', attributes: ['mun_code'] },
                { key: 'classification_index', type: 'key', attributes: ['classification'] },
                { key: 'taxability_index', type: 'key', attributes: ['taxability'] },
                { key: 'pin_index', type: 'key', attributes: ['pin'] }
            ];

            for (const index of indexes) {
                try {
                    await this.createIndex(index.key, index.type, index.attributes);
                    await this.delay(500);
                } catch (error) {
                    console.warn(`⚠️ Failed to create index ${index.key}:`, error.message);
                }
            }

            console.log('\n🎉 Collection setup completed successfully!');
            console.log('\n📋 Summary:');
            console.log('✅ Collection: property_assessments');
            console.log('✅ String attributes: 21');
            console.log('✅ Numeric attributes: 4');
            console.log('✅ Indexes: 7 (no unique constraints - allows duplicates)');
            console.log('✅ Permissions: read("any"), write("users")');
            console.log('\n🚀 You can now test CSV import!');

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
const setup = new AdminAppwriteSetup();
setup.setupCollection();
