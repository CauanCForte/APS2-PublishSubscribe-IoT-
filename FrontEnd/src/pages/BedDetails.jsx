import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import mqtt from 'mqtt';

// Defina a ordem fixa dos sensores, se quiser manter a lógica anterior
const SENSOR_ORDER = [
  "frequencia_cardiaca",
  "saturacao_oxigenio",
  "pressao_arterial_invasiva",
  "pressao_arterial_nao_invasiva",
  "frequencia_respiratoria",
  "temperatura",
  "capnografia"
];

function BedDetails() {
  const { bedId } = useParams();
  
  // Estado para armazenar os dados dos sensores (normal)
  const [sensorData, setSensorData] = useState({});
  
  // Em vez de um array de alertas, criamos um OBJETO
  // Estrutura: { [sensorName]: { message, timestamp } }
  const [alertsBySensor, setAlertsBySensor] = useState({});

  useEffect(() => {
    const client = mqtt.connect('ws://broker.hivemq.com:8000/mqtt');

    client.on('connect', () => {
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

      // Se for dados normais do sensor: paciente/{bedId}/{sensor}
      if (topic.startsWith(`paciente/${bedId}/`)) {
        const parts = topic.split('/');
        if (parts.length >= 3) {
          const sensorKey = parts[2];
          setSensorData(prev => ({ ...prev, [sensorKey]: msg }));
        }
      }
      // Se for alerta crítico: alertas_criticos/paciente/{bedId}/{sensor}
      else if (topic.startsWith(`alertas_criticos/paciente/${bedId}/`)) {
        const parts = topic.split('/');
        if (parts.length >= 4) {
          const sensorName = parts[3];
          
          // Cria objeto com a mensagem e o timestamp atual
          const alertObj = {
            message: msg,
            timestamp: new Date().toLocaleTimeString()
          };

          // Atualiza "alertsBySensor" sem acumular duplicados
          setAlertsBySensor(prev => ({
            ...prev,
            [sensorName]: alertObj  // sobrescreve se já existir esse sensor
          }));
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
        {SENSOR_ORDER.map((sensorName) => {
          const value = sensorData[sensorName];
          return (
            <div
              key={sensorName}
              style={{
                marginBottom: '5px',
                padding: '5px',
                backgroundColor: '#f4f4f4',
              }}
            >
              <strong>{sensorName}:</strong>{' '}
              {value !== undefined ? value : 'Sem dados ainda'}
            </div>
          );
        })}
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Alertas Críticos</h3>
        {Object.keys(alertsBySensor).length === 0 ? (
          <p>Sem alertas críticos.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {Object.entries(alertsBySensor).map(([sensorName, alertObj]) => (
              <li
                key={sensorName}
                style={{
                  backgroundColor: 'red',
                  color: 'white',
                  padding: '8px',
                  marginBottom: '5px',
                  borderRadius: '5px'
                }}
              >
                <strong>{sensorName}:</strong> {alertObj.message}{' '}
                <em>- Hora:({alertObj.timestamp})</em>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <Link
        to="/dashboard"
        style={{
          textDecoration: 'none',
          padding: '8px 12px',
          backgroundColor: '#333',
          color: '#fff',
          borderRadius: '4px',
          display: 'inline-block',
          marginTop: '20px'
        }}
      >
        Voltar para o Dashboard
      </Link>
    </div>
  );
}

export default BedDetails;

