import sql from "@/modules/database"
import { GetMe } from "@/modules/getme"
import { NextRequest, NextResponse } from "next/server"

export async function POST (req: NextRequest) {
    const authheader = req.headers.get("authorization")
    const body = await req.json()
    if(body.length <= 0){
        return NextResponse.json({
            code: 400, 
            error: "Bad Request",
            dev: "FORM_INCOMPLETE",
            message: "Formulário imcompleto."
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
    for(var i = 0; i < body.length; i++){
        var c = body[i]
        if((c.current_stock - 1) <= 0){
            await sql `update films set film_available = ${false} where film_id = ${c.film_id}`
        }
        await sql `insert into rental (film_id, user_id, initial_date, final_date)
        values (${c.film_id}, ${user.user_id}, ${new Date().toLocaleDateString("pt-BR")}, ${c.returnDate})`

        await sql `update films set current_stock = ${c.current_stock - 1} where film_id = ${c.film_id}`
    }
    return NextResponse.json({
        code: 200, 
        error: "OK",
        dev: "OK",
    }, {
        status: 200
    })
}

export async function GET (req: NextRequest) {
    const authheader = req.headers.get("authorization")
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
    var data = await sql `
    select 
        rl.*,
        u.username as username,
        f.*
    from rental as rl
    join users as u
        on u.user_id = rl.user_id
    join films as f
        on f.film_id = rl.film_id`
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
        const { rental_id } = await req.json()
        
        if (!rental_id) {
            return NextResponse.json({
                code: 400,
                error: "Rent is required",
                dev: "RentalID is required"
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
                message: "user nao encotrado!"
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
        
        var data = await sql`select * from rental where rental_id = ${rental_id}`
        if(data.length <= 0){
            return NextResponse.json({
                code: 404, 
                error: "not found",
                dev: "RENTAL_ALREADY_EXIST",
                message: "Aluguel nao existente!"
            }, {
                status: 404
            })
        }
        console.log(data[0])
        await sql`DELETE FROM rental WHERE rental_id = ${rental_id}`
        await sql`UPDATE films set current_stock = (select f.current_stock + 1 as cs from films as f where f.film_id = ${data[0].film_id}) where film_id = ${data[0].film_id}`

        return NextResponse.json({
            code: 200,
            error: "OK",
            dev: "Rental deleted successfully"
        }, {
            status: 200
        })
}