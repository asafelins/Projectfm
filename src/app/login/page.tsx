"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const formSchema = z.object({
    username: z.string({
        required_error: "Informe o nome do utilizador!",
    }).min(4, { message: "O mínimo de caracteres é 4!" }).max(50, { message: "O máximo de caracteres é 50!" }),
    password: z.string({
        required_error: "Informe a senha!"
    }).max(128)
})

export default function Login() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        var res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(values)
        })
        var data = await res.json()
        if (res.status !== 200) {
            return toast.error(data.message)
        }
        localStorage.setItem("token", data.data.token)
        localStorage.setItem("username", data.data.username)
        localStorage.setItem("user_id", data.data.user_id)
        return window.location.href = "/"
    }

    function handleRegister() {
        window.location.href = "/register"
    }

    function handleHome() {
        window.location.href = "/"
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-8 space-y-2 rounded-lg">
                <Card>
                    <CardHeader>
                    <h2 className="text-2xl font-bold text-center text-gray-100">Login</h2>
                    </CardHeader>
                    <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Username" {...field} className="text-gray-200 border-gray-600" />
                                    </FormControl>
                                    <FormMessage className="text-red-500" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Password</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Password" {...field} type="password" className="text-gray-200 border-gray-600" />
                                    </FormControl>
                                    <FormMessage className="text-red-500" />
                                </FormItem>
                            )}
                        />
                        
                        <div className="flex flex-wrap content-start gap-1">
                            <Button type="submit" className="w-full ">Entrar</Button>
                            <Button type="button" onClick={handleRegister} variant={"outline"} className="w-full">Registrar</Button>
                            <Button type="button" onClick={handleHome} variant={"outline"} className="w-full">Home</Button>
                        </div>
                    </form>
                </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
