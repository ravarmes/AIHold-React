// Calcular valor total da carteira
export const calculateTotalValue = (assets) => {
    return assets.reduce((total, asset) => total + (asset.price * asset.quantity), 0);
  };
  
  // Calcular distribuição entre ações e FIIs
  export const calculateDistribution = (assets) => {
    const totalValue = calculateTotalValue(assets);
    if (totalValue === 0) return { stocks: 0, reits: 0 };
    
    const stocksValue = assets
      .filter(asset => asset.type === 'stock')
      .reduce((sum, asset) => sum + (asset.price * asset.quantity), 0);
      
    const reitsValue = assets
      .filter(asset => asset.type === 'reit')
      .reduce((sum, asset) => sum + (asset.price * asset.quantity), 0);
      
    return {
      stocks: (stocksValue / totalValue) * 100,
      reits: (reitsValue / totalValue) * 100
    };
  };
  
  // Calcular a porcentagem de cada ativo na carteira
  export const calculateAssetPercentages = (assets) => {
    const totalValue = calculateTotalValue(assets);
    if (totalValue === 0) return assets.map(asset => ({...asset, percentage: 0}));
    
    return assets.map(asset => ({
      ...asset,
      percentage: ((asset.price * asset.quantity) / totalValue) * 100
    }));
  };
  
  // Gerar recomendação de compra com base nas configurações e valor disponível
  export const generatePurchaseSuggestion = (currentAssets, settings, availableValue) => {
    // Se não houver configurações ou valor disponível, retornar array vazio
    if (!settings || !availableValue || availableValue <= 0) {
      return [];
    }
    
    const totalCurrentValue = calculateTotalValue(currentAssets);
    const { stocksPercentage, reitsPercentage, assetAllocations } = settings;
    
    // Combinar valor atual + novo investimento
    const totalAfterInvestment = totalCurrentValue + availableValue;
    
    // Valor ideal para ações e FIIs após o investimento
    const idealStocksValue = (stocksPercentage / 100) * totalAfterInvestment;
    const idealReitsValue = (reitsPercentage / 100) * totalAfterInvestment;
    
    // Valor atual em ações e FIIs
    const currentStocksValue = currentAssets
      .filter(asset => asset.type === 'stock')
      .reduce((sum, asset) => sum + (asset.price * asset.quantity), 0);
      
    const currentReitsValue = currentAssets
      .filter(asset => asset.type === 'reit')
      .reduce((sum, asset) => sum + (asset.price * asset.quantity), 0);
    
    // Diferença entre valor ideal e atual
    const stocksDeficit = idealStocksValue - currentStocksValue;
    const reitsDeficit = idealReitsValue - currentReitsValue;
    
    // Distribuir o valor disponível proporcionalmente aos déficits
    const totalDeficit = Math.max(0, stocksDeficit) + Math.max(0, reitsDeficit);
    
    let stocksAllocation = 0;
    let reitsAllocation = 0;
    
    if (totalDeficit > 0) {
      stocksAllocation = (Math.max(0, stocksDeficit) / totalDeficit) * availableValue;
      reitsAllocation = availableValue - stocksAllocation;
    } else {
      // Se não houver déficit, alocar conforme percentuais ideais
      stocksAllocation = (stocksPercentage / 100) * availableValue;
      reitsAllocation = availableValue - stocksAllocation;
    }
    
    // Gerar sugestões para ações
    const stockSuggestions = generateSuggestionsByType(
      currentAssets.filter(a => a.type === 'stock'),
      assetAllocations,
      stocksAllocation,
      'stock'
    );
    
    // Gerar sugestões para FIIs
    const reitSuggestions = generateSuggestionsByType(
      currentAssets.filter(a => a.type === 'reit'),
      assetAllocations,
      reitsAllocation,
      'reit'
    );
    
    // Combinar sugestões
    const allSuggestions = [...stockSuggestions, ...reitSuggestions];
    
    // Ordenar por deficit percentual (maior deficit primeiro)
    return allSuggestions.sort((a, b) => b.deficitPercentage - a.deficitPercentage);
  };
  
  // Função auxiliar para gerar sugestões por tipo de ativo
  const generateSuggestionsByType = (currentAssets, idealAllocations, availableValue, type) => {
    const suggestions = [];
    let remainingValue = availableValue;
    
    // Calcular valor total atual para esse tipo de ativo
    const currentTotalValue = currentAssets.reduce((sum, asset) => sum + (asset.price * asset.quantity), 0);
    
    // Para cada ativo desse tipo, calcular o deficit em relação ao percentual ideal
    const assetsWithDeficit = currentAssets.map(asset => {
      const ticker = asset.ticker;
      const currentValue = asset.price * asset.quantity;
      const idealPercentage = idealAllocations[ticker] || 0;
      const idealValueInType = (idealPercentage / 100) * currentTotalValue;
      const deficit = idealValueInType - currentValue;
      
      return {
        ...asset,
        deficit,
        deficitPercentage: currentValue > 0 ? (deficit / currentValue) * 100 : 0
      };
    });
    
    // Ordenar por maior deficit
    const sortedAssets = [...assetsWithDeficit].sort((a, b) => b.deficit - a.deficit);
    
    // Alocar o valor disponível começando pelos ativos com maior deficit
    for (const asset of sortedAssets) {
      if (remainingValue <= 0) break;
      
      // Quantas unidades podemos comprar com o valor disponível?
      const maxUnits = Math.floor(remainingValue / asset.price);
      if (maxUnits <= 0) continue;
      
      // Valor a investir neste ativo
      const investmentValue = maxUnits * asset.price;
      
      if (investmentValue > 0) {
        suggestions.push({
          ticker: asset.ticker,
          name: asset.name,
          price: asset.price,
          quantityToBuy: maxUnits,
          value: investmentValue,
          type: asset.type,
          deficitPercentage: asset.deficitPercentage
        });
        
        remainingValue -= investmentValue;
      }
    }
    
    return suggestions;
  };