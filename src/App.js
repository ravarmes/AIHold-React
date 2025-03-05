import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Invest from './pages/Invest';

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [portfolio, setPortfolio] = useState([]);
  const [distribution, setDistribution] = useState({ stocks: 0, reits: 0 });
  const [totalValue, setTotalValue] = useState(0);
  const [settings, setSettings] = useState({
    stocksPercentage: 70,
    reitsPercentage: 30,
    assetAllocations: {}
  });
  const [investmentValue, setInvestmentValue] = useState(500);
  const [investSuggestions, setInvestSuggestions] = useState([]);
  const [selectedTickers, setSelectedTickers] = useState([]);

  // Carregar portfólio e configurações do localStorage ao iniciar
  useEffect(() => {
    const storedPortfolio = localStorage.getItem('aiholdPortfolio');
    const storedSettings = localStorage.getItem('aiholdSettings');
    
    if (storedPortfolio) {
      const parsedPortfolio = JSON.parse(storedPortfolio);
      setPortfolio(parsedPortfolio);
    }
    
    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings);
      setSettings(parsedSettings);
    } else {
      // Inicializar configurações se não existirem
      const initialSettings = {
        stocksPercentage: 70,
        reitsPercentage: 30,
        assetAllocations: {}
      };
      setSettings(initialSettings);
      localStorage.setItem('aiholdSettings', JSON.stringify(initialSettings));
    }
  }, []);

  // Atualizar distribuição e valor total quando o portfólio mudar
  useEffect(() => {
    if (portfolio.length > 0) {
      // Calcular valor total
      const total = portfolio.reduce((sum, asset) => sum + (asset.price * asset.quantity), 0);
      setTotalValue(total);
      
      // Calcular distribuição
      const stocksValue = portfolio
        .filter(asset => asset.type === 'stock')
        .reduce((sum, asset) => sum + (asset.price * asset.quantity), 0);
      
      const reitsValue = portfolio
        .filter(asset => asset.type === 'reit')
        .reduce((sum, asset) => sum + (asset.price * asset.quantity), 0);
      
      if (total > 0) {
        setDistribution({
          stocks: (stocksValue / total) * 100,
          reits: (reitsValue / total) * 100
        });
      }
      
      // Salvar no localStorage
      localStorage.setItem('aiholdPortfolio', JSON.stringify(portfolio));
    } else {
      setTotalValue(0);
      setDistribution({ stocks: 0, reits: 0 });
      localStorage.removeItem('aiholdPortfolio');
    }
  }, [portfolio]);

  // Calcular porcentagem de cada ativo
  const getPortfolioWithPercentages = () => {
    if (totalValue === 0) return portfolio.map(asset => ({...asset, percentage: 0}));
    
    return portfolio.map(asset => ({
      ...asset,
      percentage: ((asset.price * asset.quantity) / totalValue) * 100
    }));
  };

  // Componente de Tab personalizado
  const Tab = ({ children, isActive, onClick }) => (
    <div 
      className={`py-2 px-4 text-center cursor-pointer border-b-2 flex items-center justify-center ${
        isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-blue-500'
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  );

  // Separar ativos por tipo
  const assetsWithPercentage = getPortfolioWithPercentages();
  const stockAssets = assetsWithPercentage.filter(asset => asset.type === 'stock');
  const reitAssets = assetsWithPercentage.filter(asset => asset.type === 'reit');
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-6xl mx-auto p-5">
        {/* Tabs */}
        <div className="flex border-b mb-6">
          <Tab 
            isActive={activeTab === 0} 
            onClick={() => setActiveTab(0)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
            Carteira
          </Tab>
          <Tab 
            isActive={activeTab === 1} 
            onClick={() => setActiveTab(1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Configurações
          </Tab>
          <Tab 
            isActive={activeTab === 2} 
            onClick={() => setActiveTab(2)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
            Investir
          </Tab>
        </div>
        
        {/* Conteúdo principal */}
        {activeTab === 0 && (
          <Dashboard 
            portfolio={portfolio} 
            setPortfolio={setPortfolio} 
            distribution={distribution} 
            totalValue={totalValue} 
            stockAssets={stockAssets}
            reitAssets={reitAssets}
          />
        )}
        
        {activeTab === 1 && (
          <Settings 
            settings={settings}
            setSettings={setSettings}
            portfolio={portfolio}
            stockAssets={stockAssets}
            reitAssets={reitAssets}
          />
        )}
        
        {activeTab === 2 && (
  <Invest 
    portfolio={portfolio}
    setPortfolio={setPortfolio}  // Adicionamos este prop
    settings={settings}
    distribution={distribution}
    stockAssets={stockAssets}
    reitAssets={reitAssets}
    investmentValue={investmentValue}
    setInvestmentValue={setInvestmentValue}
    investSuggestions={investSuggestions}
    setInvestSuggestions={setInvestSuggestions}
    selectedTickers={selectedTickers}
    setSelectedTickers={setSelectedTickers}
  />
)}
      </div>
    </div>
  );
}

export default App;