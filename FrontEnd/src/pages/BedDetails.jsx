import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import mqtt from 'mqtt';

function BedDetails() {
  const { bedId } = useParams();
  // Estado para armazenar os dados dos sensores: { [sensor]: value }
  const [sensorData, setSensorData] = useState({});
  // Estado para armazenar os alertas críticos em um array (cada alerta é acumulado)
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const client = mqtt.connect('ws://broker.hivemq.com:8000/mqtt');

    client.on('connect', () => {
      // Inscreve-se para dados dos sensores e alertas da cama específica
      const sensorTopic = `paciente/${bedId}/#`;
      const alertTopic = `alertas_criticos/paciente/${bedId}/#`;
      client.subscribe([sensorTopic, alertTopic], (err) => {
        if (err) {
          console.error('Erro na inscrição:', err);
        } else {
          console.log(`Inscrito nos tópicos: ${sensorTopic} e ${alertTopic}`);
        }
      });
    });

    client.on('message', (topic, message) => {
      const msg = message.toString();
      // Se a mensagem for dos dados dos sensores (paciente/{bedId}/{sensor})
      if (topic.startsWith(`paciente/${bedId}/`)) {
        const parts = topic.split('/');
        if (parts.length >= 3) {
          const sensorKey = parts[2]; // Considera apenas o nome do sensor
          setSensorData(prev => ({ ...prev, [sensorKey]: msg }));
        }
      }
      // Se a mensagem for de alerta (alertas_criticos/paciente/{bedId}/{sensor})
      else if (topic.startsWith(`alertas_criticos/paciente/${bedId}/`)) {
        const parts = topic.split('/');
        if (parts.length >= 4) {
          const sensor = parts[3];
          const alertObj = {
            sensor,
            message: msg,
            timestamp: new Date().toLocaleTimeString()
          };
          
          setAlerts(prev => [...prev, alertObj]);
        }
      }
    });

    return () => {
      client.end();
    };
  }, [bedId]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Detalhes da Cama {bedId}</h2>
      
      <div>
        <h3>Dados dos Sensores</h3>
        {Object.keys(sensorData).length === 0 ? (
          <p>Sem dados disponíveis.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {Object.entries(sensorData).map(([sensor, value], idx) => (
              <li key={idx} style={{ marginBottom: '5px', padding: '5px', backgroundColor: '#f4f4f4' }}>
                <strong>{sensor}:</strong> {value}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Alertas Críticos</h3>
        {alerts.length === 0 ? (
          <p>Sem alertas críticos.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {alerts.map((alert, idx) => (
              <li key={idx} style={{ backgroundColor: 'red', color: 'white', padding: '8px', marginBottom: '5px', borderRadius: '5px' }}>
                <strong>{alert.sensor}:</strong> {alert.message} <em>({alert.timestamp})</em>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <Link to="/dashboard" style={{ textDecoration: 'none', padding: '8px 12px', backgroundColor: '#333', color: '#fff', borderRadius: '4px', display: 'inline-block', marginTop: '20px' }}>
        Voltar para o Dashboard
      </Link>
    </div>
  );
}

export default BedDetails;
