"use client"

import type React from "react"

import { useState } from "react"
import { Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"


export default function Newsletter() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Call the API function
    
      
      toast({
        title: "Success!",
        description: "You've been added to our waitlist.",
      })

      setPhoneNumber("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join waitlist. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl text-center">
      <h3 className="text-2xl font-bold">Join the Waitlist</h3>
      <p className="mt-2 text-gray-300">Stay updated with the latest drops and exclusive offers.</p>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="tel"
            placeholder="Enter your phone number"
            className="pl-10"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-white text-black hover:bg-white/90 border-0"
        >
          {isLoading ? "Joining..." : "Join"}
        </Button>
      </form>
    </div>
  )
}
