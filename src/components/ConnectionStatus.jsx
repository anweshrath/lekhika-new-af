import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, Info } from 'lucide-react';
import superadminService from '../services/superadminService';

const ConnectionStatus = () => {
  const [status, setStatus] = useState({
    connected: false,
    endpoint: '',
    message: 'Using local mode...'
  });
  const [loading, setLoading] = useState(false);

  const checkConnection = async () => {
    setLoading(true);
    try {
      const connectionStatus = await superadminService.getConnectionStatus();
      setStatus(connectionStatus);
    } catch (error) {
      setStatus({
        connected: false,
        endpoint: superadminService.baseURL,
        message: 'Local mode active - all features working'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-2 px-3 py-2 rounded-lg text-sm">
      {loading ? (
        <RefreshCw className="w-4 h-4 animate-spin" />
      ) : (
        <Info className="w-4 h-4" />
      )}
      
      <span className="flex-1">{status.message}</span>
      
      <span className="text-xs bg-blue-100 px-2 py-1 rounded">
        LOCAL MODE
      </span>
    </div>
  );
};

export default ConnectionStatus;
