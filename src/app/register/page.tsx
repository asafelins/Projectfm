"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const formSchema = z.object({
    username: z.string({
        required_error: "Informe o nome do utilizador!",
    }).min(4, { message: "O minimo de caracteres é 4!" }).max(50, { message: "O máximo de caracteres é 50!" }),
    password: z.string({
        required_error: "Informe a senha!"
    }).min(6, { message: "O minimo de caracteres é 6!" }).max(128),
    re_password: z.string({
        required_error: "Informe a senha!"
    }).min(6, { message: "O minimo de caracteres é 6!" }).max(128),
    email: z.string({
        required_error: "Informe o e-mail!"
    }).min(6, { message: "O minimo de caracteres é 6!" }).max(128).email()
})

export default function RegisterPage() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (values.password !== values.re_password) {
            form.setError("re_password", {
                message: "Senhas não correspondem!"
            })
            return false
        }
        values.username = values.username.toLowerCase()
        const res: Response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(values)
        })
        const data: any = await res.json()
        if (res.status !== 200) {
            return toast.error(data.message)
        }
        return window.location.href = "/login"
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-8 space-y-2 rounded-lg">
                <Card>
                    <CardHeader>
                        <h2 className="text-2xl font-bold text-center text-gray-100" >Registro</h2>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                                <FormField
                                    control={form.control}
                                    name="re_password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-300">Confirm Password</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Confirm Password" {...field} type="password" className="text-gray-200 border-gray-600" />
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-300">Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Email" {...field} type="email" className="text-gray-200 border-gray-600" />
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                    Registrar
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
