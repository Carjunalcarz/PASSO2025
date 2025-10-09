import React, { useState, useEffect } from 'react';
import { appwriteConfig } from '../lib/appwrite';

const AppwriteConnectionTest: React.FC = () => {
    const [testResults, setTestResults] = useState<string[]>([]);
    const [testing, setTesting] = useState(false);

    const addResult = (message: string) => {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const runConnectionTests = async () => {
        setTesting(true);
        setTestResults([]);
        
        addResult('🚀 Starting Appwrite connection tests...');
        
        // Test 1: Configuration check
        addResult('📋 Test 1: Configuration check');
        addResult(`   Endpoint: ${appwriteConfig.endpoint}`);
        addResult(`   Project ID: ${appwriteConfig.projectId}`);
        addResult(`   Database ID: ${appwriteConfig.databaseId}`);
        
        // Test 2: Basic network connectivity
        addResult('🌐 Test 2: Network connectivity');
        try {
            const healthUrl = `${appwriteConfig.endpoint}/health`;
            addResult(`   Testing: ${healthUrl}`);
            
            const response = await fetch(healthUrl);
            addResult(`   ✅ Response: ${response.status} ${response.statusText}`);
            
            const data = await response.json();
            addResult(`   ✅ Data: ${JSON.stringify(data)}`);
        } catch (error: any) {
            addResult(`   ❌ Network test failed: ${error.message}`);
        }
        
        // Test 3: CORS test
        addResult('🔒 Test 3: CORS test');
        try {
            const corsResponse = await fetch(`${appwriteConfig.endpoint}/account`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Appwrite-Project': appwriteConfig.projectId,
                },
            });
            addResult(`   ✅ CORS test: ${corsResponse.status} ${corsResponse.statusText}`);
        } catch (error: any) {
            if (error.message?.includes('CORS')) {
                addResult(`   ❌ CORS error: ${error.message}`);
                addResult(`   🔧 Fix: Add localhost:5173 to your Appwrite web platform`);
            } else {
                addResult(`   ❌ CORS test failed: ${error.message}`);
            }
        }
        
        // Test 4: Manual browser test suggestion
        addResult('🌍 Test 4: Manual browser test');
        addResult(`   Open this URL in your browser: ${appwriteConfig.endpoint}/health`);
        addResult(`   Expected result: {"status":"OK"}`);
        
        setTesting(false);
        addResult('🏁 Connection tests completed');
    };

    useEffect(() => {
        runConnectionTests();
    }, []);

    return (
        <div className="p-6 bg-gray-50 rounded-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Appwrite Connection Diagnostics</h2>
            
            <div className="mb-4">
                <button
                    onClick={runConnectionTests}
                    disabled={testing}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {testing ? 'Testing...' : 'Run Tests Again'}
                </button>
            </div>

            <div className="bg-white p-4 rounded border">
                <h3 className="font-semibold mb-2">Test Results:</h3>
                <div className="font-mono text-sm max-h-96 overflow-y-auto">
                    {testResults.map((result, index) => (
                        <div key={index} className="mb-1">
                            {result}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-semibold text-yellow-800 mb-2">Common Solutions:</h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                    <li>1. <strong>Server not running:</strong> Start your Appwrite server</li>
                    <li>2. <strong>Wrong IP:</strong> Check if 192.168.2.3 is correct</li>
                    <li>3. <strong>CORS error:</strong> Add localhost:5173 to Appwrite web platform</li>
                    <li>4. <strong>Firewall:</strong> Check if port is blocked</li>
                    <li>5. <strong>Network:</strong> Try ping 192.168.2.3 in terminal</li>
                </ul>
            </div>
        </div>
    );
};

export default AppwriteConnectionTest;
