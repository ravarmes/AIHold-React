import React, { useEffect, useState, useCallback } from 'react';
import Card from '../components/Card';

function Settings({ settings, setSettings, portfolio, stockAssets, reitAssets }) {
  // Estado local para rastrear os totais de alocação
  const [stocksAllocationTotal, setStocksAllocationTotal] = useState(0);
  const [reitsAllocationTotal, setReitsAllocationTotal] = useState(0);
  const [validationErrors, setValidationErrors] = useState({
    stocks: false,
    reits: false
  });

  // Função para atualizar a alocação de um ativo específico (usando useCallback)
  const handleAssetAllocationChange = useCallback((ticker, value, type) => {
    // Limitar valor entre 0 e 100
    value = Math.min(100, Math.max(0, value));
    
    // Clonar as alocações atuais
    const newAllocations = { ...settings.assetAllocations };
    newAllocations[ticker] = value;
    
    // Para manter o total em 100%, ajustar os outros ativos proporcionalmente
    const assetsOfSameType = type === 'stock' ? stockAssets : reitAssets;
    
    // Se houver mais de um ativo, garantir que o total não ultrapasse 100%
    if (assetsOfSameType.length > 1) {
      // Calcular o total atual sem o ativo que está sendo alterado
      const otherAssets = assetsOfSameType.filter(asset => asset.ticker !== ticker);
      const otherAssetsTotal = otherAssets.reduce((sum, asset) => {
        return sum + (newAllocations[asset.ticker] || 0);
      }, 0);
      
      const newAssetsTotal = otherAssetsTotal + value;
      
      // Se o total ultrapassar 100%, ajustar os outros ativos
      if (newAssetsTotal > 100) {
        // Fator de ajuste para reduzir proporcionalmente
        const reductionFactor = (100 - value) / otherAssetsTotal;
        
        // Ajustar cada ativo proporcionalmente
        otherAssets.forEach(asset => {
          const currentValue = newAllocations[asset.ticker] || 0;
          newAllocations[asset.ticker] = currentValue * reductionFactor;
        });
      }
    }
    
    // Atualizar as configurações
    const newSettings = {
      ...settings,
      assetAllocations: newAllocations
    };
    
    setSettings(newSettings);
    localStorage.setItem('aiholdSettings', JSON.stringify(newSettings));
  }, [settings, stockAssets, reitAssets, setSettings]);

  // Calcular totais de alocação quando as configurações mudarem
  useEffect(() => {
    // Calcular total para ações
    const stocksTotal = stockAssets.reduce((sum, asset) => {
      return sum + (settings.assetAllocations[asset.ticker] || 0);
    }, 0);
    
    // Calcular total para FIIs
    const reitsTotal = reitAssets.reduce((sum, asset) => {
      return sum + (settings.assetAllocations[asset.ticker] || 0);
    }, 0);
    
    setStocksAllocationTotal(stocksTotal);
    setReitsAllocationTotal(reitsTotal);
    
    // Verificar se os totais ultrapassam os limites definidos na distribuição da carteira
    setValidationErrors({
      stocks: stocksTotal > 100,
      reits: reitsTotal > 100
    });
    
    // Auto-ajustar para o caso de apenas um ativo do tipo
    if (stockAssets.length === 1 && stockAssets[0]?.ticker) {
      const ticker = stockAssets[0].ticker;
      // Definir como o percentual total de ações na distribuição
      if (settings.assetAllocations[ticker] !== 100) {
        handleAssetAllocationChange(ticker, 100, 'stock');
      }
    }
    
    if (reitAssets.length === 1 && reitAssets[0]?.ticker) {
      const ticker = reitAssets[0].ticker;
      // Definir como o percentual total de FIIs na distribuição
      if (settings.assetAllocations[ticker] !== 100) {
        handleAssetAllocationChange(ticker, 100, 'reit');
      }
    }
  }, [settings, stockAssets, reitAssets, handleAssetAllocationChange]);

  // Função para atualizar a distribuição entre ações e FIIs
  const handleDistributionChange = (value) => {
    const newSettings = {
      ...settings,
      stocksPercentage: value,
      reitsPercentage: 100 - value
    };
    
    // Se houver apenas um ativo de cada tipo, ajustar automaticamente seu percentual
    const newAllocations = { ...newSettings.assetAllocations };
    
    if (stockAssets.length === 1 && stockAssets[0]?.ticker) {
      // Ajustar o único ativo de ações para o novo percentual de ações
      newAllocations[stockAssets[0].ticker] = 100;
    }
    
    if (reitAssets.length === 1 && reitAssets[0]?.ticker) {
      // Ajustar o único ativo de FIIs para o novo percentual de FIIs
      newAllocations[reitAssets[0].ticker] = 100;
    }
    
    newSettings.assetAllocations = newAllocations;
    
    setSettings(newSettings);
    localStorage.setItem('aiholdSettings', JSON.stringify(newSettings));
  };
  
  // Normalizar percentuais para refletir a distribuição geral
  const getNormalizedPercentage = (assetPercentage, type) => {
    // Converter o percentual interno (de 0-100%) para o percentual global baseado na distribuição
    const distributionPercentage = type === 'stock' ? settings.stocksPercentage : settings.reitsPercentage;
    return (assetPercentage / 100) * distributionPercentage;
  };
  
  // Função para salvar todas as configurações
  const handleSaveSettings = () => {
    // Verificar se os totais estão dentro dos limites
    if (stocksAllocationTotal > 100 || reitsAllocationTotal > 100) {
      alert('A soma dos percentuais ideais não pode ultrapassar 100% para cada tipo de ativo. Por favor, ajuste as alocações antes de salvar.');
      return;
    }
    
    localStorage.setItem('aiholdSettings', JSON.stringify(settings));
    alert('Configurações salvas com sucesso!');
  };
  
  // Calcular o máximo permitido para cada tipo considerando a distribuição
  const stocksMaxAllowed = 100; // Percentual interno (0-100%)
  const reitsMaxAllowed = 100; // Percentual interno (0-100%)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Configurações</h1>
      <p className="text-gray-600 mb-6">Defina a alocação ideal da sua carteira</p>
      
      {/* Distribuição entre Ações e FIIs */}
      <Card>
        <h2 className="text-lg font-bold mb-4">Distribuição da Carteira</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Ações vs. FIIs</label>
          <div className="flex items-center">
            <p className="w-16 font-medium">{settings.stocksPercentage}%</p>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={settings.stocksPercentage} 
              onChange={(e) => handleDistributionChange(parseInt(e.target.value))}
              className="flex-1 mx-2"
            />
            <p className="w-16 text-right font-medium">{settings.reitsPercentage}%</p>
          </div>
          <div className="flex justify-between mt-1">
            <p className="text-sm">Ações</p>
            <p className="text-sm">FIIs</p>
          </div>
        </div>
        
        <div className="flex">
          <div 
            className="bg-blue-500 h-5 rounded-l" 
            style={{ width: `${settings.stocksPercentage}%` }}
          ></div>
          <div 
            className="bg-green-500 h-5 rounded-r" 
            style={{ width: `${settings.reitsPercentage}%` }}
          ></div>
        </div>
      </Card>
      
      {/* Configuração de ativos individuais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mt-6">
        {/* Ações */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Alocação de Ações ({settings.stocksPercentage}%)</h2>
            <div className={`text-sm font-medium ${validationErrors.stocks ? 'text-red-500' : 'text-green-500'}`}>
              Total interno: {stocksAllocationTotal.toFixed(1)}%
              {validationErrors.stocks && ' (Excede 100%)'}
            </div>
          </div>
          
          {stockAssets.length === 0 ? (
            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
              <p>Nenhuma ação na carteira. Adicione ações para configurar a alocação.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Ativo</th>
                    <th className="px-4 py-2 text-right">Atual</th>
                    <th className="px-4 py-2 text-right">% Interno</th>
                    <th className="px-4 py-2 text-right">% Carteira</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stockAssets.map((asset) => (
                    <tr key={asset.ticker}>
                      <td className="px-4 py-2 font-medium">{asset.ticker}</td>
                      <td className="px-4 py-2 text-right">{(asset.percentage || 0).toFixed(1)}%</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-end">
                          <input 
                            type="number" 
                            className={`w-16 text-right border rounded py-1 px-2 ${
                              (settings.assetAllocations[asset.ticker] || 0) > 100 ? 'border-red-500' : ''
                            }`}
                            min="0"
                            max="100"
                            step="0.1"
                            value={settings.assetAllocations[asset.ticker] || 0}
                            onChange={(e) => handleAssetAllocationChange(
                              asset.ticker, 
                              parseFloat(e.target.value) || 0,
                              'stock'
                            )}
                            disabled={stockAssets.length === 1} // Desabilitar se for o único ativo
                          />
                          <span className="ml-1 text-xs">%</span>
                        </div>
                        
                        {/* Mostrar diferença entre porcentagem atual e ideal */}
                        {settings.assetAllocations[asset.ticker] > 0 && (
                          <div className="mt-1 text-xs text-right">
                            {(() => {
                              const diff = (asset.percentage || 0) - getNormalizedPercentage(settings.assetAllocations[asset.ticker] || 0, 'stock');
                              const absText = Math.abs(diff).toFixed(1);
                              
                              if (diff > 1) {
                                return <span className="text-red-500">+{absText}% (excesso)</span>;
                              } else if (diff < -1) {
                                return <span className="text-blue-500">-{absText}% (falta)</span>;
                              } else {
                                return <span className="text-green-500">Balanceado</span>;
                              }
                            })()}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {getNormalizedPercentage(settings.assetAllocations[asset.ticker] || 0, 'stock').toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {stockAssets.length === 1 && (
            <div className="mt-3 text-sm text-blue-600">
              <p>Como há apenas uma ação, o percentual interno foi definido automaticamente para 100% (equivalente a {settings.stocksPercentage}% da carteira total).</p>
            </div>
          )}
        </Card>
        
        {/* FIIs */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Alocação de FIIs ({settings.reitsPercentage}%)</h2>
            <div className={`text-sm font-medium ${validationErrors.reits ? 'text-red-500' : 'text-green-500'}`}>
              Total interno: {reitsAllocationTotal.toFixed(1)}%
              {validationErrors.reits && ' (Excede 100%)'}
            </div>
          </div>
          
          {reitAssets.length === 0 ? (
            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
              <p>Nenhum FII na carteira. Adicione FIIs para configurar a alocação.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Ativo</th>
                    <th className="px-4 py-2 text-right">Atual</th>
                    <th className="px-4 py-2 text-right">% Interno</th>
                    <th className="px-4 py-2 text-right">% Carteira</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reitAssets.map((asset) => (
                    <tr key={asset.ticker}>
                      <td className="px-4 py-2 font-medium">{asset.ticker}</td>
                      <td className="px-4 py-2 text-right">{(asset.percentage || 0).toFixed(1)}%</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-end">
                          <input 
                            type="number" 
                            className={`w-16 text-right border rounded py-1 px-2 ${
                              (settings.assetAllocations[asset.ticker] || 0) > 100 ? 'border-red-500' : ''
                            }`}
                            min="0"
                            max="100"
                            step="0.1"
                            value={settings.assetAllocations[asset.ticker] || 0}
                            onChange={(e) => handleAssetAllocationChange(
                              asset.ticker, 
                              parseFloat(e.target.value) || 0,
                              'reit'
                            )}
                            disabled={reitAssets.length === 1} // Desabilitar se for o único ativo
                          />
                          <span className="ml-1 text-xs">%</span>
                        </div>
                        
                        {/* Mostrar diferença entre porcentagem atual e ideal */}
                        {settings.assetAllocations[asset.ticker] > 0 && (
                          <div className="mt-1 text-xs text-right">
                            {(() => {
                              const diff = (asset.percentage || 0) - getNormalizedPercentage(settings.assetAllocations[asset.ticker] || 0, 'reit');
                              const absText = Math.abs(diff).toFixed(1);
                              
                              if (diff > 1) {
                                return <span className="text-red-500">+{absText}% (excesso)</span>;
                              } else if (diff < -1) {
                                return <span className="text-blue-500">-{absText}% (falta)</span>;
                              } else {
                                return <span className="text-green-500">Balanceado</span>;
                              }
                            })()}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {getNormalizedPercentage(settings.assetAllocations[asset.ticker] || 0, 'reit').toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {reitAssets.length === 1 && (
            <div className="mt-3 text-sm text-green-600">
              <p>Como há apenas um FII, o percentual interno foi definido automaticamente para 100% (equivalente a {settings.reitsPercentage}% da carteira total).</p>
            </div>
          )}
        </Card>
      </div>
      
      {/* Informativo sobre validações */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <h3 className="text-blue-800 font-medium mb-2">Informações sobre as configurações</h3>
        <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
          <li>A soma dos percentuais ideais para cada tipo de ativo (ações ou FIIs) não deve ultrapassar o valor máximo definido na distribuição da carteira.</li>
          <li>
            Por exemplo: Se na distribuição da carteira foi definido 50% para ações e 50% para FIIs, então, o somatório de todos os percentuais ideais para ações e FIIs não deve ultrapassar 50%.
          </li>
          <li>Quando há apenas um ativo de cada tipo, seu percentual é automaticamente definido como o valor do percentual definido para o tipo de ativo (ações ou FIIs).</li>
          <li>
            Por exemplo: Se na distribuição da carteira foi definido 50% para ações e 50% para FIIs, e se existe apenas uma ação na alocação, então, essa ação é configurada com percentual ideal de 50%.
          </li>
        </ul>
      </div>
      
      {/* Botões de ação */}
      <div className="flex justify-end">
        <button 
          className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded ${
            validationErrors.stocks || validationErrors.reits ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleSaveSettings}
          disabled={validationErrors.stocks || validationErrors.reits}
        >
          Salvar Configurações
        </button>
      </div>
    </div>
  );
}

export default Settings;