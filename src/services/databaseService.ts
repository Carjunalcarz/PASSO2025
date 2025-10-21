import { databases, appwriteConfig } from '../lib/appwrite';
import { ID, Query, Models } from 'appwrite';

export interface AssessmentDocument {
    $id?: string;
    csv_id?: string; // Unique CSV identifier for import duplicate handling
    pin: string;
    name: string;
    tdn: string;
    market_val: number;
    ass_value: number;
    area: number;
    unit_value: number;
    kind: string;
    ass_level: string;
    classification: string;
    sub_class: string;
    taxability: string;
    trans_cd: string;
    tax_beg_yr: string;
    eff_date: string;
    owner_no: string;
    mun_code: string;
    municipality: string;
    bcode: string;
    barangay: string;
    gr_code: string;
    gr: string;
    $createdAt?: string;
    $updatedAt?: string;
}

// Interface for batch import result
interface BatchImportResult {
    success: boolean;
    id?: string;
    recordId: string;
    updated?: boolean;
    error?: string;
    rateLimited?: boolean;
    errorCode?: string;
    errorType?: string;
    originalError?: string;
}

// New interface for Building Assessment based on your Appwrite schema
export interface BuildingAssessmentDocument {
    $id?: string;
    clientLocalId?: string;
    createdAt?: string;
    updatedAt?: string;
    userId?: string;
    synced?: boolean;
    ownerName?: string;
    transactionCode?: string;
    tdArp?: string;
    pin?: string;
    barangay?: string;
    municipality?: string;
    province?: string;
    marketValueTotal?: number;
    taxable?: boolean;
    effYear?: string;
    effQuarter?: string;
    totalArea?: number;
    additionalItem?: string;
    isSuperseded?: boolean;
    owner_details?: string; // JSON string
    building_location?: string; // JSON string
    land_reference?: string; // JSON string
    general_description?: string; // JSON string
    structural_materials?: string; // JSON string
    property_appraisal?: string; // JSON string
    property_assessment?: string; // JSON string
    additionalItems?: string; // JSON string
    superseded_records?: string; // JSON string
    memoranda?: string; // JSON string
    faas?: string; // FAAS document URL
    $createdAt?: string;
    $updatedAt?: string;
}

class DatabaseService {
    private databaseId: string;
    
    constructor() {
        this.databaseId = appwriteConfig.databaseId;
    }

