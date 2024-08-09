import { NextRequest, NextResponse } from "next/server"
import sql from "@/modules/database"
import { GetMe } from "@/modules/getme"

export async function POST (req: NextRequest) {
    const authheader = req.headers.get("authorization")
    const body = await req.json()
    if(!body.film_name || !body.director || !body.copy){
        return NextResponse.json({
            code: 400, 
            error: "Bad Request",
            dev: "FORM_INCOMPLETE",
            message: "Formulário imcompleto."
        }, {
            status: 400
        })
    }
    if(body.film_name == body.director){
        return NextResponse.json({
            code: 409, 
            error: "Bad Request",
            dev: "NAME_AND_DIRECTOR_EQUALS",
            message: "Nome do filme e igual ao do diretor.!"
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
    var data = await sql`select COUNT(*) from films where film_name = ${body.film_name}`
    if(data[0].count > 0){
        return NextResponse.json({
            code: 409, 
            error: "Conflict",
            dev: "FILM_ALREADY_EXIST",
            message: "Filme ja existente!"
        }, {
            status: 409
        })
    }
    await sql`
            insert into films (film_name, director, current_stock)
            values (${body.film_name}, ${body.director}, ${body.copy})`
    return NextResponse.json({
        code: 200, 
        error: "OK",
        dev: "OK",
    }, {
        status: 200
    })
}

export async function GET (req: NextRequest){
    const data = await sql`select * from films`
    return NextResponse.json({
        code: 200, 
        error: "OK",
        dev: "OK",
        data: data
    }, {
        status: 200
    })
}

export async function DELETE (req: NextRequest) {
    const authheader = req.headers.get("authorization")
        const { filmId } = await req.json()
        
        if (!filmId) {
            return NextResponse.json({
                code: 400,
                error: "film is required",
                dev: "filmsId is required"
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
                message: "User nao encotrado!"
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

        await sql`DELETE FROM films WHERE film_id = ${filmId}`

        return NextResponse.json({
            code: 200,
            error: "OK",
            dev: "Film deleted successfully"
        }, {
            status: 200
        })
}