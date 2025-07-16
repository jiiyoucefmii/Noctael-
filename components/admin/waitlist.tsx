"use client"

import { useEffect, useState, useCallback } from "react"
import { Search, Phone, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Define the WaitlistEntry interface directly in this file
interface WaitlistEntry {
  id: string;
  phone_number: string;
  created_at: string;
}

// Dummy data for waitlist entries
const dummyWaitlistEntries: WaitlistEntry[] = [
  { id: "wl-1", phone_number: "+14155552671", created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "wl-2", phone_number: "+12125557890", created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "wl-3", phone_number: "+13235559876", created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "wl-4", phone_number: "+17185551234", created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "wl-5", phone_number: "+19175556543", created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "wl-6", phone_number: "+16465558765", created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "wl-7", phone_number: "+18185552345", created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "wl-8", phone_number: "+15105559876", created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "wl-9", phone_number: "+16195554321", created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "wl-10", phone_number: "+17075557654", created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "wl-11", phone_number: "+14085551122", created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "wl-12", phone_number: "+16265553344", created_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "wl-13", phone_number: "+19495555566", created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "wl-14", phone_number: "+17145557788", created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "wl-15", phone_number: "+18585559900", created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
];

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
    // Simulate loading delay
    const timer = setTimeout(() => {
      // Sort by most recent first
      const sortedEntries = [...dummyWaitlistEntries].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      setWaitlistEntries(sortedEntries)
      setLoading(false)
    }, 800) // Simulate a short loading delay
    
    return () => clearTimeout(timer)
  }, [])

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

      <div className="rounded-[5px] border-0 p-6 bg-[#171717]">
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