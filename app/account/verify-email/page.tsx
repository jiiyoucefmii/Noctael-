'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { verifyEmail } from '@/utils/api/users'
import { toast } from '@/components/ui/use-toast'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')

  useEffect(() => {
    const token = searchParams?.get('token')

    if (!token) {
      setStatus('error')
      toast({
        variant: 'destructive',
        title: 'Invalid verification link.',
      })
      return
    }

    verifyEmail(token)
      .then(() => {
        setStatus('success')
        toast({
          title: 'Email verified successfully!',
        })
        setTimeout(() => router.push('/auth/login'), 2000)
      })
      .catch(() => {
        setStatus('error')
        toast({
          variant: 'destructive',
          title: 'Verification failed. The link may be invalid or expired.',
        })
      })
  }, [searchParams, router])

  return (
    <div className="flex h-screen w-full items-center justify-center">
      {status === 'verifying' && <p>Verifying your email...</p>}
      {status === 'success' && <p>Email verified! Redirecting to login...</p>}
      {status === 'error' && <p>There was a problem verifying your email.</p>}
    </div>
  )
}
