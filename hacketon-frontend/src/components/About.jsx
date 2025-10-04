import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1>About Air Sentinel</h1>
        
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            Air Sentinel is a platform dedicated to monitoring air quality 
            and atmospheric CO2 concentrations. We use NASA satellite data 
            to provide accurate and real-time information about air quality 
            in different regions.
          </p>
        </section>

        <section className="about-section">
          <h2>Technology</h2>
          <p>
            Our application integrates data from NASA's OCO-2, OCO-3 and MERRA-2 satellites 
            to offer detailed analyses on:
          </p>
          <ul>
            <li>Atmospheric CO2 concentrations</li>
            <li>Air quality temporal trends</li>
            <li>Geographic analyses by region</li>
            <li>Recommendations based on detected levels</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Data and Sources</h2>
          <p>
            We use official NASA Earthdata, processed through secure APIs 
            and updated regularly. All data is validated and 
            presented with quality and reliability indicators.
          </p>
        </section>

        <section className="about-section">
          <h2>Team</h2>
          <p>
            Developed during the Café, Código e Coragem Hackathon, this project 
            represents our commitment to environmental transparency and 
            democratic access to air quality information.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;