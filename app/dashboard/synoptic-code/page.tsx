// "use client";

// import { useState } from "react";
// import { Formik, Form } from "formik";
// import SynopticCodeForm from "./synoptic-code-form";
// import SynopticDataTable from "./SynopticDataTable";
// import SynopticTable from "./synoptic-components/synoptic-table";

// export interface SynopticFormValues {
//   dataType: string;
//   stationNo: string;
//   year: string;
//   month: string;
//   day: string;
//   weatherRemark: string;
//   measurements: string[];
// }

// export default function WeatherTabsPage() {
//   const [activeTab, setActiveTab] = useState<"weather" | "synoptic">("synoptic");

//   const initialValues: SynopticFormValues = {
//     dataType: "",
//     stationNo: "",
//     year: "",
//     month: "",
//     day: "",
//     weatherRemark: "",
//     measurements: Array(21).fill(""),
//   };

//   const handleSubmit = (values: SynopticFormValues) => {
//     console.log(values);
//     // Handle form submission
//   };

//   return (
//     <main className="container mx-auto py-8 px-4">
//       <h1 className="text-2xl font-bold mb-6 text-blue-800 text-center">
//         Weather Data Management System
//       </h1>

//       <Formik<SynopticFormValues>
//         initialValues={initialValues}
//         onSubmit={handleSubmit}
//       >
//         <Form>
//           <div className="flex justify-center mb-6">
//             <button
//               type="button"
//               className={`ml-4 px-6 py-2 font-medium rounded-t-lg border-b-2 ${
//                 activeTab === "synoptic"
//                   ? "border-blue-600 text-blue-600"
//                   : "border-transparent text-gray-500 hover:text-blue-600"
//               }`}
//               onClick={() => setActiveTab("synoptic")}
//             >
//               Synoptic Code
//             </button>
//             <button
//               type="button"
//               className={`px-6 py-2 font-medium rounded-t-lg border-b-2 ${
//                 activeTab === "weather"
//                   ? "border-blue-600 text-blue-600"
//                   : "border-transparent text-gray-500 hover:text-blue-600"
//               }`}
//               onClick={() => setActiveTab("weather")}
//             >
//               Synoptic Table
//             </button>
//           </div>

//           <div className="bg-white p-4 rounded-lg shadow">
//             {activeTab === "synoptic" && <SynopticCodeForm />}
//             {activeTab === "weather" &&  <SynopticTable />}
//           </div>
//         </Form>
//       </Formik>
//     </main>
//   );
// }

















"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { TableIcon, FileTextIcon } from "lucide-react"
import SynopticCodeTable from "./synoptic-components/synoptic-table"
import SynopticForm from "@/components/synoptic-form"

export default function SynopticPage() {
  const [activeTab, setActiveTab] = useState("table")

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Synoptic Code Management</h1>
        <p className="text-gray-600">Generate and view today's synoptic codes for meteorological observations</p>
      </div>

      <Tabs defaultValue="table" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="table" className="flex items-center gap-2">
            <TableIcon className="h-4 w-4" />
            <span>Daily Synoptic Table</span>
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <FileTextIcon className="h-4 w-4" />
            <span>Current Synoptic</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="w-full">
          <Card>
            <CardContent className="pt-6">
              <SynopticCodeTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form" className="w-full">
          <Card>
            <CardContent className="pt-6">
              <SynopticForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
