import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1>Sobre o Air Sentinel</h1>
        
        <section className="about-section">
          <h2>Nossa Missão</h2>
          <p>
            O Air Sentinel é uma plataforma dedicada ao monitoramento da qualidade do ar 
            e concentrações de CO2 atmosférico. Utilizamos dados de satélites da NASA 
            para fornecer informações precisas e em tempo real sobre a qualidade do ar 
            em diferentes regiões.
          </p>
        </section>

        <section className="about-section">
          <h2>Tecnologia</h2>
          <p>
            Nossa aplicação integra dados dos satélites OCO-2, OCO-3 e MERRA-2 da NASA 
            para oferecer análises detalhadas sobre:
          </p>
          <ul>
            <li>Concentrações de CO2 atmosférico</li>
            <li>Tendências temporais de qualidade do ar</li>
            <li>Análises geográficas por região</li>
            <li>Recomendações baseadas nos níveis detectados</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Dados e Fontes</h2>
          <p>
            Utilizamos dados oficiais da NASA Earthdata, processados através de APIs 
            seguras e atualizadas regularmente. Todos os dados são validados e 
            apresentados com indicadores de qualidade e confiabilidade.
          </p>
        </section>

        <section className="about-section">
          <h2>Equipe</h2>
          <p>
            Desenvolvido durante o Hackathon Café, Código e Coragem, este projeto 
            representa o compromisso com a transparência ambiental e o acesso 
            democrático a informações sobre qualidade do ar.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;