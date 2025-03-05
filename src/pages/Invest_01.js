import React from 'react';
import Card from '../components/Card';

function Invest({ 
  portfolio, 
  settings, 
  distribution, 
  stockAssets, 
  reitAssets,
  investmentValue,
  setInvestmentValue,
  investSuggestions,
  setInvestSuggestions,
  selectedTickers,
  setSelectedTickers
}) {
  // Função para gerar sugestões de investimento
  const generateSuggestions = () => {
    if (portfolio.length === 0) {
      alert('Adicione ativos à carteira antes de gerar sugestões.');
      return;
    }
    
    // Verificar se há alocações configuradas
    const hasAllocations = Object.keys(settings.assetAllocations).length > 0;
    if (!hasAllocations) {
      alert('Configure as alocações ideais dos ativos na tela de Configurações.');
      return;
    }
    
    if (investmentValue <= 0) {
      alert('Informe um valor válido para investimento.');
      return;
    }
    
    // Calcular quanto deve ir para ações e quanto para FIIs
    const stockDeficit = settings.stocksPercentage - distribution.stocks;
    const reitDeficit = settings.reitsPercentage - distribution.reits;
    
    let stocksAllocation = 0;
    let reitsAllocation = 0;
    
    if (stockDeficit > 0 && reitDeficit > 0) {
      // Ambos os tipos estão abaixo do ideal, distribuir pelo déficit
      const totalDeficit = stockDeficit + reitDeficit;
      stocksAllocation = (stockDeficit / totalDeficit) * investmentValue;
      reitsAllocation = investmentValue - stocksAllocation;
    } else if (stockDeficit > 0) {
      // Ações estão abaixo do ideal
      stocksAllocation = investmentValue;
    } else if (reitDeficit > 0) {
      // FIIs estão abaixo do ideal
      reitsAllocation = investmentValue;
    } else {
      // Proporção ideal
      stocksAllocation = (settings.stocksPercentage / 100) * investmentValue;
      reitsAllocation = investmentValue - stocksAllocation;
    }
    
    // Gerar sugestões por tipo de ativo
    const suggestions = [];
    
    // Para ações
    if (stocksAllocation > 0) {
      const stocksWithTarget = stockAssets.map(asset => {
        const currentPct = asset.percentage || 0;
        const targetPct = settings.assetAllocations[asset.ticker] || 0;
        const deficitPct = targetPct - currentPct;
        
        return {
          ...asset,
          deficitPct
          // Continuação de src/pages/Invest.js
        };
    }).sort((a, b) => b.deficitPct - a.deficitPct);
    
    let remainingValue = stocksAllocation;
    
    for (const asset of stocksWithTarget) {
      if (remainingValue < asset.price || asset.deficitPct <= 0) continue;
      
      const maxUnits = Math.floor(remainingValue / asset.price);
      if (maxUnits > 0) {
        const purchaseValue = maxUnits * asset.price;
        
        suggestions.push({
          ticker: asset.ticker,
          name: asset.name,
          price: asset.price,
          quantityToBuy: maxUnits,
          value: purchaseValue,
          type: 'stock'
        });
        
        remainingValue -= purchaseValue;
      }
    }
  }
  
  // Para FIIs
  if (reitsAllocation > 0) {
    const reitsWithTarget = reitAssets.map(asset => {
      const currentPct = asset.percentage || 0;
      const targetPct = settings.assetAllocations[asset.ticker] || 0;
      const deficitPct = targetPct - currentPct;
      
      return {
        ...asset,
        deficitPct
      };
    }).sort((a, b) => b.deficitPct - a.deficitPct);
    
    let remainingValue = reitsAllocation;
    
    for (const asset of reitsWithTarget) {
      if (remainingValue < asset.price || asset.deficitPct <= 0) continue;
      
      const maxUnits = Math.floor(remainingValue / asset.price);
      if (maxUnits > 0) {
        const purchaseValue = maxUnits * asset.price;
        
        suggestions.push({
          ticker: asset.ticker,
          name: asset.name,
          price: asset.price,
          quantityToBuy: maxUnits,
          value: purchaseValue,
          type: 'reit'
        });
        
        remainingValue -= purchaseValue;
      }
    }
  }
  
  setInvestSuggestions(suggestions);
  setSelectedTickers(suggestions.map(s => s.ticker));
};

// Toggle seleção de uma sugestão
const toggleSuggestion = (ticker) => {
  if (selectedTickers.includes(ticker)) {
    setSelectedTickers(selectedTickers.filter(t => t !== ticker));
  } else {
    setSelectedTickers([...selectedTickers, ticker]);
  }
};

// Calcular valor total das sugestões selecionadas
const totalSelected = investSuggestions
  .filter(s => selectedTickers.includes(s.ticker))
  .reduce((sum, s) => sum + s.value, 0);
  
const remainingValue = investmentValue - totalSelected;

return (
  <div>
    <h1 className="text-2xl font-bold mb-2">Investir</h1>
    <p className="text-gray-600 mb-6">Receba sugestões de investimento para otimizar sua carteira</p>
    
    {/* Input de valor para investimento */}
    <Card>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Valor disponível para investir</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 text-lg">R$</span>
          </div>
          <input
            type="number"
            className="block w-full pl-10 pr-4 py-3 border rounded-md text-lg"
            placeholder="Quanto você quer investir?"
            value={investmentValue}
            onChange={(e) => setInvestmentValue(Math.max(0, parseFloat(e.target.value) || 0))}
          />
        </div>
      </div>
      
      <button 
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded font-medium"
        onClick={generateSuggestions}
      >
        Gerar Sugestões
      </button>
    </Card>
    
    {/* Sugestões de investimento */}
    {investSuggestions.length > 0 && (
      <Card className="mt-6">
        <h2 className="text-lg font-bold mb-4">Sugestões de Investimento</h2>
        
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ativo</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {investSuggestions.map((suggestion) => (
                <tr key={suggestion.ticker}>
                  <td className="px-3 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedTickers.includes(suggestion.ticker)} 
                      onChange={() => toggleSuggestion(suggestion.ticker)}
                    />
                  </td>
                  <td className="px-3 py-4">
                    <p className="font-medium">{suggestion.ticker}</p>
                    <p className="text-sm text-gray-600">{suggestion.name}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                      suggestion.type === 'stock' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {suggestion.type === 'stock' ? 'Ação' : 'FII'}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-right">R$ {suggestion.price.toFixed(2)}</td>
                  <td className="px-3 py-4 text-right">{suggestion.quantityToBuy}</td>
                  <td className="px-3 py-4 text-right font-bold">
                    R$ {suggestion.value.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <hr className="my-4" />
        
        <div className="flex justify-between items-center">
          <div>
            <p className="font-bold">Valor total selecionado:</p>
            <p className="text-2xl font-bold text-blue-600">
              R$ {totalSelected.toFixed(2)}
            </p>
            <p className={`text-sm ${remainingValue >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {remainingValue >= 0 
                ? `Restante: R$ ${remainingValue.toFixed(2)}` 
                : `Excesso: R$ ${Math.abs(remainingValue).toFixed(2)}`}
            </p>
          </div>
          
          <button 
            className={`px-6 py-3 rounded font-medium flex items-center ${
              remainingValue >= 0 && selectedTickers.length > 0
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
            disabled={remainingValue < 0 || selectedTickers.length === 0}
            onClick={() => {
              alert('Operação simulada: Em um ambiente real, a compra seria executada.');
              setInvestSuggestions([]);
              setSelectedTickers([]);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Investir
          </button>
        </div>
      </Card>
    )}
    
    {portfolio.length === 0 && (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md mt-4">
        <p>Adicione ativos à sua carteira para receber sugestões de investimento.</p>
      </div>
    )}
    
    {portfolio.length > 0 && Object.keys(settings.assetAllocations).length === 0 && (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md mt-4">
        <p>Configure as alocações ideais dos ativos na tela de Configurações.</p>
      </div>
    )}
  </div>
);
}

export default Invest;