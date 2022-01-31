import { useEffect, useState } from "react";
import { connect } from 'react-redux';
import { withRouter } from "react-router";
import Cookies from 'js-cookie'
import $ from 'jquery'; 
import jwt from 'jsonwebtoken';
import { connectToChat, disconnectFromChat, messageRecieve, sendMessage, reactToChats, createChat, deleteChat } from "./chatMqtt";
import { togglemode } from "./cssmode";


const Chat = ( props) => {

    const chatTopic = 'chatTopic' // domyślny czat

    useEffect(() => {
        if(Cookies.get("token") !== undefined){
            messageRecieve(chatTopic, jwt.decode(Cookies.get("token")).email.split("@")[0], $('#messages'))
        }
        reactToChats($('#chatList'))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    
    const [filter, setfilter] = useState("")

    const handlefilterChange = (event) => {
        if($('#msgInput').val() !== '') {
            $('#sendButton').prop('disabled', false);
         }
        setfilter((event.target.value));
    }

    const send = (message) =>{
        $('#msgInput').val("")
        $('#sendButton').prop('disabled', true);
        sendMessage(currentChat, jwt.decode(Cookies.get("token")).email.split("@")[0], message)
        setfilter("")
    }

    const connectionMsg = (message) =>{
        if (message){
            connectToChat(currentChat)
            sendMessage(currentChat, jwt.decode(Cookies.get("token")).email.split("@")[0], "Połączył się")
            message = jwt.decode(Cookies.get("token")).email.split("@")[0] + ": Połączono"
            $('#messages').append($('<div>').text(message))
            $('#connect').prop('disabled', true);
            $('#disconnect').prop('disabled', false);
        }
        else{
            disconnectFromChat(currentChat)
            sendMessage(currentChat, jwt.decode(Cookies.get("token")).email.split("@")[0], "Rozłączył się")
            message = jwt.decode(Cookies.get("token")).email.split("@")[0] + ": Rozłączono"
            $('#messages').append($('<div>').text(message))
            $('#disconnect').prop('disabled', true);
            $('#connect').prop('disabled', false);
        }
    }
    const [currentChat, setcurrentChat] = useState(chatTopic)

    const handlecurrentChatChange = (event) => {
        $('#messages').empty()
        disconnectFromChat(currentChat)
        sendMessage(currentChat, jwt.decode(Cookies.get("token")).email.split("@")[0], "Wyszedł z chatu")
        setcurrentChat((event.target.value));
        sendMessage((event.target.value), jwt.decode(Cookies.get("token")).email.split("@")[0], "Dołączył do chatu")
        connectToChat((event.target.value))
        messageRecieve(event.target.value, jwt.decode(Cookies.get("token")).email.split("@")[0], $('#messages'))
    }

    const [chatname, setchatname] = useState("")

    const handlechatnameChange = (event) => {
        setchatname((event.target.value));
    }

    const addRoom = (chatname) =>{
        createChat(chatname)
    }

    const deleteRoom = (chatname) =>{
        deleteChat(chatname)
    }
    const adminButtons = () => {
        if(Cookies.get("token") !== undefined){
          if(jwt.decode(Cookies.get("token")).access_level === "admin"){
            return(
                <div>
                    <div><input type="text" onChange={handlechatnameChange} /></div>
                    <button onClick={() => addRoom(chatname)}>Dodaj pokój</button>
                    <button onClick={() => deleteRoom(chatname)}>Usuń pokój</button>
                </div>
            )
          }
        }
      }

    if (Cookies.get("token") !== undefined){
        return (
            <div className="Karta">
                <h3 className={"h3" + togglemode()}>Chat</h3>
                <div className="selector">
                    <select name="chat" id="chatList" onChange={handlecurrentChatChange}>
                            <option value={chatTopic}>Główny chat</option>
                    </select> 
                    {adminButtons()}
                </div>
                <div className = "chatbuttons">
                <button className = "chatbutton" id="connect" onClick={() => connectionMsg(true)}>Połącz</button>
                <button className = "chatbutton" id="disconnect" onClick={() => connectionMsg(false)}>Rozłącz</button>
                </div>
                    <div className="Chat">
                        <div id="messages"></div>
                    </div>
                    <div className = "chatbuttons">
                        <input className = "chatbutton" type="text"  placeholder="Wiadmość"  onChange={handlefilterChange} id="msgInput"/>          
                        <button className = "chatbutton" id="sendButton" onClick={() => send(filter)}>Wyślij</button>
                    </div>
            </div>
        )
    }
    else if (Cookies.get("token") === undefined) {
        return (
            <h1>Brak uprawnień</h1>
        )
    }
};

export default withRouter(connect(null, null)(Chat));