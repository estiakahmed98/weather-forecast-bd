"use client"

import { useState } from "react"
import { Formik, Form } from "formik"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SynopticMeasurementsTab from "./synoptic-measurements-tab"
import SynopticCodeDisplay from "@/components/synoptic-code-display"
import { Loader2, Save, RefreshCw } from "lucide-react"

export default function SynopticForm() {
  const [activeTab, setActiveTab] = useState("measurements")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSubmit = async (values) => {
    setIsSaving(true)
    try {
      // Here you would save the synoptic code to your database
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Error saving synoptic code:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const initialValues = {
    dataType: "SYNOP",
    stationNo: "",
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString().padStart(2, "0"),
    day: new Date().getDate().toString().padStart(2, "0"),
    weatherRemark: "",
    measurements: Array(21).fill(""),
  }

  return (
    <div className="space-y-6">
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ values, isSubmitting }) => (
          <Form>
            <Tabs defaultValue="measurements" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger value="measurements">Measurements</TabsTrigger>
                  <TabsTrigger value="preview">Code Preview</TabsTrigger>
                </TabsList>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="gap-2" onClick={() => window.location.reload()}>
                    <RefreshCw className="h-4 w-4" />
                    Refresh Data
                  </Button>
                  <Button
                    type="submit"
                    className="gap-2 bg-green-600 hover:bg-green-700"
                    disabled={isSubmitting || isSaving}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saveSuccess ? "Saved!" : "Save Synoptic Code"}
                  </Button>
                </div>
              </div>

              <TabsContent value="measurements">
                <SynopticMeasurementsTab />
              </TabsContent>

              <TabsContent value="preview">
                <SynopticCodeDisplay values={values} />
              </TabsContent>
            </Tabs>
          </Form>
        )}
      </Formik>
    </div>
  )
}
