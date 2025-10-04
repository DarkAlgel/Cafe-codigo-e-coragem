import React, { useState, useEffect } from 'react';
import { 
  Info, 
  Satellite, 
  Globe, 
  Calendar, 
  Database, 
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import apiService from '../services/apiService';
import './DatasetInfo.css';

const DatasetInfo = () => {
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadDatasetInfo();
  }, []);

  const loadDatasetInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const info = await apiService.getTempoDatasetInfo();
      setDatasetInfo(info);
    } catch (err) {
      setError('Erro ao carregar informações do dataset: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatResolution = (resolution) => {
    if (typeof resolution === 'object') {
      return `${resolution.spatial} (espacial), ${resolution.temporal} (temporal)`;
    }
    return resolution;
  };

  if (loading) {
    return (
      <div className="dataset-info loading">
        <div className="loading-spinner"></div>
        <p>Carregando informações do dataset...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dataset-info error">
        <p className="error-message">{error}</p>
        <button onClick={loadDatasetInfo} className="retry-btn">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!datasetInfo) {
    return null;
  }

  return (
    <div className="dataset-info">
      <div className="dataset-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="header-content">
          <div className="header-title">
            <Info className="header-icon" />
            <h3>Informações do Dataset TEMPO NO₂</h3>
          </div>
          <div className="expand-icon">
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="dataset-content">
          {/* Informações Básicas */}
          <div className="info-section">
            <h4>
              <Database className="section-icon" />
              Informações Básicas
            </h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Nome:</span>
                <span className="info-value">{datasetInfo.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Plataforma:</span>
                <span className="info-value">{datasetInfo.platform}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Instrumento:</span>
                <span className="info-value">{datasetInfo.instrument}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Nível de Processamento:</span>
                <span className="info-value">{datasetInfo.processing_level}</span>
              </div>
            </div>
            <div className="description">
              <p>{datasetInfo.description}</p>
            </div>
          </div>

          {/* Cobertura */}
          <div className="info-section">
            <h4>
              <Globe className="section-icon" />
              Cobertura
            </h4>
            <div className="coverage-grid">
              <div className="coverage-item">
                <span className="coverage-label">Espacial:</span>
                <span className="coverage-value">{datasetInfo.spatial_coverage}</span>
              </div>
              <div className="coverage-item">
                <span className="coverage-label">Temporal:</span>
                <span className="coverage-value">
                  {formatDate(datasetInfo.temporal_coverage.start)} - {formatDate(datasetInfo.temporal_coverage.end)}
                </span>
              </div>
              <div className="coverage-item">
                <span className="coverage-label">Resolução:</span>
                <span className="coverage-value">{formatResolution(datasetInfo.resolution)}</span>
              </div>
            </div>
          </div>

          {/* Dados Técnicos */}
          <div className="info-section">
            <h4>
              <Satellite className="section-icon" />
              Especificações Técnicas
            </h4>
            <div className="tech-grid">
              <div className="tech-item">
                <span className="tech-label">Formato:</span>
                <span className="tech-value">{datasetInfo.data_format}</span>
              </div>
              <div className="tech-item">
                <span className="tech-label">Variável Principal:</span>
                <span className="tech-value">{datasetInfo.primary_variable}</span>
              </div>
              {datasetInfo.auxiliary_variables && (
                <div className="tech-item full-width">
                  <span className="tech-label">Variáveis Auxiliares:</span>
                  <div className="variables-list">
                    {datasetInfo.auxiliary_variables.map((variable, index) => (
                      <span key={index} className="variable-tag">{variable}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notas de Uso */}
          {datasetInfo.usage_notes && (
            <div className="info-section">
              <h4>
                <FileText className="section-icon" />
                Notas de Uso
              </h4>
              <div className="usage-notes">
                {datasetInfo.usage_notes.map((note, index) => (
                  <div key={index} className="usage-note">
                    <span className="note-bullet">•</span>
                    <span className="note-text">{note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Citação */}
          {datasetInfo.citation && (
            <div className="info-section">
              <h4>
                <FileText className="section-icon" />
                Citação
              </h4>
              <div className="citation">
                <p className="citation-text">{datasetInfo.citation}</p>
                <button 
                  className="copy-citation-btn"
                  onClick={() => navigator.clipboard.writeText(datasetInfo.citation)}
                  title="Copiar citação"
                >
                  Copiar Citação
                </button>
              </div>
            </div>
          )}

          {/* Links Úteis */}
          <div className="info-section">
            <h4>
              <ExternalLink className="section-icon" />
              Links Úteis
            </h4>
            <div className="links-grid">
              <a 
                href="https://tempo.si.edu/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="info-link"
              >
                <ExternalLink className="link-icon" />
                Site Oficial TEMPO
              </a>
              <a 
                href="https://earthdata.nasa.gov/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="info-link"
              >
                <ExternalLink className="link-icon" />
                NASA Earthdata
              </a>
              <a 
                href="https://www.earthdata.nasa.gov/learn/find-data/near-real-time/tempo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="info-link"
              >
                <ExternalLink className="link-icon" />
                Documentação TEMPO
              </a>
            </div>
          </div>

          {/* Última Atualização */}
          <div className="last-updated">
            <Calendar className="calendar-icon" />
            <span>Informações atualizadas em: {new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasetInfo;