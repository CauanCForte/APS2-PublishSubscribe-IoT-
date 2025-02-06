import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import mqtt from 'mqtt';

function Dashboard() {

  const role = localStorage.getItem('userRole'); 

  // Dados mockados de camas
  const beds = [
    { id: 1, paciente: 'Paciente A' },
    { id: 2, paciente: 'Paciente B' },
    { id: 3, paciente: 'Paciente C' },
  ];

  // Estado para armazenar os alertas críticos por cama.
  const [alertsByBed, setAlertsByBed] = useState({});

  useEffect(() => {
    const client = mqtt.connect('ws://broker.hivemq.com:8000/mqtt');

    client.on('connect', () => {
      console.log('Connected to MQTT broker');
      // Inscreve no tópico de alertas críticos para todas as camas
      client.subscribe('alertas_criticos/paciente/#', (err) => {
        if (err) {
          console.error('Subscription error:', err);
        }
      });
    });

    client.on('message', (topic, message) => {
      const msg = message.toString();
      console.log('Received message:', topic, msg);
      //Esperado: alertas_criticos/paciente/{bedId}/{sensor}
      const parts = topic.split('/');
      if (parts.length >= 4) {
        const bedId = parts[2];
        const sensor = parts[3];
        setAlertsByBed(prev => {
          const bedAlerts = prev[bedId] || {};
          return {
            ...prev,
            [bedId]: {
              ...bedAlerts,
              [sensor]: msg
            }
          };
        });
      }
    });

    return () => {
      client.end();
    };
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard - Camas</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {beds.map(bed => {
          const bedAlerts = alertsByBed[bed.id] || {};
          const hasAlert = Object.keys(bedAlerts).length > 0;
          return (
            <li
              key={bed.id}
              style={{
                border: '1px solid #ccc',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '5px',
                backgroundColor: hasAlert ? 'red' : 'white',
                color: hasAlert ? 'white' : 'black'
              }}
            >{role === 'painel' ? (
              <Link
                to={`/bed/${bed.id}`}
                style={{
                  color: hasAlert ? 'white' : 'blue',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                Cama {bed.id} - {bed.paciente}
              </Link>) : (
                <>
                  Cama {bed.id} - {bed.paciente}
                </>
              )}
              {hasAlert && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Alertas:</strong>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {Object.entries(bedAlerts).map(([sensor, alertMsg], index) => (
                      <li
                        key={index}
                        style={{
                          padding: '5px',
                          borderBottom: '1px solid rgba(255,255,255,0.5)'
                        }}
                      >
                        {sensor}: {alertMsg}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <Link
        to="/dashboard"
        style={{
          textDecoration: 'none',
          padding: '8px 12px',
          backgroundColor: '#333',
          color: '#fff',
          borderRadius: '4px'
        }}
      >
        Atualizar Dashboard
      </Link>
    </div>
  );
}

export default Dashboard;