    // Get all building assessments from a collection
    async getBuildingAssessments(collectionId: string, limit: number = 100000): Promise<BuildingAssessmentDocument[]> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                collectionId,
                [
                    Query.limit(limit),
                    Query.orderAsc('pin')
                ]
            );
            
            const assessments = response.documents.map((doc: Models.Document) => {
                return doc as unknown as BuildingAssessmentDocument;
            });

            return assessments;
        } catch (error: any) {
            console.error('❌ DatabaseService: Error fetching building assessments:', error);
            console.error('❌ DatabaseService: Error details:', {
                name: error.name,
                message: error.message,
                code: error.code,
                type: error.type
            });
            throw error;
        }
    }

    // Get all assessments from a collection
    async getAssessments(collectionId: string, limit: number = 100000): Promise<AssessmentDocument[]> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                collectionId,
                [
                    Query.limit(limit),
                    Query.orderAsc('tdn')
                ]
            );
            
            // Transform the documents to match the Assessment interface
            const assessments = response.documents.map((doc: Models.Document) => {
                const assessment = doc as unknown as AssessmentDocument;
                
                // Transform taxability from numeric to string format
                if (assessment.taxability === "1") {
                    assessment.taxability = "Taxable";
                } else if (assessment.taxability === "0") {
                    assessment.taxability = "Exempt";
                }
                
                return assessment;
            });

            return assessments;
        } catch (error: any) {
            console.error('❌ DatabaseService: Error fetching assessments:', error);
            console.error('❌ DatabaseService: Error details:', {
                name: error.name,
                message: error.message,
                code: error.code,
                type: error.type
            });
            throw error;
        }
    }

    // Get a single building assessment by TDN
    async getBuildingAssessmentByTdn(collectionId: string, tdn: string): Promise<BuildingAssessmentDocument | null> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                collectionId,
                [
                    Query.equal('tdArp', tdn),
                    Query.limit(1)
                ]
            );

            if (response.documents.length > 0) {
                return response.documents[0] as unknown as BuildingAssessmentDocument;
            }
            return null;
        } catch (error) {
            console.error('Error fetching building assessment by TDN:', error);
            throw error;
        }
    }

    // Get a single assessment by TDN
    async getAssessmentByTdn(collectionId: string, tdn: string): Promise<AssessmentDocument | null> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                collectionId,
                [
                    Query.equal('tdn', tdn),
                    Query.limit(1)
                ]
            );

            if (response.documents.length > 0) {
                return response.documents[0] as unknown as AssessmentDocument;
            }
            return null;
        } catch (error) {
            console.error('Error fetching assessment by TDN:', error);
            throw error;
        }
    }

    // Get a single assessment by CSV ID
    async getAssessmentByCsvId(collectionId: string, csvId: string): Promise<AssessmentDocument | null> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                collectionId,
                [
                    Query.equal('csv_id', csvId),
                    Query.limit(1)
                ]
            );

            if (response.documents.length > 0) {
                return response.documents[0] as unknown as AssessmentDocument;
            }
            return null;
        } catch (error) {
            console.error('Error fetching assessment by CSV ID:', error);
            throw error;
        }
    }

    // Create a new building assessment
    async createBuildingAssessment(collectionId: string, data: Omit<BuildingAssessmentDocument, '$id' | '$createdAt' | '$updatedAt'>): Promise<BuildingAssessmentDocument> {
        try {
            const response = await databases.createDocument(
                this.databaseId,
                collectionId,
                ID.unique(),
                data
            );

            return response as unknown as BuildingAssessmentDocument;
        } catch (error) {
            console.error('Error creating building assessment:', error);
            throw error;
        }
    }

    // Create a new assessment
    async createAssessment(collectionId: string, data: Omit<AssessmentDocument, '$id' | '$createdAt' | '$updatedAt'>): Promise<AssessmentDocument> {
        try {
            const response = await databases.createDocument(
                this.databaseId,
                collectionId,
                ID.unique(),
                data
            );

            return response as unknown as AssessmentDocument;
        } catch (error) {
            console.error('Error creating assessment:', error);
            throw error;
        }
    }

    // Update a building assessment
    async updateBuildingAssessment(collectionId: string, documentId: string, data: Partial<BuildingAssessmentDocument>): Promise<BuildingAssessmentDocument> {
        try {
            console.log('🔄 DatabaseService: Updating building assessment:', documentId);
            
            // Remove read-only fields
            const updateData = { ...data };
            delete updateData.$id;
            delete updateData.$createdAt;
            delete updateData.$updatedAt;

            const response = await databases.updateDocument(
                this.databaseId,
                collectionId,
                documentId,
                updateData
            );

            console.log('✅ DatabaseService: Building assessment updated successfully');
            return response as unknown as BuildingAssessmentDocument;
        } catch (error) {
            console.error('❌ DatabaseService: Error updating building assessment:', error);
            throw error;
        }
    }

    // Update an assessment
    async updateAssessment(collectionId: string, documentId: string, data: Partial<AssessmentDocument>): Promise<AssessmentDocument> {
        try {
            console.log('🔄 DatabaseService: Updating assessment:', documentId);
            
            // Remove read-only fields
            const updateData = { ...data };
            delete updateData.$id;
            delete updateData.$createdAt;
            delete updateData.$updatedAt;

            const response = await databases.updateDocument(
                this.databaseId,
                collectionId,
                documentId,
                updateData
            );

            console.log('✅ DatabaseService: Assessment updated successfully');
            return response as unknown as AssessmentDocument;
        } catch (error) {
            console.error('❌ DatabaseService: Error updating assessment:', error);
            throw error;
        }
    }

    // Delete a building assessment
    async deleteBuildingAssessment(collectionId: string, documentId: string): Promise<void> {
        try {
            console.log('🗑️ DatabaseService: Deleting building assessment:', documentId);
            
            await databases.deleteDocument(
                this.databaseId,
                collectionId,
                documentId
            );

            console.log('✅ DatabaseService: Building assessment deleted successfully');
        } catch (error) {
            console.error('❌ DatabaseService: Error deleting building assessment:', error);
            throw error;
        }
    }

    // Delete an assessment
    async deleteAssessment(collectionId: string, documentId: string): Promise<void> {
        try {
            console.log('🗑️ DatabaseService: Deleting assessment:', documentId);
            
            await databases.deleteDocument(
                this.databaseId,
                collectionId,
                documentId
            );

            console.log('✅ DatabaseService: Assessment deleted successfully');
        } catch (error) {
            console.error('❌ DatabaseService: Error deleting assessment:', error);
            throw error;
        }
    }

    // Delete all assessments by municipality
    async deleteAssessmentsByMunicipality(
        collectionId: string, 
        municipalityName: string, 
        onProgress?: (progress: { processed: number; total: number; deleted: number; errors: number }) => void
    ): Promise<{ deleted: number; errors: string[] }> {
        try {
            console.log('🗑️ DatabaseService: Deleting all assessments for municipality:', municipalityName);
            
            let deleted = 0;
            const errors: string[] = [];
            let processed = 0;
            let totalRecords = 0;
            
            // First, get actual total count for progress tracking
            // Note: Appwrite limits response.total to 5000, so we need to count manually for large datasets
            try {
                let actualTotal = 0;
                let hasMore = true;
                let offset = 0;
                const batchSize = 100;
                
                // Count all records by fetching in batches
                while (hasMore) {
                    const countResponse = await databases.listDocuments(
                        this.databaseId,
                        collectionId,
                        [
                            Query.equal('municipality', municipalityName),
                            Query.limit(batchSize),
                            Query.offset(offset)
                        ]
                    );
                    
                    actualTotal += countResponse.documents.length;
                    
                    if (countResponse.documents.length < batchSize) {
                        hasMore = false;
                    } else {
                        offset += batchSize;
                    }
                    
                    // Safety break to prevent infinite loops
                    if (offset > 100000) {
                        console.warn('⚠️ Reached safety limit while counting records');
                        break;
                    }
                }
                
                totalRecords = actualTotal;
                console.log(`📊 Actual total records to delete for ${municipalityName}: ${totalRecords}`);
                
                // Initial progress update
                onProgress?.({ processed: 0, total: totalRecords, deleted: 0, errors: 0 });
            } catch (error) {
                console.warn('Could not get total count, proceeding without progress tracking');
            }
            
            let hasMore = true;
            
            // Delete in batches to handle large datasets
            while (hasMore) {
                const response = await databases.listDocuments(
                    this.databaseId,
                    collectionId,
                    [
                        Query.equal('municipality', municipalityName),
                        Query.limit(100) // Process 100 at a time
                    ]
                );
                
                if (response.documents.length === 0) {
                    hasMore = false;
                    break;
                }
                
                console.log(`🔄 Found ${response.documents.length} records to delete for ${municipalityName}`);
                
                // Delete each document
                for (const doc of response.documents) {
                    try {
                        await databases.deleteDocument(
                            this.databaseId,
                            collectionId,
                            doc.$id
                        );
                        deleted++;
                        processed++;
                        
                        // Update progress every 10 deletions or on last item
                        if (processed % 10 === 0 || processed === totalRecords) {
                            onProgress?.({ 
                                processed, 
                                total: totalRecords, 
                                deleted, 
                                errors: errors.length 
                            });
                        }
                        
                        // Add small delay to prevent rate limiting
                        await new Promise(resolve => setTimeout(resolve, 10));
                    } catch (error: any) {
                        console.error(`❌ Error deleting document ${doc.$id}:`, error);
                        errors.push(`Failed to delete record ${doc.$id}: ${error.message}`);
                        processed++;
                        
                        // Update progress on error too
                        if (processed % 10 === 0 || processed === totalRecords) {
                            onProgress?.({ 
                                processed, 
                                total: totalRecords, 
                                deleted, 
                                errors: errors.length 
                            });
                        }
                    }
                }
                
                // Check if there are more documents
                if (response.documents.length < 100) {
                    hasMore = false;
                }
            }
            
            console.log(`✅ DatabaseService: Deleted ${deleted} assessments for municipality: ${municipalityName}`);
            
            if (errors.length > 0) {
                console.warn(`⚠️ DatabaseService: ${errors.length} errors occurred during deletion`);
            }
            
            return { deleted, errors };
        } catch (error) {
            console.error('❌ DatabaseService: Error deleting assessments by municipality:', error);
            throw error;
        }
    }

    // Search assessments by field
    async searchAssessments(collectionId: string, field: string, value: string, limit: number = 100): Promise<AssessmentDocument[]> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                collectionId,
                [
                    Query.search(field, value),
                    Query.limit(limit)
                ]
            );

            return response.documents as unknown as AssessmentDocument[];
        } catch (error) {
            console.error('Error searching assessments:', error);
            throw error;
        }
    }

    // Get assessments by municipality
    async getAssessmentsByMunicipality(collectionId: string, municipalityCode: string): Promise<AssessmentDocument[]> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                collectionId,
                [
                    Query.equal('mun_code', municipalityCode),
                    Query.orderAsc('tdn')
                ]
            );

            return response.documents as unknown as AssessmentDocument[];
        } catch (error) {
            console.error('Error fetching assessments by municipality:', error);
            throw error;
        }
    }

    // Get assessments by classification
    async getAssessmentsByClassification(collectionId: string, classification: string): Promise<AssessmentDocument[]> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                collectionId,
                [
                    Query.equal('classification', classification),
                    Query.orderAsc('tdn')
                ]
            );

            return response.documents as unknown as AssessmentDocument[];
        } catch (error) {
            console.error('Error fetching assessments by classification:', error);
            throw error;
        }
    }

    // ULTRA-FAST bulk import assessments with maximum speed optimization
    async bulkImportAssessments(
        collectionId: string, 
        assessments: Omit<AssessmentDocument, '$id' | '$createdAt' | '$updatedAt'>[],
        onProgress?: (progress: { processed: number; successful: number; failed: number; errors: string[] }) => void,
        speedMode: 'normal' | 'fast' | 'ultra' = 'ultra'
    ): Promise<{ successful: number; failed: number; errors: string[] }> {
        let successful = 0;
        let failed = 0;
        const errors: string[] = [];
        
        console.log(`🚀 Starting enhanced bulk import of ${assessments.length} records`);
        
        // Get initial database count for verification
        const initialCount = await this.getTotalCount(collectionId);
        console.log(`📊 Initial database count: ${initialCount}`);
        
        // Enhanced tracking statistics
        let createdCount = 0;
        let updatedCount = 0;
        let actuallyProcessed = 0;
        
        // Track all processed records to detect missing ones
        const processedRecords = new Set<string>();
        
        // DYNAMIC SPEED CONFIGURATION BASED ON MODE
        let BATCH_SIZE: number;
        let DELAY_BETWEEN_BATCHES: number;
        let MAX_RETRIES: number;
        
        switch (speedMode) {
            case 'ultra':
                BATCH_SIZE = 100; // Maximum batch size for ultra speed
                DELAY_BETWEEN_BATCHES = 10; // Minimal delay
                MAX_RETRIES = 1; // Single retry only
                break;
            case 'fast':
                BATCH_SIZE = 50;
                DELAY_BETWEEN_BATCHES = 25;
                MAX_RETRIES = 2;
                break;
            case 'normal':
            default:
                BATCH_SIZE = 20;
                DELAY_BETWEEN_BATCHES = 50;
                MAX_RETRIES = 3;
                break;
        }
        
        console.log(`⚡ ${speedMode.toUpperCase()} SPEED MODE: Processing ${assessments.length} records`);
        console.log(`⚡ Batch size: ${BATCH_SIZE}, Delay: ${DELAY_BETWEEN_BATCHES}ms, Retries: ${MAX_RETRIES}`);

        // Process records in large batches for maximum speed
        for (let i = 0; i < assessments.length; i += BATCH_SIZE) {
            const batch = assessments.slice(i, i + BATCH_SIZE);
            const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(assessments.length / BATCH_SIZE);
            
            console.log(`⚡ Processing batch ${batchNumber}/${totalBatches} (${batch.length} records) - Speed optimized`);
            
            // Process entire batch in parallel for maximum speed
            const batchPromises = batch.map(async (assessment, batchIndex) => {
                const globalIndex = i + batchIndex;
                const recordId = assessment.csv_id || assessment.tdn || `record-${globalIndex}`;
                
                try {
                    // Track this record as being processed
                    processedRecords.add(recordId);
                    actuallyProcessed++;
                    
                    // SPEED OPTIMIZATION: Skip duplicate checks for faster processing
                    // Just try to create first, handle duplicates in catch block
                    try {
                        const result = await this.createAssessment(collectionId, assessment);
                        console.log(`⚡ Created: ${recordId} -> ${result.$id}`);
                        createdCount++;
                        return { success: true, type: 'created', recordId, index: globalIndex };
                    } catch (createError: any) {
                        // Handle duplicates by updating
                        if (createError?.code === 409 || createError?.message?.includes('duplicate') || createError?.message?.includes('unique')) {
                            try {
                                // Try CSV ID first, then TDN
                                let existing = null;
                                if (assessment.csv_id) {
                                    existing = await this.getAssessmentByCsvId(collectionId, assessment.csv_id);
                                }
                                if (!existing && assessment.tdn) {
                                    existing = await this.getAssessmentByTdn(collectionId, assessment.tdn);
                                }
                                
                                if (existing) {
                                    const result = await this.updateAssessment(collectionId, existing.$id!, assessment);
                                    console.log(`⚡ Updated: ${recordId} -> ${result.$id}`);
                                    updatedCount++;
                                    return { success: true, type: 'updated', recordId, index: globalIndex };
                                }
                            } catch (updateError) {
                                console.warn(`⚠️ Update failed for ${recordId}:`, updateError);
                            }
                        }
                        throw createError;
                    }
                } catch (error: any) {
                    const identifier = assessment.csv_id ? `CSV ID ${assessment.csv_id} (TDN: ${assessment.tdn})` : `TDN ${assessment.tdn}`;
                    const errorMsg = `${identifier}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    console.error(`❌ Failed: ${recordId}`, error.message);
                    return { success: false, error: errorMsg, recordId, index: globalIndex };
                }
            });
            
            // Wait for entire batch to complete
            const batchResults = await Promise.allSettled(batchPromises);
            
            // Process batch results
            batchResults.forEach((result, batchIndex) => {
                if (result.status === 'fulfilled') {
                    if (result.value.success) {
                        successful++;
                    } else {
                        failed++;
                        errors.push(result.value.error || 'Unknown error');
                    }
                } else {
                    failed++;
                    const globalIndex = i + batchIndex;
                    const assessment = batch[batchIndex];
                    const identifier = assessment.csv_id ? `CSV ID ${assessment.csv_id}` : `TDN ${assessment.tdn}`;
                    errors.push(`${identifier}: Promise rejected - ${result.reason}`);
                    console.error(`❌ Promise rejection for record ${globalIndex}:`, result.reason);
                }
            });

            // Update progress after each batch
            if (onProgress) {
                onProgress({
                    processed: Math.min(i + BATCH_SIZE, assessments.length),
                    successful,
                    failed,
                    errors
                });
            }

            // Minimal delay between batches for maximum speed
            if (i + BATCH_SIZE < assessments.length) {
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
            }
        }

        // Final verification - check actual database count
        console.log(`🏁 Import completed. Verifying results...`);
        const finalCount = await this.getTotalCount(collectionId);
        const actualIncrease = finalCount - initialCount;
        
        console.log(`📊 Final Import Statistics:`);
        console.log(`   - Input records: ${assessments.length}`);
        console.log(`   - Actually processed: ${actuallyProcessed}`);
        console.log(`   - Reported successful: ${successful}`);
        console.log(`   - Reported failed: ${failed}`);
        console.log(`   - Created: ${createdCount}`);
        console.log(`   - Updated: ${updatedCount}`);
        console.log(`   - Initial DB count: ${initialCount}`);
        console.log(`   - Final DB count: ${finalCount}`);
        console.log(`   - Actual DB increase: ${actualIncrease}`);
        
        // Check for discrepancies
        const totalProcessed = successful + failed;
        if (totalProcessed !== assessments.length) {
            console.warn(`⚠️ WARNING: Processed count mismatch! Expected: ${assessments.length}, Actual: ${totalProcessed}`);
            errors.push(`Processed count mismatch: Expected ${assessments.length}, got ${totalProcessed}`);
        }
        
        if (actualIncrease < createdCount) {
            console.warn(`⚠️ WARNING: Database increase (${actualIncrease}) is less than created count (${createdCount})!`);
            console.warn(`   This suggests some records were not actually saved to the database.`);
            errors.push(`Database verification failed: Expected increase of ${createdCount}, actual increase was ${actualIncrease}`);
        }
        
        if (actualIncrease === 0 && successful > 0) {
            console.error(`❌ CRITICAL: No records were actually saved to database despite ${successful} reported successes!`);
            errors.push(`CRITICAL: No database changes detected despite ${successful} reported successes`);
        }

        return { successful, failed, errors };
    }

    // ULTRA-FAST import method with comprehensive error debugging
    async ultraFastBulkImport(
        collectionId: string, 
        assessments: Omit<AssessmentDocument, '$id' | '$createdAt' | '$updatedAt'>[],
        onProgress?: (progress: { processed: number; successful: number; failed: number; errors: string[] }) => void
    ): Promise<{ successful: number; failed: number; errors: string[] }> {
        let successful = 0;
        let failed = 0;
        const errors: string[] = [];
        
        console.log(`🚀 ULTRA-FAST MODE: Processing ${assessments.length} records with comprehensive error tracking`);
        
        // Pre-flight checks
        console.log(`🔍 PRE-FLIGHT CHECKS:`);
        console.log(`   - Collection ID: ${collectionId}`);
        console.log(`   - Database ID: ${this.databaseId}`);
        console.log(`   - Records to import: ${assessments.length}`);
        
        // Check first record structure
        if (assessments.length > 0) {
            const sample = assessments[0];
            console.log(`   - Sample record keys:`, Object.keys(sample));
            console.log(`   - Sample TDN: ${sample.tdn}`);
            console.log(`   - Sample CSV ID: ${sample.csv_id}`);
        }
        
        // Test database connection
        try {
            const testCount = await this.getTotalCount(collectionId);
            console.log(`   - Current database count: ${testCount}`);
        } catch (error) {
            console.error(`❌ Database connection test failed:`, error);
            errors.push(`Database connection failed: ${error}`);
            return { successful: 0, failed: assessments.length, errors };
        }
        
        const MEGA_BATCH_SIZE = 25; // Further reduced for stability
        const NO_DELAY = 200; // Increased delay to prevent rate limiting
        
        // Process in mega batches with maximum concurrency
        for (let i = 0; i < assessments.length; i += MEGA_BATCH_SIZE) {
            const batch = assessments.slice(i, i + MEGA_BATCH_SIZE);
            const batchNumber = Math.floor(i / MEGA_BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(assessments.length / MEGA_BATCH_SIZE);
            
            console.log(`🚀 MEGA BATCH ${batchNumber}/${totalBatches} (${batch.length} records) - STARTING AT ${new Date().toISOString()}`);
            console.log(`📊 Progress so far: ${successful} successful, ${failed} failed`);
            console.log(`🔍 Batch records sample:`, batch.slice(0, 2).map(r => ({ tdn: r.tdn, municipality: r.municipality })));
            
            // Memory monitoring
            if ((performance as any).memory) {
                const memory = (performance as any).memory;
                console.log(`💾 Memory: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB used, ${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB total`);
            }
            
            // EMERGENCY: Add timeout wrapper to catch silent failures
            const batchPromise = new Promise<PromiseSettledResult<BatchImportResult>[]>(async (resolve, reject) => {
                const batchTimeout = setTimeout(() => {
                    console.error(`❌ BATCH ${batchNumber} TIMEOUT AFTER 60 SECONDS!`);
                    reject(new Error(`Batch ${batchNumber} timeout`));
                }, 60000);
                
                try {
                    // Enhanced error tracking for debugging
                    const megaBatchPromises: Promise<BatchImportResult>[] = batch.map(async (assessment, batchIndex): Promise<BatchImportResult> => {
                const recordId = assessment.csv_id || assessment.tdn || `record-${i + batchIndex}`;
                
                try {
                    // Validate record before processing
                    if (!assessment.tdn) {
                        throw new Error('Missing TDN field');
                    }
                    if (!assessment.pin) {
                        throw new Error('Missing PIN field');
                    }
                    
                    // Try to create the record
                    console.log(`🔄 Creating record: ${recordId}`);
                    const result = await this.createAssessment(collectionId, assessment);
                    console.log(`✅ Created: ${recordId} -> ${result.$id}`);
                    return { success: true, id: result.$id, recordId };
                    
                } catch (error: any) {
                    console.error(`❌ Error processing ${recordId}:`, {
                        code: error.code,
                        type: error.type,
                        message: error.message,
                        response: error.response?.status
                    });
                    
                    // Handle specific error types
                    if (error?.code === 409 || error?.message?.includes('duplicate')) {
                        console.log(`🔄 Duplicate detected for ${recordId}, attempting update...`);
                        try {
                            // Try to find and update existing record
                            const existing = assessment.csv_id 
                                ? await this.getAssessmentByCsvId(collectionId, assessment.csv_id)
                                : await this.getAssessmentByTdn(collectionId, assessment.tdn);
                            
                            if (existing) {
                                const result = await this.updateAssessment(collectionId, existing.$id!, assessment);
                                console.log(`✅ Updated: ${recordId} -> ${result.$id}`);
                                return { success: true, id: result.$id, updated: true, recordId };
                            } else {
                                throw new Error('Existing record not found for update');
                            }
                        } catch (updateError: any) {
                            console.error(`❌ Update failed for ${recordId}:`, updateError.message);
                            return { 
                                success: false, 
                                error: `Update failed: ${updateError.message}`, 
                                recordId,
                                originalError: error.message
                            };
                        }
                    } else if (error?.code === 429 || error?.type === 'general_rate_limit_exceeded') {
                        console.warn(`⏳ Rate limit hit for ${recordId}`);
                        return { 
                            success: false, 
                            error: `Rate limit exceeded`, 
                            recordId,
                            rateLimited: true
                        };
                    } else {
                        // Other errors
                        return { 
                            success: false, 
                            error: `${error.code || 'UNKNOWN'}: ${error.message}`, 
                            recordId,
                            errorCode: error.code,
                            errorType: error.type
                        };
                    }
                }
            });
            
                    // Process mega batch
                    const batchPromiseResults = await Promise.allSettled(megaBatchPromises);
                    clearTimeout(batchTimeout);
                    
                    console.log(`✅ BATCH ${batchNumber} COMPLETED - Processing ${batchPromiseResults.length} results`);
                    resolve(batchPromiseResults);
                    
                } catch (error) {
                    clearTimeout(batchTimeout);
                    console.error(`❌ BATCH ${batchNumber} ERROR:`, error);
                    reject(error);
                }
            });
            
            // Wait for batch to complete with timeout protection
            const batchResults = await batchPromise;
            
            // Analyze batch results
            let batchSuccessful = 0;
            let batchFailed = 0;
            let batchDuplicates = 0;
            let batchRateLimited = 0;
            let batchValidationErrors = 0;
            
            batchResults.forEach((result, resultIndex) => {
                if (result.status === 'fulfilled' && result.value.success) {
                    successful++;
                    batchSuccessful++;
                    if (result.value.updated) {
                        batchDuplicates++;
                    }
                } else {
                    failed++;
                    batchFailed++;
                    
                    // Categorize errors
                    if (result.status === 'fulfilled' && result.value.rateLimited) {
                        batchRateLimited++;
                    } else if (result.status === 'fulfilled' && result.value.error?.includes('Missing')) {
                        batchValidationErrors++;
                    }
                    
                    const errorMsg = result.status === 'fulfilled' 
                        ? `${result.value.recordId}: ${result.value.error}`
                        : `Record ${i + resultIndex}: Promise rejected - ${result.reason}`;
                    errors.push(errorMsg);
                }
            });
            
            // Log batch summary
            console.log(`📊 Batch ${batchNumber} Summary:`);
            console.log(`   ✅ Successful: ${batchSuccessful}`);
            console.log(`   ❌ Failed: ${batchFailed}`);
            console.log(`   🔄 Duplicates Updated: ${batchDuplicates}`);
            console.log(`   ⏳ Rate Limited: ${batchRateLimited}`);
            console.log(`   📝 Validation Errors: ${batchValidationErrors}`);
            console.log(`   🕒 Batch completed at: ${new Date().toISOString()}`);

            // Ultra-fast progress update
            if (onProgress) {
                onProgress({
                    processed: Math.min(i + MEGA_BATCH_SIZE, assessments.length),
                    successful,
                    failed,
                    errors
                });
            }

            // Minimal delay for ultra speed
            if (i + MEGA_BATCH_SIZE < assessments.length) {
                await new Promise(resolve => setTimeout(resolve, NO_DELAY));
            }
        }
        
        // Final comprehensive error analysis
        console.log(`🏁 ULTRA-FAST IMPORT COMPLETE - DETAILED ANALYSIS:`);
        console.log(`📊 FINAL STATISTICS:`);
        console.log(`   - Total Records: ${assessments.length}`);
        console.log(`   - Successful: ${successful}`);
        console.log(`   - Failed: ${failed}`);
        console.log(`   - Success Rate: ${((successful / assessments.length) * 100).toFixed(2)}%`);
        
        if (failed > 0) {
            console.log(`❌ FAILURE ANALYSIS:`);
            
            // Categorize all errors
            const errorCategories = {
                rateLimited: errors.filter(e => e.includes('Rate limit')).length,
                validation: errors.filter(e => e.includes('Missing')).length,
                duplicates: errors.filter(e => e.includes('duplicate')).length,
                database: errors.filter(e => e.includes('Database')).length,
                permission: errors.filter(e => e.includes('permission') || e.includes('unauthorized')).length,
                network: errors.filter(e => e.includes('network') || e.includes('timeout')).length,
                unknown: 0
            };
            
            errorCategories.unknown = failed - Object.values(errorCategories).reduce((a, b) => a + b, 0);
            
            console.log(`   - Rate Limited: ${errorCategories.rateLimited}`);
            console.log(`   - Validation Errors: ${errorCategories.validation}`);
            console.log(`   - Duplicate Issues: ${errorCategories.duplicates}`);
            console.log(`   - Database Errors: ${errorCategories.database}`);
            console.log(`   - Permission Errors: ${errorCategories.permission}`);
            console.log(`   - Network Errors: ${errorCategories.network}`);
            console.log(`   - Unknown Errors: ${errorCategories.unknown}`);
            
            // Show first few errors for debugging
            console.log(`🔍 SAMPLE ERRORS (first 5):`);
            errors.slice(0, 5).forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
            
            if (errors.length > 5) {
                console.log(`   ... and ${errors.length - 5} more errors`);
            }
        }
        
        // Database verification
        try {
            const finalCount = await this.getTotalCount(collectionId);
            console.log(`📊 DATABASE VERIFICATION:`);
            console.log(`   - Final database count: ${finalCount}`);
            console.log(`   - Expected increase: ${successful}`);
        } catch (verifyError) {
            console.error(`❌ Database verification failed:`, verifyError);
        }
        
        return { successful, failed, errors };
    }

    // Test basic database operations for debugging
    async testDatabaseOperations(collectionId: string): Promise<void> {
        console.log(`🧪 TESTING DATABASE OPERATIONS:`);
        
        try {
            // Test 1: Check collection access
            console.log(`1️⃣ Testing collection access...`);
            const count = await this.getTotalCount(collectionId);
            console.log(`   ✅ Collection accessible, current count: ${count}`);
            
            // Test 2: Try to create a simple test record
            console.log(`2️⃣ Testing record creation...`);
            const testRecord: Omit<AssessmentDocument, '$id' | '$createdAt' | '$updatedAt'> = {
                tdn: `TEST_${Date.now()}`,
                pin: 'TEST_PIN',
                name: 'Test Record',
                municipality: 'TEST',
                barangay: 'TEST_BARANGAY',
                market_val: 100000,
                ass_value: 80000,
                area: 100,
                unit_value: 1000,
                kind: 'LAND',
                ass_level: '20',
                classification: 'RESIDENTIAL',
                sub_class: 'R1',
                taxability: 'Taxable',
                trans_cd: 'TD',
                tax_beg_yr: '2025',
                eff_date: '2025-01-01',
                owner_no: '1',
                mun_code: 'TEST',
                bcode: 'TEST',
                gr_code: 'GR01',
                gr: 'GR01',
                csv_id: `TEST_CSV_${Date.now()}`
            };
            
            const created = await this.createAssessment(collectionId, testRecord);
            console.log(`   ✅ Test record created: ${created.$id}`);
            
            // Test 3: Try to read the created record
            console.log(`3️⃣ Testing record retrieval...`);
            const retrieved = await this.getAssessmentByTdn(collectionId, testRecord.tdn);
            console.log(`   ✅ Test record retrieved: ${retrieved?.$id}`);
            
            // Test 4: Try to update the record
            console.log(`4️⃣ Testing record update...`);
            const updated = await this.updateAssessment(collectionId, created.$id!, {
                ...testRecord,
                market_val: 150000
            });
            console.log(`   ✅ Test record updated: ${updated.$id}`);
            
            // Test 5: Clean up - delete the test record
            console.log(`5️⃣ Cleaning up test record...`);
            await this.deleteAssessment(collectionId, created.$id!);
            console.log(`   ✅ Test record deleted`);
            
            console.log(`🎉 ALL DATABASE OPERATIONS WORKING CORRECTLY!`);
            
        } catch (error: any) {
            console.error(`❌ DATABASE TEST FAILED:`, {
                code: error.code,
                type: error.type,
                message: error.message,
                response: error.response
            });
            throw error;
        }
    }

    // Get collection statistics
    async getCollectionStats(collectionId: string): Promise<{
        totalRecords: number;
        totalMarketValue: number;
        totalAssessmentValue: number;
        totalArea: number;
    }> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                collectionId,
                [Query.limit(100000)] // Get all documents for accurate stats
            );

            const documents = response.documents as unknown as AssessmentDocument[];
            
            const stats = {
                totalRecords: documents.length,
                totalMarketValue: documents.reduce((sum, doc) => sum + (doc.market_val || 0), 0),
                totalAssessmentValue: documents.reduce((sum, doc) => sum + (doc.ass_value || 0), 0),
                totalArea: documents.reduce((sum, doc) => sum + (doc.area || 0), 0)
            };

            return stats;
        } catch (error) {
            console.error('Error fetching collection stats:', error);
            throw error;
        }
    }

    // Check collection info and permissions
    async checkCollectionInfo(collectionId: string): Promise<void> {
        try {
            console.log('🔍 Checking collection info and permissions...');
            
            // Try to get a sample document to check permissions
            const sampleResponse = await databases.listDocuments(
                this.databaseId,
                collectionId,
                [Query.limit(1)]
            );
            
            if (sampleResponse.documents.length > 0) {
                const sampleDoc = sampleResponse.documents[0];
                console.log('📄 Sample document structure:', {
                    id: sampleDoc.$id,
                    permissions: sampleDoc.$permissions,
                    createdAt: sampleDoc.$createdAt,
                    updatedAt: sampleDoc.$updatedAt
                });
            }
            
        } catch (error) {
            console.error('❌ Error checking collection info:', error);
        }
    }

    // Analytics methods for Finance dashboard
    async getAnalytics(collectionId: string): Promise<{
        totalRpus: number;
        taxableCount: number;
        exemptCount: number;
        taxableMarketValue: number;
        exemptMarketValue: number;
        taxableAssessmentValue: number;
        exemptAssessmentValue: number;
        taxableArea: number;
        exemptArea: number;
    }> {
        try {
            console.log('📊 DatabaseService: Fetching analytics data...');
            
            const response = await databases.listDocuments(
                this.databaseId,
                collectionId,
                [Query.limit(100000)] // Get all documents for accurate analytics
            );

            const documents = response.documents as unknown as AssessmentDocument[];
            
            // Separate taxable and exempt records
            const taxableRecords = documents.filter(doc => 
                doc.taxability === 'Taxable' || doc.taxability === '1'
            );
            const exemptRecords = documents.filter(doc => 
                doc.taxability === 'Exempt' || doc.taxability === '0'
            );

            const analytics = {
                totalRpus: documents.length,
                taxableCount: taxableRecords.length,
                exemptCount: exemptRecords.length,
                taxableMarketValue: taxableRecords.reduce((sum, doc) => sum + (doc.market_val || 0), 0),
                exemptMarketValue: exemptRecords.reduce((sum, doc) => sum + (doc.market_val || 0), 0),
                taxableAssessmentValue: taxableRecords.reduce((sum, doc) => sum + (doc.ass_value || 0), 0),
                exemptAssessmentValue: exemptRecords.reduce((sum, doc) => sum + (doc.ass_value || 0), 0),
                taxableArea: taxableRecords.reduce((sum, doc) => sum + (doc.area || 0), 0),
                exemptArea: exemptRecords.reduce((sum, doc) => sum + (doc.area || 0), 0)
            };

            console.log('✅ DatabaseService: Analytics data fetched successfully:', analytics);
            return analytics;
        } catch (error) {
            console.error('❌ DatabaseService: Error fetching analytics:', error);
            throw error;
        }
    }

    // Get total count of assessments
    async getTotalCount(collectionId: string): Promise<number> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                collectionId,
                [Query.limit(1)] // Just get count, not actual documents
            );
            return response.total;
        } catch (error) {
            console.error('Error fetching total count:', error);
            throw error;
        }
    }

    // Get count of taxable assessments
    async getTaxableCount(collectionId: string): Promise<number> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                collectionId,
                [
                    Query.equal('taxability', 'Taxable'),
                    Query.limit(1)
                ]
            );
            return response.total;
        } catch (error) {
            console.error('Error fetching taxable count:', error);
            throw error;
        }
    }

    // Get count of exempt assessments
    async getExemptCount(collectionId: string): Promise<number> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                collectionId,
                [
                    Query.equal('taxability', 'Exempt'),
                    Query.limit(1)
                ]
            );
            return response.total;
        } catch (error) {
            console.error('Error fetching exempt count:', error);
            throw error;
        }
    }

    // Get analytics for a specific municipality
    async getMunicipalityAnalytics(collectionId: string, municipality: string): Promise<{
        taxableCount: number;
        exemptCount: number;
        taxableMarketValue: number;
        exemptMarketValue: number;
        taxableAssessmentValue: number;
        exemptAssessmentValue: number;
        taxableArea: number;
        exemptArea: number;
    }> {
        try {
            console.log(`📊 DatabaseService: Fetching analytics for municipality: ${municipality}`);
            
            // Get all documents for the specific municipality
            const response = await databases.listDocuments(
                this.databaseId,
                collectionId,
                [
                    Query.equal('municipality', municipality),
                    Query.limit(100000) // Get all documents for this municipality
                ]
            );

            const documents = response.documents as unknown as AssessmentDocument[];
            
            // Separate taxable and exempt records
            const taxableRecords = documents.filter(doc => 
                doc.taxability === 'Taxable' || doc.taxability === '1'
            );
            const exemptRecords = documents.filter(doc => 
                doc.taxability === 'Exempt' || doc.taxability === '0'
            );

            const analytics = {
                taxableCount: taxableRecords.length,
                exemptCount: exemptRecords.length,
                taxableMarketValue: taxableRecords.reduce((sum, doc) => sum + (doc.market_val || 0), 0),
                exemptMarketValue: exemptRecords.reduce((sum, doc) => sum + (doc.market_val || 0), 0),
                taxableAssessmentValue: taxableRecords.reduce((sum, doc) => sum + (doc.ass_value || 0), 0),
                exemptAssessmentValue: exemptRecords.reduce((sum, doc) => sum + (doc.ass_value || 0), 0),
                taxableArea: taxableRecords.reduce((sum, doc) => sum + (doc.area || 0), 0),
                exemptArea: exemptRecords.reduce((sum, doc) => sum + (doc.area || 0), 0)
            };

            console.log(`✅ DatabaseService: Municipality analytics fetched for ${municipality}:`, analytics);
            return analytics;
        } catch (error) {
            console.error(`❌ DatabaseService: Error fetching municipality analytics for ${municipality}:`, error);
            throw error;
        }
    }

    // Clear all assessments from a collection
    async clearAllAssessments(
        collectionId: string,
        onProgress?: (progress: { processed: number; total: number; deleted: number; failed: number; errors: string[] }) => void,
        abortSignal?: AbortSignal
    ): Promise<{ deleted: number; failed: number; errors: string[] }> {
        try {
            console.log('🗑️ DatabaseService: Starting to clear all assessments from collection:', collectionId);
            
            // Check collection info first
            await this.checkCollectionInfo(collectionId);
            
            // First, get all documents to delete
            const response = await databases.listDocuments(
                this.databaseId,
                collectionId,
                [Query.limit(100000)] // Get all documents
            );

            const documents = response.documents;
            const total = documents.length;
            let deleted = 0;
            let failed = 0;
            const errors: string[] = [];

            console.log(`📊 Found ${total} documents to delete`);

            if (total === 0) {
                console.log('✅ No documents to delete');
                return { deleted: 0, failed: 0, errors: [] };
            }

            // Process documents one by one to avoid rate limits
            // Appwrite has strict rate limits, so we need to be very conservative
            for (let i = 0; i < documents.length; i++) {
                // Check if operation was aborted
                if (abortSignal?.aborted) {
                    console.log('🛑 Clear operation aborted by user');
                    throw new Error('Operation cancelled by user');
                }

                const doc = documents[i];
                
                // Retry logic for failed deletions
                const maxRetries = 3;
                let retryCount = 0;
                let success = false;
                
                while (retryCount < maxRetries && !success) {
                    // Check abort signal before each retry
                    if (abortSignal?.aborted) {
                        console.log('🛑 Clear operation aborted during retry');
                        throw new Error('Operation cancelled by user');
                    }
                    try {
                        await databases.deleteDocument(
                            this.databaseId,
                            collectionId,
                            doc.$id
                        );
                        deleted++;
                        success = true;
                        console.log(`✅ Deleted document: ${doc.$id} (${i + 1}/${total})`);
                    } catch (error: any) {
                        retryCount++;
                        
                        // Enhanced error logging
                        const errorDetails = {
                            documentId: doc.$id,
                            attempt: retryCount,
                            errorType: error?.type || 'unknown',
                            errorCode: error?.code || 'unknown',
                            errorMessage: error?.message || 'Unknown error',
                            statusCode: error?.response?.status || 'unknown'
                        };
                        
                        console.warn(`⚠️ Retry ${retryCount}/${maxRetries} for document ${doc.$id}:`, errorDetails);
                        
                        if (retryCount < maxRetries) {
                            // Wait before retry with much longer delays for rate limit errors
                            const isRateLimit = error?.code === 429 || error?.response?.status === 429 || 
                                              error?.type === 'general_rate_limit_exceeded' ||
                                              error?.message?.includes('Rate limit') ||
                                              error?.message?.includes('Too Many Requests');
                            
                            const waitTime = isRateLimit 
                                ? 1000 * retryCount // Faster retry for rate limit errors (1s, 2s, 3s)
                                : 500 * retryCount; // Faster exponential backoff for other errors
                                
                            console.log(`⏳ Waiting ${waitTime}ms before retry ${retryCount + 1}/${maxRetries}...`);
                            await new Promise(resolve => setTimeout(resolve, waitTime));
                        } else {
                            // Final failure after all retries
                            failed++;
                            const errorMsg = `TDN: ${(doc as any).tdn || 'unknown'} | ID: ${doc.$id} | Error: ${errorDetails.errorType} (${errorDetails.errorCode}) - ${errorDetails.errorMessage}`;
                            errors.push(errorMsg);
                            console.error(`❌ Failed to delete document ${doc.$id} after ${maxRetries} retries:`, errorDetails);
                        }
                    }
                }

                // Call progress callback if provided
                if (onProgress) {
                    onProgress({
                        processed: i + 1,
                        total,
                        deleted,
                        failed,
                        errors
                    });
                }

                // Wait between each deletion - much faster now with abuse protection disabled
                if (i < documents.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 50)); // 50ms between each deletion
                }
            }

            console.log(`✅ DatabaseService: Clearing complete. Deleted: ${deleted}, Failed: ${failed}`);
            return { deleted, failed, errors };

        } catch (error) {
            console.error('❌ DatabaseService: Error clearing all assessments:', error);
            throw error;
        }
    }
}

export const databaseService = new DatabaseService();
export default databaseService;
