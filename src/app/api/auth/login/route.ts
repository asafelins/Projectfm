import { NextRequest, NextResponse } from "next/server"
const bcrypt = require('bcryptjs')
import sql from "@/modules/database"

export async function POST (req: NextRequest) {
    const body = await req.json()
    if(!body.username || !body.password){
        return NextResponse.json({
            code: 400, 
            error: "Bad Request",
            dev: "FORM_INCOMPLETE",
            message: "Formulário imcompleto."
        }, {
            status: 400
        })
    }
    var data = await sql`select * from users where username = ${body.username}`
    if(data.length <= 0){
        return NextResponse.json({
            code: 404, 
            error: "Not Found",
            dev: "USER_NOT_FOUND",
            message: "usuario nao encontrado!"
        }, {
            status: 404
        })
    }
    var pass = bcrypt.compareSync(body.password, data[0].password)
    if(!pass){
        return NextResponse.json({
            code: 404, 
            error: "Not Found",
            dev: "USER_NOT_FOUND",
            message: "usuario nao encontrado!"
        }, {
            status: 404
        })
    }
    return NextResponse.json({
        code: 200, 
        error: "OK",
        dev: "OK",
        data: {
            token: (data[0].token)+":"+(data[0].admin == true ? "hgve51" : "726vsy"),
            username: (data[0].username),
            admin: (data[0].admin),
            user_id: (data[0].user_id)
        }
    }, {
        status: 200
    })
}