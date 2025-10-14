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

class DatabaseService {
    private databaseId: string;
    
    constructor() {
        this.databaseId = appwriteConfig.databaseId;
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
                        if (error?.code === 429 || error?.message?.includes('Too Many Requests')) {
                            retryCount++;
                            if (retryCount <= maxRetries) {
                                console.log(`⏳ Rate limit hit for ${assessment.tdn}, retrying in ${retryCount * 2} seconds... (${retryCount}/${maxRetries})`);
                                await new Promise(resolve => setTimeout(resolve, retryCount * 2000)); // Exponential backoff
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

            // Longer delay between each record to avoid rate limits
            if (i < assessments.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay between records
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

    // Clear all assessments from a collection
    async clearAllAssessments(
        collectionId: string,
        onProgress?: (progress: { processed: number; total: number; deleted: number; failed: number; errors: string[] }) => void
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

            // Delete documents in batches to avoid overwhelming the API
            const batchSize = 3; // Reduced batch size to handle rate limits better
            
            for (let i = 0; i < documents.length; i += batchSize) {
                const batch = documents.slice(i, i + batchSize);
                
                const batchResults = await Promise.allSettled(
                    batch.map(async (doc) => {
                        // Retry logic for failed deletions
                        const maxRetries = 3;
                        let retryCount = 0;
                        
                        while (retryCount < maxRetries) {
                            try {
                                await databases.deleteDocument(
                                    this.databaseId,
                                    collectionId,
                                    doc.$id
                                );
                                deleted++;
                                console.log(`✅ Deleted document: ${doc.$id} (attempt ${retryCount + 1})`);
                                return { success: true };
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
                                    // Wait before retry with exponential backoff
                                    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                                } else {
                                    // Final failure after all retries
                                    failed++;
                                    const errorMsg = `TDN: ${(doc as any).tdn || 'unknown'} | ID: ${doc.$id} | Error: ${errorDetails.errorType} (${errorDetails.errorCode}) - ${errorDetails.errorMessage}`;
                                    errors.push(errorMsg);
                                    console.error(`❌ Failed to delete document ${doc.$id} after ${maxRetries} retries:`, errorDetails);
                                    return { success: false, error: errorMsg };
                                }
                            }
                        }
                    })
                );

                // Call progress callback if provided
                if (onProgress) {
                    onProgress({
                        processed: Math.min(i + batchSize, total),
                        total,
                        deleted,
                        failed,
                        errors
                    });
                }

                // Longer delay between batches to avoid overwhelming the API
                if (i + batchSize < documents.length) {
                    await new Promise(resolve => setTimeout(resolve, 500));
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
