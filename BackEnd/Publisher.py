import random
import time
import paho.mqtt.client as mqtt

# Configurações do broker MQTT
BROKER = "broker.hivemq.com"
PORT = 1883

PATIENTS = [1, 2, 3]

# Simulador de sensores
sensor_generators = {
    "frequencia_cardiaca": lambda: random.randint(50, 150),
    "saturacao_oxigenio": lambda: round(random.uniform(85, 100), 1),
    "pressao_arterial_invasiva": lambda: f"{random.randint(90, 140)}/{random.randint(60, 90)}",
    "pressao_arterial_nao_invasiva": lambda: f"{random.randint(100, 160)}/{random.randint(70, 100)}",
    "frequencia_respiratoria": lambda: random.randint(12, 25),
    "temperatura": lambda: round(random.uniform(35.0, 40.0), 1),
    "capnografia": lambda: round(random.uniform(30, 45), 1)
}

# Gerador de sensores simulados
def generate_sensor_value(sensor):
    generator = sensor_generators.get(sensor, lambda: None)
    return generator()

# Condições críticas determinadas
critical_conditions = {
    "frequencia_cardiaca": (lambda value: value > 120, "Taquicardia detectada"),
    "saturacao_oxigenio": (lambda value: value < 90, "Baixa saturação de oxigênio"),
    "temperatura": (lambda value: value > 38.5, "Febre alta detectada")
}

# Verificador de condições críticas 
def verify_critical_conditions(sensor, value):
    condition = critical_conditions.get(sensor)
    return [condition[1]] if condition and condition[0](value) else []

client = mqtt.Client(protocol=mqtt.MQTTv5)
client.connect(BROKER, PORT, 60)
client.loop_start()

try:
    while True:
        for patient in PATIENTS:
            for sensor in sensor_generators.keys():
                value = generate_sensor_value(sensor)
                topic = f"paciente/{patient}/{sensor}"
                payload = str(value)

                client.publish(topic, payload, qos=1, retain=True)

                print(f"Paciente {patient} - {sensor}: {payload}")
                
                alerts = verify_critical_conditions(sensor, value)
                for alert in alerts:
                    alert_payload = f"{sensor}: {alert} ({value})"
                    alert_topic = f"alertas_criticos/paciente/{patient}/{sensor}"
                    client.publish(alert_topic, alert_payload, qos=2, retain=True)
                    print(f"Alerta para Paciente {patient} - {sensor}: {alert_payload}")

            time.sleep(5)
        time.sleep(10)
except KeyboardInterrupt:
    print("Simulação interrompida pelo usuário.")
    client.disconnect()
    client.loop_stop()
