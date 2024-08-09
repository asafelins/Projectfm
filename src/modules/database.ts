import postgres from 'postgres'     

const sql = postgres(process.env.DATABASE_URL ?? "postgres://postgres:1234@localhost:5432/projectfm")

export default sql