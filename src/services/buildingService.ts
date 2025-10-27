/**
 * Building Service
 * Handles CRUD operations for building-related tables:
 * - building_components
 * - building_parts
 * - building_part_rates
 */

import { databases } from '../lib/appwrite';
import { ID, Query } from 'appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

// Collection IDs
const COLLECTIONS = {
    COMPONENTS: 'building_components',
    PARTS: 'building_parts',
    RATES: 'building_part_rates',
} as const;

// TypeScript Interfaces
export interface BuildingComponent {
    $id?: string;
    building_component_id?: string;
    description?: string;
    status?: string;
    uid?: string;
    $createdAt?: string;
    $updatedAt?: string;
}

export interface BuildingPart {
    $id?: string;
    building_part_id?: string;
    description?: string;
    status?: string;
    uid?: string;
    building_component_id?: string;
    $createdAt?: string;
    $updatedAt?: string;
}

export interface BuildingPartRate {
    $id?: string;
    building_part_rate_id?: string;
    unit_value?: number;
    status?: string;
    uid?: string;
    building_part_id?: string;
    $createdAt?: string;
    $updatedAt?: string;
}

// Extended interfaces with relationships
export interface BuildingPartWithComponent extends BuildingPart {
    component?: BuildingComponent;
}

export interface BuildingPartRateWithPart extends BuildingPartRate {
    part?: BuildingPart;
}

export interface BuildingComponentWithParts extends BuildingComponent {
    parts?: BuildingPart[];
}

class BuildingService {
    // ==================== BUILDING COMPONENTS ====================

