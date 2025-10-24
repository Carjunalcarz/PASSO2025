/**
 * Debug Utility for Property Assessment Table
 * 
 * Usage in Browser Console:
 * 
 * 1. Import the function:
 *    import { debugPropertyTable, quickStatus } from './utils/debugTable';
 * 
 * 2. Run full debug:
 *    await debugPropertyTable('property_assessments');
 * 
 * 3. Run quick status:
 *    await quickStatus('property_assessments');
 */

import { databaseService } from '../services/databaseService';

/**
 * Run comprehensive debug on property assessment table
 * Shows: total count, sample records, municipalities, duplicates, data quality
 */
export async function debugPropertyTable(collectionId: string = 'property_assessments'): Promise<void> {
    console.log(`🔍 Starting comprehensive table debug for: ${collectionId}`);
    await databaseService.debugTableStatus(collectionId);
}

/**
 * Quick status check - minimal output
 * Returns: { total, municipalities, lastImport }
 */
export async function quickStatus(collectionId: string = 'property_assessments'): Promise<{ total: number; municipalities: number; lastImport: string }> {
    console.log(`📊 Running quick status check for: ${collectionId}`);
    return await databaseService.quickTableStatus(collectionId);
}

/**
 * Check specific municipality records
 */
export async function debugMunicipality(municipalityName: string, collectionId: string = 'property_assessments'): Promise<void> {
    console.log(`\n🔍 Debugging Municipality: ${municipalityName}`);
    
    try {
        const records = await databaseService.getAssessmentsByMunicipality(collectionId, municipalityName);
        console.log(`📊 Total records for ${municipalityName}: ${records.length.toLocaleString()}`);
        console.log(`📄 Sample records (first 10):`);
        
        records.slice(0, 10).forEach((record, idx) => {
            console.log(`\n   ${idx + 1}. ${record.name || 'N/A'}`);
            console.log(`      TDN: ${record.tdn}`);
            console.log(`      PIN: ${record.pin}`);
            console.log(`      Market Value: ${record.market_val?.toLocaleString() || 0}`);
            console.log(`      Classification: ${record.classification || 'N/A'}`);
        });
        
    } catch (error: any) {
        console.error(`❌ Error debugging municipality:`, error.message);
    }
}

/**
 * Export to console for easy browser access
 */
if (typeof window !== 'undefined') {
    (window as any).debugPropertyTable = debugPropertyTable;
    (window as any).quickStatus = quickStatus;
    (window as any).debugMunicipality = debugMunicipality;
    
    console.log(`
🔍 Debug utilities loaded! Available commands:

1. Full Debug:
   await debugPropertyTable('property_assessments')

2. Quick Status:
   await quickStatus('property_assessments')

3. Municipality Debug:
   await debugMunicipality('BUENAVISTA')

4. Custom Collection:
   await debugPropertyTable('your_collection_id')
    `);
}
