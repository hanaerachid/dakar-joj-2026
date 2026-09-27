"use client"

import {
  useTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowData
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { features, type DataTableFeatures } from "@/utils/data-table-features"
import { Input } from "./ui/input"
import { useState } from "react"
import { useTranslation } from "react-i18next"

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[]
  data: TData[]
  filterBy?: string
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  filterBy,
}: DataTableProps<TData>) {
  const { t } = useTranslation()
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  )
  const table = useTable({
    features,
    data,
    columns,
    // onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      // sorting,
      columnFilters,
    },
  })

  return (
    <div>
      {filterBy && (
        <div className="flex items-center pb-4">
          <Input
            placeholder={t("search", "Search...")}
            value={(table.getColumn(filterBy || "name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(filterBy || "name")?.setFilterValue(event.target.value)
            }
            className="max-w-full md:max-w-sm"
          />
        </div>
      )}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t("business.not_found", "No results.")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}