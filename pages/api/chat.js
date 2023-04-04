import prisma from "@/lib/prisma"
import { format } from "date-fns"
import { utcToZonedTime } from 'date-fns-tz'


// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log({ body: req.body.id })
    const { id, message } = req.body
    console.log(id, message)
    await prisma.message.create({
      data: {
        by: id,
        text: message,
      },
    })
    // res.status(200).json({ message: "ok" })
    return res.redirect(307, '/chat?id=' + req.body.id)
  } else if (req.method === 'DELETE') {
    await prisma.message.deleteMany()

    res.status(200).json({ message: "ok" })
    return
  }

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

  const pruned = response.map(item => ({ id: item.id, name: item.by, message: item.text, timestamp: format(utcToZonedTime(item.createdAt, "Europe/Istanbul"), "yyyy-MM-dd HH:mm:ss") }))
  res.status(200).json(pruned)
  return
}
