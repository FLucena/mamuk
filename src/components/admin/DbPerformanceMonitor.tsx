'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface DbStats {
  isConnected: boolean;
  poolSize: number;
  avgQueryTime: number;
  lastUsed?: number;
  slowQueries: number;
  timestamp: string;
}

export default function DbPerformanceMonitor() {
  const [stats, setStats] = useState<DbStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/system/db-stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch database stats');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching database stats:', error);
        setError('Error al cargar estadísticas de la base de datos');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rendimiento de Base de Datos</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rendimiento de Base de Datos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error || 'No hay datos disponibles'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Rendimiento de Base de Datos
          <Badge variant={stats.isConnected ? "success" : "destructive"}>
            {stats.isConnected ? 'Conectado' : 'Desconectado'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Tiempo promedio de consulta:</span>
            <span className={`font-medium ${stats.avgQueryTime > 200 ? 'text-amber-500' : 'text-green-500'}`}>
              {stats.avgQueryTime}ms
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Consultas lentas ({'>'}500ms):</span>
            <span className={`font-medium ${stats.slowQueries > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {stats.slowQueries}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Tamaño del pool de conexiones:</span>
            <span className="font-medium">{stats.poolSize}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Última actualización:</span>
            <span className="font-medium">
              {new Date(stats.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 