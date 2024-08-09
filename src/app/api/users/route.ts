import { NextRequest, NextResponse } from "next/server"
import sql from "@/modules/database"
import { GetMe } from "@/modules/getme"

export async function GET(req: NextRequest) {
    const data = await sql`SELECT * FROM users`
    return NextResponse.json({
        code: 200, 
        error: "OK",
        dev: "OK",
        data: data
    }, {
        status: 200
    })
}

export async function DELETE(req: NextRequest) {
    const authheader = req.headers.get("authorization")
        const { user_id } = await req.json()
        
        if (!user_id) {
            return NextResponse.json({
                code: 400,
                error: "user_id is required",
                dev: "user_id is required"
            }, {
                status: 400
            })
        }
        
        const user = await GetMe(authheader)
        if(!user){
            return NextResponse.json({
                code: 401,
                error: "User not found",
                dev: "USER_NOT_FOUND",
                message: "Usuario nao encotrado!"
            }, {
                status: 401
            })
        }
        
        if(user.admin == false){
            return NextResponse.json({
                code: 401,
                error: "User not admin",
                dev: "USER_NOT_ADMIN",
                message: "Usuario nao e um admin!"
            }, {
                status: 401
            })
        }

        await sql`DELETE FROM users WHERE user_id = ${user_id}`

        return NextResponse.json({
            code: 200,
            error: "OK",
            dev: "User deleted successfully"
        }, {
            status: 200
        })
}

export async function PUT(req: NextRequest) {
    const authheader = req.headers.get("authorization")
    const { user_id, admin } = await req.json()

        if (user_id == null || admin == null) {
            return NextResponse.json({
                code: 400,
                error: "user_id and admin status are required",
                dev: "user_id and admin status are required"
            }, {
                status: 400
            })
        }
        const user = await GetMe(authheader)
        if(!user){
            return NextResponse.json({
                code: 401,
                error: "User not found",
                dev: "USER_NOT_FOUND",
                message: "Usuario nao encotrado!"
            }, {
                status: 401
            })
        }
        
        if(user.admin == false){
            return NextResponse.json({
                code: 401,
                error: "User not admin",
                dev: "USER_NOT_ADMIN",
                message: "Usuario nao e um admin!"
            }, {
                status: 401
            })
        }
        await sql`UPDATE users SET admin = ${admin} WHERE user_id = ${user_id}`

        return NextResponse.json({
            code: 200,
            error: "OK",
            dev: "Admin status updated successfully"
        }, {
            status: 200
        })
}
