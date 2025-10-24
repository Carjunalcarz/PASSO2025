import React, { useState, useRef } from 'react';
import { Modal } from '@mantine/core';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import { databaseService, AssessmentDocument } from '../../../services/databaseService';
import IconUpload from '../../../components/Icon/IconUpload';
import IconX from '../../../components/Icon/IconX';
import IconCircleCheck from '../../../components/Icon/IconCircleCheck';

interface CSVImportProps {
    isOpen: boolean;
    onClose: () => void;
    onImportComplete: () => void;
    collectionId: string;
}

interface ImportProgress {
    total: number;
    processed: number;
    successful: number;
    failed: number;
    skipped?: number;
    errors: string[];
    jsonConverted?: number;
}

interface ImportResult {
    successful: number;
    failed: number;
    skipped?: number;
    errors: string[];
    jsonConverted?: number;
}

interface ParsedRow {
    data: Partial<AssessmentDocument>;
    rowNumber: number;
    isValid: boolean;
    errors: string[];
}

interface ColumnValidation {
    foundColumns: string[];
    mappedColumns: string[];
    unmappedColumns: string[];
    missingRequiredColumns: string[];
    suggestions: { [key: string]: string[] };
}

const CSVImport: React.FC<CSVImportProps> = ({ isOpen, onClose, onImportComplete, collectionId }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [progress, setProgress] = useState<ImportProgress>({
        total: 0,
        processed: 0,
        successful: 0,
        failed: 0,
        skipped: 0,
        errors: []
    });
    const [previewData, setPreviewData] = useState<ParsedRow[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [columnValidation, setColumnValidation] = useState<ColumnValidation | null>(null);
    const [importResult, setImportResult] = useState<{ successful: number; failed: number; skipped?: number; errors: string[] } | null>(null);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Required columns for a valid import (based on actual Appwrite schema)
    // Made more flexible - only truly essential columns are required
    const requiredColumns = ['tdn', 'pin', 'name'];
    
    // Expected CSV columns mapping
    const columnMapping = {
        // Standard lowercase mappings
        'csv_id': 'csv_id',
        'tdn': 'tdn',
        'td_no': 'tdn',
        'tax_dec_no': 'tdn',
        'tax_declaration_no': 'tdn',
        'tax_declaration_number': 'tdn',
        'pin': 'pin', 
        'name': 'name',
        'market_val': 'market_val',
        'market_value': 'market_val',
        'ass_value': 'ass_value',
        'assessment_value': 'ass_value',
        'area': 'area',
        'unit_value': 'unit_value',
        'kind': 'kind',
        'ass_level': 'ass_level',
        'assessment_level': 'ass_level',
        'classification': 'classification',
        'sub_class': 'sub_class',
        'subclass': 'sub_class',
        'taxability': 'taxability',
        'trans_cd': 'trans_cd',
        'transaction_code': 'trans_cd',
        'tax_beg_yr': 'tax_beg_yr',
        'tax_begin_year': 'tax_beg_yr',
        'eff_date': 'eff_date',
        'effective_date': 'eff_date',
        'owner_no': 'owner_no',
        'owner_number': 'owner_no',
        'mun_code': 'mun_code',
        'municipality_code': 'mun_code',
        'municipality': 'municipality',
        'mun': 'municipality',
        'city': 'municipality',
        'town': 'municipality',
        'barangay_code': 'bcode',
        'bcode': 'bcode',
        'barangay': 'barangay',
        'gr_code': 'gr_code',
        'gr': 'gr',
        
        // UPPERCASE mappings for your format
        'CSV_ID': 'csv_id',
        'TDN': 'tdn',
        'TD_NO': 'tdn',
        'TAX_DEC_NO': 'tdn',
        'TAX_DECLARATION_NO': 'tdn',
        'TAX_DECLARATION_NUMBER': 'tdn',
        'PIN': 'pin',
        'NAME': 'name',
        'Market_val': 'market_val',
        'MARKET_VAL': 'market_val',
        'Ass_value': 'ass_value',
        'ASS_VALUE': 'ass_value',
        'Area': 'area',
        'AREA': 'area',
        'UNIT_VALUE': 'unit_value',
        'KIND': 'kind',
        'ASS_LEVEL': 'ass_level',
        'Classification': 'classification',
        'CLASSIFICATION': 'classification',
        'Sub_class': 'sub_class',
        'SUB_CLASS': 'sub_class',
        'Taxability': 'taxability',
        'TAXABILITY': 'taxability',
        'TRANS_CD': 'trans_cd',
        'TAX_BEG_YR': 'tax_beg_yr',
        'EFF_DATE': 'eff_date',
        'OWNER_NO': 'owner_no',
        'MUN_CODE': 'mun_code',
        'MUNICIPALITY': 'municipality',
        'BCODE': 'bcode',
        'BARANGAY': 'barangay',
        'GR_CODE': 'gr_code',
        'GR': 'gr'
    };

    // Function to validate column mapping and provide suggestions
    const validateColumnMapping = (headers: string[]): ColumnValidation => {
        const foundColumns = headers;
        const mappedColumns: string[] = [];
        const unmappedColumns: string[] = [];
        const suggestions: { [key: string]: string[] } = {};
        
        // Check which headers can be mapped
        headers.forEach(header => {
            const mappedField = columnMapping[header as keyof typeof columnMapping];
            if (mappedField) {
                mappedColumns.push(header);
            } else {
                unmappedColumns.push(header);
                
                // Provide suggestions for unmapped columns
                const headerLower = header.toLowerCase();
                const possibleMatches: string[] = [];
                
                // Check for partial matches
                Object.keys(columnMapping).forEach(key => {
                    if (key.includes(headerLower) || headerLower.includes(key)) {
                        possibleMatches.push(key);
                    }
                });
                
                // Check for similar sounding columns
                if (headerLower.includes('market')) possibleMatches.push('market_val', 'market_value');
                if (headerLower.includes('assess')) possibleMatches.push('ass_value', 'assessment_value');
                if (headerLower.includes('tax')) possibleMatches.push('taxability', 'tax_beg_yr');
                if (headerLower.includes('owner')) possibleMatches.push('owner_no', 'owner_number');
                if (headerLower.includes('mun')) possibleMatches.push('mun_code', 'municipality_code', 'municipality', 'mun', 'city', 'town');
                if (headerLower.includes('bar')) possibleMatches.push('barangay', 'barangay_code', 'bcode');
                if (headerLower.includes('class')) possibleMatches.push('classification', 'sub_class', 'subclass');
                if (headerLower.includes('date')) possibleMatches.push('eff_date', 'effective_date');
                if (headerLower.includes('trans')) possibleMatches.push('trans_cd', 'transaction_code');
                
                suggestions[header] = [...new Set(possibleMatches)].slice(0, 3); // Remove duplicates and limit to 3
            }
        });
        
        // Check for missing required columns
        const mappedFields = mappedColumns.map(col => columnMapping[col as keyof typeof columnMapping]);
        const missingRequiredColumns = requiredColumns.filter(req => !mappedFields.includes(req));
        
        const validation: ColumnValidation = {
            foundColumns,
            mappedColumns,
            unmappedColumns,
            missingRequiredColumns,
            suggestions
        };
        
        // Log detailed column validation results
        console.log('📊 CSV Column Validation Results:');
        console.log('✅ Found columns in CSV:', foundColumns);
        console.log('✅ Successfully mapped columns:', mappedColumns);
        console.log('❌ Unmapped columns:', unmappedColumns);
        console.log('⚠️ Missing required columns:', missingRequiredColumns);
        
        if (unmappedColumns.length > 0) {
            console.log('💡 Suggestions for unmapped columns:');
            unmappedColumns.forEach(col => {
                if (suggestions[col] && suggestions[col].length > 0) {
                    console.log(`   "${col}" → Try: ${suggestions[col].join(', ')}`);
                } else {
                    console.log(`   "${col}" → No suggestions available`);
                }
            });
        }
        
        if (missingRequiredColumns.length > 0) {
            console.log('🚨 Required columns that need to be added or renamed:');
            missingRequiredColumns.forEach(col => {
                const possibleHeaders = Object.keys(columnMapping).filter(key => columnMapping[key as keyof typeof columnMapping] === col);
                console.log(`   Missing "${col}" → Use one of: ${possibleHeaders.join(', ')}`);
            });
        }
        
        return validation;
    };

    // Enhanced CSV to JSON parsing using PapaParse library
    const parseCSVToJSON = (csvText: string): ParsedRow[] => {
        console.log('🔄 Starting CSV to JSON conversion using PapaParse...');
        
        // Use PapaParse to convert CSV to JSON with proper typing
        const parseResult = Papa.parse<Record<string, string>>(csvText, {
            header: true, // First row contains headers
            skipEmptyLines: true, // Skip empty lines
            dynamicTyping: false, // Keep all values as strings initially for custom type conversion
            transformHeader: (header: string) => {
                // Trim whitespace from headers
                return header.trim();
            }
        });

        if (parseResult.errors && parseResult.errors.length > 0) {
            console.warn('⚠️ PapaParse encountered errors:', parseResult.errors);
            parseResult.errors.forEach((error: Papa.ParseError) => {
                console.warn(`   Row ${error.row}: ${error.message}`);
            });
        }

        console.log(`✅ PapaParse successfully parsed ${parseResult.data.length} rows`);
        console.log('📋 Headers detected:', parseResult.meta.fields);
        
        // Validate column mapping
        const headers = (parseResult.meta.fields || []) as string[];
        const validation = validateColumnMapping(headers);
        setColumnValidation(validation);
        
        const rows: ParsedRow[] = [];
        
        // Convert each JSON row to AssessmentDocument format
        parseResult.data.forEach((jsonRow: Record<string, string>, index: number) => {
            const rowData: Partial<AssessmentDocument> = {};
            
            // Log first few rows for debugging
            if (index < 3) {
                console.log(`📝 Row ${index + 1} JSON data:`, jsonRow);
            }
            
            // Map JSON fields to AssessmentDocument properties
            headers.forEach((header: string) => {
                const mappedField = columnMapping[header as keyof typeof columnMapping];
                if (mappedField && jsonRow[header] !== undefined) {
                    const value = jsonRow[header];
                    
                    // Log field mapping for first row
                    if (index === 0) {
                        console.log(`🔗 Mapping: "${header}" → "${mappedField}" = "${value}"`);
                    }
                    
                    // Type conversion based on field
                    if (['market_val', 'ass_value', 'area', 'unit_value'].includes(mappedField)) {
                        if (value === '' || value === '-' || value === null || value === undefined || 
                            value.toString().toLowerCase() === 'null' || value.toString().toLowerCase() === 'undefined' ||
                            value.toString().trim() === '') {
                            (rowData as any)[mappedField] = 0;
                        } else {
                            // Extract numeric value from strings like "72.8 sqm", "₱294,694", etc.
                            const cleanValue = value.toString()
                                .replace(/[₱$,]/g, '') // Remove currency symbols and commas
                                .replace(/[^\d.-]/g, ''); // Keep only digits, decimal point, and minus sign
                            const numValue = parseFloat(cleanValue);
                            (rowData as any)[mappedField] = isNaN(numValue) ? 0 : numValue;
                        }
                    } else if (['owner_no', 'mun_code', 'bcode', 'gr_code', 'ass_level', 'tax_beg_yr'].includes(mappedField)) {
                        (rowData as any)[mappedField] = value || '';
                    } else if (mappedField === 'classification') {
                        (rowData as any)[mappedField] = value || '';
                    } else if (mappedField === 'taxability') {
                        const taxValue = value.toString().toLowerCase().trim();
                        const taxabilityMap: { [key: string]: string } = {
                            '0': 'Exempt',
                            '1': 'Taxable',
                            'exempt': 'Exempt',
                            'taxable': 'Taxable',
                            'e': 'Exempt',
                            't': 'Taxable',
                            'false': 'Exempt',
                            'true': 'Taxable'
                        };
                        (rowData as any)[mappedField] = taxabilityMap[taxValue] || (taxValue === '0' ? 'Exempt' : 'Taxable');
                    } else if (mappedField === 'eff_date') {
                        if (value && value.toString().trim() !== '') {
                            const dateStr = value.toString().trim();
                            if (dateStr.includes('/')) {
                                const parts = dateStr.split('/');
                                if (parts.length === 3) {
                                    const month = parts[0].padStart(2, '0');
                                    const day = parts[1].padStart(2, '0');
                                    let year = parts[2];
                                    if (year.length === 2) {
                                        const currentYear = new Date().getFullYear();
                                        const currentCentury = Math.floor(currentYear / 100) * 100;
                                        year = String((parseInt(year) <= 50 ? currentCentury + 100 : currentCentury) + parseInt(year));
                                    }
                                    (rowData as any)[mappedField] = `${year}-${month}-${day}`;
                                } else {
                                    (rowData as any)[mappedField] = value;
                                }
                            } else {
                                (rowData as any)[mappedField] = value;
                            }
                        } else {
                            (rowData as any)[mappedField] = '';
                        }
                    } else {
                        if (mappedField === 'municipality') {
                            let cleanValue = value;
                            if (!cleanValue || cleanValue.toString().toLowerCase() === 'undefined' || 
                                cleanValue.toString().toLowerCase() === 'null' || cleanValue.toString().trim() === '') {
                                cleanValue = '';
                            }
                            (rowData as any)[mappedField] = cleanValue;
                        } else {
                            (rowData as any)[mappedField] = value || '';
                        }
                    }
                }
            });
            
            rows.push({
                data: rowData,
                rowNumber: index + 1,
                isValid: true,
                errors: []
            });
        });
        
        console.log(`✅ CSV to JSON conversion complete: ${rows.length} records ready`);
        return rows;
    };

    // Note: parseCSV function removed - using PapaParse exclusively via parseCSVToJSON()

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
            toast.error('Please select a CSV file');
            return;
        }

        setFile(selectedFile);

        // Read and preview the file using PapaParse
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvText = e.target?.result as string;
                console.log('📄 CSV file loaded, converting CSV to JSON using PapaParse...');
                const parsed = parseCSVToJSON(csvText);
                console.log(`📊 Converted ${parsed.length} CSV records to JSON format`);
                setPreviewData(parsed); // Show all rows - no limit
                setShowPreview(true);
            } catch (error) {
                console.error('❌ Error parsing CSV:', error);
                toast.error(`Error parsing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
                setFile(null);
            }
        };
        reader.readAsText(selectedFile);
    };

    const handleImport = async () => {
        if (!file) return;

        console.log('🚀 Starting import process...');
        setIsImporting(true);
        setProgress({ total: 0, processed: 0, successful: 0, failed: 0, skipped: 0, errors: [] });
        console.log('✅ Import state set to true, progress modal should show');
        
        // Force a small delay to ensure state update is processed
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Add CSV validation after clicking import

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const csvText = e.target?.result as string;
                    
                    // SIMPLE: CSV → JSON → Save
                    console.log('📄 Step 1: Converting CSV to JSON...');
                    const parsedRows = parseCSVToJSON(csvText);
                    
                    if (parsedRows.length === 0) {
                        throw new Error('CSV file is empty');
                    }
                    
                    console.log(`✅ Converted ${parsedRows.length} rows to JSON`);
                    toast.success(`Ready to import ${parsedRows.length} records`);
                    
                    setProgress(prev => ({ ...prev, total: parsedRows.length }));
                    
                    // HYPER-FAST: Just take the data from CSV and save it with maximum speed
                    const assessmentsToImport = parsedRows.map(row => row.data) as Omit<AssessmentDocument, '$id' | '$createdAt' | '$updatedAt'>[];
                    
                    console.log('⚡ Step 2: Saving to database (HYPER-FAST MODE - 100 records per batch)...');
                    const result = await databaseService.hyperFastImport(
                        collectionId,
                        assessmentsToImport,
                        (progress) => {
                            setProgress(prev => ({
                                ...prev,
                                processed: progress.processed,
                                successful: progress.successful,
                                failed: progress.failed,
                                errors: progress.errors
                            }));
                        }
                    );

                    // Store result and show completion modal
                    setImportResult(result);
                    setShowCompletionModal(true);
                    setIsImporting(false); // Import completed successfully
                    
                    if (result.successful > 0) {
                        toast.success(`Import completed! ${result.successful} records imported successfully${result.failed > 0 ? `, ${result.failed} failed` : ''}.`);
                        onImportComplete();
                    } else {
                        toast.error(`Import failed! No records were imported. Check the error details below.`);
                    }
                    
                } catch (error) {
                    console.error('❌ Import error:', error);
                    toast.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    setIsImporting(false); // Import failed
                    setImportResult({ successful: 0, failed: 0, errors: [error instanceof Error ? error.message : 'Unknown error'] });
                    setShowCompletionModal(true);
                }
            };
            reader.readAsText(file);
        } catch (error) {
            console.error('❌ FileReader error:', error);
            toast.error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setIsImporting(false); // File reading failed
        }
    };

    const handleClose = () => {
        setFile(null);
        setPreviewData([]);
        setShowPreview(false);
        setColumnValidation(null);
        setImportResult(null);
        setShowCompletionModal(false);
        setIsImporting(false);
        setProgress({ total: 0, processed: 0, successful: 0, failed: 0, skipped: 0, errors: [] });
        onClose();
    };

    const downloadTemplate = () => {
        const headers = [
            'csv_id', 'tdn', 'pin', 'name', 'market_val', 'ass_value', 'area', 'unit_value',
            'kind', 'ass_level', 'classification', 'sub_class', 'taxability',
            'trans_cd', 'tax_beg_yr', 'eff_date', 'owner_no', 'mun_code',
            'municipality', 'bcode', 'barangay', 'gr_code', 'gr'
        ];
        
        // Sample data rows with municipality-based CSV_ID prefixes
        const sampleRows = [
            ['TUBAY_1', '001-001-001', '001-001-001-001', 'JUAN DELA CRUZ', '500000', '100000', '100', '5000', 'LAND', '20', 'RESIDENTIAL', 'RESIDENTIAL LOT', 'Taxable', 'NEW', '2025', '2025-01-01', '12345', '001', 'TUBAY', '001', 'BARANGAY 1', '001', 'GR 1'],
            ['TUBAY_2', '001-001-002', '001-001-002-001', 'MARIA SANTOS', '750000', '150000', '150', '5000', 'LAND', '20', 'RESIDENTIAL', 'RESIDENTIAL LOT', 'Taxable', 'NEW', '2025', '2025-01-01', '12346', '001', 'TUBAY', '001', 'BARANGAY 1', '001', 'GR 1'],
            ['BUTUAN_CITY_3', '001-001-003', '001-001-003-001', 'PEDRO GARCIA', '300000', '60000', '80', '3750', 'LAND', '20', 'AGRICULTURAL', 'AGRICULTURAL LOT', 'Exempt', 'NEW', '2025', '2025-01-01', '12347', '001', 'BUTUAN CITY', '002', 'BARANGAY 2', '002', 'GR 2'],
            ['4', '001-002-001', '001-002-001-001', 'ANNA REYES', '1200000', '240000', '200', '6000', 'BUILDING', '20', 'COMMERCIAL', 'OFFICE BUILDING', 'Taxable', 'NEW', '2025', '2025-01-01', '12348', '001', 'BUTUAN CITY', '003', 'BARANGAY 3', '003', 'GR 3'],
            ['5', '001-002-002', '001-002-002-001', 'CARLOS LOPEZ', '850000', '170000', '120', '7083', 'BUILDING', '20', 'RESIDENTIAL', 'SINGLE FAMILY DWELLING', 'Taxable', 'UPDATE', '2025', '2025-01-01', '12349', '001', 'BUTUAN CITY', '003', 'BARANGAY 3', '003', 'GR 3'],
            ['6', '001-003-001', '001-003-001-001', 'ROSA MARTINEZ', '2500000', '500000', '500', '5000', 'LAND', '20', 'INDUSTRIAL', 'INDUSTRIAL LOT', 'Taxable', 'NEW', '2025', '2025-01-01', '12350', '001', 'BUTUAN CITY', '004', 'BARANGAY 4', '004', 'GR 4'],
            ['7', '001-003-002', '001-003-002-001', 'MIGUEL TORRES', '180000', '36000', '60', '3000', 'LAND', '20', 'AGRICULTURAL', 'RICE FIELD', 'Exempt', 'NEW', '2025', '2025-01-01', '12351', '001', 'BUTUAN CITY', '005', 'BARANGAY 5', '005', 'GR 5'],
            ['8', '001-004-001', '001-004-001-001', 'ELENA CRUZ', '950000', '190000', '180', '5278', 'BUILDING', '20', 'RESIDENTIAL', 'DUPLEX', 'Taxable', 'NEW', '2025', '2025-01-01', '12352', '001', 'BUTUAN CITY', '006', 'BARANGAY 6', '006', 'GR 6'],
            ['9', '001-004-002', '001-004-002-001', 'FRANCISCO RAMOS', '3200000', '640000', '800', '4000', 'LAND', '20', 'COMMERCIAL', 'COMMERCIAL LOT', 'Taxable', 'UPDATE', '2025', '2025-01-01', '12353', '001', 'BUTUAN CITY', '007', 'BARANGAY 7', '007', 'GR 7'],
            ['10', '001-005-001', '001-005-001-001', 'GOVERNMENT OF AGUSAN DEL NORTE', '0', '0', '1000', '0', 'LAND', '0', 'GOVERNMENT', 'PUBLIC SCHOOL', 'Exempt', 'NEW', '2025', '2025-01-01', '99999', '001', 'BUTUAN CITY', '008', 'BARANGAY 8', '008', 'GR 8']
        ];
        
        // Build CSV content with headers and sample data
        let csvContent = headers.join(',') + '\n';
        sampleRows.forEach(row => {
            csvContent += row.join(',') + '\n';
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'property_assessment_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <>
            <Modal
                opened={isOpen}
                onClose={handleClose}
                title={isImporting ? "Importing Records" : showCompletionModal ? "Import Complete" : "Import Property Assessments from CSV"}
                size={isImporting || showCompletionModal ? "md" : "xl"}
                closeOnClickOutside={!isImporting}
                closeOnEscape={!isImporting}
            >
                <div className="space-y-6">
                
                {/* Import Completion Results */}
                {showCompletionModal && importResult ? (
                    <div className="text-center space-y-6">
                        {/* Success/Failure Icon */}
                        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center">
                            {importResult.failed === 0 ? (
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            ) : importResult.successful > 0 ? (
                                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {importResult.failed === 0 ? 'Import Successful!' : 
                             importResult.successful > 0 ? 'Import Completed with Issues' : 
                             'Import Failed'}
                        </h3>

                        {/* Results Summary */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {importResult.successful}
                                </div>
                                <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                                    Imported
                                </div>
                            </div>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                    {importResult.skipped || 0}
                                </div>
                                <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                                    Skipped
                                </div>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                                    {importResult.failed}
                                </div>
                                <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                                    Failed
                                </div>
                            </div>
                        </div>

                        {/* Success Rate */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Success Rate</div>
                            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-600">
                                <div 
                                    className="h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-1000 ease-out"
                                    style={{ 
                                        width: `${(importResult.successful + importResult.failed) > 0 ? 
                                            (importResult.successful / (importResult.successful + importResult.failed)) * 100 : 0}%` 
                                    }}
                                ></div>
                            </div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
                                {(importResult.successful + importResult.failed) > 0 ? 
                                    Math.round((importResult.successful / (importResult.successful + importResult.failed)) * 100) : 0}%
                            </div>
                        </div>

                        {/* Error Details */}
                        {importResult.errors.length > 0 && (
                            <div className="text-left">
                                <details className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                                    <summary className="cursor-pointer text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                                        View Error Details ({importResult.errors.length} errors)
                                    </summary>
                                    <div className="mt-3 max-h-32 overflow-y-auto">
                                        <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                                            {importResult.errors.slice(0, 20).map((error, index) => (
                                                <li key={index} className="break-words">• {error}</li>
                                            ))}
                                            {importResult.errors.length > 20 && (
                                                <li className="text-gray-500 italic">
                                                    ... and {importResult.errors.length - 20} more errors
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </details>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCompletionModal(false);
                                    setImportResult(null);
                                    setIsImporting(false);
                                    handleClose();
                                    onImportComplete();
                                }}
                                className="btn btn-primary"
                            >
                                Close
                            </button>
                            {importResult.failed > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCompletionModal(false);
                                        setImportResult(null);
                                        setIsImporting(false);
                                        // Reset states to allow retry
                                        setFile(null);
                                        setPreviewData([]);
                                        setShowPreview(false);
                                        setColumnValidation(null);
                                    }}
                                    className="btn btn-outline-primary"
                                >
                                    Retry Import
                                </button>
                            )}
                        </div>
                    </div>
                ) : isImporting ? (
                    /* Import Progress Section */
                    <>
                    {console.log('🔄 Rendering progress section, isImporting:', isImporting, 'progress:', progress)}
                    <div className="text-center space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-center space-x-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Importing Records
                            </h3>
                        </div>

                        {/* Progress Circle */}
                        <div className="relative w-32 h-32 mx-auto">
                            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                                {/* Background circle */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    className="text-gray-200 dark:text-gray-700"
                                />
                                {/* Progress circle */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * 40}`}
                                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - (progress.total > 0 ? progress.processed / progress.total : 0))}`}
                                    className="text-blue-600 transition-all duration-500 ease-out"
                                    strokeLinecap="round"
                                />
                            </svg>
                            {/* Percentage text */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0}%
                                </span>
                            </div>
                        </div>

                        {/* Progress Stats */}
                        <div className="grid grid-cols-4 gap-3 text-center">
                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                    {progress.jsonConverted || 0}
                                </div>
                                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                    JSON Converted
                                </div>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                    {progress.processed}
                                </div>
                                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                    Processed
                                </div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                                    {progress.successful}
                                </div>
                                <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                                    Success
                                </div>
                            </div>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                                <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                                    {progress.skipped || 0}
                                </div>
                                <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                                    Skipped
                                </div>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                                <div className="text-xl font-bold text-red-600 dark:text-red-400">
                                    {progress.failed}
                                </div>
                                <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                                    Failed
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>Progress</span>
                                <span>{progress.processed} of {progress.total}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 overflow-hidden">
                                <div className="relative h-full">
                                    {/* Success portion (green) */}
                                    <div 
                                        className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-300"
                                        style={{ width: `${progress.total > 0 ? (progress.successful / progress.total) * 100 : 0}%` }}
                                    ></div>
                                    {/* Skipped portion (yellow) */}
                                    <div 
                                        className="absolute top-0 h-full bg-yellow-500 transition-all duration-300"
                                        style={{ 
                                            left: `${progress.total > 0 ? (progress.successful / progress.total) * 100 : 0}%`,
                                            width: `${progress.total > 0 ? ((progress.skipped || 0) / progress.total) * 100 : 0}%`
                                        }}
                                    ></div>
                                    {/* Failed portion (red) */}
                                    <div 
                                        className="absolute top-0 h-full bg-red-500 transition-all duration-300"
                                        style={{ 
                                            left: `${progress.total > 0 ? ((progress.successful + (progress.skipped || 0)) / progress.total) * 100 : 0}%`,
                                            width: `${progress.total > 0 ? (progress.failed / progress.total) * 100 : 0}%`
                                        }}
                                    ></div>
                                    {/* Processing portion (blue) */}
                                    <div 
                                        className="absolute top-0 h-full bg-blue-500 transition-all duration-300"
                                        style={{ 
                                            left: `${progress.total > 0 ? ((progress.successful + (progress.skipped || 0) + progress.failed) / progress.total) * 100 : 0}%`,
                                            width: `${progress.total > 0 ? ((progress.processed - progress.successful - (progress.skipped || 0) - progress.failed) / progress.total) * 100 : 0}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Status Message */}
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {progress.processed === 0 ? (
                                "Preparing to import records..."
                            ) : progress.processed < progress.total ? (
                                `Processing record ${progress.processed} of ${progress.total}...`
                            ) : (
                                "Finalizing import..."
                            )}
                        </div>

                        {/* Recent Errors (if any) */}
                        {progress.errors.length > 0 && (
                            <div className="text-left">
                                <details className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                                    <summary className="cursor-pointer text-sm font-medium text-red-600 dark:text-red-400">
                                        Recent Errors ({progress.errors.length})
                                    </summary>
                                    <div className="mt-2 max-h-24 overflow-y-auto">
                                        <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                                            {progress.errors.slice(-5).map((error, index) => (
                                                <li key={index} className="break-words">• {error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </details>
                            </div>
                        )}
                    </div>
                    </>
                ) : (
                    /* CSV Upload and Preview Section */
                    <>
                    {/* File Upload Section */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                    <div className="text-center">
                        <IconUpload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                            <label htmlFor="csv-upload" className="cursor-pointer">
                                <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                                    {file ? file.name : 'Choose CSV file or drag and drop'}
                                </span>
                                <input
                                    ref={fileInputRef}
                                    id="csv-upload"
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    disabled={isImporting}
                                />
                            </label>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">CSV files only</p>
                    </div>
                </div>


                {/* Template Download */}
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={downloadTemplate}
                        className="btn btn-outline-primary"
                        disabled={isImporting}
                    >
                        Download CSV Template
                    </button>
                </div>

                {/* File Info and Preview */}
                {file && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-medium text-blue-900 dark:text-blue-100">{file.name}</h4>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        Ready to import {previewData.length} records
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CSV Data Preview - First 10 Rows */}
                        {previewData.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        CSV Data Preview (First 10 rows)
                                    </h4>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        Total: {previewData.length} rows
                                    </span>
                                </div>
                                
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-xs">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-600">
                                                <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">#</th>
                                                <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">TDN</th>
                                                <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">PIN</th>
                                                <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Name</th>
                                                <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Municipality</th>
                                                <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Market Val</th>
                                                <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Ass Val</th>
                                                <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Area</th>
                                                <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Classification</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.slice(0, 10).map((row, index) => (
                                                <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                    <td className="py-2 px-2 text-gray-600 dark:text-gray-400">{index + 1}</td>
                                                    <td className="py-2 px-2 text-gray-900 dark:text-white font-mono">
                                                        {row.data.tdn || <span className="text-red-500">Missing</span>}
                                                    </td>
                                                    <td className="py-2 px-2 text-gray-900 dark:text-white font-mono">
                                                        {row.data.pin || <span className="text-red-500">Missing</span>}
                                                    </td>
                                                    <td className="py-2 px-2 text-gray-900 dark:text-white max-w-32 truncate">
                                                        {row.data.name || <span className="text-red-500">Missing</span>}
                                                    </td>
                                                    <td className="py-2 px-2 text-gray-900 dark:text-white">
                                                        {row.data.municipality || <span className="text-yellow-500">Unknown</span>}
                                                    </td>
                                                    <td className="py-2 px-2 text-gray-900 dark:text-white text-right">
                                                        {row.data.market_val ? `₱${row.data.market_val.toLocaleString()}` : '₱0'}
                                                    </td>
                                                    <td className="py-2 px-2 text-gray-900 dark:text-white text-right">
                                                        {row.data.ass_value ? `₱${row.data.ass_value.toLocaleString()}` : '₱0'}
                                                    </td>
                                                    <td className="py-2 px-2 text-gray-900 dark:text-white text-right">
                                                        {row.data.area ? `${row.data.area.toLocaleString()} sqm` : '0 sqm'}
                                                    </td>
                                                    <td className="py-2 px-2 text-gray-900 dark:text-white">
                                                        {row.data.classification || <span className="text-gray-400">-</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {previewData.length > 10 && (
                                    <div className="mt-3 text-center">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            ... and {previewData.length - 10} more rows
                                        </span>
                                    </div>
                                )}

                                {/* Column Validation Summary */}
                                {columnValidation && (
                                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                            <div className="bg-green-50 dark:bg-green-900/20 rounded p-2">
                                                <div className="font-medium text-green-700 dark:text-green-300">
                                                    ✅ Mapped Columns ({columnValidation.mappedColumns.length})
                                                </div>
                                                <div className="text-green-600 dark:text-green-400 mt-1">
                                                    {columnValidation.mappedColumns.slice(0, 3).join(', ')}
                                                    {columnValidation.mappedColumns.length > 3 && '...'}
                                                </div>
                                            </div>
                                            
                                            {columnValidation.missingRequiredColumns.length > 0 && (
                                                <div className="bg-red-50 dark:bg-red-900/20 rounded p-2">
                                                    <div className="font-medium text-red-700 dark:text-red-300">
                                                        ❌ Missing Required ({columnValidation.missingRequiredColumns.length})
                                                    </div>
                                                    <div className="text-red-600 dark:text-red-400 mt-1">
                                                        {columnValidation.missingRequiredColumns.join(', ')}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {columnValidation.unmappedColumns.length > 0 && (
                                                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded p-2">
                                                    <div className="font-medium text-yellow-700 dark:text-yellow-300">
                                                        ⚠️ Unmapped Columns ({columnValidation.unmappedColumns.length})
                                                    </div>
                                                    <div className="text-yellow-600 dark:text-yellow-400 mt-1">
                                                        {columnValidation.unmappedColumns.slice(0, 2).join(', ')}
                                                        {columnValidation.unmappedColumns.length > 2 && '...'}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}


                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="btn btn-outline-danger"
                        disabled={isImporting}
                    >
                        Cancel
                    </button>
                    {file && (
                        <button
                            type="button"
                            className="btn btn-primary"
                            disabled={isImporting || previewData.length === 0}
                            onClick={() => {
                                console.log('🔘 Import button clicked');
                                console.log('📊 Preview data length:', previewData.length);
                                console.log('⏳ Is importing:', isImporting);
                                handleImport();
                            }}
                        >
                            {isImporting ? (
                                <div className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Starting Import...</span>
                                </div>
                            ) : (
                                `Import All ${previewData.length} Records`
                            )}
                        </button>
                    )}
                </div>
                    </>
                )}
                
                </div>
        </Modal>
        </>
    );
};

export default CSVImport;
