// Dados de exemplo iniciais de ativos disponíveis
const MOCK_ASSETS = {
    'PETR4': { name: 'Petrobras', price: 36.78, type: 'stock' },
    'VALE3': { name: 'Vale', price: 68.25, type: 'stock' },
    'ITUB4': { name: 'Itaú Unibanco', price: 34.56, type: 'stock' },
    'BBDC4': { name: 'Bradesco', price: 20.35, type: 'stock' },
    'ABEV3': { name: 'Ambev', price: 14.92, type: 'stock' },
    'HGLG11': { name: 'CSHG Logística', price: 162.50, type: 'reit' },
    'KNRI11': { name: 'Kinea Renda Imobiliária', price: 135.80, type: 'reit' },
    'MXRF11': { name: 'Maxi Renda', price: 10.75, type: 'reit' },
    'VISC11': { name: 'Vinci Shopping Centers', price: 108.15, type: 'reit' }
  };
  
  // Simulação de API externa para buscar dados de ativos
  export const fetchExternalAssetData = async (query) => {
    // Em um ambiente real, aqui seria feita uma requisição para uma API externa
    // como Alpha Vantage, Yahoo Finance, B3, etc.
    
    // Simulação de delay de rede
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    await delay(800);
    
    // Busca na base de dados de exemplo
    const localResults = Object.entries(MOCK_ASSETS)
      .filter(([ticker, asset]) => 
        ticker.toUpperCase().includes(query.toUpperCase()) || 
        asset.name.toUpperCase().includes(query.toUpperCase())
      )
      .map(([ticker, asset]) => ({
        ticker,
        ...asset
      }));
      
    // Se o ticker não existe localmente, simular um resultado "externo"
    // Se o ticker não existe localmente, simular um resultado "externo"
  if (localResults.length === 0 && query.length >= 4) {
    // Gera um preço aleatório baseado no ticker para simular dados reais
    const generatePrice = (ticker) => {
      // Usa o código ASCII dos caracteres para gerar um número "pseudo-aleatório" mas consistente
      const seed = ticker.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      return parseFloat((10 + (seed % 200)).toFixed(2));
    };
    
    // Determina o tipo de ativo baseado no formato do ticker
    const isReit = query.length >= 6 && query.endsWith('11');
    
    return [{
      ticker: query.toUpperCase(),
      name: `${isReit ? 'Fundo' : 'Empresa'} ${query.toUpperCase()}`,
      price: generatePrice(query.toUpperCase()),
      type: isReit ? 'reit' : 'stock',
      isExternal: true // Marcador para indicar que é um resultado externo
    }];
  }
  
  return localResults;
};

// Buscar todos os ativos disponíveis
export const fetchAvailableAssets = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_ASSETS);
    }, 300);
  });
};

// Buscar preços atualizados
export const fetchUpdatedPrices = async (tickers) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = {};
      tickers.forEach(ticker => {
        if (MOCK_ASSETS[ticker]) {
          // Simula uma pequena variação aleatória no preço
          const variation = (Math.random() - 0.5) * 0.02; // +/- 1%
          const price = MOCK_ASSETS[ticker].price * (1 + variation);
          result[ticker] = {
            ...MOCK_ASSETS[ticker],
            price: Number(price.toFixed(2))
          };
        }
      });
      resolve(result);
    }, 500);
  });
};