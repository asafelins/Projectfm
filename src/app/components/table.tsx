"use client"
import * as React from "react"
import Link from "next/link"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowData,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ShoppingCart } from "lucide-react"
import { toast } from "sonner"

interface Filmes {
    film_id: number,
    film_name: string,
    director: string,
    film_available: boolean,
    current_stock: number,
    returnDate: string
}

declare module '@tanstack/table-core' {
    interface TableMeta<TData extends RowData> {
        removeRow: any
        addRow: any
    }
}

export default function TabelaFilmes(props: any) {
    const [sendingData, setSendingData] = React.useState<any>(null)
    const [rowSelection, setRowSelection] = React.useState({})
    const [open, setOpen] = React.useState<boolean>(false)
    const [columnVisibility, setColumnVisibility] =
      React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
      []
    )
    const [sorting, setSorting] = React.useState<SortingState>([
        { id: 'film_id', desc: false }
    ])
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 999,
    })

    const [data, setData] = React.useState<any>(props.data)
    const [clickedIndices, setClickedIndices] = React.useState<Set<number>>(new Set())
    const [tab, setTab] = React.useState<'list' | 'cart'>('list')
    const [cart, setCart] = React.useState<Filmes[]>([])
    const [isLoggedIn, setIsLoggedIn] = React.useState(false)
    const [username, setUsername] = React.useState<string | null>(null)
    const [isadm, setIsadm] = React.useState(false)

    React.useEffect(() => {
        const token = localStorage.getItem("token")
        const storedUsername = localStorage.getItem("username")
        const storedAdmin = localStorage.getItem("token")?.endsWith("hgve51") ? true : false
        
        setIsLoggedIn(!!token)
        setUsername(storedUsername)
        setIsadm(storedAdmin)
    }, [])

    const handleDateChange = (filmId: number, date: string) => {
        setCart(cart.map(film =>
            film.film_id === filmId ? { ...film, returnDate: date } : film
        ))
    }

    const finalizeRental = async() => {
        if (cart.length === 0) {
          toast.error("O carrinho está vazio. Adicione pelo menos um item para finalizar o aluguel.")
          return
        }
      
        const today = new Date().toISOString().split('T')[0]
        const invalidDates = cart.filter(film => !film.returnDate || film.returnDate < today)
      
        if (invalidDates.length > 0) {
          toast.error("Por favor, defina uma data de devolução para todos os filmes e garanta que seja igual ou posterior à data atual.")
          return
        }
        var response = await fetch("/api/films/rent", {
            method: "POST",
            headers: {
                "authorization": String(localStorage.getItem("token")),
                "content-type": "application/json"
            },
            body: JSON.stringify(cart)
        })
        var data2 = await response.json()
        if(response.status != 200){
            return toast.error(data2.message)
        }
        toast.success("Aluguel finalizado com sucesso!")
        var tmpa: Array<Filmes>= data
        for(var i = 0; i < cart.length; i++){
            var tmp = tmpa.find((e:Filmes)=> e.film_id == cart[i].film_id)
            if(tmp){
                tmp.current_stock -= 1
            }
        }
        setData(tmpa)
        setCart([])
        setClickedIndices(new Set())
        return window.location.reload()
      }

    const columns = React.useMemo<ColumnDef<Filmes>[]> (
        () => [
            {
                accessorKey: "film_id",
                header: "ID",
                cell: ({ row }) => (
                    <div className="text-center">{row.getValue("film_id")}</div>
                ),
            },
            {
                accessorKey: "film_name",
                header: "Nome do Filme",
                cell: ({ row }) => (
                    <div className="text-center">{row.getValue("film_name")}</div>
                ),
            },
            {
                accessorKey: "director",
                header: "Diretor",
                cell: ({ row }) => (
                    <div className="text-center">{row.getValue("director")}</div>
                ),
            },
            {
                accessorKey: "current_stock",
                header: "Quantidade de cópias",
                cell: ({ row }) => (
                    <div className="text-center">{row.getValue("current_stock")}</div>
                ),
            },
            {
                accessorKey: "film_available",
                header: "Disponível",
                cell: ({ row }) => {
                    var texto = row.getValue("film_available") ? "Sim" : "Não"
                    return (
                        <div className="text-center">{texto}</div>
                    )
                }
            },
            {
                id: "actions",
                header: "Alugar",
                enableHiding: false,
                cell: ({ row }) => {
                    const isClicked = clickedIndices.has(row.index)
                    return (
                        <div className="flex justify-center items-center">
                            <Button 
                                variant={"outline"}
                                disabled={!row.getValue("film_available")}
                                onClick={() => {
                                    const newClickedIndices = new Set(clickedIndices)
                                    if (isClicked) {
                                        newClickedIndices.delete(row.index)
                                        setCart(cart.filter(film => film.film_id !== row.original.film_id))
                                    } else {
                                        newClickedIndices.add(row.index)
                                        setCart([...cart, { ...row.original, returnDate: '' }])
                                    }
                                    setClickedIndices(newClickedIndices)
                                }} 
                                className={`h-8 w-8 flex items-center justify-center p-1 
                                    ${isClicked ? 'bg-green-600' : 'bg-red-600'} 
                                    hover:bg-green-700 transition-colors`} 
                            >
                                <ShoppingCart className={`${isClicked ? 'text-green-900' : 'text-white'}`} />
                            </Button>
                        </div>
                    )
                },
            },
        ], [clickedIndices, cart]
    )

    const table = useReactTable({
        data: data,
        columns: columns,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,  
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
          pagination,
          sorting
        },
        meta: {
            updateData: () =>{
            },
            addRow: (data: any) => { 
                console.log(data)
                setData((prev: any) => [...prev, data])
            },
            removeRow: (index: number) => {
                setData(data.filter((_row: Filmes, index2: number) => index != index2))
            }
        }
    })

    const [filters, setFilters] = React.useState<any>("")

    const filter = (e: any) => {
        setFilters(e.target.value)
        table.setGlobalFilter(e.target.value)
    }

    function handleLoginLogout() {
        if (isLoggedIn) {
            localStorage.removeItem("token")
            localStorage.removeItem("username")
            localStorage.removeItem("user_id")
            setIsLoggedIn(false)
            window.location.href = "/"
        } else {
            window.location.href = "/login"
        }
    }

    function handlePainelAdmin() {
        window.location.href = "/paineladmin"
    }

    return (
        <div className="min-h-screen flex flex-col items-center py-10">
            <div className="container mx-auto px-6">
                <div className="flex flex-col items-center mb-8 ">
                    <h1 className="text-5xl font-bold mb-2 text-gray-100">Locadora de Filmes</h1>
                    <p className="text-lg mb-4 text-gray-300">Escolha um filme para alugar na nossa coleção</p>
                    <div className="flex items-center space-x-1 mb-6">
                        {isLoggedIn && (
                            <span className="text-lg font-semibold text-gray-200">{username}</span>
                        )}
                        <Button
                            variant="outline"
                            onClick={handleLoginLogout}
                            className={`text-white transition-colors ${isLoggedIn ? 'bg-red-600 hover:bg-red-800' : 'bg-blue-600 hover:bg-blue-800'}`}
                        >
                            {isLoggedIn ? "Logout" : "Login"}
                        </Button>
                        {isadm && (
                        <Button
                            variant="secondary"
                            onClick={handlePainelAdmin}
                            className="text-white transition-colors"
                        >
                            Painel Admin
                        </Button>
                        )}
                    </div>
                </div>
                <div className="mb-8 flex justify-center">
                    <Input
                        placeholder="Filtrar Filmes"
                        value={filters}
                        onChange={filter}
                        className="w-full max-w-md border rounded-lg p-2 text-gray-200"
                    />
                </div>
                <div className="flex justify-center space-x-4 mb-8">
                    <Button
                        variant={tab === 'list' ? 'default' : 'outline'}
                        onClick={() => setTab('list')}
                        className={`px-4 py-2 transition-colors`}
                    >
                        Lista de Filmes
                    </Button>
                    {isLoggedIn && (
                    <Button
                        variant={"secondary"}
                        onClick={() => setTab('cart')}
                        className={`px-4 py-2 ${tab === 'cart' ? 'text-white' : 'text-gray-200'} transition-colors`}
                    >
                        Carrinho ({cart.length})
                    </Button>
                    )}
                </div>
                {tab === 'list' && (
                <div className="overflow-x-auto border rounded-lg p-4 shadow-lg">
                    <Table className="min-w-full divide-y divide-gray-700">
                        <TableHeader>
                            {table.getHeaderGroups().map(headerGroup => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <TableHead key={header.id} className="px-4 py-2 text-center">
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    {...{
                                                        className: header.column.getCanSort()
                                                            ? 'cursor-pointer select-none text-gray-300'
                                                            : 'text-gray-300',
                                                        onClick: header.column.getToggleSortingHandler(),
                                                    }}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                    {{
                                                        asc: ' 🔼',
                                                        desc: ' 🔽',
                                                    }[header.column.getIsSorted() as string] ?? null}
                                                </div>
                                            )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map(row => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && 'selected'}
                                    >
                                        {row.getVisibleCells().map(cell => (
                                            <TableCell key={cell.id} className="px-4 py-2 text-center text-gray-200">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center text-gray-400">
                                        Nenhum filme encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                )}
                {tab === 'cart' && (
                    <div className="overflow-x-auto rounded-lg p-4 shadow-lg">
                        <Table className="min-w-full divide-y divide-gray-700">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-4 py-2 text-center text-gray-300">ID</TableHead>
                                    <TableHead className="px-4 py-2 text-center text-gray-300">Nome do Filme</TableHead>
                                    <TableHead className="px-4 py-2 text-center text-gray-300">Diretor</TableHead>
                                    <TableHead className="px-4 py-2 text-center text-gray-300">Data de Devolução</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cart.length > 0 ? (
                                    cart.map((film) => (
                                        <TableRow key={film.film_id}>
                                            <TableCell className="px-4 py-2 text-center text-gray-200">{film.film_id}</TableCell>
                                            <TableCell className="px-4 py-2 text-center text-gray-200">{film.film_name}</TableCell>
                                            <TableCell className="px-4 py-2 text-center text-gray-200">{film.director}</TableCell>
                                            <TableCell className="px-4 py-2 text-center text-gray-200">
                                                <input
                                                    type="date"
                                                    value={film.returnDate}
                                                    onChange={(e) => handleDateChange(film.film_id, e.target.value)}
                                                    className="border rounded-lg p-1 text-gray-200"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-gray-400">
                                            Nenhum filme no carrinho.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        {cart.length > 0 && (
                            <div className="flex justify-center mt-4">
                                <Button
                                    onClick={finalizeRental}
                                    className="bg-green-600 text-white hover:bg-green-800 transition-colors"
                                >
                                    Finalizar Aluguel
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}