import React, { useEffect, useState } from 'react'
// import user from "./Client.js"
import socketIo from "socket.io-client"
import "../css/chat.css";
import Message from "./message.js";
import ReactScrollToBottom from "react-scroll-to-bottom" 
import { useLocation } from 'react-router-dom';
const ENDPOINT=process.env.REACT_APP_BACKEND_URL
let socket;

const Chat = () => {
    const [id, setid] = useState("");
    const location = useLocation();
    const [messages,setMessages]=useState([]);
    const send=()=>{
        let message=document.getElementById("chatInput").value;
        if(message)socket.emit('message',{message,id})
        document.getElementById("chatInput").value="";
    }

  useEffect(() => {
    socket=socketIo(ENDPOINT,{transports : ['websocket']});
    socket.on('connect',()=>{
        setid(socket.id);
    })

    socket.emit("joined",{
        user: location.state?.username,
    });

    socket.on("welcome",(data)=>{
        console.log(data.user,data.message);
        setMessages([...messages,data]);
    })

    socket.on('userjoined',(data)=>{
        setMessages([...messages,data]);
    })
    
    socket.on('leave',(data)=>{
        setMessages([...messages,data]);
    })


    return () => {
        socket.emit('disconnected');
        socket.off();
    }
  }, [])

  useEffect(() => {

    socket.on('sendMessage',(data)=>{
        setMessages([...messages,data]);
    })
    return () => {
        socket.off();
    }
  }, [messages])
  
  
  return (
    <div className="chatPage">
            <div className="chatContainer">
                <ReactScrollToBottom className='chatBox' smooth={true}>
                    {messages.map((item,i)=><Message user={item.id===id ? '' : item.user} message={item.message} classs={item.id===id ? 'right' : 'left'} />)}
                </ReactScrollToBottom>
                <div className="inputBox">
                    <input onKeyPress={(e)=>e.key==='Enter' ? send() :null} type="text" placeholder='type message here ' id="chatInput" />
                    <button onClick={send} className="sendBtn"><img src='/send.png' alt='send'></img></button>
                </div>
            </div>
        </div>
  )
}

export default Chat