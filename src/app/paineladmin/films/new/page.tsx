"use client"
import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { useRouter } from 'next/navigation'
import LoadingSpinner from './loading'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const formSchema = z.object({
    film_name: z.string({
        required_error: "Informe o nome do Filme!",
    }).min(2, { message: "O mínimo de caracteres é 2!" }).max(60, { message: "O máximo de caracteres é 60!" }),
    director: z.string({
        required_error: "Informe o Diretor!"
    }).min(2, { message: "O mínimo de caracteres é 2!" }).max(128),
    copy: z.string({
        required_error: "Informe a quantidade de cópias!"
    }).max(5),
})

export default function New() {
    const [loading, setLoading] = useState<boolean>(true)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            film_name: '',
            director: '',
            copy: ''
        }
    })
    const router = useRouter()

    useEffect(() => {
        async function checkAdminStatus() {
            let token = String(localStorage.getItem("token"))

            if(!token){
                return router.push('/login')
            }

            if(!token.endsWith("hgve51")){
                return router.push('/access-denied')
            }
            setLoading(false)
            return true
        }
        
        checkAdminStatus()
    }, [])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (values.film_name === values.director) {
            form.setError("film_name", {
                message: "Filme e Diretor Iguais!"
            })
            form.setError("director", {
                message: "Filme e Diretor Iguais!"
            })
            return
        }
        const res = await fetch("/api/films", {
            method: "POST",
            headers: {
                "authorization": String(localStorage.getItem("token")),
                "content-type": "application/json"
            },
            body: JSON.stringify(values)
        })
        const data = await res.json()
        console.log(data)
        if (res.status !== 200) {
            return toast.error(data.message)
        }
        form.setValue('film_name', '')
        form.setValue('director', '')
        form.setValue('copy', '')
        toast.success("Filme adicionado com sucesso!")
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-lg p-6 rounded-lg">
                <Card>
                    <CardHeader className='text-center '>
                        <h1 className='text-2xl font-bold text-center text-gray-100'> Adicione um novo filme</h1>
                    </CardHeader>
                    <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="film_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Nome Do Filme</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Filme" {...field} className="rounded-md text-gray-200" />
                                    </FormControl>
                                    <FormMessage className="text-red-500" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="director"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Nome do Diretor</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Diretor" {...field} className="rounded-md text-gray-200" />
                                    </FormControl>
                                    <FormMessage className="text-red-500" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="copy"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Quantidade de Cópias</FormLabel>
                                    <FormControl>
                                        <Input placeholder="*****" {...field} className="rounded-md text-gray-200" />
                                    </FormControl>
                                    <FormMessage className="text-red-500" />
                                </FormItem>
                            )}
                        />  
                        <div className="flex flex-wrap content-start gap-1">
                            <Button type="submit" className="w-full">Enviar</Button>
                            <Button type="button" onClick={() => router.push('/paineladmin')}variant={"secondary"} className="w-full">Painel Adm</Button>
                        </div>
                    </form>
                </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
