import { format, } from "date-fns";
import React, { useEffect, useState } from "react";
import { prisma } from "../../lib/prisma";
import Link from "next/link";
import { useRouter } from "next/router";
export default function Chat({ id, chat }) {
  const [message, setMessage] = useState("");
  const [onlineChat, setOnlineChat] = useState(chat);
  const inputRef = React.useRef(null);
  const router = useRouter();

  function sendMessage() {
    // inputRef.current.focus()
    if (message === "") return;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/chat");
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          setMessage("")
          refreshChat()
        } else {
          console.log("Error: " + xhr.status);
        }
      }
    };
    xhr.send(JSON.stringify({
      name: id,
      message,
    }));
  }

  function refreshChat() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/chat");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          setOnlineChat(result);
        } else {
          console.log("Error: " + xhr.status);
        }
      }
    };
    xhr.send();
  }
  //refresh chat every 3 seconds with use effect
  useEffect(() => {
    const interval = setInterval(() => {
      refreshChat()
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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
    <div className={`h-8  mx-auto ${id === "Aslan" ? "bg-blue-500" : "bg-pink-500"}`}>
      <form action="/api/chat" method="post" onSubmit={() => {
        router.push("/chat?id=" + id)
      }}>
        <div className="w-fit mx-auto">
          <input type="hidden" name="id" value={id} />
          <input ref={inputRef} type="text" name="message" className="mt-1" placeholder="chat here" />
        </div>
        <div className="h-8 mx-auto w-fit">
          <button type="submit" className={`m-4 p-2 border-2 ${id === "Aslan" ? "border-blue-500" : "border-pink-500"}  rounded-md`} >send</button>
          <button className={`m-4 p-2 border-2 ${id === "Aslan" ? "border-blue-500" : "border-pink-500"}  rounded-md`} onClick={() => refreshChat()}>refresh</button>
          <Link href={"/"} className={`m-4 p-2 border-2 ${id === "Aslan" ? "border-blue-500" : "border-pink-500"}`} >
            Ev
          </Link>
        </div>
      </form>
    </div>
  </div >)
}

//server props
export async function getServerSideProps(context) {
  const { query } = context;
  const { id } = query;
  let response = await prisma.message.findMany({
    select: {
      id: true,
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

  const pruned = response.map(item => ({ id: item.id, name: item.by, message: item.text, timestamp: format(item.createdAt, "yyyy-MM-dd HH:mm:ss") }))


  return {
    props: {
      id,
      chat: pruned
    },
  };
}