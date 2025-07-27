"use client"

import { useEffect, useState, useCallback } from "react"
import { Search, Phone, Calendar, Trash2 } from "lucide-react"

import { useToast } from "@/hooks/use-toast"
import { getWaitlistEntries, deleteWaitlistEntry, WaitlistEntry } from "@/utils/api/waitlist"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function AdminWaitlist() {
  const [search, setSearch] = useState("")
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchEntries = useCallback(async () => {
    try {
      const entries = await getWaitlistEntries()
      setWaitlistEntries(entries)
    } catch (error) {
      toast({
        title: "Failed to load entries",
        description: "Could not fetch waitlist data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }, [])

  const handleRemoveEntry = async (id: string) => {
    try {
      await deleteWaitlistEntry(id)
      setWaitlistEntries(prev => prev.filter(entry => entry.id !== id))
      toast({
        title: "Entry removed",
        description: "Waitlist entry has been successfully removed.",
      })
    } catch (error) {
      toast({
        title: "Error removing entry",
        description: "Something went wrong while removing the entry.",
        variant: "destructive",
      })
    }
  }

  const filteredEntries = waitlistEntries.filter(entry =>
    entry.phone_number.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Waitlist</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search phone numbers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-[5px] border-0 p-4 sm:p-6 bg-[#171717] overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead className="text-right">Timestamp</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  {search ? "No matching entries found" : "No waitlist entries found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Phone className="mr-2 h-4 w-4" />
                      {entry.phone_number}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      <Calendar className="mr-2 h-4 w-4" />
                      {formatDate(entry.created_at)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveEntry(entry.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
