"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingBag, FileText, Video, Bell } from "lucide-react"

export function MarketplacePlaceholder() {
  const [tab, setTab] = useState("materials")

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="max-w-lg mx-auto text-center space-y-8">
        <div className="flex justify-center">
          <ShoppingBag className="h-24 w-24 text-primary/30" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Study Material Marketplace</h1>
          <p className="text-muted-foreground">
            Coming in Phase 2. You&apos;ll be able to upload notes, PYQs, and cheat sheets here.
            We&apos;ll notify you when this launches.
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="materials" className="flex-1 gap-2" disabled>
              <FileText className="h-4 w-4" />
              Study Materials
            </TabsTrigger>
            <TabsTrigger value="lectures" className="flex-1 gap-2" disabled>
              <Video className="h-4 w-4" />
              Recorded Lectures
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <span>We&apos;ll Let You Know</span>
            </CardTitle>
            <CardDescription>
              Both features will be available together in Phase 2. You&apos;ll receive a notification
              when the marketplace opens.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              <strong>Study Materials:</strong> Upload and sell notes, practice papers, and cheat sheets.
            </p>
            <p className="mt-2">
              <strong>Recorded Lectures:</strong> Upload and sell pre-recorded video lessons.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
