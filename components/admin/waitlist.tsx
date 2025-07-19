"use client"

import { useEffect, useState, useCallback } from "react"
import { Search, Phone, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getWaitlistEntries } from "@/utils/api/waitlist"

import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface WaitlistEntry {
  id: string;
  phone_number: string;
  created_at: string;
}

export default function AdminWaitlist() {
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  useEffect(() => {
    const fetchWaitlist = async () => {
      try {
        const entries = await getWaitlistEntries()
        const sortedEntries = entries.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setWaitlistEntries(sortedEntries)
      } catch (error) {
        toast({
          title: "Error fetching waitlist",
          description: "Something went wrong while fetching waitlist entries.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWaitlist()
  }, [toast])

  const filteredEntries = waitlistEntries.filter(entry =>
    entry.phone_number.toLowerCase().includes(search.toLowerCase())
  )

  return (
    // Update the main component layout
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  Loading waitlist entries...
                </TableCell>
              </TableRow>
            ) : filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
