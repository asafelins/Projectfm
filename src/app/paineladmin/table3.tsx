"use client"
import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
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
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Rent {
  rental_id: number
  film_id: number
  film_name: string
  username: string
  user_id: number
  initial_date: Date
  final_date: Date
}

interface TabelaUsuariosProps {
  data: Rent[]
}

export default function TabelaRents({ data: initialData }: TabelaUsuariosProps) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [open, setOpen] = React.useState<boolean>(false)
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 999,
  })
  const [data, setData] = React.useState<Rent[]>(initialData)
  const [filters, setFilters] = React.useState<string>("")

  const deleteUser = async (rental_id: number) => {
    
      const response = await fetch(`/api/films/rent`, {
        method: 'DELETE',
        headers: {
          "authorization": String(localStorage.getItem("token")),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rental_id }),
      })
      var data = await response.json()
      if (!response.ok) {
        return toast.error(data.message)
      }

      setData((prev) => prev.filter((rent: Rent) => rent.rental_id !== rental_id))
  }

  const columns = React.useMemo<ColumnDef<Rent>[]>(
    () => [
      {
        accessorKey: "rental_id",
        header: () => (
          <div className="font-bold text-gray-100 text-center">ID</div>
      ),
        cell: ({ row }) => <div className="font-bold text-gray-300">{row.getValue("rental_id")}</div>,
      },
      {
        accessorKey: "film_name",
        header: () => (
          <div className="font-bold text-gray-100 text-center">Filme</div>
      ),
        cell: ({ row }) => <div className="font-bold text-gray-300">{row.getValue("film_name")}</div>,
      },
      {
        accessorKey: "username",
        header: () => (
          <div className="font-bold text-gray-100 text-center">Usuario</div>
      ),
        cell: ({ row }) => <div className="font-bold text-gray-300">{row.getValue("username")}</div>,
      },  
      {
        accessorKey: "initial_date",
        header: () => (
          <div className="font-bold text-gray-100 text-center">Data de locacao</div>
      ),
        cell: ({ row }) => (
          <div className="font-bold text-gray-300">{new Date(row.getValue("initial_date")).toLocaleDateString("pt-BR")}</div>
        ),
      },
      {
        accessorKey: "final_date",
        header: () => (
          <div className="font-bold text-gray-100 text-center">Data de locacao</div>
      ),
        cell: ({ row }) => (
          <div className="font-bold text-gray-300">{new Date(row.getValue("final_date")).toLocaleDateString("pt-BR")}</div>
        ),
      },
      {
        id: "actions",
        header: () => (
          <div className="font-bold text-gray-100 text-center">Remover</div>
      ),
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Button
              variant={"destructive"}
              onClick={() => deleteUser(row.getValue("rental_id"))}
              className="h-8 w-8 flex items-center justify-center p-1 text-gray-300"
            >
              <Trash2 />
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
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
      updateData: () =>{
      },
      addRow: (newData: Rent) => {
        setData((prev) => [...prev, newData])
      },
      removeRow: (index: number) => {
        setData((prev) => prev.filter((_row, idx) => idx !== index))
      },
    },
  })

  const filter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(e.target.value)
    table.setGlobalFilter(e.target.value)
  }

  return (
    <div className="container mx-auto px-4">
      <div className="my-6">
        <h1 className="text-3xl font-bold text-center">Tabela de Filmes Alugados</h1>
        <p className="text-center text-lg text-gray-600">Lista de usuarios cadastrados.</p>
      </div>
      <div className="mb-6 flex justify-center">
        <Input
          placeholder="Filtrar Alugueis"
          value={filters}
          onChange={filter}
          className="w-[50%] border rounded-lg p-2"
        />
      </div>
      <div className="overflow-x-auto border rounded-lg p-4 shadow-lg">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-4 py-2 text-center text-gray-300">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-gray-700">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-2 text-center text-gray-200">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-400">
                  Sem Usuarios.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}