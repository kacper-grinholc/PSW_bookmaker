import { v4 as uuidv4 } from 'uuid';
import mqtt from 'mqtt'
import $ from 'jquery'; 

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
const chatmetaData = 'chatmetaData'



client.on('connect', () => {
    console.log('connected')
    client.subscribe(chatmetaData, () => {
        console.log(`Subscribed to topic '${chatmetaData}'`)
    })
})



export const messageRecieve = (chatName, myUsername, messagesTextArea) => {
    client.on('message', (topic, message) => {
        if (topic === chatName) {
            const decoded = JSON.parse(message.toString())
            var username = decoded.username
            const msg = decoded.value
            console.log(username, msg)
            if (myUsername === username) {
                username = "Ja"
            }
            var today = new Date();
            var time = today.getHours() + ":" + today.getMinutes();
            messagesTextArea.append($('<div>').text(time + ": " + username + " - " + msg))
        }
    })
}

export const sendMessage = (chat, user, msg) => {
    client.publish(chat, JSON.stringify(
        {
            "username" : user,
            "value" : msg
        }
    ))
}

export const connectToChat = (chat) => {
    client.subscribe(chat, () => {
        console.log(`Subscribed to topic '${chat}'`)
      })
}

export const disconnectFromChat = (chat) => {
    client.unsubscribe(chat, () => {
        console.log(`Unsubscribed to topic '${chat}'`)
      })
}

export const createChat = (name) => {
    client.publish(chatmetaData, JSON.stringify(
        {
            "operation" : "ADD",
            "name" : name
        }
    ))
}

export const deleteChat = (name) => {
    client.publish(chatmetaData, JSON.stringify(
        {
            "operation" : "REMOVE",
            "name" : name
        }
    ))
   
}

export const reactToChats = (chatList) => {
    client.on('message', (topic, message) => {
        if (topic === chatmetaData) {
            const decoded = JSON.parse(message.toString())
            if (decoded.operation === "ADD") {
                console.log("new room created", decoded.name)
                $("#chatList").append('<option value=' + decoded.name +'>'+ decoded.name +'</option>');
            } else {
                console.log("room deleted", decoded.name)
                $("#chatList option[value='"+ decoded.name +"']").remove();
            }
        }
    })
}