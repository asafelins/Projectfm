import { NextRequest, NextResponse } from "next/server"
import sql from "@/modules/database"

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({
      code: 400,
      error: "Token is required",
      dev: "Token is required"
    }, {
      status: 400
    })
  }

    const user = await sql`SELECT user_id FROM users WHERE token = ${token}`
    
    if (user.length === 0) {
      return NextResponse.json({
        code: 404,
        error: "Token not found",
        dev: "Token not found"
      }, {
        status: 404
      })
    }

    const adminStatus = await sql`SELECT admin FROM users WHERE user_id = ${user[0].user_id}`
    
    if (adminStatus.length === 0) {
      return NextResponse.json({
        code: 404,
        error: "User not found",
        dev: "User not found"
      }, {
        status: 404
      })
    }

    return NextResponse.json({
      code: 200,
      isAdmin: adminStatus[0].admin
    }, {
      status: 200
    })
}
