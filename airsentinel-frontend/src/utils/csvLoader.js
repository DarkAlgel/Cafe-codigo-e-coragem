// Utilitário para carregar e processar dados CSV
export const loadCSVData = async () => {
  try {
    const response = await fetch('/src/data/dados_completos_NASA_aqi.csv');
    const csvText = await response.text();
    
    // Processar CSV
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const values = line.split(',');
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || '';
        });
        data.push(row);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao carregar CSV:', error);
    throw error;
  }
};

// Função para obter dados de "hoje" para uma cidade específica
export const getTodayDataForCity = (csvData, cityName) => {
  const cityData = csvData.filter(row => 
    row.Cidade && row.Cidade.toLowerCase().includes(cityName.toLowerCase())
  );
  
  // Retorna a primeira linha (simula "hoje")
  return cityData.length > 0 ? cityData[0] : null;
};

// Função para obter dados dos próximos N dias para uma cidade
export const getNextDaysData = (csvData, cityName, days = 3) => {
  const cityData = csvData.filter(row => 
    row.Cidade && row.Cidade.toLowerCase().includes(cityName.toLowerCase())
  );
  
  return cityData.slice(0, days);
};

// Função para obter dados históricos (últimos N dias)
export const getHistoricalData = (csvData, cityName, days = 30) => {
  const cityData = csvData.filter(row => 
    row.Cidade && row.Cidade.toLowerCase().includes(cityName.toLowerCase())
  );
  
  return cityData.slice(0, Math.min(days, cityData.length));
};

// Função para determinar categoria e cor do AQI
export const getAQICategory = (aqi) => {
  const aqiValue = parseInt(aqi);
  
  if (aqiValue <= 50) {
    return { category: 'Bom', color: '#4CAF50' };
  } else if (aqiValue <= 100) {
    return { category: 'Moderado', color: '#FFEB3B' };
  } else if (aqiValue <= 150) {
    return { category: 'Insalubre p/ grupos sensíveis', color: '#FF9800' };
  } else if (aqiValue <= 200) {
    return { category: 'Insalubre', color: '#F44336' };
  } else if (aqiValue <= 300) {
    return { category: 'Muito insalubre', color: '#9C27B0' };
  } else {
    return { category: 'Perigoso', color: '#800020' };
  }
};

// Função para verificar se deve mostrar alerta de saúde
export const shouldShowHealthAlert = (aqi) => {
  return parseInt(aqi) > 100;
};