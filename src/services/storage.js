// Salvar carteira do usuário
export const savePortfolio = (portfolio) => {
    localStorage.setItem('aiholdPortfolio', JSON.stringify(portfolio));
  };
  
  // Recuperar carteira do usuário
  export const getPortfolio = () => {
    const data = localStorage.getItem('aiholdPortfolio');
    return data ? JSON.parse(data) : [];
  };
  
  // Salvar configurações de alocação ideal
  export const saveAllocationSettings = (settings) => {
    localStorage.setItem('aiholdAllocationSettings', JSON.stringify(settings));
  };
  
  // Recuperar configurações de alocação ideal
  export const getAllocationSettings = () => {
    const data = localStorage.getItem('aiholdAllocationSettings');
    if (!data) {
      // Valores padrão se não existir configuração
      return {
        stocksPercentage: 70,
        reitsPercentage: 30,
        assetAllocations: {}
      };
    }
    return JSON.parse(data);
  };