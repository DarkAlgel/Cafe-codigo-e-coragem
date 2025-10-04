import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Air Sentinel API - NASA Earthdata Integration',
      version: '1.0.0',
      description: `
        API para integração com NASA Earthdata, permitindo acesso aos dados MERRA-2 M2IMNPASM.
        
        ## Autenticação
        Esta API utiliza autenticação Bearer Token. Para obter acesso:
        1. Registre-se no NASA Earthdata Login (https://urs.earthdata.nasa.gov/)
        2. Gere um token de acesso
        3. Configure as credenciais nas variáveis de ambiente
        4. Use o token JWT do Air Sentinel para autenticação nas rotas
        
        ## Dados Disponíveis
        - **M2IMNPASM**: Dados atmosféricos instantâneos do MERRA-2
        - **Variáveis**: Pressão, temperatura, umidade, vento, precipitação, radiação
        - **Resolução**: 0.5° x 0.625° (aproximadamente 50km)
        - **Cobertura**: Global
        - **Período**: 1980 até presente
        
        ## Rate Limiting
        - 100 requisições por hora por IP para endpoints NASA
        - 1000 requisições por hora limite da NASA Earthdata
        
        ## Formatos Suportados
        - JSON (padrão)
        - CSV
        - GeoJSON
      `,
      contact: {
        name: 'Air Sentinel Team',
        email: 'contact@airsentinel.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.airsentinel.com' 
          : 'http://localhost:3001',
        description: process.env.NODE_ENV === 'production' 
          ? 'Servidor de Produção' 
          : 'Servidor de Desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido através do endpoint de autenticação'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Mensagem de erro'
            },
            error: {
              type: 'string',
              example: 'Detalhes técnicos do erro'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operação realizada com sucesso'
            },
            data: {
              type: 'object',
              description: 'Dados retornados pela operação'
            }
          }
        },
        M2IMNPASMVariable: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'Surface Pressure'
            },
            standard_name: {
              type: 'string',
              example: 'PS'
            },
            unit: {
              type: 'string',
              example: 'Pa'
            },
            description: {
              type: 'string',
              example: 'Pressão atmosférica na superfície'
            },
            data_type: {
              type: 'string',
              example: 'float32'
            },
            valid_range: {
              type: 'array',
              items: {
                type: 'number'
              },
              example: [50000, 110000]
            }
          }
        },
        M2IMNPASMData: {
          type: 'object',
          properties: {
            metadata: {
              type: 'object',
              properties: {
                granule_id: {
                  type: 'string',
                  example: 'MERRA2_400.inst1_2d_asm_Nx.20230101.nc4'
                },
                title: {
                  type: 'string',
                  example: 'MERRA-2 inst1_2d_asm_Nx: 2d,1-Hourly,Instantaneous,Single-Level,Assimilation,Single-Level Diagnostics'
                },
                data_center: {
                  type: 'string',
                  example: 'GES DISC'
                },
                processing_level: {
                  type: 'string',
                  example: 'Level 3'
                }
              }
            },
            temporal_coverage: {
              type: 'object',
              properties: {
                start_date: {
                  type: 'string',
                  format: 'date-time',
                  example: '2023-01-01T00:00:00Z'
                },
                end_date: {
                  type: 'string',
                  format: 'date-time',
                  example: '2023-01-01T23:59:59Z'
                },
                temporal_resolution: {
                  type: 'string',
                  example: 'Instantaneous'
                }
              }
            },
            spatial_coverage: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  example: 'global'
                },
                resolution: {
                  type: 'string',
                  example: '0.5° x 0.625°'
                },
                bounds: {
                  type: 'object',
                  properties: {
                    north: { type: 'number', example: 90 },
                    south: { type: 'number', example: -90 },
                    east: { type: 'number', example: 180 },
                    west: { type: 'number', example: -180 }
                  }
                }
              }
            },
            variables: {
              type: 'object',
              additionalProperties: {
                $ref: '#/components/schemas/M2IMNPASMVariable'
              }
            }
          }
        },
        NASAProduct: {
          type: 'object',
          properties: {
            concept_id: {
              type: 'string',
              example: 'C1276812863-GES_DISC'
            },
            title: {
              type: 'string',
              example: 'MERRA-2 inst1_2d_asm_Nx: 2d,1-Hourly,Instantaneous,Single-Level,Assimilation,Single-Level Diagnostics V5.12.4'
            },
            short_name: {
              type: 'string',
              example: 'M2I1NXASM'
            },
            version_id: {
              type: 'string',
              example: '5.12.4'
            },
            data_center: {
              type: 'string',
              example: 'GES_DISC'
            },
            processing_level_id: {
              type: 'string',
              example: '3'
            }
          }
        },
        UsageStats: {
          type: 'object',
          properties: {
            total_requests: {
              type: 'integer',
              example: 1250
            },
            requests_today: {
              type: 'integer',
              example: 45
            },
            most_requested_variables: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  variable: { type: 'string', example: 'T2M' },
                  count: { type: 'integer', example: 320 }
                }
              }
            },
            average_response_time: {
              type: 'number',
              example: 1.25,
              description: 'Tempo médio de resposta em segundos'
            },
            data_volume_processed: {
              type: 'string',
              example: '2.5 GB',
              description: 'Volume total de dados processados'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'NASA Earthdata',
        description: 'Endpoints para integração com NASA Earthdata e dados MERRA-2'
      },
      {
        name: 'Authentication',
        description: 'Endpoints de autenticação e autorização'
      },
      {
        name: 'Air Quality',
        description: 'Endpoints de qualidade do ar'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ]
};

const specs = swaggerJsdoc(options);

// Configuração customizada do Swagger UI
const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #2c5aa0 }
    .swagger-ui .scheme-container { background: #f7f7f7; padding: 10px; border-radius: 5px }
  `,
  customSiteTitle: 'Air Sentinel API - NASA Earthdata',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
    requestInterceptor: (req) => {
      // Adicionar headers customizados se necessário
      req.headers['X-API-Source'] = 'Air-Sentinel-Swagger';
      return req;
    }
  }
};

export { specs, swaggerUi, swaggerUiOptions };