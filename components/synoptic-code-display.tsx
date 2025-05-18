"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"
import type { SynopticFormValues } from "@/lib/generateSynopticCode"

interface SynopticCodeDisplayProps {
  values: SynopticFormValues
}

export default function SynopticCodeDisplay({ values }: SynopticCodeDisplayProps) {
  const [copied, setCopied] = useState(false)

  // Format the synoptic code for display
  const formatSynopticCode = () => {
    if (!values.measurements || values.measurements.length === 0) {
      return "No data available"
    }

    // First section (measurements 0-13)
    const section1 = values.measurements.slice(0, 14).join(" ")

    // Second section (measurements 14-20)
    const section2 = values.measurements.slice(14).join(" ")

    return `${section1}\n${section2}`
  }

  const synopticCode = formatSynopticCode()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(synopticCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4 bg-green-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium text-green-700">Generated Synoptic Code</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-green-700 hover:text-green-800 hover:bg-green-100"
              onClick={copyToClipboard}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 font-mono text-sm whitespace-pre-wrap">
            {synopticCode}
          </div>

          <div className="mt-6 grid gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Station Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-3 rounded-md">
                  <div className="text-xs text-green-700 mb-1">Station No.</div>
                  <div className="font-medium">{values.stationNo || "N/A"}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-md">
                  <div className="text-xs text-green-700 mb-1">Date</div>
                  <div className="font-medium">
                    {values.year}/{values.month}/{values.day}
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-md">
                  <div className="text-xs text-green-700 mb-1">Time</div>
                  <div className="font-medium">{values.measurements[15] || "00"}:00 UTC</div>
                </div>
                <div className="bg-green-50 p-3 rounded-md">
                  <div className="text-xs text-green-700 mb-1">Data Type</div>
                  <div className="font-medium">{values.dataType}</div>
                </div>
              </div>
            </div>

            {values.weatherRemark && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Weather Remarks</h3>
                <div className="bg-blue-50 p-3 rounded-md text-sm">{values.weatherRemark}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
