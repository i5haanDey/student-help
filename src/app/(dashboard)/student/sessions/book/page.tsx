import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BookingForm } from "@/components/booking/booking-form"

export const metadata: Metadata = {
  title: "Book a Session - Student Help",
  description: "Book an instant or scheduled tutoring session with a verified teacher.",
}

export default async function BookSessionPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "student") redirect(`/${session.user.role}`)

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <BookingForm />
    </div>
  )
}
