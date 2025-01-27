import random
import time
import paho.mqtt.client as mqtt

# Configurações do broker MQTT
BROKER = "broker.hivemq.com"
PORT = 1883

# IDs dos pacientes
PACIENTES = [1, 2, 3]

# Função para simular medições dos sensores
def gerar_dados_sensor():
    return {
        "frequencia_cardiaca": random.randint(50, 150),
        "saturacao_oxigenio": random.uniform(85, 100),
        "pressao_arterial_invasiva": (random.randint(90, 140), random.randint(60, 90)),
        "pressao_arterial_nao_invasiva": (random.randint(100, 160), random.randint(70, 100)),
        "frequencia_respiratoria": random.randint(12, 25),
        "temperatura": random.uniform(35.0, 40.0),
        "capnografia": random.uniform(30, 45)
    }

# Função para verificar condições críticas
def verificar_condicoes_criticas(dados):
    alertas = []
    if dados["frequencia_cardiaca"] > 120:
        alertas.append(f"Taquicardia detectada: {dados['frequencia_cardiaca']} BPM")
    if dados["saturacao_oxigenio"] < 90:
        alertas.append(f"Baixa saturação de oxigênio: {dados['saturacao_oxigenio']:.1f}%")
    if dados["temperatura"] > 38.5:
        alertas.append(f"Febre alta detectada: {dados['temperatura']:.1f} °C")
    return alertas

# Callback para quando a conexão for estabelecida
def on_connect(client, userdata, flags, rc, properties=None):
    print(f"Conectado ao broker MQTT com código de retorno: {rc}")

# Callback para erros
def on_log(client, userdata, level, buf):
    print(f"Log: {buf}")

# Configuração do cliente MQTT com MQTTv5
client = mqtt.Client(protocol=mqtt.MQTTv5)
client.on_connect = on_connect
client.on_log = on_log

client.connect(BROKER, PORT, 60)

try:
    while True:
        for paciente_id in PACIENTES:
            # Gera dados simulados para cada paciente
            dados_sensor = gerar_dados_sensor()

            # Publica os dados nos tópicos apropriados
            for sensor, valor in dados_sensor.items():
                topico = f"paciente/{paciente_id}/{sensor}"
                if isinstance(valor, tuple):
                    valor = f"{valor[0]}/{valor[1]}"
                client.publish(topico, valor, qos=1)

            # Verifica e publica alertas críticos
            alertas = verificar_condicoes_criticas(dados_sensor)
            for alerta in alertas:
                topico_alerta = f"alertas_criticos/paciente/{paciente_id}"
                client.publish(topico_alerta, alerta, qos=2)

        time.sleep(60)

except KeyboardInterrupt:
    print("Simulação interrompida pelo usuário.")
    client.disconnect()
