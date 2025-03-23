"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface Update {
  old: string;
  new: string;
}

type FilterType = 'all' | 'colon' | 'case' | 'other';

export default function SyncPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(true);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [history, setHistory] = useState<Update[][]>([]);

  const handlePreview = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/tmdb?preview=true');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Une erreur est survenue');
      }
      
      setUpdates(data.updates);
      
      if (data.updates.length === 0) {
        setError('Aucune mise à jour nécessaire');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/tmdb');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Une erreur est survenue');
      }
      
      // Sauvegarder l'état actuel dans l'historique
      setHistory(prev => [...prev, updates]);
      setUpdates(data.updates);
      
      toast.success(`${data.updatedCount} titres ont été mis à jour`);
      
      if (data.updatedCount === 0) {
        setError('Aucune mise à jour nécessaire');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndo = async () => {
    try {
      if (history.length === 0) {
        toast.error('Aucune modification à annuler');
        return;
      }

      setIsLoading(true);
      const lastState = history[history.length - 1];
      
      const response = await fetch('/api/tmdb/revert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates: lastState }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de l\'annulation');
      }

      setHistory(prev => prev.slice(0, -1));
      setUpdates([]);
      toast.success('Modifications annulées avec succès');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'annulation');
    } finally {
      setIsLoading(false);
    }
  };

  const filterUpdates = (updates: Update[]) => {
    let filtered = updates;

    // Filtrer par type de modification
    if (filterType !== 'all') {
      filtered = filtered.filter(update => {
        const hasColon = update.old.includes(':') || update.new.includes(':');
        const isCaseChange = update.old.toLowerCase() === update.new.toLowerCase();
        
        switch (filterType) {
          case 'colon':
            return hasColon;
          case 'case':
            return isCaseChange;
          case 'other':
            return !hasColon && !isCaseChange;
          default:
            return true;
        }
      });
    }

    // Filtrer par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        update => update.old.toLowerCase().includes(term) || 
                 update.new.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  const filteredUpdates = filterUpdates(updates);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Synchronisation des titres avec TMDB</h1>
      
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isPreviewing}
                onChange={(e) => setIsPreviewing(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Mode prévisualisation
              </span>
            </label>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={handleUndo}
              disabled={isLoading || history.length === 0}
              variant="outline"
            >
              Annuler la dernière synchronisation
            </Button>
            
            <Button 
              onClick={isPreviewing ? handlePreview : handleSync}
              disabled={isLoading}
              variant="default"
            >
              {isLoading ? 'En cours...' : isPreviewing ? 'Prévisualiser' : 'Synchroniser'}
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          {isPreviewing 
            ? "Prévisualisez les modifications avant de les appliquer."
            : "Les modifications seront appliquées directement au fichier JSON."}
        </p>
      </Card>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {updates.length > 0 && (
        <div>
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              placeholder="Rechercher un titre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded px-3 py-2 max-w-xs"
            />
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="border rounded px-3 py-2"
            >
              <option value="all">Tous les changements</option>
              <option value="colon">Deux-points</option>
              <option value="case">Casse</option>
              <option value="other">Autres</option>
            </select>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ancien titre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nouveau titre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type de modification
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUpdates.map((update, index) => {
                  const hasColon = update.old.includes(':') || update.new.includes(':');
                  const isCaseChange = update.old.toLowerCase() === update.new.toLowerCase();
                  let changeType = 'Autre';
                  if (hasColon) changeType = 'Deux-points';
                  else if (isCaseChange) changeType = 'Casse';

                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {update.old}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {update.new}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {changeType}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            {filteredUpdates.length} modifications affichées sur {updates.length} au total
          </div>
        </div>
      )}
    </div>
  );
} 