import Link from "next/link";


export default function Home() {

  const handleClick = async (e) => {
    e.preventDefault();
    await fetch("/api/chat", {
      method: "DELETE",
    })
    console.log("clicked")
  }

  return (
    <>
      <main className={"bg-gray-100 w-full h-full"}>
        <h1 className={"text-md text-center font-bold text-lg"}>WhatŞap</h1>
        <div className="w-full">
          <div className="w-fit mx-auto mt-4">
            <Link href={"/chat?id=Aslan"} className="m-2 p-2 rounded-md font-bold text-blue-500 bg-blue-100 border-blue-400 border-2">
              Aslan
            </Link>
            <Link href={"/chat?id=Kaplan"} className="m-2 p-2 rounded-md font-bold text-pink-500 bg-pink-100 border-pink-400 border-2" >
              Kaplan
            </Link>
          </div>
          <div className="w-fit mx-auto mt-8">
            <button onClick={handleClick} className="m-2 p-2 rounded-md font-bold text-red-500 bg-red-100 border-red-400 border-2" >
              Delete All Chat
            </button>
          </div>
        </div>
      </main>
    </>
  )
}
