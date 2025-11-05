#!/usr/bin/env node

/**
 * Persons and User Accounts Table Appwrite Setup Script
 * Creates the persons and user_accounts collections with all required fields
 * 
 * Note: This script uses Appwrite's built-in Teams feature instead of a custom teams table.
 * Teams are managed through Appwrite's Teams API.
 * 
 * Usage:
 * - Setup all collections: node scripts/Users/setup-person.js
 * - Update single person: node scripts/Users/setup-person.js --update-person <id> --team-ids <team1,team2> --account-id <account>
 * - Bulk update: node scripts/Users/setup-person.js --bulk-update <json-file>
 * - List missing IDs: node scripts/Users/setup-person.js --list-missing
 * 
 * Schema:
 * 
 * PERSONS:
 * - person_id (PK - auto generated as $id)
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
 * - team_ids (FK → Appwrite Teams) [array - supports multiple teams]
 * - user_account_id (FK → user_accounts)
 * 
 * TEAMS:
 * - Managed by Appwrite Teams API (not a custom table)
 * - Use Appwrite SDK: teams.create(), teams.list(), teams.createMembership(), etc.
 * 
 * USER_ACCOUNTS:
 * - account_id (PK - auto generated as $id)
 * - person_id (FK → persons)
 * - team_id (FK → teams)
 * - appwrite_user_id (Appwrite Auth User ID)
 * - email
 * - role
 * - status
 * - last_login
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

    async createStringAttribute(collectionId, key, size, required = false, isArray = false) {
        const url = `${this.endpoint}/databases/${this.databaseId}/collections/${collectionId}/attributes/string`;
        
        console.log(`  📝 Creating string attribute: ${key} (${size})${isArray ? ' [array]' : ''}`);
        await this.makeRequest(url, 'POST', {
            key,
            size,
            required,
            array: isArray
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

    async setupTeams() {
        console.log('\n👥 === TEAMS ===');
        console.log('ℹ️  Using Appwrite\'s built-in Teams feature');
        console.log('ℹ️  No custom teams table needed');
        console.log('ℹ️  Manage teams via Appwrite Console or Teams API');
        console.log('✅ Teams configuration complete!');
    }

    async setupUserAccounts() {
        const collectionId = 'user_accounts';
        
        console.log('\n👤 === SETTING UP USER ACCOUNTS ===');
        
        // Delete existing collection
        await this.deleteCollection(collectionId);
        await this.delay(2000);

        // Create collection
        await this.createCollection(collectionId, 'User Accounts');
        await this.delay(1000);

        // Create attributes
        console.log('\n📝 Creating attributes...');
        
        // Foreign keys
        await this.createStringAttribute(collectionId, 'person_id', 100, true);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'team_id', 100, false);
        await this.delay(300);
        
        // Appwrite user reference
        await this.createStringAttribute(collectionId, 'appwrite_user_id', 100, true);
        await this.delay(300);
        
        // User details
        await this.createStringAttribute(collectionId, 'email', 255, true);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'role', 100, true);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'status', 50, false);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'last_login', 100, false);
        await this.delay(300);

        // Create indexes
        console.log('\n📇 Creating indexes...');
        
        // Foreign key indexes
        await this.createIndex(collectionId, 'person_id_fk_index', 'key', ['person_id']);
        await this.delay(500);
        
        await this.createIndex(collectionId, 'team_id_fk_index', 'key', ['team_id']);
        await this.delay(500);
        
        // Unique indexes
        await this.createIndex(collectionId, 'appwrite_user_id_unique', 'unique', ['appwrite_user_id']);
        await this.delay(500);
        
        await this.createIndex(collectionId, 'email_unique', 'unique', ['email']);
        await this.delay(500);
        
        // Search indexes
        await this.createIndex(collectionId, 'role_index', 'key', ['role']);
        await this.delay(500);
        
        await this.createIndex(collectionId, 'status_index', 'key', ['status']);
        await this.delay(500);

        console.log('✅ User Accounts setup complete!');
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
        
        // Team and User Account references (team_ids is an array for multiple teams)
        await this.createStringAttribute(collectionId, 'team_ids', 100, false, true);
        await this.delay(300);
        
        await this.createStringAttribute(collectionId, 'user_account_id', 100, false);
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
        
        await this.createIndex(collectionId, 'team_ids_fk_index', 'key', ['team_ids']);
        await this.delay(500);
        
        await this.createIndex(collectionId, 'user_account_id_fk_index', 'key', ['user_account_id']);
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

            console.log('\n🎯 Starting setup of all user-related tables...\n');

            // Setup tables in order (dependencies first)
            await this.setupTeams();
            await this.setupPersons();
            await this.setupUserAccounts();

            console.log('\n🎉 ALL USER TABLES SETUP COMPLETED SUCCESSFULLY!');
            console.log('\n📋 Summary:');
            
            console.log('\n✅ teams:');
            console.log('   - Using Appwrite\'s built-in Teams API');
            console.log('   - No custom table created');
            console.log('   - Manage via: Appwrite Console → Teams');
            console.log('   - API: teams.create(), teams.list(), teams.createMembership()');
            
            console.log('\n✅ persons:');
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
            console.log('     • team_ids (FK - array for multiple teams)');
            console.log('     • user_account_id (FK)');
            console.log('   - Indexes:');
            console.log('     • owner_type_id_fk_index');
            console.log('     • barangay_id_fk_index');
            console.log('     • last_name_index');
            console.log('     • first_name_index');
            console.log('     • status_index');
            console.log('     • uid_index');
            console.log('     • team_ids_fk_index');
            console.log('     • user_account_id_fk_index');
            
            console.log('\n✅ user_accounts:');
            console.log('   - Attributes:');
            console.log('     • $id (PK - auto generated)');
            console.log('     • person_id (FK - required)');
            console.log('     • team_id (FK)');
            console.log('     • appwrite_user_id (required, unique)');
            console.log('     • email (required, unique)');
            console.log('     • role (required)');
            console.log('     • status');
            console.log('     • last_login');
            console.log('   - Indexes:');
            console.log('     • person_id_fk_index');
            console.log('     • team_id_fk_index');
            console.log('     • appwrite_user_id_unique (unique)');
            console.log('     • email_unique (unique)');
            console.log('     • role_index');
            console.log('     • status_index');
            
            console.log('\n🔗 Foreign Key Relationships:');
            console.log('   • persons.owner_type_id → owner_types table');
            console.log('   • persons.barangay_id → barangays table');
            console.log('   • persons.team_ids → Appwrite Teams (array - multiple teams)');
            console.log('   • persons.user_account_id → user_accounts table');
            console.log('   • user_accounts.person_id → persons table');
            console.log('   • user_accounts.team_id → Appwrite Teams');
            console.log('   • user_accounts.appwrite_user_id → Appwrite Auth Users');
            console.log('');
            console.log('🚀 You can now start using all user-related tables!');
            console.log('\n💡 Next steps:');
            console.log('   1. Add to .env file:');
            console.log('      VITE_APPWRITE_PERSONS_COLLECTION_ID=persons');
            console.log('      VITE_APPWRITE_USER_ACCOUNTS_COLLECTION_ID=user_accounts');
            console.log('   2. Create service layers:');
            console.log('      - src/pages/Users/services/team.ts (using Appwrite Teams API)');
            console.log('      - src/pages/Users/services/person.ts (already exists)');
            console.log('      - src/pages/Users/services/userAccount.ts');
            console.log('   3. Create teams via Appwrite Console or Teams API');
            console.log('   4. Update PersonForm.tsx to use Appwrite Teams');

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

    async updatePersonRecord(personId, teamIds = null, userAccountId = null) {
        const url = `${this.endpoint}/databases/${this.databaseId}/collections/persons/documents/${personId}`;
        
        console.log(`\n📝 Updating person ${personId}...`);
        
        const updateData = {};
        if (teamIds) {
            // Ensure teamIds is an array
            updateData.team_ids = Array.isArray(teamIds) ? teamIds : [teamIds];
        }
        if (userAccountId) updateData.user_account_id = userAccountId;

        if (Object.keys(updateData).length === 0) {
            console.log('⚠️ No data to update');
            return;
        }

        try {
            const response = await this.makeRequest(url, 'PATCH', updateData);
            console.log(`✅ Person updated successfully`);
            console.log(`   Team IDs: ${teamIds ? JSON.stringify(updateData.team_ids) : 'not set'}`);
            console.log(`   User Account ID: ${userAccountId || 'not set'}`);
            return response;
        } catch (error) {
            console.error(`❌ Failed to update person ${personId}:`, error.message);
            throw error;
        }
    }

    async bulkUpdatePersons(updates) {
        console.log(`\n🔄 === BULK UPDATING ${updates.length} PERSONS ===\n`);
        
        let successCount = 0;
        let failCount = 0;

        for (const update of updates) {
            try {
                await this.updatePersonRecord(
                    update.personId,
                    update.teamIds || update.teamId, // Support both teamIds (array) and legacy teamId (string)
                    update.userAccountId
                );
                successCount++;
                await this.delay(200);
            } catch (error) {
                console.error(`Failed to update ${update.personId}`);
                failCount++;
            }
        }

        console.log('\n📊 Bulk Update Summary:');
        console.log(`   ✅ Success: ${successCount}`);
        console.log(`   ❌ Failed: ${failCount}`);
        console.log(`   📝 Total: ${updates.length}`);
    }

    async getAllPersons() {
        const url = `${this.endpoint}/databases/${this.databaseId}/collections/persons/documents?limit=100`;
        
        try {
            const response = await this.makeRequest(url, 'GET');
            return response.documents || [];
        } catch (error) {
            console.error('❌ Failed to fetch persons:', error.message);
            throw error;
        }
    }

    async listPersonsWithoutIds() {
        console.log('\n📋 === PERSONS WITHOUT TEAM/ACCOUNT IDs ===\n');
        
        const persons = await this.getAllPersons();
        const personsWithoutIds = persons.filter(p => !p.team_ids || p.team_ids.length === 0 || !p.user_account_id);

        if (personsWithoutIds.length === 0) {
            console.log('✅ All persons have team_ids and user_account_id set!');
            return;
        }

        console.log(`Found ${personsWithoutIds.length} persons without IDs:\n`);
        personsWithoutIds.forEach(person => {
            console.log(`ID: ${person.$id}`);
            console.log(`Name: ${person.first_name} ${person.last_name}`);
            console.log(`Team IDs: ${person.team_ids && person.team_ids.length > 0 ? JSON.stringify(person.team_ids) : '❌ NOT SET'}`);
            console.log(`User Account ID: ${person.user_account_id || '❌ NOT SET'}`);
            console.log('---');
        });
    }
}

// CLI Handler
async function main() {
    const args = process.argv.slice(2);
    
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

    const setup = new PersonsTableSetup();

    try {
        if (args.includes('--update-person')) {
            const personIdIndex = args.indexOf('--update-person') + 1;
            const teamIdsIndex = args.indexOf('--team-ids') + 1;
            const accountIdIndex = args.indexOf('--account-id') + 1;

            const personId = args[personIdIndex];
            // Support comma-separated team IDs or single team ID
            const teamIdsArg = teamIdsIndex > 0 ? args[teamIdsIndex] : null;
            const teamIds = teamIdsArg ? teamIdsArg.split(',').map(id => id.trim()) : null;
            const accountId = accountIdIndex > 0 ? args[accountIdIndex] : null;

            if (!personId) {
                console.error('❌ Person ID is required');
                console.log('Usage: node scripts/Users/setup-person.js --update-person <person_id> --team-ids <team_id1,team_id2> --account-id <account_id>');
                console.log('Example: node scripts/Users/setup-person.js --update-person abc123 --team-ids team1,team2,team3 --account-id acc456');
                process.exit(1);
            }

            await setup.updatePersonRecord(personId, teamIds, accountId);
        }
        else if (args.includes('--bulk-update')) {
            const fileIndex = args.indexOf('--bulk-update') + 1;
            const filePath = args[fileIndex];

            if (!filePath) {
                console.error('❌ JSON file path is required');
                console.log('Usage: node scripts/Users/setup-person.js --bulk-update <json_file>');
                console.log('\nJSON format:');
                console.log('[');
                console.log('  { "personId": "123", "teamIds": ["team1", "team2"], "userAccountId": "acc1" },');
                console.log('  { "personId": "456", "teamIds": ["team3"], "userAccountId": "acc2" }');
                console.log(']');
                console.log('\nNote: Use "teamIds" (array) for multiple teams, or "teamId" (string) for single team (legacy).');
                process.exit(1);
            }

            const updates = JSON.parse(readFileSync(filePath, 'utf8'));
            await setup.bulkUpdatePersons(updates);
        }
        else if (args.includes('--list-missing')) {
            await setup.listPersonsWithoutIds();
        }
        else if (args.includes('--help') || args.includes('-h')) {
            console.log('📚 Person Management Script - Usage:\n');
            console.log('1. Setup all collections (run once):');
            console.log('   node scripts/Users/setup-person.js\n');
            console.log('2. Update a single person:');
            console.log('   node scripts/Users/setup-person.js --update-person <person_id> --team-ids <team_id1,team_id2> --account-id <account_id>');
            console.log('   Example: node scripts/Users/setup-person.js --update-person abc123 --team-ids team1,team2 --account-id acc456\n');
            console.log('3. Bulk update from JSON file:');
            console.log('   node scripts/Users/setup-person.js --bulk-update updates.json\n');
            console.log('4. List persons without IDs:');
            console.log('   node scripts/Users/setup-person.js --list-missing\n');
            console.log('Example JSON format for bulk update:');
            console.log('[');
            console.log('  { "personId": "123abc", "teamIds": ["team_xyz", "team_abc"], "userAccountId": "acc_123" },');
            console.log('  { "personId": "456def", "teamIds": ["team_def"], "userAccountId": "acc_456" }');
            console.log(']');
            console.log('\nNote: Use "teamIds" (array) for multiple teams. Legacy "teamId" (string) is also supported.');
        }
        else {
            // Default: Run full setup
            await setup.setupAllTables();
        }
    } catch (error) {
        console.error('\n❌ Operation failed:', error.message);
        process.exit(1);
    }
}

main();
