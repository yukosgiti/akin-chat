import prisma from "@/lib/prisma"
import { format } from "date-fns"

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log(req.body)
    const { name, message } = JSON.parse(req.body)
    console.log(name, message)
    await prisma.message.create({
      data: {
        by: name,
        text: message,
      },
    })
    res.status(200).json({ message: "ok" })
    return
  } else if (req.method === 'DELETE') {
    await prisma.message.deleteMany()
    res.status(200).json({ message: "ok" })
    return
  }

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
  res.status(200).json(pruned)
  return
}
