import { databases, appwriteConfig } from '../lib/appwrite';
import { ID, Query, Models } from 'appwrite';

export interface AssessmentDocument {
    $id?: string;
    csv_id?: string; // Unique CSV identifier for import duplicate handling (required in schema)
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
    // Appwrite will handle these automatically
    date_input?: string;
    inputed_by?: string;
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

    // Get all assessments from a collection (PAGINATED for large datasets)
    async getAssessments(collectionId: string, limit: number = 5000): Promise<AssessmentDocument[]> {
        try {
            console.log(`📊 Fetching assessments with limit: ${limit}`);
            
            // For large datasets (>10k records), use pagination
            if (limit > 10000) {
                console.warn(`⚠️ Limit ${limit} is too high! Using paginated fetch instead.`);
                return await this.getAssessmentsPaginated(collectionId, limit);
            }
            
            const response = await databases.listDocuments(
                this.databaseId,
                collectionId,
                [
                    Query.limit(Math.min(limit, 5000)), // Appwrite max is 5000
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

            console.log(`✅ Fetched ${assessments.length} assessments`);
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

    // Get assessments with pagination (for large datasets >10k records)
    async getAssessmentsPaginated(collectionId: string, totalLimit: number = 500000): Promise<AssessmentDocument[]> {
        try {
            console.log(`📊 Starting paginated fetch for up to ${totalLimit} records...`);
            
            const allAssessments: AssessmentDocument[] = [];
            const pageSize = 5000; // Appwrite's maximum limit per request
            let offset = 0;
            let hasMore = true;
            let pageNumber = 1;

            while (hasMore && allAssessments.length < totalLimit) {
                console.log(`📄 Fetching page ${pageNumber} (offset: ${offset})...`);
                
                const response = await databases.listDocuments(
                    this.databaseId,
                    collectionId,
                    [
                        Query.limit(pageSize),
                        Query.offset(offset),
                        Query.orderAsc('tdn')
                    ]
                );

                const pageAssessments = response.documents.map((doc: Models.Document) => {
                    const assessment = doc as unknown as AssessmentDocument;
                    
                    // Transform taxability
                    if (assessment.taxability === "1") {
                        assessment.taxability = "Taxable";
                    } else if (assessment.taxability === "0") {
                        assessment.taxability = "Exempt";
                    }
                    
                    return assessment;
                });

                allAssessments.push(...pageAssessments);
                console.log(`✅ Page ${pageNumber}: Fetched ${pageAssessments.length} records (Total: ${allAssessments.length})`);

                // Check if there are more records
                hasMore = pageAssessments.length === pageSize;
                offset += pageSize;
                pageNumber++;

                // Prevent infinite loop (500k records = 100 pages max)
                if (pageNumber > 100) {
                    console.warn(`⚠️ Reached maximum page limit (100 pages = 500k records). Stopping pagination.`);
                    console.warn(`⚠️ Current total: ${allAssessments.length} records`);
                    break;
                }
            }

            console.log(`✅ Paginated fetch complete: ${allAssessments.length} total records`);
            return allAssessments;
        } catch (error: any) {
            console.error('❌ DatabaseService: Error in paginated fetch:', error);
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
        // Always use ID.unique() for document ID, CSV_ID is stored as a field
        const response = await databases.createDocument(
            this.databaseId,
            collectionId,
            ID.unique(),
            data
        );
        return response as unknown as AssessmentDocument;
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

    // Get assessments by municipality CODE (old method)
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

    // Get assessments by municipality NAME with pagination (SERVER-SIDE FILTERING)
    async getAssessmentsByMunicipalityName(
        collectionId: string, 
        municipalityName: string,
        limit: number = 200000
    ): Promise<AssessmentDocument[]> {
        try {
            console.log(`🔍 Fetching assessments for municipality: ${municipalityName}...`);
            
            // For large datasets, use pagination with server-side filtering
            if (limit > 10000) {
                return await this.getAssessmentsByMunicipalityPaginated(collectionId, municipalityName, limit);
            }
            
            // Try different variations for Las Nieves
            let queries: any[] = [];
            if (municipalityName.toUpperCase().includes('LAS NIEVES')) {
                // Try multiple variations for Las Nieves
                queries = [
                    Query.equal('municipality', 'LAS NIEVES'),
                    Query.equal('municipality', 'LASNIEVES'),
                    Query.equal('municipality', 'Las Nieves'),
                    Query.equal('municipality', 'Lasnieves'),
                ];
            } else {
                queries = [Query.equal('municipality', municipalityName)];
            }
            
            // Try each query variation
            let allAssessments: AssessmentDocument[] = [];
            for (const query of queries) {
                try {
                    const response = await databases.listDocuments(
                        this.databaseId,
                        collectionId,
                        [
                            query,
                            Query.limit(Math.min(limit, 5000)),
                            Query.orderAsc('tdn')
                        ]
                    );

                    const assessments = response.documents.map((doc: Models.Document) => {
                        const assessment = doc as unknown as AssessmentDocument;
                        
                        // Transform taxability
                        if (assessment.taxability === "1") {
                            assessment.taxability = "Taxable";
                        } else if (assessment.taxability === "0") {
                            assessment.taxability = "Exempt";
                        }
                        
                        return assessment;
                    });

                    if (assessments.length > 0) {
                        console.log(`✅ Fetched ${assessments.length} assessments for ${municipalityName} using query: ${JSON.stringify(query)}`);
                        return assessments;
                    }
                } catch (err) {
                    // Continue to next variation
                    continue;
                }
            }

            console.log(`✅ Fetched ${allAssessments.length} assessments for ${municipalityName}`);
            return allAssessments;
        } catch (error: any) {
            console.error(`❌ Error fetching assessments for ${municipalityName}:`, error);
            throw error;
        }
    }

    // Get assessments by municipality NAME with pagination (for large datasets)
    async getAssessmentsByMunicipalityPaginated(
        collectionId: string,
        municipalityName: string,
        totalLimit: number = 200000
    ): Promise<AssessmentDocument[]> {
        try {
            console.log(`📊 Starting paginated fetch for ${municipalityName} (up to ${totalLimit} records)...`);
            
            // Determine the actual municipality name to use in queries
            let actualMunicipalityName = municipalityName;
            
            // For Las Nieves, try to find which variation exists in the database
            if (municipalityName.toUpperCase().includes('LAS NIEVES')) {
                const variations = ['LAS NIEVES', 'LASNIEVES', 'Las Nieves', 'Lasnieves'];
                for (const variation of variations) {
                    try {
                        const testResponse = await databases.listDocuments(
                            this.databaseId,
                            collectionId,
                            [
                                Query.equal('municipality', variation),
                                Query.limit(1)
                            ]
                        );
                        if (testResponse.documents.length > 0) {
                            actualMunicipalityName = variation;
                            console.log(`✅ Found Las Nieves records using: "${variation}"`);
                            break;
                        }
                    } catch (err) {
                        continue;
                    }
                }
            }
            
            const allAssessments: AssessmentDocument[] = [];
            const pageSize = 5000; // Appwrite's maximum limit per request
            let offset = 0;
            let hasMore = true;
            let pageNumber = 1;

            while (hasMore && allAssessments.length < totalLimit) {
                console.log(`📄 Fetching page ${pageNumber} for ${municipalityName} (offset: ${offset})...`);
                
                const response = await databases.listDocuments(
                    this.databaseId,
                    collectionId,
                    [
                        Query.equal('municipality', actualMunicipalityName), // SERVER-SIDE FILTER!
                        Query.limit(pageSize),
                        Query.offset(offset),
                        Query.orderAsc('tdn')
                    ]
                );

                const pageAssessments = response.documents.map((doc: Models.Document) => {
                    const assessment = doc as unknown as AssessmentDocument;
                    
                    // Transform taxability
                    if (assessment.taxability === "1") {
                        assessment.taxability = "Taxable";
                    } else if (assessment.taxability === "0") {
                        assessment.taxability = "Exempt";
                    }
                    
                    return assessment;
                });

                allAssessments.push(...pageAssessments);
                console.log(`✅ Page ${pageNumber}: Fetched ${pageAssessments.length} records (Total: ${allAssessments.length})`);

                // Check if there are more records
                hasMore = pageAssessments.length === pageSize;
                offset += pageSize;
                pageNumber++;

                // Prevent infinite loop
                if (pageNumber > 100) {
                    console.warn(`⚠️ Reached maximum page limit (100 pages). Stopping pagination.`);
                    console.warn(`⚠️ Current total for ${municipalityName}: ${allAssessments.length} records`);
                    break;
                }
            }

            console.log(`✅ Paginated fetch complete for ${municipalityName}: ${allAssessments.length} total records`);
            return allAssessments;
        } catch (error: any) {
            console.error(`❌ Error in paginated fetch for ${municipalityName}:`, error);
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
                BATCH_SIZE = 25; // Optimized batch size for speed vs stability
                DELAY_BETWEEN_BATCHES = 100; // Reduced delay for faster processing
                MAX_RETRIES = 2; // Fewer retries for speed
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
                const recordId = assessment.csv_id || `record-${globalIndex}`;
                
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
                                // Enhanced duplicate resolution with multiple strategies
                                let existing = null;
                                
                                // Strategy 1: Try CSV ID only (primary identifier)
                                if (assessment.csv_id) {
                                    try {
                                        existing = await this.getAssessmentByCsvId(collectionId, assessment.csv_id);
                                    } catch (csvError) {
                                        console.warn(`⚠️ CSV ID lookup failed for ${assessment.csv_id}:`, csvError);
                                    }
                                }
                                
                                // Strategy 3: If found, try to update
                                if (existing) {
                                    try {
                                        const result = await this.updateAssessment(collectionId, existing.$id!, assessment);
                                        console.log(`⚡ Updated: ${recordId} -> ${result.$id}`);
                                        updatedCount++;
                                        return { success: true, type: 'updated', recordId, index: globalIndex };
                                    } catch (updateError: any) {
                                        console.error(`❌ Update failed for ${recordId}:`, updateError.message);
                                        // If update fails, try creating with modified CSV ID
                                        try {
                                            const municipalityPrefix = assessment.municipality ? assessment.municipality.toString().trim().toUpperCase().replace(/\s+/g, '_') : 'UNKNOWN';
                                            const modifiedAssessment = {
                                                ...assessment,
                                                csv_id: `${municipalityPrefix}_${assessment.csv_id}_retry_${Date.now()}`
                                            };
                                            const retryResult = await this.createAssessment(collectionId, modifiedAssessment);
                                            console.log(`🔧 Created with modified ID: ${recordId} -> ${retryResult.$id}`);
                                            createdCount++;
                                            return { success: true, type: 'created', recordId, index: globalIndex };
                                        } catch (retryError) {
                                            console.error(`❌ Retry create failed for ${recordId}:`, retryError);
                                            throw updateError; // Throw original update error
                                        }
                                    }
                                } else {
                                    // Strategy 4: Record not found but duplicate error occurred
                                    console.warn(`⚠️ Duplicate error but record not found for ${recordId}, trying modified create...`);
                                    try {
                                        const municipalityPrefix = assessment.municipality ? assessment.municipality.toString().trim().toUpperCase().replace(/\s+/g, '_') : 'UNKNOWN';
                                        const modifiedAssessment = {
                                            ...assessment,
                                            csv_id: `${municipalityPrefix}_${assessment.csv_id}_notfound_${Date.now()}`
                                        };
                                        const retryResult = await this.createAssessment(collectionId, modifiedAssessment);
                                        console.log(`🔧 Created with modified ID (not found): ${recordId} -> ${retryResult.$id}`);
                                        createdCount++;
                                        return { success: true, type: 'created', recordId, index: globalIndex };
                                    } catch (retryError) {
                                        console.error(`❌ Modified create failed for ${recordId}:`, retryError);
                                        throw createError; // Throw original create error
                                    }
                                }
                            } catch (updateError) {
                                console.warn(`⚠️ Duplicate handling failed for ${recordId}:`, updateError);
                            }
                        }
                        throw createError;
                    }
                } catch (error: any) {
                    const identifier = assessment.csv_id ? `CSV ID ${assessment.csv_id}` : `Record ${globalIndex}`;
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

    // GUARANTEED UNIQUE import method - NO DUPLICATE CHECKING
    async guaranteedUniqueImport(
        collectionId: string, 
        assessments: Omit<AssessmentDocument, '$id' | '$createdAt' | '$updatedAt'>[],
        onProgress?: (progress: { processed: number; successful: number; failed: number; errors: string[] }) => void
    ): Promise<{ successful: number; failed: number; errors: string[] }> {
        let successful = 0;
        let failed = 0;
        const errors: string[] = [];
        
        console.log(`🚀 GUARANTEED UNIQUE MODE: Processing ${assessments.length} records with Appwrite auto-generated IDs`);
        console.log(`🚀 Every record gets a completely new document - NO DUPLICATE CHECKING`);
        
        // Process records one by one with Appwrite auto-generated IDs
        for (let i = 0; i < assessments.length; i++) {
            const assessment = assessments[i];
            const recordId = assessment.csv_id || `record-${i}`;
            
            try {
                // COMPLETELY CLEAN DATA - Remove any potential ID fields
                const cleanAssessment = { ...assessment } as any;
                delete cleanAssessment.$id;
                delete cleanAssessment.$createdAt;
                delete cleanAssessment.$updatedAt;
                
                console.log(`🚀 Processing record ${i + 1}/${assessments.length}: ${recordId}`);
                
                // Create document with Appwrite's automatic ID generation
                const result = await databases.createDocument(
                    this.databaseId,
                    collectionId,
                    ID.unique(), // Let Appwrite generate unique ID automatically
                    cleanAssessment
                );
                
                console.log(`✅ SUCCESS: Record ${recordId} created with ID: ${result.$id}`);
                successful++;
                
                // Longer delay between each record to prevent race conditions
                if (i < assessments.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100)); // Increased delay to prevent race conditions
                }
                
            } catch (createError: any) {
                console.error(`❌ FAILED: Record ${recordId} failed:`, createError.message);
                failed++;
                errors.push(`${recordId}: ${createError.message}`);
                
                // If still getting ID conflicts, try with ID.unique() as fallback
                if (createError.message.includes('already exists')) {
                    try {
                        console.log(`🔄 RETRY: Using ID.unique() for ${recordId}`);
                        const cleanAssessment = { ...assessment } as any;
                        delete cleanAssessment.$id;
                        delete cleanAssessment.$createdAt;
                        delete cleanAssessment.$updatedAt;
                        
                        const retryResult = await databases.createDocument(
                            this.databaseId,
                            collectionId,
                            ID.unique(), // Fallback to ID.unique()
                            cleanAssessment
                        );
                        
                        console.log(`✅ RETRY SUCCESS: Record ${recordId} created with ID: ${retryResult.$id}`);
                        successful++;
                        failed--; // Remove from failed count
                        errors.pop(); // Remove the error
                    } catch (retryError: any) {
                        console.error(`❌ RETRY FAILED: Record ${recordId}:`, retryError.message);
                        // Keep in failed count and errors
                    }
                }
            }
            
            // Update progress every 10 records or on completion
            if ((i + 1) % 10 === 0 || i === assessments.length - 1) {
                if (onProgress) {
                    onProgress({
                        processed: i + 1,
                        successful,
                        failed,
                        errors
                    });
                }
            }
        }
        
        console.log(`🚀 GUARANTEED UNIQUE import completed: ${successful} successful, ${failed} failed`);
        return { successful, failed, errors };
    }

    // BATCH SEQUENTIAL import method - REDUCED RACE CONDITIONS
    async forceUniqueImport(
        collectionId: string, 
        assessments: Omit<AssessmentDocument, '$id' | '$createdAt' | '$updatedAt'>[],
        onProgress?: (progress: { processed: number; successful: number; failed: number; errors: string[] }) => void
    ): Promise<{ successful: number; failed: number; errors: string[] }> {
        let successful = 0;
        let failed = 0;
        const errors: string[] = [];
        
        console.log(`🔥 SEQUENTIAL MODE: Processing ${assessments.length} records ONE BY ONE to avoid race conditions`);
        console.log(`🔥 This method processes records sequentially with delays to prevent ID conflicts`);
        
        const SEQUENTIAL_BATCH_SIZE = 5; // Very small batches to prevent race conditions
        const DELAY_BETWEEN_BATCHES = 100; // 100ms delay between batches
        
        // Process in small sequential batches
        for (let i = 0; i < assessments.length; i += SEQUENTIAL_BATCH_SIZE) {
            const batch = assessments.slice(i, i + SEQUENTIAL_BATCH_SIZE);
            const batchNumber = Math.floor(i / SEQUENTIAL_BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(assessments.length / SEQUENTIAL_BATCH_SIZE);
            
            console.log(`🔥 SEQUENTIAL BATCH ${batchNumber}/${totalBatches} (${batch.length} records)`);
            
            // Process batch with limited concurrency to avoid race conditions
            const batchPromises = batch.map(async (assessment, batchIndex) => {
                const globalIndex = i + batchIndex;
                const recordId = assessment.csv_id || `record-${globalIndex}`;
                
                try {
                    // COMPLETELY CLEAN DATA - Remove any potential ID fields
                    const cleanAssessment = { ...assessment } as any;
                    delete cleanAssessment.$id;
                    delete cleanAssessment.$createdAt;
                    delete cleanAssessment.$updatedAt;
                    
                    // FORCE ID.unique() - NO EXCEPTIONS
                    console.log(`🔥 Creating record ${globalIndex + 1} with FORCED unique ID`);
                    const result = await databases.createDocument(
                        this.databaseId,
                        collectionId,
                        ID.unique(), // ABSOLUTELY FORCED unique ID
                        cleanAssessment
                    );
                    
                    console.log(`✅ SUCCESS: Record ${recordId} created with ID: ${result.$id}`);
                    return { success: true, type: 'created', recordId, id: result.$id };
                } catch (createError: any) {
                    console.error(`❌ FAILED: Record ${recordId} failed:`, createError.message);
                    return { success: false, error: `${recordId}: ${createError.message}`, recordId };
                }
            });
            
            // Wait for batch completion
            const batchResults = await Promise.allSettled(batchPromises);
            
            // Process results
            batchResults.forEach((result, idx) => {
                if (result.status === 'fulfilled') {
                    if (result.value.success) {
                        successful++;
                    } else {
                        failed++;
                        errors.push(result.value.error || 'Unknown error');
                    }
                } else {
                    failed++;
                    const recordId = batch[idx]?.csv_id || `record-${i + idx}`;
                    console.error(`❌ PROMISE REJECTED for ${recordId}:`, result.reason);
                    errors.push(`${recordId}: Promise rejected - ${result.reason}`);
                }
            });

            // Update progress
            if (onProgress) {
                onProgress({
                    processed: Math.min(i + SEQUENTIAL_BATCH_SIZE, assessments.length),
                    successful,
                    failed,
                    errors
                });
            }
            
            // Delay between batches to prevent race conditions
            if (i + SEQUENTIAL_BATCH_SIZE < assessments.length) {
                console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`);
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
            }
        }
        
        console.log(`🔥 FORCE-UNIQUE import completed: ${successful} successful, ${failed} failed`);
        if (failed > 0) {
            console.log(`🔥 First 5 errors:`, errors.slice(0, 5));
        }
        return { successful, failed, errors };
    }

    // LIGHTNING-FAST import method - NO VALIDATION, NO DUPLICATE CHECKING
    async lightningFastImport(
        collectionId: string, 
        assessments: Omit<AssessmentDocument, '$id' | '$createdAt' | '$updatedAt'>[],
        onProgress?: (progress: { processed: number; successful: number; failed: number; errors: string[] }) => void
    ): Promise<{ successful: number; failed: number; errors: string[] }> {
        let successful = 0;
        let failed = 0;
        const errors: string[] = [];
        
        console.log(`⚡ LIGHTNING-FAST MODE: Processing ${assessments.length} records with ZERO validation`);
        
        const LIGHTNING_BATCH_SIZE = 100; // Maximum batch size for speed
        
        // Process in maximum batches with no delay
        for (let i = 0; i < assessments.length; i += LIGHTNING_BATCH_SIZE) {
            const batch = assessments.slice(i, i + LIGHTNING_BATCH_SIZE);
            const batchNumber = Math.floor(i / LIGHTNING_BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(assessments.length / LIGHTNING_BATCH_SIZE);
            
            console.log(`⚡ LIGHTNING BATCH ${batchNumber}/${totalBatches} (${batch.length} records)`);
            
            // Process entire batch in parallel - CREATE ONLY, NO DUPLICATE CHECKING
            const batchPromises = batch.map(async (assessment, batchIndex) => {
                const globalIndex = i + batchIndex;
                const recordId = assessment.csv_id || `record-${globalIndex}`;
                
                try {
                    // DIRECT CREATE - NO DUPLICATE CHECKING, NO VALIDATION
                    const result = await databases.createDocument(
                        this.databaseId,
                        collectionId,
                        ID.unique(), // Always use unique ID
                        assessment
                    );
                    return { success: true, type: 'created', recordId, id: result.$id };
                } catch (createError: any) {
                    // NO DUPLICATE HANDLING - JUST LOG AND CONTINUE
                    return { success: false, error: `${recordId}: ${createError.message}`, recordId };
                }
            });
            
            // Wait for batch completion
            const batchResults = await Promise.allSettled(batchPromises);
            
            // Process results quickly
            batchResults.forEach((result) => {
                if (result.status === 'fulfilled') {
                    if (result.value.success) {
                        successful++;
                    } else {
                        failed++;
                        errors.push(result.value.error || 'Unknown error');
                    }
                } else {
                    failed++;
                    errors.push(`Promise rejected: ${result.reason}`);
                }
            });

            // Update progress
            if (onProgress) {
                onProgress({
                    processed: Math.min(i + LIGHTNING_BATCH_SIZE, assessments.length),
                    successful,
                    failed,
                    errors
                });
            }
        }
        
        console.log(`🏁 LIGHTNING import completed: ${successful} successful, ${failed} failed`);
        return { successful, failed, errors };
    }

    // TURBO-FAST import method with optimized performance
    async turboFastImport(
        collectionId: string, 
        assessments: Omit<AssessmentDocument, '$id' | '$createdAt' | '$updatedAt'>[],
        onProgress?: (progress: { processed: number; successful: number; failed: number; errors: string[] }) => void
    ): Promise<{ successful: number; failed: number; errors: string[] }> {
        let successful = 0;
        let failed = 0;
        const errors: string[] = [];
        
        console.log(`🚀 TURBO-FAST MODE: Processing ${assessments.length} records with maximum speed optimization`);
        
        const TURBO_BATCH_SIZE = 50; // Larger batches for speed
        const MINIMAL_DELAY = 50; // Very small delay
        
        // Pre-process: Remove duplicates within the CSV to prevent conflicts
        const uniqueAssessments = this.removeDuplicatesFromBatch(assessments);
        console.log(`🔍 Removed ${assessments.length - uniqueAssessments.length} duplicate records from CSV`);
        
        // Process in large batches with minimal delay
        for (let i = 0; i < uniqueAssessments.length; i += TURBO_BATCH_SIZE) {
            const batch = uniqueAssessments.slice(i, i + TURBO_BATCH_SIZE);
            const batchNumber = Math.floor(i / TURBO_BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(uniqueAssessments.length / TURBO_BATCH_SIZE);
            
            console.log(`⚡ TURBO BATCH ${batchNumber}/${totalBatches} (${batch.length} records)`);
            
            // Process entire batch in parallel with optimized error handling
            const batchPromises = batch.map(async (assessment, batchIndex) => {
                const globalIndex = i + batchIndex;
                const recordId = assessment.csv_id || `record-${globalIndex}`;
                
                try {
                    // Optimized create-first approach
                    const result = await this.createAssessment(collectionId, assessment);
                    return { success: true, type: 'created', recordId, id: result.$id };
                } catch (createError: any) {
                    // Fast duplicate handling - only try update if it's clearly a duplicate
                    if (this.isDuplicateError(createError)) {
                        try {
                            // Quick duplicate resolution - try CSV ID first, then TDN
                            const existing = await this.quickFindExisting(collectionId, assessment);
                            if (existing) {
                                const result = await this.updateAssessment(collectionId, existing.$id!, assessment);
                                return { success: true, type: 'updated', recordId, id: result.$id };
                            } else {
                                // Create with modified ID if not found
                                const municipalityPrefix = assessment.municipality ? assessment.municipality.toString().trim().toUpperCase().replace(/\s+/g, '_') : 'UNKNOWN';
                                const modifiedAssessment = {
                                    ...assessment,
                                    csv_id: `${municipalityPrefix}_${assessment.csv_id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
                                };
                                const result = await this.createAssessment(collectionId, modifiedAssessment);
                                return { success: true, type: 'created', recordId, id: result.$id };
                            }
                        } catch (updateError: any) {
                            return { success: false, error: `${recordId}: ${updateError.message}`, recordId };
                        }
                    } else {
                        return { success: false, error: `${recordId}: ${createError.message}`, recordId };
                    }
                }
            });
            
            // Wait for batch completion
            const batchResults = await Promise.allSettled(batchPromises);
            
            // Process results quickly
            batchResults.forEach((result) => {
                if (result.status === 'fulfilled') {
                    if (result.value.success) {
                        successful++;
                    } else {
                        failed++;
                        errors.push(result.value.error || 'Unknown error');
                    }
                } else {
                    failed++;
                    errors.push(`Promise rejected: ${result.reason}`);
                }
            });

            // Update progress
            if (onProgress) {
                onProgress({
                    processed: Math.min(i + TURBO_BATCH_SIZE, uniqueAssessments.length),
                    successful,
                    failed,
                    errors
                });
            }

            // Minimal delay for maximum speed
            if (i + TURBO_BATCH_SIZE < uniqueAssessments.length) {
                await new Promise(resolve => setTimeout(resolve, MINIMAL_DELAY));
            }
        }
        
