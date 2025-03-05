import React, { useState, useEffect } from 'react';
import { fetchExternalAssetData } from '../services/api';

function AddAssetModal({ isOpen, onClose, onAddAsset }) {
  const [newAsset, setNewAsset] = useState({ ticker: '', quantity: 1 });
  const [tickerSearch, setTickerSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [fetchingPrice, setFetchingPrice] = useState(false);

  // Limpar estado quando o modal abre ou fecha
  useEffect(() => {
    if (isOpen) {
      setNewAsset({ ticker: '', quantity: 1 });
      setTickerSearch('');
      setSearchResults([]);
      setSelectedAsset(null);
    }
  }, [isOpen]);

  // Função de pesquisa de ticker
  const searchTicker = async (query) => {
    setTickerSearch(query);
    
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setLoading(true);
    
    try {
      // Buscar em "fonte externa"
      const externalResults = await fetchExternalAssetData(query);
      setSearchResults(externalResults);
    } catch (error) {
      console.error('Erro ao buscar dados do ativo:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para selecionar um ticker da pesquisa
  const selectTickerFromSearch = (asset) => {
    setSelectedAsset(asset);
    setTickerSearch(asset.ticker);
    setNewAsset({
      ...newAsset,
      ticker: asset.ticker
    });
    setSearchResults([]);
    
    // Simular busca de preço atualizado
    setFetchingPrice(true);
    
    // Simulação de requisição a API externa
    setTimeout(() => {
      // Adiciona variação randômica para simular preço em tempo real
      const variation = (Math.random() - 0.5) * 0.03; // +/- 1.5%
      const updatedPrice = asset.price * (1 + variation);
      
      setSelectedAsset({
        ...asset,
        price: parseFloat(updatedPrice.toFixed(2)),
        lastUpdate: new Date().toLocaleTimeString() // Adiciona timestamp da atualização
      });
      
      setFetchingPrice(false);
    }, 1000);
  };

  // Função para adicionar o ativo
  const handleAddAsset = () => {
    if (!selectedAsset || newAsset.quantity <= 0) {
      alert('Por favor, selecione um ativo e informe uma quantidade válida');
      return;
    }
    
    const assetToAdd = {
      ticker: selectedAsset.ticker,
      name: selectedAsset.name,
      price: selectedAsset.price,
      quantity: Number(newAsset.quantity),
      type: selectedAsset.type
    };
    
    onAddAsset(assetToAdd);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Adicionar Ativo</h2>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Pesquisar Ativo</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-2 border rounded-md"
              placeholder="Digite o código do ativo (ex: PETR4, ITUB4, KNRI11)"
              value={tickerSearch}
              onChange={(e) => searchTicker(e.target.value)}
            />
          </div>
          
          {loading && (
            <div className="mt-2 flex items-center justify-center p-2 text-gray-500">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Buscando ativo...</span>
            </div>
          )}
          
          {searchResults.length > 0 && (
            <div className="mt-1 border rounded-md shadow-sm overflow-y-auto max-h-40">
              {searchResults.map(result => (
                <div 
                  key={result.ticker}
                  className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  onClick={() => selectTickerFromSearch(result)}
                >
                  <div>
                    <span className="font-medium">{result.ticker}</span>
                    <span className="text-sm text-gray-600 ml-2">{result.name}</span>
                    {result.isExternal && (
                      <span className="ml-2 text-xs text-blue-500">Ativo externo</span>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    result.type === 'stock' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {result.type === 'stock' ? 'Ação' : 'FII'}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {searchResults.length === 0 && tickerSearch.length >= 3 && !loading && (
            <div className="mt-1 p-2 text-sm text-gray-500">
              Nenhum resultado encontrado. Digite pelo menos 4 caracteres para buscar ativos externos.
            </div>
          )}
        </div>
        
        {selectedAsset && (
          <>
            <div className="mb-4 p-3 border rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{selectedAsset.ticker}</p>
                  <p className="text-sm text-gray-600">{selectedAsset.name}</p>
                  {selectedAsset.isExternal && (
                    <span className="text-xs text-blue-500">Ativo externo</span>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  selectedAsset.type === 'stock' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {selectedAsset.type === 'stock' ? 'Ação' : 'FII'}
                </span>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-gray-600">Preço atual:</span>
                {fetchingPrice ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Atualizando...</span>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="font-bold">R$ {selectedAsset?.price ? selectedAsset.price.toFixed(2) : '0.00'}</span>
                    {selectedAsset.lastUpdate && (
                      <p className="text-xs text-gray-500">Atualizado às {selectedAsset.lastUpdate}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Quantidade</label>
              <input
                type="number"
                className="block w-full px-4 py-2 border rounded-md"
                min="1"
                value={newAsset.quantity}
                onChange={(e) => setNewAsset({...newAsset, quantity: parseInt(e.target.value) || 0})}
              />
            </div>
            
            <div className="p-3 border rounded-md mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Valor total:</span>
                <span className="font-bold">
                  R$ {(selectedAsset?.price ? selectedAsset.price * newAsset.quantity : 0).toFixed(2)}
                </span>
              </div>
            </div>
          </>
        )}
        
        <div className="flex justify-end space-x-3">
          <button 
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-white ${
              selectedAsset && newAsset.quantity > 0
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            onClick={handleAddAsset}
            disabled={!selectedAsset || newAsset.quantity <= 0}
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddAssetModal;