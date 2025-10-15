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

    // Bulk import assessments with progress tracking
    async bulkImportAssessments(
        collectionId: string, 
        assessments: Omit<AssessmentDocument, '$id' | '$createdAt' | '$updatedAt'>[],
        onProgress?: (progress: { processed: number; successful: number; failed: number; errors: string[] }) => void
    ): Promise<{ successful: number; failed: number; errors: string[] }> {
        let successful = 0;
        let failed = 0;
        const errors: string[] = [];

        // Process records one by one to avoid rate limits
        for (let i = 0; i < assessments.length; i++) {
            const assessment = assessments[i];
            
            try {
                // Add retry logic for rate limit errors
                let retryCount = 0;
                const maxRetries = 3;
                
                while (retryCount <= maxRetries) {
                    try {
                        // Check for CSV ID duplicate first if csv_id is provided
                        if (assessment.csv_id) {
                            try {
                                const existing = await this.getAssessmentByCsvId(collectionId, assessment.csv_id);
                                if (existing) {
                                    // Update existing record with same CSV ID
                                    await this.updateAssessment(collectionId, existing.$id!, assessment);
                                    console.log(`✅ Updated existing assessment with CSV ID: ${assessment.csv_id} (TDN: ${assessment.tdn})`);
                                    successful++;
                                    break; // Success, exit retry loop
                                }
                            } catch (duplicateCheckError) {
                                console.log(`⚠️ Error checking for CSV ID duplicate: ${assessment.csv_id}`, duplicateCheckError);
                                // Continue to try creating new record
                            }
                        }

                        // Try to create new record
                        try {
                            await this.createAssessment(collectionId, assessment);
                            console.log(`✅ Created new assessment: ${assessment.csv_id ? `CSV ID: ${assessment.csv_id}` : `TDN: ${assessment.tdn}`}`);
                            successful++;
                            break; // Success, exit retry loop
                        } catch (createError: any) {
                            // If creation fails due to duplicate and no csv_id was provided, fall back to TDN-based duplicate handling
                            if (!assessment.csv_id && (createError?.code === 409 || createError?.message?.includes('duplicate') || createError?.message?.includes('unique'))) {
                                console.log(`🔄 Duplicate detected for TDN: ${assessment.tdn}, attempting update...`);
                                try {
                                    // Check if record exists by TDN and update it
                                    const existing = await this.getAssessmentByTdn(collectionId, assessment.tdn);
                                    if (existing) {
                                        await this.updateAssessment(collectionId, existing.$id!, assessment);
                                        console.log(`✅ Updated existing assessment by TDN: ${assessment.tdn}`);
                                        successful++;
                                        break; // Success, exit retry loop
                                    } else {
                                        throw new Error('Record not found for update');
                                    }
                                } catch (updateError) {
                                    console.log(`⚠️ Update failed for TDN: ${assessment.tdn}, skipping duplicate check and retrying create...`);
                                    throw createError; // Re-throw original create error
                                }
                            } else {
                                throw createError; // Re-throw if not a duplicate error or csv_id was provided
                            }
                        }
                        
                    } catch (error: any) {
                        const isRateLimit = error?.code === 429 || error?.response?.status === 429 || 
                                          error?.type === 'general_rate_limit_exceeded' ||
                                          error?.message?.includes('Rate limit') ||
                                          error?.message?.includes('Too Many Requests');
                        
                        if (isRateLimit) {
                            retryCount++;
                            if (retryCount <= maxRetries) {
                                const waitTime = 1000 * retryCount; // 1s, 2s, 3s - faster with abuse protection disabled
                                console.log(`⏳ Rate limit hit for ${assessment.tdn}, retrying in ${waitTime}ms... (${retryCount}/${maxRetries})`);
                                await new Promise(resolve => setTimeout(resolve, waitTime));
                                continue;
                            }
                        }
                        throw error; // Re-throw if not rate limit or max retries exceeded
                    }
                }
                
            } catch (error) {
                failed++;
                const identifier = assessment.csv_id ? `CSV ID ${assessment.csv_id} (TDN: ${assessment.tdn})` : `TDN ${assessment.tdn}`;
                const errorMsg = `${identifier}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                errors.push(errorMsg);
                console.error(`❌ Failed to import assessment ${identifier}:`, error);
            }

            // Call progress callback if provided
            if (onProgress) {
                onProgress({
                    processed: i + 1,
                    successful,
                    failed,
                    errors
                });
            }

            // Faster processing with abuse protection disabled
            if (i < assessments.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay between records
            }
        }

        return { successful, failed, errors };
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