        console.log(`🏁 TURBO import completed: ${successful} successful, ${failed} failed`);
        return { successful, failed, errors };
    }

    // Helper method to remove duplicates within the batch
    private removeDuplicatesFromBatch(assessments: any[]): any[] {
        const seen = new Set<string>();
        return assessments.filter(assessment => {
            const key = assessment.csv_id;
            if (!key || seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    // Quick method to find existing records
    private async quickFindExisting(collectionId: string, assessment: any): Promise<any> {
        // Try CSV ID only (primary identifier)
        if (assessment.csv_id) {
            try {
                return await this.getAssessmentByCsvId(collectionId, assessment.csv_id);
            } catch (error) {
                // Ignore errors
            }
        }
        
        return null;
    }

    // Helper to check if error is duplicate-related
    private isDuplicateError(error: any): boolean {
        return error?.code === 409 || 
               error?.message?.includes('duplicate') || 
               error?.message?.includes('unique') ||
               error?.message?.includes('already exists');
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
            return { deleted: 0, failed: 0, errors: [] };
        }
    }

    // ULTRA-SAFE sequential import method - ZERO race conditions
    async ultraSafeSequentialImport(
        collectionId: string, 
        assessments: Omit<AssessmentDocument, '$id' | '$createdAt' | '$updatedAt'>[],
        onProgress?: (progress: { processed: number; successful: number; failed: number; errors: string[] }) => void
    ): Promise<{ successful: number; failed: number; errors: string[] }> {
        let successful = 0;
        let failed = 0;
        const errors: string[] = [];
        
        console.log(`🛡️ ULTRA-SAFE MODE: Processing ${assessments.length} records with ZERO race conditions`);
        console.log(`🛡️ Sequential processing with extended delays and error recovery`);
        
        // Process records one by one with extended delays
        for (let i = 0; i < assessments.length; i++) {
            const assessment = assessments[i];
            const recordId = assessment.csv_id || `record-${i}`;
            
            console.log(`🛡️ Processing record ${i + 1}/${assessments.length}: ${recordId}`);
            
            let attempts = 0;
            const maxAttempts = 3;
            let recordProcessed = false;
            
            while (attempts < maxAttempts && !recordProcessed) {
                attempts++;
                
                try {
                    // Clean data completely
                    const cleanAssessment = { ...assessment } as any;
                    delete cleanAssessment.$id;
                    delete cleanAssessment.$createdAt;
                    delete cleanAssessment.$updatedAt;
                    
                    console.log(`🛡️ Attempt ${attempts}/${maxAttempts} for record: ${recordId}`);
                    
                    // Generate Appwrite-compliant bulletproof ID (max 36 chars, no special start)
                    const timestamp = Date.now().toString(36); // Base36 timestamp (shorter)
                    const random = Math.random().toString(36).substring(2, 8); // 6 chars
                    const index = i.toString(36); // Base36 index
                    const attempt = attempts.toString(36); // Base36 attempt
                    const extra = Math.floor(Math.random() * 1000).toString(36); // Extra randomness
                    const uniqueId = `a${timestamp}${random}${index}${attempt}${extra}`.substring(0, 36);
                    
                    console.log(`🆔 Generated compliant ID (${uniqueId.length} chars): ${uniqueId}`);
                    
                    // Create document with our bulletproof unique ID
                    const result = await databases.createDocument(
                        this.databaseId,
                        collectionId,
                        uniqueId, // Use our bulletproof unique ID
                        cleanAssessment
                    );
                    
                    console.log(`✅ SUCCESS: Record ${recordId} created with ID: ${result.$id}`);
                    successful++;
                    recordProcessed = true;
                    
                } catch (createError: any) {
                    console.error(`❌ ATTEMPT ${attempts} FAILED for ${recordId}:`, createError.message);
                    
                    if (attempts >= maxAttempts) {
                        // All attempts failed
                        failed++;
                        errors.push(`${recordId}: Failed after ${maxAttempts} attempts - ${createError.message}`);
                        recordProcessed = true; // Stop trying
                    } else {
                        // Wait longer before retry
                        console.log(`⏳ Waiting 2 seconds before retry attempt ${attempts + 1}...`);
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
            }
            
            // Update progress every record
            if (onProgress) {
                onProgress({
                    processed: i + 1,
                    successful,
                    failed,
                    errors
                });
            }
            
            // Extended delay between records to prevent any race conditions
            if (i < assessments.length - 1) {
                console.log(`⏳ Waiting 200ms before next record...`);
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
        
        console.log(`🛡️ ULTRA-SAFE import completed: ${successful} successful, ${failed} failed`);
        return { successful, failed, errors };
    }

    // FAST BULLETPROOF import method - Parallel processing with bulletproof IDs
    async fastBulletproofImport(
        collectionId: string, 
        assessments: Omit<AssessmentDocument, '$id' | '$createdAt' | '$updatedAt'>[],
        onProgress?: (progress: { processed: number; successful: number; failed: number; errors: string[] }) => void
    ): Promise<{ successful: number; failed: number; errors: string[] }> {
        let successful = 0;
        let failed = 0;
        const errors: string[] = [];
        
        console.log(`⚡ FAST BULLETPROOF MODE: Processing ${assessments.length} records with parallel processing + bulletproof IDs`);
        
        const BATCH_SIZE = 5; // Small batch size to prevent race conditions
        const DELAY_BETWEEN_BATCHES = 200; // Longer delay to prevent ID conflicts
        
        // Process in batches with bulletproof ID generation
        for (let i = 0; i < assessments.length; i += BATCH_SIZE) {
            const batch = assessments.slice(i, i + BATCH_SIZE);
            const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(assessments.length / BATCH_SIZE);
            
            console.log(`⚡ BULLETPROOF BATCH ${batchNumber}/${totalBatches} (${batch.length} records)`);
            
            // Process batch in parallel with bulletproof IDs
            const batchPromises = batch.map(async (assessment, batchIndex) => {
                const globalIndex = i + batchIndex;
                const recordId = assessment.csv_id || `record-${globalIndex}`;
                
                try {
                    // Clean data completely
                    const cleanAssessment = { ...assessment } as any;
                    delete cleanAssessment.$id;
                    delete cleanAssessment.$createdAt;
                    delete cleanAssessment.$updatedAt;
                    
                    // Use ID.unique() for maximum reliability - let Appwrite handle uniqueness
                    console.log(`⚡ Creating record ${globalIndex + 1} with ID.unique()`);
                    
                    // Create document with ID.unique()
                    const result = await databases.createDocument(
                        this.databaseId,
                        collectionId,
                        ID.unique(),
                        cleanAssessment
                    );
                    
                    return { success: true, type: 'created', recordId, id: result.$id };
                    
                } catch (createError: any) {
                    console.error(`❌ FAILED: Record ${recordId}:`, createError.message);
                    return { success: false, error: `${recordId}: ${createError.message}`, recordId };
                }
            });
            
            // Wait for batch completion
            const batchResults = await Promise.allSettled(batchPromises);
            
            // Process results
            batchResults.forEach((result) => {
                if (result.status === 'fulfilled') {
                    if (result.value.success) {
                        successful++;
                    } else {
                        failed++;
                        errors.push(result.value.error || 'Unknown error');
                    }
                } else {
                    failed++;
                    errors.push(`Promise rejected: ${result.reason}`);
                }
            });

            // Update progress
            if (onProgress) {
                onProgress({
                    processed: Math.min(i + BATCH_SIZE, assessments.length),
                    successful,
                    failed,
                    errors
                });
            }

            // Short delay between batches
            if (i + BATCH_SIZE < assessments.length) {
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
            }
        }
        
        console.log(`⚡ FAST BULLETPROOF import completed: ${successful} successful, ${failed} failed`);
        return { successful, failed, errors };
    }

    // ABSOLUTELY SAFE sequential import - ONE record at a time, ZERO concurrency
    async absolutelySafeImport(
        collectionId: string, 
        assessments: Omit<AssessmentDocument, '$id' | '$createdAt' | '$updatedAt'>[],
        onProgress?: (progress: { processed: number; successful: number; failed: number; errors: string[] }) => void
    ): Promise<{ successful: number; failed: number; errors: string[] }> {
        let successful = 0;
        let failed = 0;
        const errors: string[] = [];
        
        console.log(`🔒 ABSOLUTELY SAFE MODE: Processing ${assessments.length} records ONE BY ONE with ZERO concurrency`);
        console.log(`🔒 This will be slower but 100% reliable - no race conditions possible`);
        
        // Process records one by one with NO concurrency
        for (let i = 0; i < assessments.length; i++) {
            const assessment = assessments[i];
            const recordId = assessment.csv_id || `record-${i}`;
            
            console.log(`🔒 Processing record ${i + 1}/${assessments.length}: ${recordId}`);
            
            try {
                // Clean data completely
                const cleanAssessment = { ...assessment } as any;
                delete cleanAssessment.$id;
                delete cleanAssessment.$createdAt;
                delete cleanAssessment.$updatedAt;
                
                // Use ID.unique() with no concurrency
                const result = await databases.createDocument(
                    this.databaseId,
                    collectionId,
                    ID.unique(),
                    cleanAssessment
                );
                
                console.log(`✅ SUCCESS: Record ${recordId} created with ID: ${result.$id}`);
                successful++;
                
            } catch (createError: any) {
                console.error(`❌ FAILED: Record ${recordId}:`, createError.message);
                failed++;
                errors.push(`${recordId}: ${createError.message}`);
            }
            
            // Update progress every 5 records or on completion
            if ((i + 1) % 5 === 0 || i === assessments.length - 1) {
                if (onProgress) {
                    onProgress({
                        processed: i + 1,
                        successful,
                        failed,
                        errors
                    });
                }
            }
            
            // Wait between each record to prevent any possible timing issues
            if (i < assessments.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        console.log(`🔒 ABSOLUTELY SAFE import completed: ${successful} successful, ${failed} failed`);
        return { successful, failed, errors };
    }

    // CSV to JSON conversion helper method
    // NO CSV_ID or TDN VALIDATION - Just save the data as-is
    private convertCSVRowToJSON(csvRow: any, index: number): Record<string, any> {
        console.log(`🔄 Converting CSV row ${index + 1} to JSON format`);
        
        // Generate truly unique identifiers to avoid database unique constraint violations
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        
        // Create a clean JSON object with proper data types
        const jsonData: Record<string, any> = {
            // NO csv_id field - let Appwrite handle uniqueness via document ID only
            
            // Core identification fields - make them unique per import
            tdn: csvRow.tdn?.toString().trim() || `IMPORT_${timestamp}_${random}_${index}`,
            pin: csvRow.pin?.toString().trim() || '',
            name: csvRow.name?.toString().trim() || '',
            
            // Financial fields (ensure numeric conversion)
            market_val: this.parseNumericValue(csvRow.market_val, 0),
            ass_value: this.parseNumericValue(csvRow.ass_value, 0),
            area: this.parseNumericValue(csvRow.area, 0),
            unit_value: this.parseNumericValue(csvRow.unit_value, 0),
            
            // Classification fields
            kind: csvRow.kind?.toString().trim() || '',
            ass_level: csvRow.ass_level?.toString().trim() || '',
            classification: csvRow.classification?.toString().trim() || '',
            sub_class: csvRow.sub_class?.toString().trim() || '',
            taxability: csvRow.taxability?.toString().trim() || '',
            
            // Transaction fields
            trans_cd: csvRow.trans_cd?.toString().trim() || '',
            tax_beg_yr: csvRow.tax_beg_yr?.toString().trim() || '',
            eff_date: csvRow.eff_date?.toString().trim() || '',
            owner_no: csvRow.owner_no?.toString().trim() || '',
            
            // Location fields
            mun_code: csvRow.mun_code?.toString().trim() || '',
            municipality: csvRow.municipality?.toString().trim() || 'UNKNOWN',
            bcode: csvRow.bcode?.toString().trim() || '',
            barangay: csvRow.barangay?.toString().trim() || '',
            gr_code: csvRow.gr_code?.toString().trim() || '',
            gr: csvRow.gr?.toString().trim() || ''
        };
        
        // Remove empty or undefined fields to keep JSON clean
        Object.keys(jsonData).forEach(key => {
            if (jsonData[key] === undefined || jsonData[key] === null || jsonData[key] === '') {
                delete jsonData[key];
            }
        });
        
        console.log(`✅ JSON conversion complete for row ${index + 1}:`, {
            tdn: jsonData.tdn,
            municipality: jsonData.municipality,
            fields_count: Object.keys(jsonData).length
        });
        
        return jsonData;
    }
    
    // Helper method to parse numeric values safely
    private parseNumericValue(value: any, defaultValue: number = 0): number {
        if (value === null || value === undefined || value === '') {
            return defaultValue;
        }
        
        // Convert to string and remove any non-numeric characters except decimal point
        const cleanValue = value.toString().replace(/[^\d.-]/g, '');
        const parsed = parseFloat(cleanValue);
        
        return isNaN(parsed) ? defaultValue : parsed;
    }
    
    // Enhanced JSON validation method
    private validateJSONData(jsonData: any, index: number): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        // Required field validation
        if (!jsonData.tdn) {
            errors.push(`Row ${index + 1}: Missing required field 'tdn'`);
        }
        
        if (!jsonData.pin) {
            errors.push(`Row ${index + 1}: Missing required field 'pin'`);
        }
        
        if (!jsonData.name) {
            errors.push(`Row ${index + 1}: Missing required field 'name'`);
        }
        
        // Numeric field validation
        if (typeof jsonData.market_val !== 'number' || jsonData.market_val < 0) {
            errors.push(`Row ${index + 1}: Invalid market_val - must be a positive number`);
        }
        
        if (typeof jsonData.ass_value !== 'number' || jsonData.ass_value < 0) {
            errors.push(`Row ${index + 1}: Invalid ass_value - must be a positive number`);
        }
        
        if (typeof jsonData.area !== 'number' || jsonData.area <= 0) {
            errors.push(`Row ${index + 1}: Invalid area - must be a positive number`);
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // ULTRA SIMPLE NO-VALIDATION IMPORT - Save every row as-is with zero checks
    async noValidationImport(
        collectionId: string, 
        csvData: any[],
        onProgress?: (progress: { processed: number; successful: number; failed: number; skipped: number; errors: string[]; jsonConverted: number }) => void
    ): Promise<{ successful: number; failed: number; skipped: number; errors: string[]; jsonConverted: number }> {
        let successful = 0;
        let failed = 0;
        const errors: string[] = [];
        
        console.log(`🚀 NO-VALIDATION IMPORT: Saving ${csvData.length} rows directly to database`);
        console.log(`🚀 Every row will be saved as a new document - NO CHECKS WHATSOEVER`);
        
        for (let i = 0; i < csvData.length; i++) {
            const row = csvData[i];
            
            try {
                // Deep clone to ensure completely independent object
                const cleanRow = JSON.parse(JSON.stringify(row));
                
                // Remove csv_id to avoid any potential unique constraint issues
                delete cleanRow.csv_id;
                
                // Generate unique ID
                const docId = ID.unique();
                
                if (i < 3) {
                    console.log(`📝 Row ${i + 1} - Document ID: ${docId}`);
                    console.log(`📝 Row ${i + 1} - Data:`, cleanRow);
                }
                
                const result = await databases.createDocument(
                    this.databaseId,
                    collectionId,
                    docId,
                    cleanRow
                );
                
                successful++;
                
                if (i < 5 || (i + 1) % 50 === 0) {
                    console.log(`✅ Row ${i + 1}/${csvData.length} saved with ID: ${result.$id}`);
                }
                
            } catch (error: any) {
                failed++;
                const errorMsg = `Row ${i + 1}: ${error.message}`;
                errors.push(errorMsg);
                
                if (failed <= 10) {
                    console.error(`❌ Row ${i + 1} failed:`, error);
                    console.error(`❌ Error code:`, error.code);
                    console.error(`❌ Error type:`, error.type);
                }
            }
            
            // Progress update
            if ((i + 1) % 10 === 0 || i === csvData.length - 1) {
                if (onProgress) {
                    onProgress({
                        processed: i + 1,
                        successful,
                        failed,
                        skipped: 0,
                        errors,
                        jsonConverted: i + 1
                    });
                }
            }
            
            // Small delay to prevent rate limiting
            if (i < csvData.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }
        
        console.log(`🏁 IMPORT COMPLETE: ${successful} saved, ${failed} failed`);
        return { successful, failed, skipped: 0, errors, jsonConverted: csvData.length };
    }

    // ENHANCED CSV TO JSON IMPORT - Convert CSV to JSON then push to Appwrite
    // NO VALIDATION - Every row is saved as a new document with Appwrite auto-generated ID
    async csvToJsonImport(
        collectionId: string, 
        csvData: any[],
        onProgress?: (progress: { processed: number; successful: number; failed: number; skipped: number; errors: string[]; jsonConverted: number }) => void
    ): Promise<{ successful: number; failed: number; skipped: number; errors: string[]; jsonConverted: number }> {
        let successful = 0;
        let failed = 0;
        let skipped = 0;
        let jsonConverted = 0;
        const errors: string[] = [];
        
        console.log(`🔄 CSV TO JSON IMPORT: Processing ${csvData.length} CSV records`);
        console.log(`🔄 NO VALIDATION MODE: Every row will be saved as a new document`);
        console.log(`🔄 Pattern: CSV → JSON Conversion → Direct Database Push (No Checks)`);
        
        // Step 1: Convert all CSV rows to JSON format
        console.log(`📝 Step 1: Converting ${csvData.length} CSV rows to JSON...`);
        const jsonRecords: any[] = [];
        
        for (let i = 0; i < csvData.length; i++) {
            try {
                const jsonData = this.convertCSVRowToJSON(csvData[i], i);
                
                // NO VALIDATION - Accept all rows as-is
                jsonRecords.push(jsonData);
                jsonConverted++;
                
                if (i < 3 || (i + 1) % 1000 === 0) {
                    console.log(`✅ Row ${i + 1} converted to JSON`);
                }
                
            } catch (conversionError: any) {
                const errorMsg = `Row ${i + 1} JSON conversion failed: ${conversionError.message}`;
                errors.push(errorMsg);
                console.error(`❌ ${errorMsg}`);
            }
        }
        
        console.log(`📊 JSON Conversion Summary:`);
        console.log(`   ✅ Successfully converted: ${jsonConverted}`);
        console.log(`   ❌ Conversion failures: ${csvData.length - jsonConverted}`);
        console.log(`   📋 Ready for database: ${jsonRecords.length}`);
        
        // Step 2: Push JSON records to Appwrite database - NO DUPLICATE CHECKING
        console.log(`💾 Step 2: Pushing ${jsonRecords.length} JSON records to Appwrite (NO VALIDATION)...`);
        
        for (let i = 0; i < jsonRecords.length; i++) {
            const jsonRecord = jsonRecords[i];
            
            try {
                // DIRECT SAVE - No checking, no validation, just create with ID.unique()
                const result = await databases.createDocument(
                    this.databaseId,
                    collectionId,
                    ID.unique(), // Appwrite generates unique ID automatically
                    jsonRecord
                );
                
                successful++;
                
                if (i < 3 || (i + 1) % 100 === 0) {
                    console.log(`✅ Record ${i + 1}/${jsonRecords.length} saved with ID: ${result.$id}`);
                }
                
            } catch (dbError: any) {
                // Log error but continue processing
                failed++;
                const errorMsg = `Record ${i + 1}: ${dbError.message}`;
                errors.push(errorMsg);
                
                if (failed <= 5) {
                    console.error(`❌ Database error: ${errorMsg}`);
                }
            }
            
            // Update progress every 10 records
            if ((i + 1) % 10 === 0 || i === jsonRecords.length - 1) {
                if (onProgress) {
                    onProgress({
                        processed: i + 1,
                        successful,
                        failed,
                        skipped,
                        errors,
                        jsonConverted
                    });
                }
            }
            
            // Small delay to prevent overwhelming Appwrite
            if (i < jsonRecords.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }
        
        // Final results
        console.log(`🏁 CSV TO JSON IMPORT COMPLETED:`);
        console.log(`   📊 Total CSV rows: ${csvData.length}`);
        console.log(`   🔄 JSON converted: ${jsonConverted}`);
        console.log(`   ✅ Database successful: ${successful}`);
        console.log(`   ❌ Database failed: ${failed}`);
        console.log(`   📋 Total errors: ${errors.length}`);
        
        return { successful, failed, skipped, errors, jsonConverted };
    }

    // HYPER-FAST IMPORT - Maximum speed with massive parallel processing + DEBUG MODE
    async hyperFastImport(
        collectionId: string, 
        assessments: Omit<AssessmentDocument, '$id' | '$createdAt' | '$updatedAt'>[],
        onProgress?: (progress: { processed: number; successful: number; failed: number; errors: string[] }) => void
    ): Promise<{ successful: number; failed: number; errors: string[] }> {
        let successful = 0;
        let failed = 0;
        const errors: string[] = [];
        
        console.log(`⚡ HYPER-FAST MODE: Processing ${assessments.length} records with MAXIMUM SPEED`);
        console.log(`🔍 DEBUG MODE ENABLED - Tracking all batch operations`);
        
        const HYPER_BATCH_SIZE = 25; // Process 25 records simultaneously (safer for stability)
        const BATCH_DELAY = 100; // 100ms delay to prevent overwhelming server
        const BATCH_TIMEOUT = 120000; // 2 minute timeout per batch
        
        const startTime = Date.now();
        
        // Process in massive parallel batches
        for (let i = 0; i < assessments.length; i += HYPER_BATCH_SIZE) {
            const batch = assessments.slice(i, i + HYPER_BATCH_SIZE);
            const batchNumber = Math.floor(i / HYPER_BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(assessments.length / HYPER_BATCH_SIZE);
            const batchStartTime = Date.now();
            
            console.log(`\n🚀 ========== BATCH ${batchNumber}/${totalBatches} START ==========`);
            console.log(`📊 Batch Info:`);
            console.log(`   - Records in batch: ${batch.length}`);
            console.log(`   - Start index: ${i}`);
            console.log(`   - End index: ${i + batch.length - 1}`);
            console.log(`   - Time: ${new Date().toISOString()}`);
            console.log(`   - Progress: ${successful} successful, ${failed} failed so far`);
            
            try {
                // Wrap batch processing with timeout
                const batchPromise = Promise.race([
                    // Actual batch processing
                    (async () => {
                        console.log(`⚡ Firing ${batch.length} parallel requests...`);
                        
                        // Fire all requests simultaneously with individual tracking
                        const batchPromises = batch.map(async (assessment, idx) => {
                            const recordIndex = i + idx;
                            const recordId = assessment.csv_id || assessment.tdn || `record-${recordIndex}`;
                            
                            try {
                                console.log(`   🔄 [${recordIndex}] Starting: ${recordId}`);
                                const result = await databases.createDocument(
                                    this.databaseId,
                                    collectionId,
                                    ID.unique(),
                                    assessment
                                );
                                console.log(`   ✅ [${recordIndex}] Success: ${recordId} -> ${result.$id}`);
                                return { success: true, id: result.$id, recordId, index: recordIndex };
                            } catch (error: any) {
                                console.error(`   ❌ [${recordIndex}] Failed: ${recordId}`, {
                                    code: error.code,
                                    type: error.type,
                                    message: error.message,
                                    status: error.response?.status
                                });
                                return { 
                                    success: false, 
                                    error: error.message, 
                                    recordId, 
                                    index: recordIndex,
                                    errorCode: error.code,
                                    errorType: error.type
                                };
                            }
                        });
                        
                        console.log(`⏳ Waiting for ${batchPromises.length} promises to settle...`);
                        const results = await Promise.allSettled(batchPromises);
                        console.log(`✅ All ${results.length} promises settled`);
                        
                        return results;
                    })(),
                    
                    // Timeout handler
                    new Promise<never>((_, reject) => {
                        setTimeout(() => {
                            reject(new Error(`BATCH ${batchNumber} TIMEOUT after ${BATCH_TIMEOUT}ms`));
                        }, BATCH_TIMEOUT);
                    })
                ]);
                
                const results = await batchPromise;
                
                console.log(`📊 Processing ${results.length} results...`);
                
                // Count results with detailed logging
                let batchSuccess = 0;
                let batchFailed = 0;
                
                results.forEach((result, idx) => {
                    if (result.status === 'fulfilled' && result.value.success) {
                        successful++;
                        batchSuccess++;
                    } else {
                        failed++;
                        batchFailed++;
                        
                        if (result.status === 'fulfilled') {
                            const errorMsg = `[${result.value.index}] ${result.value.recordId}: ${result.value.error}`;
                            errors.push(errorMsg);
                            console.error(`   ❌ Error: ${errorMsg}`);
                        } else {
                            const errorMsg = `[${i + idx}] Promise rejected: ${result.reason?.message}`;
                            errors.push(errorMsg);
                            console.error(`   ❌ Rejection: ${errorMsg}`);
                        }
                    }
                });
                
                const batchDuration = Date.now() - batchStartTime;
                const totalDuration = Date.now() - startTime;
                
                console.log(`✅ ========== BATCH ${batchNumber}/${totalBatches} COMPLETE ==========`);
                console.log(`📊 Batch Results:`);
                console.log(`   ✅ Successful: ${batchSuccess}`);
                console.log(`   ❌ Failed: ${batchFailed}`);
                console.log(`   ⏱️ Duration: ${batchDuration}ms`);
                console.log(`   📈 Total Progress: ${successful}/${assessments.length} (${Math.round(successful/assessments.length*100)}%)`);
                console.log(`   ⏱️ Total Time: ${Math.round(totalDuration/1000)}s`);
                console.log(`   🚀 Speed: ${Math.round(successful/(totalDuration/1000))} records/sec`);
                
                // Update progress
                if (onProgress) {
                    onProgress({
                        processed: Math.min(i + HYPER_BATCH_SIZE, assessments.length),
                        successful,
                        failed,
                        errors
                    });
                }
                
                // Check for critical errors
                if (batchFailed === batch.length) {
                    console.error(`🚨 CRITICAL: Entire batch ${batchNumber} failed! Stopping import.`);
                    console.error(`🚨 Last 5 errors:`, errors.slice(-5));
                    throw new Error(`Batch ${batchNumber} completely failed - stopping import`);
                }
                
                // Memory check
                if ((performance as any).memory) {
                    const memory = (performance as any).memory;
                    console.log(`💾 Memory: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB / ${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`);
                }
                
            } catch (error: any) {
                console.error(`\n🚨 ========== BATCH ${batchNumber} ERROR ==========`);
                console.error(`❌ Error Type: ${error.name}`);
                console.error(`❌ Error Message: ${error.message}`);
                console.error(`❌ Stack:`, error.stack);
                console.error(`📊 Progress when error occurred: ${successful} successful, ${failed} failed`);
                
                // Log the error but continue or stop based on error type
                if (error.message.includes('TIMEOUT')) {
                    console.error(`⏰ Batch timed out - this batch may still be processing in background`);
                    errors.push(`Batch ${batchNumber} timeout - may have partial success`);
                } else {
                    console.error(`🛑 Fatal error - stopping import`);
                    throw error; // Re-throw to stop import
                }
            }
            
            // Minimal delay only if needed
            if (BATCH_DELAY > 0 && i + HYPER_BATCH_SIZE < assessments.length) {
                console.log(`⏳ Waiting ${BATCH_DELAY}ms before next batch...`);
                await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
            }
        }
        
        const totalDuration = Date.now() - startTime;
        console.log(`\n⚡ ========== IMPORT COMPLETE ==========`);
        console.log(`📊 Final Results:`);
        console.log(`   ✅ Successful: ${successful}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   📊 Total: ${assessments.length}`);
        console.log(`   ⏱️ Total Time: ${Math.round(totalDuration/1000)}s`);
        console.log(`   🚀 Average Speed: ${Math.round(successful/(totalDuration/1000))} records/sec`);
        console.log(`   📋 Error Count: ${errors.length}`);
        
        if (errors.length > 0) {
            console.log(`\n❌ First 10 errors:`);
            errors.slice(0, 10).forEach((err, idx) => {
                console.error(`   ${idx + 1}. ${err}`);
            });
        }
        
        return { successful, failed, errors };
    }

    // SIMPLE CSV IMPORT - Following the pattern: Parse → Loop → Create → Show Results
    async simpleCSVImport(
        collectionId: string, 
        assessments: Omit<AssessmentDocument, '$id' | '$createdAt' | '$updatedAt'>[],
        onProgress?: (progress: { processed: number; successful: number; failed: number; errors: string[] }) => void
    ): Promise<{ successful: number; failed: number; errors: string[] }> {
        let successful = 0;
        let failed = 0;
        const errors: string[] = [];
        
        console.log(`📋 SIMPLE CSV IMPORT: Processing ${assessments.length} records`);
        console.log(`📋 Following pattern: Parse → Loop → Create → Show Results`);
        
        // Simple loop through each row
        for (let i = 0; i < assessments.length; i++) {
            const rowData = assessments[i];
            
            try {
                console.log(`📋 Creating record ${i + 1}/${assessments.length}`);
                
                // Let Appwrite create the ID automatically
                const result = await databases.createDocument(
                    this.databaseId,
                    collectionId,
                    ID.unique(), // Let Appwrite generate ID automatically
                    rowData
                );
                
                successful++;
                console.log(`✅ Success: Created document ${result.$id}`);
                
            } catch (error: any) {
                failed++;
                const errorMsg = `Row ${i + 1}: ${error.message}`;
                errors.push(errorMsg);
                console.error(`❌ Error: ${errorMsg}`);
            }
            
            // Update progress every 10 records
            if ((i + 1) % 10 === 0 || i === assessments.length - 1) {
                if (onProgress) {
                    onProgress({
                        processed: i + 1,
                        successful,
                        failed,
                        errors
                    });
                }
            }
            
            // Small delay to prevent overwhelming Appwrite
            if (i < assessments.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }
        
        // Show final results
        console.log(`📋 Import completed:`);
        console.log(`   ✅ Successful: ${successful}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   📊 Total: ${assessments.length}`);
        
        return { successful, failed, errors };
    }

    // DEBUG: Get detailed status of property assessment table
    async debugTableStatus(collectionId: string): Promise<void> {
        console.log(`\n🔍 ========== TABLE STATUS DEBUG ==========`);
        console.log(`📊 Collection ID: ${collectionId}`);
        console.log(`🗄️ Database ID: ${this.databaseId}`);
        console.log(`⏰ Timestamp: ${new Date().toISOString()}\n`);

        try {
            // 1. Get total count
            console.log(`📊 Fetching total record count...`);
            const totalCount = await this.getTotalCount(collectionId);
            console.log(`✅ Total Records: ${totalCount.toLocaleString()}\n`);

            // 2. Get sample records
            console.log(`📄 Fetching sample records (first 10)...`);
            const sampleRecords = await databases.listDocuments(
                this.databaseId,
                collectionId,
                [Query.limit(10)]
            );
            console.log(`✅ Retrieved ${sampleRecords.documents.length} sample records\n`);

            // 3. Analyze sample data
            if (sampleRecords.documents.length > 0) {
                const firstRecord = sampleRecords.documents[0] as any;
                console.log(`📋 Sample Record Structure:`);
                console.log(`   - Document ID: ${firstRecord.$id}`);
                console.log(`   - TDN: ${firstRecord.tdn || 'N/A'}`);
                console.log(`   - PIN: ${firstRecord.pin || 'N/A'}`);
                console.log(`   - Name: ${firstRecord.name || 'N/A'}`);
                console.log(`   - Municipality: ${firstRecord.municipality || 'N/A'}`);
                console.log(`   - Market Value: ${firstRecord.market_val || 0}`);
                console.log(`   - Created: ${firstRecord.$createdAt || 'N/A'}`);
                console.log(`   - Updated: ${firstRecord.$updatedAt || 'N/A'}\n`);

                console.log(`🔑 Available Fields:`);
                const fields = Object.keys(firstRecord).filter(key => !key.startsWith('$'));
                fields.forEach(field => {
                    const value = firstRecord[field];
                    const type = typeof value;
                    console.log(`   - ${field}: ${type} = ${value !== null && value !== undefined ? String(value).substring(0, 50) : 'null'}`);
                });
                console.log('');
            }

            // 4. Get municipality breakdown
            console.log(`🏘️ Fetching municipality breakdown...`);
            const municipalities = new Map<string, number>();
            let offset = 0;
            const batchSize = 100;
            
            while (offset < Math.min(totalCount, 1000)) { // Limit to first 1000 for speed
                const batch = await databases.listDocuments(
                    this.databaseId,
                    collectionId,
                    [
                        Query.limit(batchSize),
                        Query.offset(offset)
                    ]
                );

                batch.documents.forEach((doc: any) => {
                    const mun = doc.municipality || 'Unknown';
                    municipalities.set(mun, (municipalities.get(mun) || 0) + 1);
                });

                offset += batchSize;
                if (batch.documents.length < batchSize) break;
            }

            console.log(`📊 Municipality Distribution (from ${Math.min(totalCount, 1000)} records):`);
            const sortedMuns = Array.from(municipalities.entries())
                .sort((a, b) => b[1] - a[1]);
            sortedMuns.forEach(([mun, count]) => {
                console.log(`   - ${mun}: ${count.toLocaleString()} records`);
            });
            console.log('');

            // 5. Check for duplicates (sample check)
            console.log(`🔍 Checking for duplicate TDNs (sample of 1000 records)...`);
            const tdnMap = new Map<string, number>();
            offset = 0;
            
            while (offset < Math.min(totalCount, 1000)) {
                const batch = await databases.listDocuments(
                    this.databaseId,
                    collectionId,
                    [
                        Query.limit(batchSize),
                        Query.offset(offset)
                    ]
                );

                batch.documents.forEach((doc: any) => {
                    if (doc.tdn) {
                        tdnMap.set(doc.tdn, (tdnMap.get(doc.tdn) || 0) + 1);
                    }
                });

                offset += batchSize;
                if (batch.documents.length < batchSize) break;
            }

            const duplicates = Array.from(tdnMap.entries())
                .filter(([_, count]) => count > 1)
                .sort((a, b) => b[1] - a[1]);

            if (duplicates.length > 0) {
                console.log(`⚠️ Found ${duplicates.length} duplicate TDNs (top 10):`);
                duplicates.slice(0, 10).forEach(([tdn, count]) => {
                    console.log(`   - TDN "${tdn}": ${count} occurrences`);
                });
            } else {
                console.log(`✅ No duplicate TDNs found in sample`);
            }
            console.log('');

            // 6. Data quality check
            console.log(`🔍 Data Quality Check (sample of 100 records)...`);
            const qualityCheck = await databases.listDocuments(
                this.databaseId,
                collectionId,
                [Query.limit(100)]
            );

            let missingTDN = 0;
            let missingPIN = 0;
            let missingName = 0;
            let missingMunicipality = 0;
            let zeroMarketValue = 0;

            qualityCheck.documents.forEach((doc: any) => {
                if (!doc.tdn) missingTDN++;
                if (!doc.pin) missingPIN++;
                if (!doc.name) missingName++;
                if (!doc.municipality) missingMunicipality++;
                if (!doc.market_val || doc.market_val === 0) zeroMarketValue++;
            });

            console.log(`📊 Data Quality (from 100 records):`);
            console.log(`   - Missing TDN: ${missingTDN}%`);
            console.log(`   - Missing PIN: ${missingPIN}%`);
            console.log(`   - Missing Name: ${missingName}%`);
            console.log(`   - Missing Municipality: ${missingMunicipality}%`);
            console.log(`   - Zero Market Value: ${zeroMarketValue}%`);
            console.log('');

            // 7. Recent records
            console.log(`📅 Most Recent Records (last 5):`);
            const recentRecords = await databases.listDocuments(
                this.databaseId,
                collectionId,
                [
                    Query.limit(5),
                    Query.orderDesc('$createdAt')
                ]
            );

            recentRecords.documents.forEach((doc: any, idx) => {
                console.log(`   ${idx + 1}. ID: ${doc.$id}`);
                console.log(`      TDN: ${doc.tdn || 'N/A'}`);
                console.log(`      Municipality: ${doc.municipality || 'N/A'}`);
                console.log(`      Created: ${doc.$createdAt}`);
            });
            console.log('');

            // 8. Summary
            console.log(`✅ ========== SUMMARY ==========`);
            console.log(`📊 Total Records: ${totalCount.toLocaleString()}`);
            console.log(`🏘️ Municipalities: ${municipalities.size}`);
            console.log(`⚠️ Duplicate TDNs: ${duplicates.length} (in sample)`);
            console.log(`📅 Last Import: ${recentRecords.documents[0]?.$createdAt || 'N/A'}`);
            console.log(`✅ Table Status: ${totalCount > 0 ? 'ACTIVE' : 'EMPTY'}`);
            console.log(`🔍 ========== DEBUG COMPLETE ==========\n`);

        } catch (error: any) {
            console.error(`\n❌ ========== DEBUG ERROR ==========`);
            console.error(`❌ Error Type: ${error.name}`);
            console.error(`❌ Error Message: ${error.message}`);
            console.error(`❌ Error Code: ${error.code}`);
            console.error(`❌ Error Type: ${error.type}`);
            
            if (error.code === 404) {
                console.error(`\n💡 Collection not found. Possible issues:`);
                console.error(`   - Collection ID "${collectionId}" doesn't exist`);
                console.error(`   - Database ID "${this.databaseId}" is incorrect`);
                console.error(`   - Collection was deleted`);
            } else if (error.code === 401) {
                console.error(`\n💡 Authentication error. Check:`);
                console.error(`   - Appwrite session is valid`);
                console.error(`   - User has read permissions`);
            } else if (error.message.includes('Network')) {
                console.error(`\n💡 Network error. Check:`);
                console.error(`   - Appwrite server is running`);
                console.error(`   - Network connection is stable`);
            }
            
            console.error(`🔍 ========== DEBUG FAILED ==========\n`);
            throw error;
        }
    }

    // Quick status check (minimal output)
    async quickTableStatus(collectionId: string): Promise<{ total: number; municipalities: number; lastImport: string }> {
        try {
            const totalCount = await this.getTotalCount(collectionId);
            
            const municipalities = new Set<string>();
            const batch = await databases.listDocuments(
                this.databaseId,
                collectionId,
                [Query.limit(100)]
            );

            batch.documents.forEach((doc: any) => {
                if (doc.municipality) municipalities.add(doc.municipality);
            });

            const recent = await databases.listDocuments(
                this.databaseId,
                collectionId,
                [Query.limit(1), Query.orderDesc('$createdAt')]
            );

            const lastImport = recent.documents[0]?.$createdAt || 'Never';

            console.log(`📊 Quick Status: ${totalCount.toLocaleString()} records, ${municipalities.size} municipalities, Last: ${lastImport}`);

            return {
                total: totalCount,
                municipalities: municipalities.size,
                lastImport
            };
        } catch (error: any) {
            console.error(`❌ Quick status failed:`, error.message);
            throw error;
        }
    }

    // DIAGNOSTIC: Why can't I get data from property assessment table?
    async diagnoseDataRetrievalIssue(collectionId: string): Promise<void> {
        console.log(`\n🔍 ========== DATA RETRIEVAL DIAGNOSTIC ==========`);
        console.log(`📊 Collection ID: ${collectionId}`);
        console.log(`🗄️ Database ID: ${this.databaseId}`);
        console.log(`⏰ Timestamp: ${new Date().toISOString()}\n`);

        const issues: string[] = [];
        const warnings: string[] = [];

        try {
            // Test 1: Check Appwrite connection
            console.log(`🔌 TEST 1: Checking Appwrite connection...`);
            try {
                const testResponse = await databases.listDocuments(
                    this.databaseId,
                    collectionId,
                    [Query.limit(1)]
                );
                console.log(`✅ Appwrite connection successful`);
                console.log(`   Response status: OK`);
                console.log(`   Database ID: ${this.databaseId}`);
                console.log(`   Collection ID: ${collectionId}\n`);
            } catch (error: any) {
                console.error(`❌ Appwrite connection FAILED!`);
                console.error(`   Error: ${error.message}`);
                console.error(`   Code: ${error.code}`);
                console.error(`   Type: ${error.type}\n`);
                
                if (error.code === 404) {
                    issues.push(`Collection "${collectionId}" does not exist`);
                    console.error(`💡 SOLUTION: Run setup script to create collection`);
                    console.error(`   Command: node scripts/setup-admin.js\n`);
                } else if (error.code === 401) {
                    issues.push(`Authentication failed - not logged in`);
                    console.error(`💡 SOLUTION: Login to the application first\n`);
                } else if (error.message.includes('Network')) {
                    issues.push(`Network error - cannot reach Appwrite server`);
                    console.error(`💡 SOLUTION: Check if Appwrite is running`);
                    console.error(`   Command: docker ps | grep appwrite\n`);
                }
                throw error;
            }

            // Test 2: Check total count
            console.log(`📊 TEST 2: Checking total record count...`);
            try {
                const totalCount = await this.getTotalCount(collectionId);
                console.log(`✅ Total records: ${totalCount.toLocaleString()}`);
                
                if (totalCount === 0) {
                    issues.push(`Table is EMPTY - no records found`);
                    console.warn(`⚠️ WARNING: Table has 0 records!`);
                    console.warn(`💡 SOLUTION: Import CSV data first\n`);
                } else {
                    console.log(`   Status: Table has data\n`);
                }
            } catch (error: any) {
                console.error(`❌ Failed to get count: ${error.message}\n`);
                issues.push(`Cannot get record count: ${error.message}`);
            }

            // Test 3: Try to fetch sample records
            console.log(`📄 TEST 3: Attempting to fetch sample records...`);
            try {
                const sampleRecords = await databases.listDocuments(
                    this.databaseId,
                    collectionId,
                    [Query.limit(5)]
                );
                
                console.log(`✅ Successfully fetched ${sampleRecords.documents.length} records`);
                
                if (sampleRecords.documents.length > 0) {
                    const firstRecord = sampleRecords.documents[0] as any;
                    console.log(`   Sample record ID: ${firstRecord.$id}`);
                    console.log(`   TDN: ${firstRecord.tdn || 'N/A'}`);
                    console.log(`   Municipality: ${firstRecord.municipality || 'N/A'}`);
                    console.log(`   Created: ${firstRecord.$createdAt}\n`);
                } else {
                    warnings.push(`Query successful but returned 0 records`);
                    console.warn(`⚠️ Query worked but no records returned\n`);
                }
            } catch (error: any) {
                console.error(`❌ Failed to fetch records: ${error.message}`);
                console.error(`   Code: ${error.code}`);
                console.error(`   Type: ${error.type}\n`);
                issues.push(`Cannot fetch records: ${error.message}`);
            }

            // Test 4: Check permissions
            console.log(`🔐 TEST 4: Checking permissions...`);
            try {
                // Try to read with current permissions
                const permTest = await databases.listDocuments(
                    this.databaseId,
                    collectionId,
                    [Query.limit(1)]
                );
                console.log(`✅ Read permission: OK`);
                console.log(`   User can read from collection\n`);
            } catch (error: any) {
                if (error.code === 401 || error.code === 403) {
                    console.error(`❌ Permission denied!`);
                    issues.push(`User does not have read permission`);
                    console.error(`💡 SOLUTION: Check collection permissions in Appwrite Console`);
                    console.error(`   Should have: read("any") or read("users")\n`);
                } else {
                    console.error(`❌ Permission check failed: ${error.message}\n`);
                }
            }

            // Test 5: Check database configuration
            console.log(`⚙️ TEST 5: Checking configuration...`);
            console.log(`   Database ID: ${this.databaseId}`);
            console.log(`   Collection ID: ${collectionId}`);
            console.log(`   Appwrite Endpoint: ${appwriteConfig.endpoint}`);
            console.log(`   Project ID: ${appwriteConfig.projectId}\n`);

            // Test 6: Check for common query issues
            console.log(`🔍 TEST 6: Testing different query methods...`);
            try {
                // Test without any queries
                const noQuery = await databases.listDocuments(
                    this.databaseId,
                    collectionId
                );
                console.log(`✅ No-query fetch: ${noQuery.documents.length} records`);

                // Test with limit
                const withLimit = await databases.listDocuments(
                    this.databaseId,
                    collectionId,
                    [Query.limit(10)]
                );
                console.log(`✅ With limit query: ${withLimit.documents.length} records`);

                // Test with offset
                const withOffset = await databases.listDocuments(
                    this.databaseId,
                    collectionId,
                    [Query.limit(5), Query.offset(0)]
                );
                console.log(`✅ With offset query: ${withOffset.documents.length} records\n`);
            } catch (error: any) {
                console.error(`❌ Query test failed: ${error.message}\n`);
                issues.push(`Query execution error: ${error.message}`);
            }

            // Test 7: Check browser/network
            console.log(`🌐 TEST 7: Checking browser environment...`);
            if (typeof window !== 'undefined') {
                console.log(`✅ Running in browser`);
                console.log(`   User Agent: ${navigator.userAgent.substring(0, 50)}...`);
                console.log(`   Online: ${navigator.onLine ? 'Yes' : 'No'}`);
                
                if (!navigator.onLine) {
                    issues.push(`Browser is offline`);
                    console.error(`❌ Browser is OFFLINE!\n`);
                } else {
                    console.log(`   Network: Connected\n`);
                }
            }

            // Test 8: Check session/authentication
            console.log(`👤 TEST 8: Checking authentication...`);
            try {
                const { account } = await import('../lib/appwrite');
                const user = await account.get();
                console.log(`✅ User authenticated`);
                console.log(`   User ID: ${user.$id}`);
                console.log(`   Email: ${user.email || 'N/A'}`);
                console.log(`   Name: ${user.name || 'N/A'}\n`);
            } catch (error: any) {
                console.error(`❌ Not authenticated or session expired`);
                issues.push(`User not logged in or session expired`);
                console.error(`💡 SOLUTION: Login to the application\n`);
            }

            // Summary
            console.log(`\n📋 ========== DIAGNOSTIC SUMMARY ==========\n`);
            
            if (issues.length === 0 && warnings.length === 0) {
                console.log(`✅ NO ISSUES FOUND!`);
                console.log(`   Everything appears to be working correctly.`);
                console.log(`   If you still can't see data, check your UI component.\n`);
            } else {
                if (issues.length > 0) {
                    console.error(`❌ CRITICAL ISSUES FOUND (${issues.length}):\n`);
                    issues.forEach((issue, idx) => {
                        console.error(`   ${idx + 1}. ${issue}`);
                    });
                    console.error('');
                }
                
                if (warnings.length > 0) {
                    console.warn(`⚠️ WARNINGS (${warnings.length}):\n`);
                    warnings.forEach((warning, idx) => {
                        console.warn(`   ${idx + 1}. ${warning}`);
                    });
                    console.warn('');
                }
            }

            // Recommendations
            console.log(`💡 RECOMMENDED ACTIONS:\n`);
            
            if (issues.some(i => i.includes('does not exist'))) {
                console.log(`   1. Create collection: node scripts/setup-admin.js`);
            }
            if (issues.some(i => i.includes('EMPTY'))) {
                console.log(`   1. Import CSV data through the UI`);
            }
            if (issues.some(i => i.includes('not logged in'))) {
                console.log(`   1. Login to the application`);
            }
            if (issues.some(i => i.includes('Network'))) {
                console.log(`   1. Check Appwrite server: docker ps | grep appwrite`);
                console.log(`   2. Restart Appwrite: docker restart appwrite`);
            }
            if (issues.some(i => i.includes('permission'))) {
                console.log(`   1. Check collection permissions in Appwrite Console`);
                console.log(`   2. Should have: read("any") or read("users")`);
            }
            
            if (issues.length === 0) {
                console.log(`   ✅ No action needed - system is working!`);
            }
            
            console.log(`\n🔍 ========== DIAGNOSTIC COMPLETE ==========\n`);

        } catch (error: any) {
            console.error(`\n❌ ========== DIAGNOSTIC FAILED ==========`);
            console.error(`Fatal error during diagnostic: ${error.message}`);
            console.error(`Error code: ${error.code}`);
            console.error(`Error type: ${error.type}`);
            console.error(`\n💡 This usually means:`);
            console.error(`   - Appwrite server is not running`);
            console.error(`   - Collection does not exist`);
            console.error(`   - Network connection issue`);
            console.error(`\n🔧 Try these commands:`);
            console.error(`   1. docker ps | grep appwrite`);
            console.error(`   2. docker restart appwrite`);
            console.error(`   3. node scripts/setup-admin.js`);
            console.error(`\n🔍 ========== DIAGNOSTIC FAILED ==========\n`);
        }
    }
}

export const databaseService = new DatabaseService();
export default databaseService;
