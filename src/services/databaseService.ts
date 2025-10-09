import { databases, appwriteConfig } from '../lib/appwrite';
import { ID, Query, Models } from 'appwrite';

export interface AssessmentDocument {
    $id?: string;
    pin: string;
    name: string;
    tdn: string;
    market_val: number;
    ass_value: number;
    area: number;
    unit_value: number;
    kind: string;
    ass_level: number;
    classification: string;
    sub_class: string;
    taxability: string;
    trans_cd: string;
    tax_beg_yr: number;
    eff_date: string;
    owner_no: string;
    mun_code: string;
    municipality: string;
    barangay_code: string;
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
}

export const databaseService = new DatabaseService();
export default databaseService;
