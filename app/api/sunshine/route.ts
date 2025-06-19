import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { date, hours, total } = await req.json()

    if (!date || !Array.isArray(hours) || typeof total !== "number") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const parsedDate = new Date(date)

    const existing = await prisma.sunshineData.findUnique({
      where: { date: parsedDate },
    })

    if (existing) {
      await prisma.sunshineData.update({
        where: { date: parsedDate },
        data: {
          hours,
          total,
          updatedAt: new Date(),
        },
      })
    } else {
      await prisma.sunshineData.create({
        data: {
          date: parsedDate,
          hours,
          total,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Sunshine API Error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


export async function GET() {
  try {
    const sunshineData = await prisma.sunshineData.findMany({
      orderBy: {
        date: "desc", // latest entries first
      },
    })

    return NextResponse.json(sunshineData)
  } catch (error) {
    console.error("Sunshine GET error:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}