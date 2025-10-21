import React, { useState } from 'react';
import { toast } from 'react-toastify';
import IconDownload from '../../../components/Icon/IconDownload';
import IconEye from '../../../components/Icon/IconEye';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconFile from '../../../components/Icon/IconFile';
import IconX from '../../../components/Icon/IconX';
import IconClock from '../../../components/Icon/IconClock';
import IconCaretDown from '../../../components/Icon/IconCaretDown';

interface FaasHistoryItem {
    url: string;
    timestamp: string;
    version: number;
    action: string;
    tdArp: string;
    userId?: string; // User ID who created/updated the document
    $id?: string; // Document ID from the schema
}

interface FaasData {
    current: string;
    history: FaasHistoryItem[];
}

interface FaasPdfListingProps {
    faasData?: string | FaasData; // Can be JSON string or parsed object
    tdnNumber?: string;
    ownerName?: string;
    pin?: string;
    userId?: string; // Document-level user ID to use for all history items
}

const FaasPdfListing: React.FC<FaasPdfListingProps> = ({
    faasData,
    tdnNumber,
    ownerName,
    pin,
    userId
}) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState<string>('');

    // Parse FAAS data
    const parseFaasData = (): FaasData | null => {
        if (!faasData) return null;
        
        try {
            if (typeof faasData === 'string') {
                return JSON.parse(faasData);
            }
            return faasData;
        } catch (error) {
            console.warn('Failed to parse FAAS data:', error);
            return null;
        }
    };

    const faasInfo = parseFaasData();
    const currentUrl = faasInfo?.current;
    const history = faasInfo?.history || [];
    
    // Check if FAAS document is available
    const hasFaasDocument = currentUrl && currentUrl.trim() !== '';

    // Extract filename from URL
    const getFileName = (url: string) => {
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            const filename = pathname.split('/').pop() || 'FAAS_Document.pdf';
            return filename;
        } catch {
            return 'FAAS_Document.pdf';
        }
    };

    // Get file size (mock implementation - in real app you'd fetch this)
    const getFileSize = () => {
        return 'Unknown size'; // In real implementation, you'd fetch this from the server
    };

    // Handle PDF preview
    const handlePreview = (url?: string) => {
        const targetUrl = url || currentUrl;
        if (!targetUrl) {
            toast.error('FAAS document not available');
            return;
        }

        setIsLoading(true);
        try {
            setSelectedVersion(targetUrl);
            setIsPreviewOpen(true);
        } catch (error) {
            toast.error('Failed to load PDF preview');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle PDF download
    const handleDownload = async (url?: string) => {
        const targetUrl = url || currentUrl;
        if (!targetUrl) {
            toast.error('FAAS document not available');
            return;
        }

        setIsLoading(true);
        try {
            // Create a temporary anchor element to trigger download
            const link = document.createElement('a');
            link.href = targetUrl;
            link.download = getFileName(targetUrl);
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success('Download started');
        } catch (error) {
            toast.error('Failed to download FAAS document');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle PDF print
    const handlePrint = (url?: string) => {
        const targetUrl = url || currentUrl;
        if (!targetUrl) {
            toast.error('FAAS document not available');
            return;
        }

        window.open(targetUrl, '_blank');
        toast.info('FAAS document opened in new tab for printing');
    };

    // Handle copy URL
    const handleCopyUrl = async (url?: string) => {
        const targetUrl = url || currentUrl;
        if (!targetUrl) {
            toast.error('FAAS document not available');
            return;
        }

        try {
            await navigator.clipboard.writeText(targetUrl);
            toast.success('FAAS document URL copied to clipboard');
        } catch (error) {
            toast.error('Failed to copy URL to clipboard');
        }
    };

    // Format timestamp
    const formatTimestamp = (timestamp: string) => {
        try {
            return new Date(timestamp).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return timestamp;
        }
    };

    // Get action color
    const getActionColor = (action: string) => {
        switch (action.toLowerCase()) {
            case 'created':
                return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
            case 'updated':
                return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
            case 'deleted':
                return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
            default:
                return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    return (
        <div className="panel">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <IconFile className="w-5 h-5" />
                    FAAS Document
                </h2>
            </div>

            {hasFaasDocument ? (
                <div className="space-y-4">
                    {/* Current Document Info Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <IconFile className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                                        Current FAAS Document
                                    </h3>
                                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full">
                                        Latest
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">TDN:</span>
                                        <span className="ml-2 text-slate-600 dark:text-slate-400">{tdnNumber || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">PIN:</span>
                                        <span className="ml-2 text-slate-600 dark:text-slate-400">{pin || 'N/A'}</span>
                                    </div>
                                    <div className="md:col-span-2">
                                        <span className="font-medium text-slate-700 dark:text-slate-300">Owner:</span>
                                        <span className="ml-2 text-slate-600 dark:text-slate-400">{ownerName || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">Versions:</span>
                                        <span className="ml-2 text-slate-600 dark:text-slate-400">{history.length} total</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">Type:</span>
                                        <span className="ml-2 text-slate-600 dark:text-slate-400">PDF Document</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => handlePreview()}
                            disabled={isLoading}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <IconEye className="w-4 h-4" />
                            {isLoading ? 'Loading...' : 'Preview Current'}
                        </button>

                        <button
                            onClick={() => handleDownload()}
                            disabled={isLoading}
                            className="btn btn-secondary flex items-center gap-2"
                        >
                            <IconDownload className="w-4 h-4" />
                            Download Current
                        </button>

                        <button
                            onClick={() => handlePrint()}
                            disabled={isLoading}
                            className="btn btn-info flex items-center gap-2"
                        >
                            <IconPrinter className="w-4 h-4" />
                            Print Current
                        </button>

                        <button
                            onClick={() => handleCopyUrl()}
                            disabled={isLoading}
                            className="btn btn-outline-primary flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy URL
                        </button>
                    </div>

                    {/* Version History Toggle */}
                    {history.length > 0 && (
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                <IconClock className="w-4 h-4" />
                                Version History ({history.length} versions)
                                <IconCaretDown className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                            </button>

                            {/* History List */}
                            {showHistory && (
                                <div className="mt-4 space-y-3">
                                    {history.map((item, index) => (
                                        <div key={index} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="flex items-center gap-1">
                                                            <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            <span className="font-medium text-sm font-mono">
                                                                {item.userId ? `User: ${item.userId.slice(-8)}` : userId ? `User: ${userId.slice(-8)}` : `v${item.version}`}
                                                            </span>
                                                        </div>
                                                        <span className={`px-2 py-1 text-xs rounded-full ${getActionColor(item.action)}`}>
                                                            {item.action}
                                                        </span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                                            TDN: {item.tdArp}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {formatTimestamp(item.timestamp)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handlePreview(item.url)}
                                                        className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                                                        title="Preview this version"
                                                    >
                                                        <IconEye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(item.url)}
                                                        className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded transition-colors"
                                                        title="Download this version"
                                                    >
                                                        <IconDownload className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Document Status */}
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-600 dark:text-green-400 font-medium">Document Available</span>
                        {history.length > 0 && (
                            <>
                                <span className="text-slate-400">•</span>
                                <span className="text-slate-600 dark:text-slate-400">{history.length} version{history.length !== 1 ? 's' : ''} in history</span>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                /* No Document Available */
                <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <IconFile className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        No FAAS Document Available
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        The FAAS document for this assessment has not been uploaded or is not available.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-yellow-600 dark:text-yellow-400 font-medium">Document Not Available</span>
                    </div>
                </div>
            )}

            {/* PDF Preview Modal */}
            {isPreviewOpen && selectedVersion && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-[999] flex items-center justify-center p-4"
                    onClick={() => setIsPreviewOpen(false)}
                >
                    <div 
                        className="relative bg-white dark:bg-gray-900 rounded-lg max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl w-full"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                FAAS Document Preview
                            </h3>
                            <button
                                onClick={() => setIsPreviewOpen(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <IconX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>
                        
                        {/* PDF Content */}
                        <div className="h-[80vh] overflow-hidden">
                            <iframe
                                src={selectedVersion}
                                className="w-full h-full border-0"
                                title="FAAS Document Preview"
                            />
                        </div>
                        
                        {/* Footer */}
                        <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {getFileName(selectedVersion)}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDownload(selectedVersion)}
                                    className="btn btn-sm btn-secondary"
                                >
                                    <IconDownload className="w-4 h-4 mr-1" />
                                    Download
                                </button>
                                <button
                                    onClick={() => setIsPreviewOpen(false)}
                                    className="btn btn-sm btn-primary"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FaasPdfListing;
