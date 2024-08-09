import { NextRequest, NextResponse } from "next/server"
import sql from "@/modules/database"
import { GetMe } from "@/modules/getme"

export async function PUT (req: NextRequest, params:{params: {id: string}}) {
    const authheader = req.headers.get("authorization")
        const { qntNumber } = await req.json()
        
        if (!qntNumber) {
            return NextResponse.json({
                code: 400,
                error: "Qtn is required",
                dev: "Qtn is required"
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
                message: "usuario nao encotrado!"
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
        var data = await sql`select f.* from films as f where film_id = ${params.params.id}`
        if(data.length <= 0){
            return NextResponse.json({
                code: 404, 
                error: "Conflict",
                dev: "FILM_NOT_EXIST",
                message: "Filme nao existente!"
            }, {
                status: 404
            })
        }
        var available = data[0].film_available == false ? true : false
        if(qntNumber <= 0) available =  false
        if(qntNumber > 0) available = true
        await sql`update films set current_stock = ${qntNumber}, film_available = ${available} WHERE film_id = ${params.params.id}`

        return NextResponse.json({
            code: 200,
            error: "OK",
            dev: "Film deleted successfully"
        }, {
            status: 200
        })
}