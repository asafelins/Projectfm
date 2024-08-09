"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TabelaFilmes from './table'
import TabelaUsuarios from './table2'
import LoadingSpinner from './loading'
import TabelaRents from './table3'

const Home: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [filmes, setFilms] = useState<Array<any>>([])
  const [users, setUsers] = useState<Array<any>>([])
  const [rents, setRents] = useState<Array<any>>([])
  const router = useRouter()


  useEffect(() => {
    async function fetchData() {
      
      let token = String(localStorage.getItem("token"))

      if(!token){
        return router.push('/login')
      }

      if(!token.endsWith("hgve51")){
        return router.push('/access-denied')
      }

        const resFilms = await fetch('/api/films', {
          method: 'GET',
        })
        const dataFilms = await resFilms.json()
        
        if (resFilms.status == 401){
          return router.push('/access-denied')
        }

        if (resFilms.ok && dataFilms.data) {
          setFilms(dataFilms.data)
        } else {
          console.error('Failed to fetch films data:', dataFilms)
        }

        const resUsers = await fetch('/api/users', {
          method: 'GET',
          headers:{ "authorization": String(localStorage.getItem("token"))}
        })
        const dataUsers = await resUsers.json()
        
        if (resUsers.ok && dataUsers.data) {
          setUsers(dataUsers.data)
        } else {
          console.error('Failed to fetch users data:', dataUsers)
        }
        const resRents = await fetch('/api/films/rent', {
          method: 'GET',
          headers:{ "authorization": String(localStorage.getItem("token"))}
        })
        const dataRents = await resRents.json()
        
        if (resRents.ok && dataRents.data) {
          setRents(dataRents.data)
        } else {
          console.error('Failed to fetch users data:', dataUsers)
        }
        setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <>
      <TabelaFilmes data={filmes} />
      <TabelaUsuarios data={users} />
      <TabelaRents data={rents} />
    </>
  )
}

export default Home
