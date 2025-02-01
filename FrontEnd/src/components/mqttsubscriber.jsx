import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';

function MqttSubscriber() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Conectar ao broker HiveMQ via WebSocket
    const client = mqtt.connect('ws://broker.hivemq.com:8000/mqtt'); 

    client.on('connect', () => {
      console.log('Conectado ao broker MQTT via WebSocket!');
      // Inscreva-se nos tópicos publicados pelo Python
      client.subscribe('paciente/#', (err) => {
        if (!err) {
          console.log('Inscrito no tópico paciente/#');
        } else {
          console.error('Erro na inscrição:', err);
        }
      });
      // Opcional: inscrever para os alertas críticos, se desejar
      client.subscribe('alertas_criticos/paciente/#', (err) => {
        if (!err) {
          console.log('Inscrito no tópico alertas_criticos/paciente/#');
        } else {
          console.error('Erro na inscrição:', err);
        }
      });
    });

    client.on('message', (topic, message) => {
      const payload = message.toString();
      console.log('Recebido:', topic, payload);
      setMessages(prev => [...prev, { topic, payload }]);
    });

    return () => {
      client.end();
    };
  }, []);

  return (
    <div>
      <h2>Monitoramento em Tempo Real (MQTT Subscriber)</h2>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            <strong>{msg.topic}: </strong>
            {msg.payload}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MqttSubscriber;
