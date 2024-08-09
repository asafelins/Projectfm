import sql from "./database"

export async function GetMe(token: string | null) {

    if(!token) return null
    
    var validtoken: any = token.split(":")

    if(validtoken.length < 2) return null

    validtoken = validtoken[0]

    if(!validtoken) return null

    var data = await sql`select * from users where token = ${validtoken}`

    if(data.length <= 0) return null
    
    return data[0]
}