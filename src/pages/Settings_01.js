import React from 'react';
import Card from '../components/Card';

function Settings({ settings, setSettings, portfolio, stockAssets, reitAssets }) {
  // Função para atualizar a distribuição entre ações e FIIs
  const handleDistributionChange = (value) => {
    const newSettings = {
      ...settings,
      stocksPercentage: value,
      reitsPercentage: 100 - value
    };
    
    setSettings(newSettings);
    localStorage.setItem('aiholdSettings', JSON.stringify(newSettings));
  };
  
  // Função para atualizar a alocação de um ativo específico
  const handleAssetAllocationChange = (ticker, value, type) => {
    // Limitar valor entre 0 e 100
    value = Math.min(100, Math.max(0, value));
    
    // Atualizar a alocação do ativo
    const newSettings = {
      ...settings,
      assetAllocations: {
        ...settings.assetAllocations,
        [ticker]: value
      }
    };
    
    setSettings(newSettings);
    localStorage.setItem('aiholdSettings', JSON.stringify(newSettings));
  };
  
  // Função para salvar todas as configurações
  const handleSaveSettings = () => {
    localStorage.setItem('aiholdSettings', JSON.stringify(settings));
    alert('Configurações salvas com sucesso!');
  };

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
          <h2 className="text-lg font-bold mb-4">Alocação de Ações</h2>
          
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
                    <th className="px-4 py-2 text-right">Ideal</th>
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
                            className="w-16 text-right border rounded py-1 px-2" 
                            min="0"
                            max="100"
                            step="0.1"
                            value={settings.assetAllocations[asset.ticker] || 0}
                            onChange={(e) => handleAssetAllocationChange(
                              asset.ticker, 
                              parseFloat(e.target.value) || 0,
                              'stock'
                            )}
                          />
                          <span className="ml-1 text-xs">%</span>
                        </div>
                        
                        {/* Mostrar diferença entre porcentagem atual e ideal */}
                        {settings.assetAllocations[asset.ticker] > 0 && (
                          <div className="mt-1 text-xs text-right">
                            {(() => {
                              const diff = (asset.percentage || 0) - (settings.assetAllocations[asset.ticker] || 0);
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        
        {/* FIIs */}
        <Card>
          <h2 className="text-lg font-bold mb-4">Alocação de FIIs</h2>
          
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
                    <th className="px-4 py-2 text-right">Ideal</th>
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
                            className="w-16 text-right border rounded py-1 px-2" 
                            min="0"
                            max="100"
                            step="0.1"
                            value={settings.assetAllocations[asset.ticker] || 0}
                            onChange={(e) => handleAssetAllocationChange(
                              asset.ticker, 
                              parseFloat(e.target.value) || 0,
                              'reit'
                            )}
                          />
                          <span className="ml-1 text-xs">%</span>
                        </div>
                        
                        {/* Mostrar diferença entre porcentagem atual e ideal */}
                        {settings.assetAllocations[asset.ticker] > 0 && (
                          <div className="mt-1 text-xs text-right">
                            {(() => {
                              const diff = (asset.percentage || 0) - (settings.assetAllocations[asset.ticker] || 0);
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
      
      <div className="flex justify-end">
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleSaveSettings}
        >
          Salvar Configurações
        </button>
      </div>
    </div>
  );
}

export default Settings;