    /**
     * Create a new building component
     */
    async createComponent(data: Omit<BuildingComponent, '$id' | '$createdAt' | '$updatedAt'>): Promise<BuildingComponent> {
        return await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.COMPONENTS,
            ID.unique(),
            data
        );
    }

    /**
     * Get a single building component by document ID
     */
    async getComponent(documentId: string): Promise<BuildingComponent> {
        return await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.COMPONENTS,
            documentId
        );
    }

    /**
     * Get a building component by its component ID
     */
    async getComponentByComponentId(componentId: string): Promise<BuildingComponent | null> {
        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.COMPONENTS,
            [Query.equal('building_component_id', componentId), Query.limit(1)]
        );
        return result.documents.length > 0 ? result.documents[0] as BuildingComponent : null;
    }

    /**
     * List all building components with optional filters
     */
    async listComponents(status?: string, limit: number = 100): Promise<BuildingComponent[]> {
        const queries = [Query.limit(limit)];
        if (status) {
            queries.push(Query.equal('status', status));
        }

        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.COMPONENTS,
            queries
        );
        return result.documents as BuildingComponent[];
    }

    /**
     * Update a building component
     */
    async updateComponent(documentId: string, data: Partial<BuildingComponent>): Promise<BuildingComponent> {
        return await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.COMPONENTS,
            documentId,
            data
        );
    }

    /**
     * Delete a building component
     */
    async deleteComponent(documentId: string): Promise<void> {
        await databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.COMPONENTS,
            documentId
        );
    }

    // ==================== BUILDING PARTS ====================

    /**
     * Create a new building part
     */
    async createPart(data: Omit<BuildingPart, '$id' | '$createdAt' | '$updatedAt'>): Promise<BuildingPart> {
        return await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.PARTS,
            ID.unique(),
            data
        );
    }

    /**
     * Get a single building part by document ID
     */
    async getPart(documentId: string): Promise<BuildingPart> {
        return await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.PARTS,
            documentId
        );
    }

    /**
     * Get a building part by its part ID
     */
    async getPartByPartId(partId: string): Promise<BuildingPart | null> {
        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PARTS,
            [Query.equal('building_part_id', partId), Query.limit(1)]
        );
        return result.documents.length > 0 ? result.documents[0] as BuildingPart : null;
    }

    /**
     * List all building parts with optional filters
     */
    async listParts(componentId?: string, status?: string, limit: number = 100): Promise<BuildingPart[]> {
        const queries = [Query.limit(limit)];
        if (componentId) {
            queries.push(Query.equal('building_component_id', componentId));
        }
        if (status) {
            queries.push(Query.equal('status', status));
        }

        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PARTS,
            queries
        );
        return result.documents as BuildingPart[];
    }

    /**
     * Get parts with their parent component
     */
    async getPartsWithComponent(componentId?: string, status?: string): Promise<BuildingPartWithComponent[]> {
        const parts = await this.listParts(componentId, status);
        
        // Fetch components for each part
        const partsWithComponents = await Promise.all(
            parts.map(async (part) => {
                if (part.building_component_id) {
                    const component = await this.getComponentByComponentId(part.building_component_id);
                    return { ...part, component: component || undefined };
                }
                return part;
            })
        );

        return partsWithComponents;
    }

    /**
     * Update a building part
     */
    async updatePart(documentId: string, data: Partial<BuildingPart>): Promise<BuildingPart> {
        return await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.PARTS,
            documentId,
            data
        );
    }

    /**
     * Delete a building part
     */
    async deletePart(documentId: string): Promise<void> {
        await databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.PARTS,
            documentId
        );
    }

    // ==================== BUILDING PART RATES ====================

    /**
     * Create a new building part rate
     */
    async createRate(data: Omit<BuildingPartRate, '$id' | '$createdAt' | '$updatedAt'>): Promise<BuildingPartRate> {
        return await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.RATES,
            ID.unique(),
            data
        );
    }

    /**
     * Get a single building part rate by document ID
     */
    async getRate(documentId: string): Promise<BuildingPartRate> {
        return await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.RATES,
            documentId
        );
    }

    /**
     * Get a building part rate by its rate ID
     */
    async getRateByRateId(rateId: string): Promise<BuildingPartRate | null> {
        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.RATES,
            [Query.equal('building_part_rate_id', rateId), Query.limit(1)]
        );
        return result.documents.length > 0 ? result.documents[0] as BuildingPartRate : null;
    }

    /**
     * List all building part rates with optional filters
     */
    async listRates(partId?: string, status?: string, limit: number = 100): Promise<BuildingPartRate[]> {
        const queries = [Query.limit(limit)];
        if (partId) {
            queries.push(Query.equal('building_part_id', partId));
        }
        if (status) {
            queries.push(Query.equal('status', status));
        }

        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.RATES,
            queries
        );
        return result.documents as BuildingPartRate[];
    }

    /**
     * Get rates with their parent part
     */
    async getRatesWithPart(partId?: string, status?: string): Promise<BuildingPartRateWithPart[]> {
        const rates = await this.listRates(partId, status);
        
        // Fetch parts for each rate
        const ratesWithParts = await Promise.all(
            rates.map(async (rate) => {
                if (rate.building_part_id) {
                    const part = await this.getPartByPartId(rate.building_part_id);
                    return { ...rate, part: part || undefined };
                }
                return rate;
            })
        );

        return ratesWithParts;
    }

    /**
     * Update a building part rate
     */
    async updateRate(documentId: string, data: Partial<BuildingPartRate>): Promise<BuildingPartRate> {
        return await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.RATES,
            documentId,
            data
        );
    }

    /**
     * Delete a building part rate
     */
    async deleteRate(documentId: string): Promise<void> {
        await databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.RATES,
            documentId
        );
    }

    // ==================== COMPLEX QUERIES ====================

    /**
     * Get complete hierarchy: Component → Parts → Rates
     */
    async getComponentHierarchy(componentId: string): Promise<BuildingComponentWithParts & { parts: Array<BuildingPart & { rates: BuildingPartRate[] }> }> {
        // Get component
        const component = await this.getComponentByComponentId(componentId);
        if (!component) {
            throw new Error(`Component ${componentId} not found`);
        }

        // Get parts for this component
        const parts = await this.listParts(componentId, 'Active');

        // Get rates for each part
        const partsWithRates = await Promise.all(
            parts.map(async (part) => {
                const rates = await this.listRates(part.building_part_id, 'Active');
                return { ...part, rates };
            })
        );

        return { ...component, parts: partsWithRates };
    }

    /**
     * Get all active components with their parts count
     */
    async getComponentsSummary(): Promise<Array<BuildingComponent & { partsCount: number }>> {
        const components = await this.listComponents('Active');
        
        const summaries = await Promise.all(
            components.map(async (component) => {
                const parts = await this.listParts(component.building_component_id, 'Active');
                return { ...component, partsCount: parts.length };
            })
        );

        return summaries;
    }

    /**
     * Calculate total value for a component
     */
    async calculateComponentValue(componentId: string): Promise<number> {
        const hierarchy = await this.getComponentHierarchy(componentId);
        
        let totalValue = 0;
        hierarchy.parts.forEach((part: BuildingPart & { rates: BuildingPartRate[] }) => {
            part.rates.forEach((rate: BuildingPartRate) => {
                totalValue += rate.unit_value || 0;
            });
        });

        return totalValue;
    }

    // ==================== BULK OPERATIONS ====================

    /**
     * Bulk create building components
     */
    async bulkCreateComponents(components: Array<Omit<BuildingComponent, '$id' | '$createdAt' | '$updatedAt'>>): Promise<BuildingComponent[]> {
        const results = await Promise.all(
            components.map(component => this.createComponent(component))
        );
        return results;
    }

    /**
     * Bulk create building parts
     */
    async bulkCreateParts(parts: Array<Omit<BuildingPart, '$id' | '$createdAt' | '$updatedAt'>>): Promise<BuildingPart[]> {
        const results = await Promise.all(
            parts.map(part => this.createPart(part))
        );
        return results;
    }

    /**
     * Bulk create building part rates
     */
    async bulkCreateRates(rates: Array<Omit<BuildingPartRate, '$id' | '$createdAt' | '$updatedAt'>>): Promise<BuildingPartRate[]> {
        const results = await Promise.all(
            rates.map(rate => this.createRate(rate))
        );
        return results;
    }
}

// Export singleton instance
export const buildingService = new BuildingService();
export default buildingService;
