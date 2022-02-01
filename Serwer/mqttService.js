const mqtt = require('mqtt')

const host = '127.0.0.1'
const port = '1883'
const clientId = `mqtt_server`

// connect options
const OPTIONS = {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: 'emqx',
  password: 'public',
  reconnectPeriod: 1000,
}

let connectUrl = `ws://${host}:${port}`

const eventsTopic = 'eventsTopic'
const chatTopic = 'chatTopic'
const eventFinished = 'eventFinished'
const chatmetaData = 'chatmetaData'

const mqttClient = mqtt.connect(connectUrl, OPTIONS)

console.log(mqttClient.options.protocol)


mqttClient.on('connect', () => {
  console.log(`Connected`)
  mqttClient.subscribe([eventsTopic], () => {
    console.log(`Subscribe to topic '${eventsTopic}'`)
  })
  mqttClient.subscribe([chatTopic], () => {
    console.log(`Subscribe to topic '${chatTopic}'`)
  })
  mqttClient.subscribe([eventFinished], () => {
    console.log(`Subscribe to topic '${eventFinished}'`)
  })
  mqttClient.subscribe([chatmetaData], () => {
    console.log(`Subscribe to topic '${chatmetaData}'`)
  })
})

mqttClient.on('reconnect', (error) => {
  console.log(`Reconnecting:`, error)
})

mqttClient.on('error', (error) => {
  console.log(`Cannot connect:`, error)
})

mqttClient.on('message', (topic, payload) => {
  console.log('Received Message:', topic, payload.toString())
})

module.exports.eventMessage = (message) => {
  mqttClient.publish(eventsTopic, message, { qos: 0, retain: false }, (error) => {
    if (error) {
      console.error(error)
    }
  })
}
