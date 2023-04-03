import { format, } from "date-fns";
import React, { useState } from "react";
import { prisma } from "../../lib/prisma";
export default function Chat({ id, chat }) {
  const [message, setMessage] = useState("");
  const [onlineChat, setOnlineChat] = useState(chat);
  const inputRef = React.useRef(null);

  async function sendMessage(message) {
    inputRef.current.focus()
    if (message === "") return;
    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        name: id,
        message,
      })
    })
    setMessage("")
    await refreshChat()
  }

  async function refreshChat() {
    const response = await fetch("/api/chat")
    const result = await response.json()
    setOnlineChat(result)
  }

  return (<div className="w-full h-full bg-gray-100">
    <div>
      {onlineChat.map((item) => {
        return (
          <div key={item.id} className={`p-1 border-b-2 ${item.name === "Aslan" ? "border-blue-200 bg-blue-100 text-blue-500" : "bg-pink-100 border-pink-200 text-pink-500"}`}>
            <div>
              <h1 className={`text-sm font-bold uppercase`}>{item.name}</h1>
              <p className="text-xs ">{item.timestamp}</p>
            </div>
            <p className="text-black">{item.message}</p>
          </div>
        )
      })
      }
    </div>
    <div className="h-8 bg-blue-500 mx-auto">
      <div className="w-fit mx-auto">
        <input ref={inputRef} type="text" className="mt-1" placeholder="chat here" value={message} onChange={e => setMessage(e.target.value)} />
      </div>
      <div className="h-8 mx-auto w-fit">
        <button className="m-2 p-2 border-2 border-blue-500 rounded-md" onClick={() => sendMessage(message)}>send</button>
        <button className="m-2 p-2 border-2 border-blue-500 rounded-md" onClick={() => refreshChat()}>refresh</button>
      </div>
    </div>
  </div>)
}

//server props
export async function getServerSideProps(context) {
  const { query } = context;
  const { id } = query;
  let response = await prisma.message.findMany({
    select: {
      by: true,
      text: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  })
  response.sort(function (a, b) { return a.createdAt.getTime() - b.createdAt.getTime() });

  const pruned = response.map(item => ({ name: item.by, message: item.text, timestamp: format(item.createdAt, "yyyy-MM-dd HH:mm:ss") }))


  return {
    props: {
      id,
      chat: pruned
    },
  };
}