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
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

interface User {
  user_id: number
  username: string
  email: string
  admin: boolean
  active: boolean
}

interface TabelaUsuariosProps {
  data: User[]
}

export default function TabelaUsuarios({ data: initialData }: TabelaUsuariosProps) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [open, setOpen] = React.useState<boolean>(false)
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 999,
  })
  const [data, setData] = React.useState<User[]>(initialData)
  const [filters, setFilters] = React.useState<string>("")

  const deleteUser = async (user_id: number) => {
    
      const response = await fetch(`/api/users`, {
        method: 'DELETE',
        headers: {
          "authorization": String(localStorage.getItem("token")),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id }),
      })
      var data = await response.json()
      if (!response.ok) {
        return toast.error(data.message)
      }

      setData((prev) => prev.filter((user) => user.user_id !== user_id))
  }

  const updateAdminStatus = async (user_id: number, isAdmin: boolean) => {

      const response = await fetch(`/api/users`, {
        method: 'PUT',
        headers: {
          "authorization": String(localStorage.getItem("token")),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id, admin: isAdmin }),
      })
      var data = await response.json()
      if (!response.ok) {
        return toast.error(data.message)
      }

      setData((prev) =>
        prev.map((user) =>
          user.user_id === user_id ? { ...user, admin: isAdmin } : user
        )
      )
  }

  const columns = React.useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "user_id",
        header: () => (
          <div className="font-bold text-gray-100 text-center">ID</div>
      ),
        cell: ({ row }) => <div className="font-bold text-gray-300">{row.getValue("user_id")}</div>,
      },
      {
        accessorKey: "username",
        header: () => (
          <div className="font-bold text-gray-100 text-center">Username</div>
      ),
        cell: ({ row }) => <div className="font-bold text-gray-300">{row.getValue("username")}</div>,
      },
      {
        accessorKey: "email",
        header: () => (
          <div className="font-bold text-gray-100 text-center">Email</div>
      ),
        cell: ({ row }) => <div className="font-bold text-gray-300">{row.getValue("email")}</div>,
      },
      {
        accessorKey: "admin",
        header: () => (
          <div className="font-bold text-gray-100 text-center">Admin</div>
      ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center text-gray-300">
            <Button
              onClick={() =>
                updateAdminStatus(row.getValue("user_id"), !row.getValue("admin"))
              }
              variant="secondary"
              className="items-center text-gray-300"
            >
              {row.getValue("admin") ? "Remover Admin" : "Tornar Admin"}
            </Button>
          </div>
        ),
      },   
      {
        accessorKey: "active",
        header: () => (
          <div className="font-bold text-gray-100 text-center">Ativada</div>
      ),
        cell: ({ row }) => (
          <div className="font-bold text-gray-300">{row.getValue("active") ? "Sim" : "Não"}</div>
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
              onClick={() => deleteUser(row.getValue("user_id"))}
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
      addRow: (newData: User) => {
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
        <h1 className="text-3xl font-bold text-center">Tabela de Usuarios</h1>
        <p className="text-center text-lg text-gray-600">Lista de usuarios cadastrados.</p>
      </div>
      <div className="mb-6 flex justify-center">
        <Input
          placeholder="Filtrar Usuarios"
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