"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import {
  getCurrentUser,
  updateUserProfile,
  updateUserPassword,
  requestEmailChange,
} from "@/utils/api/users"

export default function AccountProfile() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailChangeLoading, setEmailChangeLoading] = useState(false)

  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
  })
  const [currentEmail, setCurrentEmail] = useState("")
  const [newEmail, setNewEmail] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const { toast } = useToast()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser()
        setUser({
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          phone_number: userData.phone_number || "",
        })
        setCurrentEmail(userData.email || "")
        setNewEmail(userData.email || "")
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Failed to load user data",
          description: error?.response?.data?.message || "Please try again later.",
        })
      }
    }

    fetchUser()
  }, [toast])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateUserProfile({
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        email: currentEmail, // maintain current email
      })

      if (currentPassword || newPassword || confirmPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error("New passwords do not match.")
        }

        await updateUserPassword({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        })
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error?.response?.data?.message || error.message || "Something went wrong.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailChange = async () => {
    if (!newEmail) return

    setEmailChangeLoading(true)

    try {
      await requestEmailChange(newEmail)

      toast({
        title: "Verification sent",
        description: "Please check your inbox to confirm the new email address.",
      })
      setNewEmail("")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Email change failed",
        description: error?.response?.data?.message || error.message || "Try again later.",
      })
    } finally {
      setEmailChangeLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <form onSubmit={handleProfileSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={user.first_name}
                  onChange={(e) => setUser({ ...user, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={user.last_name}
                  onChange={(e) => setUser({ ...user, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={user.phone_number}
                onChange={(e) => setUser({ ...user, phone_number: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Change Email</CardTitle>
          <CardDescription>A verification link will be sent to the new email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-email">New Email</Label>
            <Input
              id="new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="button"
            onClick={handleEmailChange}
            disabled={emailChangeLoading}
          >
            {emailChangeLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Verification Link"
            )}
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}
