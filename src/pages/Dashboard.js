import React, { useState } from 'react';
import Card from '../components/Card';
import PortfolioItemCard from '../components/PortfolioItemCard';
import AddAssetModal from '../components/AddAssetModal';

function Dashboard({ portfolio, setPortfolio, distribution, totalValue, stockAssets, reitAssets }) {
  const [showAddModal, setShowAddModal] = useState(false);

  // Função para adicionar um novo ativo
  const handleAddAsset = (assetToAdd) => {
    // Verificar se o ativo já existe
    const existingAssetIndex = portfolio.findIndex(asset => asset.ticker === assetToAdd.ticker);
    
    let updatedPortfolio = [...portfolio];
    
    if (existingAssetIndex >= 0) {
      // Atualizar quantidade se já existe
      updatedPortfolio[existingAssetIndex].quantity += assetToAdd.quantity;
    } else {
      // Adicionar novo ativo
      updatedPortfolio.push(assetToAdd);
    }
    
    // Atualizar estado
    setPortfolio(updatedPortfolio);
  };

  // Função para remover um ativo
  const handleRemoveAsset = (tickerToRemove) => {
    const updatedPortfolio = portfolio.filter(asset => asset.ticker !== tickerToRemove);
    setPortfolio(updatedPortfolio);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Minha Carteira</h1>
          <p className="text-gray-600">Acompanhe seus investimentos</p>
        </div>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
          onClick={() => setShowAddModal(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Adicionar Ativo
        </button>
      </div>
      
      {/* Resumo da carteira */}
      <Card>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Valor Total</p>
            <p className="text-xl font-bold">R$ {totalValue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Ações</p>
            <p className="text-xl font-bold">{distribution.stocks.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">FIIs</p>
            <p className="text-xl font-bold">{distribution.reits.toFixed(1)}%</p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="mb-2 font-medium">Distribuição Atual</p>
          <div className="flex h-5">
            <div 
              className="bg-blue-500 rounded-l" 
              style={{ width: `${distribution.stocks}%` }}
            ></div>
            <div 
              className="bg-green-500 rounded-r" 
              style={{ width: `${distribution.reits}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1">
            <p className="text-sm">Ações ({distribution.stocks.toFixed(1)}%)</p>
            <p className="text-sm">FIIs ({distribution.reits.toFixed(1)}%)</p>
          </div>
        </div>
      </Card>
      
      {/* Detalhes da carteira */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ações */}
        <Card>
          <div className="flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            <h2 className="text-lg font-bold">Ações</h2>
          </div>
          
          {stockAssets.length === 0 ? (
            <p className="text-gray-500">Nenhuma ação na carteira</p>
          ) : (
            <div className="space-y-4">
              {stockAssets.map((asset) => (
                <PortfolioItemCard 
                  key={asset.ticker} 
                  asset={asset} 
                  onRemove={handleRemoveAsset} 
                />
              ))}
            </div>
          )}
        </Card>
        
        {/* FIIs */}
        <Card>
          <div className="flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
            <h2 className="text-lg font-bold">Fundos Imobiliários</h2>
          </div>
          
          {reitAssets.length === 0 ? (
            <p className="text-gray-500">Nenhum FII na carteira</p>
          ) : (
            <div className="space-y-4">
              {reitAssets.map((asset) => (
                <PortfolioItemCard 
                  key={asset.ticker} 
                  asset={asset} 
                  onRemove={handleRemoveAsset} 
                />
              ))}
            </div>
          )}
        </Card>
      </div>
      
      {/* Modal para adicionar ativo */}
      <AddAssetModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddAsset={handleAddAsset}
      />
    </div>
  );
}

export default Dashboard;