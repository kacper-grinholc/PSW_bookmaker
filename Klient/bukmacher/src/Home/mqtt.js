import { v4 as uuidv4 } from 'uuid';
import mqtt from 'mqtt'

const host = '127.0.0.1'
const port = '1883'
const clientId = `mqtt_client + ${uuidv4()} `

// connect options
const OPTIONS = {
    clientId,
    clean: true,
    connectTimeout: 4000,
    username: 'emqx',
    password: 'public',
    reconnectPeriod: 1000,
    protocol: 'mqtt'
}
const url = `mqtt://${host}:${port}`
const client = mqtt.connect(url, OPTIONS)
const eventsTopic = 'eventsTopic'

client.on('connect', () => {
    console.log('connected')
    client.subscribe(eventsTopic)
})

const usingMqtt = (eventTypeToactionMap) => {

    client.on('message', (topic, message) => {
        const decoded = JSON.parse(message.toString())
        if (decoded.eventType in eventTypeToactionMap) {
            console.log(decoded)
            eventTypeToactionMap[decoded.eventType](decoded.value)
        }
    })
}

export default usingMqtt