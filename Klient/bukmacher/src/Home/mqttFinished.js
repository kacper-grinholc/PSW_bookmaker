import { v4 as uuidv4 } from 'uuid';
import mqtt from 'mqtt'

const host = '127.0.0.1'
const port = '1883'
const clientId = `mqtt_chat_client + ${uuidv4()} `

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
const eventFinished = 'eventFinished'


client.on('connect', () => {
    console.log('connected')
})

client.on('message', (topic, message) => {
    alert(message)
 })

export const connectToFinished = () => {
    client.subscribe(eventFinished, () => {
        console.log(`Subscribed to topic '${eventFinished}'`)
    })
}

export const sendAlert = (team1, team2, winner, odd) => {
    client.publish(eventFinished, `Event : ${team1} - ${team2} zakończony, wygrał ${winner} z kursem ${odd}!`)
}