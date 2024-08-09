"use client"
import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  RowData,
  SortingState,
  Table as Table2,
  TableOptions,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CircleDot, PlusCircle, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Filmes {
    film_id: number,
    film_name: string,
    director: string,
    film_available: boolean,
    current_stock: number
}

declare module '@tanstack/table-core' {
    interface TableMeta<TData extends RowData> {
        updateData: any
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
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 999,
    })

    const [data, setData] = React.useState<any>(props.data)

    const columns = React.useMemo<ColumnDef<Filmes>[]> (
        () => [
            {
                accessorKey: "film_id",
                header: () => (
                    <div className="font-bold text-gray-100 text-center">ID</div>
                ),
                cell: ({ row }) => (
                    <div className="font-bold text-gray-300 text-center">{row.getValue("film_id")}</div>
                ),
            },
            {
                accessorKey: "film_name",
                header: () => (
                    <div className="font-bold text-gray-100 text-center">Nome do Filme</div>
                ),
                cell: ({ row }) => {
                    return (
                        <div className="font-bold text-gray-300 text-center">{row.getValue("film_name")}</div>
                    )
                },
            },
            {
                accessorKey: "director",
                header: () => (
                    <div className="font-bold text-gray-100 text-center">Director</div>
                ),
                cell: ({ row }) => (
                    <div className="font-bold text-gray-300 text-center">{row.getValue("director")}</div>
                ),
            },
            {
                accessorKey: "current_stock",
                header: () => (
                    <div className="font-bold text-gray-100 text-center">Quantidade de Copias</div>
                ),
                cell: ({ row }) => {
                    function Render(){
                        const [value, setValue] =  React.useState<string>(row.getValue("current_stock"))
                        return(
                        <div className="flex items-center content-center justify-center">
                            <Input type="number" value={value} onChange={(evt:any)=>{
                                setValue(evt.target.value)
                            }} onKeyPress={(evt:any)=>{
                                if(evt.key == "Enter"){
                                    table?.options?.meta?.updateData(row.index, value)
                                }
                            }} className="text-center text-white w-[100px]"/>
                        </div>
                        )
                    }
                    return <Render/>
                },
            },
            {
                accessorKey: "film_available",
                header: () => (
                    <div className="font-bold text-gray-100 text-center">Disponível</div>
                ),
                cell: ({ row }) => {
                    var texto = <p style={{
                        color: "red"
                    }}>Não</p>
                    if(row.getValue("film_available")){
                        texto = <p style={{
                            color: "rgb(0,255,0)"
                        }}>Sim</p>
                    }
                    return (
                        <div className="font-bold text-center">{texto}</div>    
                    )
                }
            },
            {
                id: "actions",
                header: () => (
                    <div className="font-bold text-gray-100 text-center">Remover</div>
                ),
                enableHiding: false,
                cell: ({ row }) => {
                    return (
                        <div className="flex justify-center">
                            <Button variant={"destructive"} onClick={() => table.options?.meta?.removeRow(row.index, row.original.film_id)} className="h-8 w-8 flex items-center justify-center p-1">
                                <Trash2/>
                            </Button>
                        </div>     
                    )
                },
            },
        ],[]
    )
    const deleteFilm = async (filmId: number) => {
        const response = await fetch(`/api/films`, {
            method: 'DELETE',
            headers: {
              "authorization": String(localStorage.getItem("token")),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filmId }),
          })
          var data = await response.json()
          if (!response.ok) {
            return toast.error(data.message) 
          } 
    }

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
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        onPaginationChange: setPagination,
        state: {
          pagination,
        },
        meta: {
            addRow: (data: any) => { 
                console.log(data)
                setData((prev: any) => [...prev, data])
            },
            removeRow: async (index: number, filmId: number) => {
                await deleteFilm(filmId)
                setData(data.filter((_row: Filmes, index2: number) => index != index2))
            },
            updateData: async (index: number, qntNumber: number) => {
                var tmpa: Array<Filmes>= data
                var tmp: Filmes | undefined = tmpa.find((f:Filmes, i:number)=> i == index)
                if(tmp){
                    const response = await fetch(`/api/films/${tmp.film_id}`, {
                        method: 'PUT',
                        headers: {
                          "authorization": String(localStorage.getItem("token")),
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ qntNumber }),
                    })
                    var data2 = await response.json()
                    if (!response.ok) {
                        return toast.error(data2.message)
                    }
                    tmp.current_stock = qntNumber
                    if(qntNumber <= 0) tmp.film_available = false
                    setData(tmpa)
                }
            }
        }
    })

    const [filters, setFilters] = React.useState<any>("")

    const filter = (e: any) => {
        setFilters(e.target.value)
        table.setGlobalFilter(e.target.value)
    }
    function handleFilmesAdd() {
        window.location.href = "paineladmin/films/new"
    }
    function handleHome() {
        window.location.href = "/"
    }

    return (
        <div className="container mx-auto px-4">
            <div className="my-6 text-center">
                <h1 className="text-3xl font-bold">Painel Adm</h1>
                <p className="text-lg text-gray-600">Escolha um filme para excluir na nossa coleção</p>
            </div>
            
            <div className="mb-6 flex justify-center space-x-1 ">
                <Button
                    variant="secondary"
                    onClick={handleHome}
                    className="text-white transition-colors bg-blue-600"
                >
                    Home
                </Button>
                <Button variant="secondary" onClick={handleFilmesAdd} className="text-white transition-colors">
                Adicionar um Filme
                </Button>
            </div>
            <div className="mb-6 flex justify-center">
                <Input
                placeholder="Filtrar Filmes"
                value={filters}
                onChange={filter}
                className="w-[50%] border rounded-lg p-2"
                />
            </div>
            <div className="overflow-x-auto border rounded-lg p-4 shadow-lg">
                <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup: any) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header: any) => (
                        <TableHead key={header.id} className="text-center">
                            {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                                )}
                        </TableHead>
                        ))}
                    </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row: any) => (
                        <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell: any) => (
                            <TableCell key={cell.id} className="text-center">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                        ))}
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                        Nenhum filme encontrado.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </div>
    )
}