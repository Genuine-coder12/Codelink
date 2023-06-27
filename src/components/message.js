import React from 'react'
import "../css/message.css";

const  Message = ({user,message,classs}) => {
  if(user)
  {
    return (
      <div className={`messageBox ${classs}`}>
        {`${user} : ${message}`}
      </div>
    )
  }else{
    return (
      <div className={`messageBox ${classs}`}>
        {`${message}`}
      </div>
    )
  }
  
}

export default Message
