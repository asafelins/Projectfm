import { NextRequest, NextResponse } from "next/server"
const bcrypt = require('bcryptjs')
import sql from "@/modules/database"
import cryptojs from "crypto-js"

export async function POST(req: NextRequest) {
    const body = await req.json()
    if (!body.username || !body.password || !body.re_password || !body.email) {
        return NextResponse.json(
            {
                code: 400,
                error: "Bad Request",
                dev: "FORM_INCOMPLETE",
                message: "Formulário incompleto.",
            },
            {
                status: 400,
            }
        )
    }

    if (body.password != body.re_password) {
        return NextResponse.json(
            {
                code: 400,
                error: "Bad Request",
                dev: "PASSWORD_MISSMATCH",
                message: "Senhas não correspondem!",
            },
            {
                status: 400,
            }
        )
    }

    var data = await sql`select COUNT(*) from users where username = ${body.username} or email = ${body.email}`
    if (data[0].count > 0) {
        return NextResponse.json(
            {
                code: 409,
                error: "Conflict",
                dev: "USER_ALREADY_EXIST",
                message: "Usuário ou Email já existentes!",
            },
            {
                status: 409,
            }
        )
    }

    var token = makeid(128)
    await sql`
        insert into users (username, password, email, creation_time, token)
        values (${body.username}, ${bcrypt.hashSync(body.password, 11)}, ${body.email}, ${new Date()}, ${token})`
    
    return NextResponse.json(
        {
            code: 200,
            error: "OK",
            dev: "OK",
            data: {
                token: await cryptojs.enc.Base64.stringify(cryptojs.enc.Utf8.parse(token)),
            },
        },
        {
            status: 200,
        }
    )
}

function makeid(length: number) {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    let counter = 0
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
        counter += 1
    }
    return result
}
