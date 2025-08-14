import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { storage } from '@/utils/storage';
import { Download, Upload, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

const DataManagement: React.FC = () => {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleExportData = () => {
    try {
      const exportData = storage.exportData();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `finance-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Data exported successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const result = storage.importData(content);

        setMessage({
          type: result.success ? 'success' : 'error',
          text: result.message
        });

        if (result.success) {
          // Refresh the page to load the imported data
          setTimeout(() => window.location.reload(), 1500);
        }

        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to read file.' });
        setTimeout(() => setMessage(null), 3000);
      }
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
  };

  const handleClearData = () => {
    storage.clearAll();
    setMessage({ type: 'success', text: 'All data cleared successfully!' });
    setShowClearConfirm(false);
    setTimeout(() => {
      setMessage(null);
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="glass-card">
      <div className="flex items-center space-x-3 mb-6">
        <Download className="w-6 h-6 text-blue-400" />
        <div>
          <h3 className="text-xl font-semibold text-white">Data Management</h3>
          <p className="text-white/70 text-sm">Export, import, or clear your financial data</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg mb-4 flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-green-500/20 border border-green-500/30 text-green-400'
              : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{message.text}</span>
        </motion.div>
      )}

      <div className="space-y-4">
        {/* Export Data */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h4 className="font-medium text-white">Export Data</h4>
            <p className="text-white/60 text-sm">Download a backup of all your financial data</p>
          </div>
          <button
            onClick={handleExportData}
            className="glass-button bg-blue-500/20 hover:bg-blue-500/30 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>

        {/* Import Data */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h4 className="font-medium text-white">Import Data</h4>
            <p className="text-white/60 text-sm">Restore data from a previously exported backup</p>
          </div>
          <label className="glass-button bg-green-500/20 hover:bg-green-500/30 flex items-center space-x-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
        </div>

        {/* Clear Data */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h4 className="font-medium text-white">Clear All Data</h4>
            <p className="text-white/60 text-sm">Permanently delete all stored financial data</p>
          </div>
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="glass-button bg-red-500/20 hover:bg-red-500/30 flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleClearData}
                className="px-3 py-2 bg-red-500/30 text-red-400 rounded-lg text-sm hover:bg-red-500/40"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-2 bg-gray-500/20 text-white/70 rounded-lg text-sm hover:bg-gray-500/30"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Storage Information */}
      <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div>
            <h4 className="text-yellow-400 font-medium mb-1">Data Storage Information</h4>
            <ul className="text-white/80 text-sm space-y-1">
              <li>• Data is stored locally in your browser's localStorage</li>
              <li>• Data is browser-specific and won't sync across different browsers</li>
              <li>• Regular exports are recommended to prevent data loss</li>
              <li>• Clearing browser data will delete all your financial information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
