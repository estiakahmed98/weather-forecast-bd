// "use client"

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Loader2, Download, Printer, Calendar } from "lucide-react"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { Calendar as CalendarComponent } from "@/components/ui/calendar"
// import { format } from "date-fns"

// // Time slots for 3-hour intervals
// const TIME_SLOTS = [
//   { label: "00", value: "00" },
//   { label: "03", value: "03" },
//   { label: "06", value: "06" },
//   { label: "09", value: "09" },
//   { label: "12", value: "12" },
//   { label: "15", value: "15" },
//   { label: "18", value: "18" },
//   { label: "21", value: "21" },
// ]

// interface SynopticData {
//   timeSlot: string
//   hasData: boolean
//   stationNo?: string
//   measurements?: string[]
//   weatherRemark?: string
// }

// interface DailyData {
//   date: string
//   synopticData: SynopticData[]
// }

// export default function SynopticCodeTable() {
//   const [selectedDate, setSelectedDate] = useState<Date>(new Date())
//   const [dailyData, setDailyData] = useState<DailyData | null>(null)
//   const [loading, setLoading] = useState<boolean>(true)
//   const [refreshing, setRefreshing] = useState<boolean>(false)
//   const [headerInfo, setHeaderInfo] = useState({
//     dataType: "SY",
//     stationNo: "41953",
//     year: format(new Date(), "yy"),
//     month: format(new Date(), "MM"),
//     day: format(new Date(), "dd"),
//   })

//   // Function to fetch data for the selected date
//   const fetchDailyData = async (date: Date) => {
//     setRefreshing(true)
//     try {
//       const dateString = format(date, "yyyy-MM-dd")
//       const res = await fetch(`/api/synoptic/daily?date=${dateString}`)

//       if (!res.ok) {
//         throw new Error(`HTTP error! status: ${res.status}`)
//       }

//       const data = await res.json()

//       // Check if we have any data for this date
//       const hasAnyData = data.synopticData.some((item: SynopticData) => item.hasData)

//       if (!hasAnyData) {
//         // If no data for the selected date, show a message
//         setDailyData({
//           date: dateString,
//           synopticData: TIME_SLOTS.map((slot) => ({
//             timeSlot: slot.value,
//             hasData: false,
//           })),
//         })
//       } else {
//         setDailyData(data)
//       }

//       // Update header info with the first available station number
//       const firstDataItem = data.synopticData.find((item: SynopticData) => item.hasData)
//       setHeaderInfo({
//         dataType: "SY",
//         stationNo: firstDataItem?.stationNo || "00000",
//         year: format(date, "yy"),
//         month: format(date, "MM"),
//         day: format(date, "dd"),
//       })
//     } catch (error) {
//       console.error("Failed to fetch daily data:", error)
//       // Set empty data for all time slots
//       setDailyData({
//         date: format(date, "yyyy-MM-dd"),
//         synopticData: TIME_SLOTS.map((slot) => ({
//           timeSlot: slot.value,
//           hasData: false,
//         })),
//       })
//     } finally {
//       setLoading(false)
//       setRefreshing(false)
//     }
//   }

//   // Load data on component mount and when selected date changes
//   useEffect(() => {
//     fetchDailyData(selectedDate)
//   }, [selectedDate])

//   // Function to export data as CSV
//   const exportToCSV = () => {
//     if (!dailyData) return

//     // Create headers
//     let csvContent =
//       "Time,C1,Iliii,iRiXhvv,Nddff,1SnTTT,2SnTdTdTd,3PPP/4PPP,6RRRtR,7wwW1W2,8NhClCmCh,2SnTnTnTn/InInInIn,56DlDmDh,57CDaEc,Av. Total Clouds,C2,GG,58P24P24P24/59P24P24P24,(6RRRtR)/7R24R24R24,8N5Ch5h5,90dqqqt,91fqfqfq,Weather Remarks\n"

//     // Add data rows
//     dailyData.synopticData.forEach((item) => {
//       if (item.hasData && item.measurements) {
//         let row = `${item.timeSlot},`
//         item.measurements.forEach((measurement) => {
//           row += `${measurement},`
//         })
//         row += `"${item.weatherRemark?.replace(/"/g, '""') || ""}"\n`
//         csvContent += row
//       }
//     })

//     // Create download link
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
//     const url = URL.createObjectURL(blob)
//     const link = document.createElement("a")
//     link.setAttribute("href", url)
//     link.setAttribute("download", `synoptic_data_${headerInfo.year}${headerInfo.month}${headerInfo.day}.csv`)
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//   }

//   // Function to print the table
//   const printTable = () => {
//     window.print()
//   }

//   // Function to handle date change
//   const handleDateChange = (date: Date | undefined) => {
//     if (date) {
//       setSelectedDate(date)
//     }
//   }

//   return (
//     <div className="space-y-6 print:space-y-0">
//       <div className="flex justify-between items-center print:hidden">
//         <h2 className="text-2xl font-bold text-gray-800 flex items-center">
//           <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-3">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width="24"
//               height="24"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <path d="M8 3v3a2 2 0 0 1-2 2H3" />
//               <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
//               <path d="M3 16h3a2 2 0 0 1 2 2v3" />
//               <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
//             </svg>
//           </span>
//           Synoptic Code Data
//         </h2>
//         <div className="flex gap-3">
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button
//                 variant="outline"
//                 className="flex items-center gap-2 text-blue-700 border-blue-300 hover:bg-blue-50"
//               >
//                 <Calendar className="h-4 w-4" />
//                 <span>{format(selectedDate, "PPP")}</span>
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0" align="end">
//               <CalendarComponent mode="single" selected={selectedDate} onSelect={handleDateChange} initialFocus />
//             </PopoverContent>
//           </Popover>
//           <Button
//             variant="outline"
//             className="flex items-center gap-2 text-blue-700 border-blue-300 hover:bg-blue-50"
//             onClick={() => fetchDailyData(selectedDate)}
//             disabled={refreshing}
//           >
//             {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-base">Refresh</span>}
//           </Button>
//           <Button
//             variant="outline"
//             className="flex items-center gap-2 text-blue-700 border-blue-300 hover:bg-blue-50"
//             onClick={exportToCSV}
//             disabled={!dailyData}
//           >
//             <Download size={18} />
//             <span className="text-base">Export CSV</span>
//           </Button>
//           <Button
//             variant="outline"
//             className="flex items-center gap-2 text-blue-700 border-blue-300 hover:bg-blue-50"
//             onClick={printTable}
//             disabled={!dailyData}
//           >
//             <Printer size={18} />
//             <span className="text-base">Print</span>
//           </Button>
//         </div>
//       </div>

//       {loading ? (
//         <div className="flex justify-center items-center h-64">
//           <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
//           <span className="ml-3 text-lg text-gray-700">Loading synoptic data...</span>
//         </div>
//       ) : !dailyData || !dailyData.synopticData.some((item) => item.hasData) ? (
//         <div className="flex justify-center items-center h-64 bg-blue-50/50 rounded-lg border-2 border-dashed border-blue-200">
//           <div className="text-center p-8">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width="56"
//               height="56"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               className="mx-auto mb-5 text-blue-400"
//             >
//               <rect x="2" y="4" width="20" height="16" rx="2" />
//               <path d="M2 8h20" />
//               <path d="M6 12h4" />
//               <path d="M14 12h4" />
//               <path d="M6 16h4" />
//               <path d="M14 16h4" />
//             </svg>
//             <h3 className="text-xl font-semibold text-gray-800 mb-3">No Data Available</h3>
//             <p className="text-lg text-gray-600 mb-5">
//               There is no synoptic data available for {format(selectedDate, "MMMM d, yyyy")}.
//             </p>
//             <Button
//               variant="outline"
//               className="bg-white text-blue-700 border-blue-300 hover:bg-blue-50 text-base"
//               onClick={() => setSelectedDate(new Date())}
//             >
//               View Today's Data
//             </Button>
//           </div>
//         </div>
//       ) : (
//         <div className="w-full overflow-auto print:overflow-visible">
//           {/* Header Section */}
//           <div className="mb-4 print:mb-2">
//             <div className="text-center border-b-2 border-blue-200 bg-gradient-to-b from-blue-50 to-white py-6 print:py-3 rounded-t-lg">
//               <h2 className="text-3xl font-extrabold uppercase mb-5 print:mb-3 text-blue-800">SYNOPTIC CODE</h2>

//               <div className="flex flex-wrap justify-center gap-10 print:gap-6 max-w-5xl mx-auto">
//                 <div className="text-left">
//                   <div className="font-bold text-base mb-2 text-gray-600">DATA TYPE</div>
//                   <div className="flex">
//                     {headerInfo.dataType.split("").map((char, i) => (
//                       <div
//                         key={i}
//                         className="w-10 h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-lg font-bold text-blue-700 rounded"
//                       >
//                         {char}
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="text-left">
//                   <div className="font-bold text-base mb-2 text-gray-600">STATION NO.</div>
//                   <div className="flex">
//                     {headerInfo.stationNo.split("").map((char, i) => (
//                       <div
//                         key={i}
//                         className="w-10 h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-lg font-bold text-blue-700 rounded"
//                       >
//                         {char}
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="text-left">
//                   <div className="font-bold text-base mb-2 text-gray-600">YEAR</div>
//                   <div className="flex">
//                     {headerInfo.year.split("").map((char, i) => (
//                       <div
//                         key={i}
//                         className="w-10 h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-lg font-bold text-blue-700 rounded"
//                       >
//                         {char}
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="text-left">
//                   <div className="font-bold text-base mb-2 text-gray-600">MONTH</div>
//                   <div className="flex">
//                     {headerInfo.month.split("").map((char, i) => (
//                       <div
//                         key={i}
//                         className="w-10 h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-lg font-bold text-blue-700 rounded"
//                       >
//                         {char}
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="text-left">
//                   <div className="font-bold text-base mb-2 text-gray-600">DAY</div>
//                   <div className="flex">
//                     {headerInfo.day.split("").map((char, i) => (
//                       <div
//                         key={i}
//                         className="w-10 h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-lg font-bold text-blue-700 rounded"
//                       >
//                         {char}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="border-2 border-blue-200 rounded-lg shadow-lg overflow-x-auto print:overflow-visible bg-white">
//             <table className="w-full border-collapse min-w-[1800px] text-base text-gray-800">
//               <thead className="bg-gradient-to-b from-blue-600 to-blue-700 text-sm font-bold uppercase text-center text-white print:bg-blue-700">
//                 <tr>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">Time</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">C1</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">Iliii</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">iRiXhvv</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">Nddff</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">1SnTTT</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">2SnTdTdTd</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">3PPP/4PPP</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">6RRRtR</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">7wwW1W2</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">8NhClCmCh</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">2SnTnTnTn/InInInIn</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">56DlDmDh</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">57CDaEc</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">Av. Total Clouds</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">C2</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">GG</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">58/59P24</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">(6RRRtR)/7R24</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">8N5Ch5h5</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">90dqqqt</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">91fqfqfq</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">Remarks</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-blue-100 text-center font-mono">
//                 {TIME_SLOTS.map((slot) => {
//                   const dataForSlot = dailyData.synopticData.find((item) => item.timeSlot === slot.value)

//                   if (!dataForSlot || !dataForSlot.hasData) {
//                     return (
//                       <tr key={slot.value} className="bg-gray-50 text-gray-400">
//                         <td className="border border-blue-200 px-4 py-3 whitespace-nowrap font-semibold">
//                           {slot.label}
//                         </td>
//                         <td colSpan={22} className="border border-blue-200 px-4 py-3 text-center italic">
//                           No data available for this time slot
//                         </td>
//                       </tr>
//                     )
//                   }

//                   return (
//                     <tr key={slot.value} className="bg-white hover:bg-blue-50 print:hover:bg-white">
//                       <td className="border border-blue-200 px-4 py-3 whitespace-nowrap font-semibold text-blue-700">
//                         {slot.label}
//                       </td>
//                       {dataForSlot.measurements?.map((m, i) => (
//                         <td
//                           key={i}
//                           className={`border border-blue-200 px-4 py-3 whitespace-nowrap ${
//                             i % 3 === 0 ? "bg-blue-50/20" : ""
//                           }`}
//                         >
//                           {m}
//                         </td>
//                       ))}
//                       <td className="border border-blue-200 px-4 py-3 whitespace-nowrap text-left text-gray-700">
//                         {dataForSlot.weatherRemark}
//                       </td>
//                     </tr>
//                   )
//                 })}
//               </tbody>
//             </table>

//             {/* Optional footer */}
//             <div className="text-right text-sm text-blue-600 mt-2 pr-4 pb-2 print:hidden">
//               Generated: {new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Print styles */}
//       <style jsx global>{`
//         @media print {
//           @page {
//             size: landscape;
//             margin: 0.5cm;
//           }

//           body {
//             font-size: 10pt;
//           }

//           .print\\:bg-blue-700 {
//             background-color: #1d4ed8 !important;
//             -webkit-print-color-adjust: exact;
//             print-color-adjust: exact;
//           }

//           .print\\:bg-white {
//             background-color: white !important;
//             -webkit-print-color-adjust: exact;
//             print-color-adjust: exact;
//           }
//         }
//       `}</style>
//     </div>
//   )
// }





// "use client"

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Loader2, Download, Printer, RefreshCw } from "lucide-react"
// import { format } from "date-fns"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import { InfoIcon } from "lucide-react"

// // Time slots for 3-hour intervals
// const TIME_SLOTS = [
//   { label: "00", value: "00" },
//   { label: "03", value: "03" },
//   { label: "06", value: "06" },
//   { label: "09", value: "09" },
//   { label: "12", value: "12" },
//   { label: "15", value: "15" },
//   { label: "18", value: "18" },
//   { label: "21", value: "21" },
// ]

// interface SynopticData {
//   timeSlot: string
//   hasData: boolean
//   stationNo?: string
//   measurements?: string[]
//   weatherRemark?: string
//   partialData?: boolean
//   message?: string
//   isMockData?: boolean
// }

// interface DailyData {
//   date: string
//   synopticData: SynopticData[]
// }

// export default function SynopticCodeTable() {
//   const [dailyData, setDailyData] = useState<DailyData | null>(null)
//   const [loading, setLoading] = useState<boolean>(true)
//   const [refreshing, setRefreshing] = useState<boolean>(false)
//   const [headerInfo, setHeaderInfo] = useState({
//     dataType: "SY",
//     stationNo: "41953",
//     year: format(new Date(), "yy"),
//     month: format(new Date(), "MM"),
//     day: format(new Date(), "dd"),
//   })
//   const [debugInfo, setDebugInfo] = useState<string | null>(null)

//   // Function to fetch data for the current date
//   const fetchTodayData = async () => {
//     setRefreshing(true)
//     try {
//       const today = new Date()
//       const res = await fetch(`/api/synoptic/daily?date=${format(today, "yyyy-MM-dd")}`)

//       if (!res.ok) {
//         throw new Error(`HTTP error! status: ${res.status}`)
//       }

//       const data = await res.json()

//       // Check if we have any data for today
//       const hasAnyData = data.synopticData.some((item: SynopticData) => item.hasData)

//       if (!hasAnyData) {
//         // If no data for today, show a message
//         setDailyData({
//           date: format(today, "yyyy-MM-dd"),
//           synopticData: TIME_SLOTS.map((slot) => ({
//             timeSlot: slot.value,
//             hasData: false,
//           })),
//         })
//         setDebugInfo("No synoptic data found for any time slot today.")
//       } else {
//         setDailyData(data)

//         // Set debug info about available data
//         const availableSlots = data.synopticData
//           .filter((item: SynopticData) => item.hasData)
//           .map((item: SynopticData) => item.timeSlot)
//           .join(", ")

//         setDebugInfo(`Found synoptic data for time slots: ${availableSlots}`)
//       }

//       // Update header info with the first available station number
//       const firstDataItem = data.synopticData.find((item: SynopticData) => item.hasData)
//       setHeaderInfo({
//         dataType: "SY",
//         stationNo: firstDataItem?.stationNo || "00000",
//         year: format(today, "yy"),
//         month: format(today, "MM"),
//         day: format(today, "dd"),
//       })
//     } catch (error) {
//       console.error("Failed to fetch today's data:", error)
//       // Set empty data for all time slots
//       const today = new Date()
//       setDailyData({
//         date: format(today, "yyyy-MM-dd"),
//         synopticData: TIME_SLOTS.map((slot) => ({
//           timeSlot: slot.value,
//           hasData: false,
//         })),
//       })
//       setDebugInfo(`Error fetching data: ${error instanceof Error ? error.message : String(error)}`)
//     } finally {
//       setLoading(false)
//       setRefreshing(false)
//     }
//   }

//   // Load data on component mount
//   useEffect(() => {
//     fetchTodayData()

//     // Set up auto-refresh every 30 minutes
//     const refreshInterval = setInterval(
//       () => {
//         fetchTodayData()
//       },
//       30 * 60 * 1000,
//     )

//     return () => clearInterval(refreshInterval)
//   }, [])

//   // Function to export data as CSV
//   const exportToCSV = () => {
//     if (!dailyData) return

//     // Create headers
//     let csvContent =
//       "Time,C1,Iliii,iRiXhvv,Nddff,1SnTTT,2SnTdTdTd,3PPP/4PPP,6RRRtR,7wwW1W2,8NhClCmCh,2SnTnTnTn/InInInIn,56DlDmDh,57CDaEc,Av. Total Clouds,C2,GG,58P24P24P24/59P24P24P24,(6RRRtR)/7R24R24R24,8N5Ch5h5,90dqqqt,91fqfqfq,Weather Remarks\n"

//     // Add data rows
//     dailyData.synopticData.forEach((item) => {
//       if (item.hasData && item.measurements) {
//         let row = `${item.timeSlot},`
//         item.measurements.forEach((measurement) => {
//           row += `${measurement},`
//         })
//         row += `"${item.weatherRemark?.replace(/"/g, '""') || ""}"\n`
//         csvContent += row
//       }
//     })

//     // Create download link
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
//     const url = URL.createObjectURL(blob)
//     const link = document.createElement("a")
//     link.setAttribute("href", url)
//     link.setAttribute("download", `synoptic_data_${headerInfo.year}${headerInfo.month}${headerInfo.day}.csv`)
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//   }

//   // Function to print the table
//   const printTable = () => {
//     window.print()
//   }

//   // Get today's formatted date for display
//   const todayFormatted = format(new Date(), "MMMM d, yyyy")

//   return (
//     <div className="space-y-6 print:space-y-0">
//       <div className="flex justify-between items-center print:hidden">
//         <h2 className="text-2xl font-bold text-gray-800 flex items-center">
//           <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-3">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width="24"
//               height="24"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <path d="M8 3v3a2 2 0 0 1-2 2H3" />
//               <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
//               <path d="M3 16h3a2 2 0 0 1 2 2v3" />
//               <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
//             </svg>
//           </span>
//           Today's Synoptic Code Data
//           <span className="ml-3 text-sm font-normal text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
//             {todayFormatted}
//           </span>
//         </h2>
//         <div className="flex gap-3">
//           <Button
//             variant="outline"
//             className="flex items-center gap-2 text-blue-700 border-blue-300 hover:bg-blue-50"
//             onClick={fetchTodayData}
//             disabled={refreshing}
//           >
//             {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
//             <span className="text-base">Refresh</span>
//           </Button>
//           <Button
//             variant="outline"
//             className="flex items-center gap-2 text-blue-700 border-blue-300 hover:bg-blue-50"
//             onClick={exportToCSV}
//             disabled={!dailyData || !dailyData.synopticData.some((item) => item.hasData)}
//           >
//             <Download size={18} />
//             <span className="text-base">Export CSV</span>
//           </Button>
//           <Button
//             variant="outline"
//             className="flex items-center gap-2 text-blue-700 border-blue-300 hover:bg-blue-50"
//             onClick={printTable}
//             disabled={!dailyData || !dailyData.synopticData.some((item) => item.hasData)}
//           >
//             <Printer size={18} />
//             <span className="text-base">Print</span>
//           </Button>
//         </div>
//       </div>

//       {debugInfo && (
//         <Alert className="bg-blue-50 border-blue-200 print:hidden">
//           <InfoIcon className="h-4 w-4 text-blue-600" />
//           <AlertTitle className="text-blue-800">Debug Information</AlertTitle>
//           <AlertDescription className="text-blue-700">{debugInfo}</AlertDescription>
//         </Alert>
//       )}

//       {loading ? (
//         <div className="flex justify-center items-center h-64">
//           <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
//           <span className="ml-3 text-lg text-gray-700">Loading today's synoptic data...</span>
//         </div>
//       ) : !dailyData || !dailyData.synopticData.some((item) => item.hasData) ? (
//         <div className="flex justify-center items-center h-64 bg-blue-50/50 rounded-lg border-2 border-dashed border-blue-200">
//           <div className="text-center p-8">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width="56"
//               height="56"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               className="mx-auto mb-5 text-blue-400"
//             >
//               <rect x="2" y="4" width="20" height="16" rx="2" />
//               <path d="M2 8h20" />
//               <path d="M6 12h4" />
//               <path d="M14 12h4" />
//               <path d="M6 16h4" />
//               <path d="M14 16h4" />
//             </svg>
//             <h3 className="text-xl font-semibold text-gray-800 mb-3">No Data Available</h3>
//             <p className="text-lg text-gray-600 mb-5">
//               There is no synoptic data available for today ({todayFormatted}).
//             </p>
//             <Button
//               variant="outline"
//               className="bg-white text-blue-700 border-blue-300 hover:bg-blue-50 text-base"
//               onClick={fetchTodayData}
//             >
//               Refresh Data
//             </Button>
//           </div>
//         </div>
//       ) : (
//         <div className="w-full overflow-auto print:overflow-visible">
//           {/* Header Section */}
//           <div className="mb-4 print:mb-2">
//             <div className="text-center border-b-2 border-blue-200 bg-gradient-to-b from-blue-50 to-white py-6 print:py-3 rounded-t-lg">
//               <h2 className="text-3xl font-extrabold uppercase mb-5 print:mb-3 text-blue-800">SYNOPTIC CODE</h2>

//               <div className="flex flex-wrap justify-center gap-10 print:gap-6 max-w-5xl mx-auto">
//                 <div className="text-left">
//                   <div className="font-bold text-base mb-2 text-gray-600">DATA TYPE</div>
//                   <div className="flex">
//                     {headerInfo.dataType.split("").map((char, i) => (
//                       <div
//                         key={i}
//                         className="w-10 h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-lg font-bold text-blue-700 rounded"
//                       >
//                         {char}
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="text-left">
//                   <div className="font-bold text-base mb-2 text-gray-600">STATION NO.</div>
//                   <div className="flex">
//                     {headerInfo.stationNo.split("").map((char, i) => (
//                       <div
//                         key={i}
//                         className="w-10 h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-lg font-bold text-blue-700 rounded"
//                       >
//                         {char}
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="text-left">
//                   <div className="font-bold text-base mb-2 text-gray-600">YEAR</div>
//                   <div className="flex">
//                     {headerInfo.year.split("").map((char, i) => (
//                       <div
//                         key={i}
//                         className="w-10 h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-lg font-bold text-blue-700 rounded"
//                       >
//                         {char}
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="text-left">
//                   <div className="font-bold text-base mb-2 text-gray-600">MONTH</div>
//                   <div className="flex">
//                     {headerInfo.month.split("").map((char, i) => (
//                       <div
//                         key={i}
//                         className="w-10 h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-lg font-bold text-blue-700 rounded"
//                       >
//                         {char}
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="text-left">
//                   <div className="font-bold text-base mb-2 text-gray-600">DAY</div>
//                   <div className="flex">
//                     {headerInfo.day.split("").map((char, i) => (
//                       <div
//                         key={i}
//                         className="w-10 h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-lg font-bold text-blue-700 rounded"
//                       >
//                         {char}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="border-2 border-blue-200 rounded-lg shadow-lg overflow-x-auto print:overflow-visible bg-white">
//             <table className="w-full border-collapse min-w-[1800px] text-base text-gray-800">
//               <thead className="bg-gradient-to-b from-blue-600 to-blue-700 text-sm font-bold uppercase text-center text-white print:bg-blue-700">
//                 <tr>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">Time</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">C1</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">Iliii</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">iRiXhvv</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">Nddff</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">1SnTTT</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">2SnTdTdTd</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">3PPP/4PPP</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">6RRRtR</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">7wwW1W2</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">8NhClCmCh</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">2SnTnTnTn/InInInIn</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">56DlDmDh</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">57CDaEc</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">Av. Total Clouds</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">C2</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">GG</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">58/59P24</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">(6RRRtR)/7R24</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">8N5Ch5h5</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">90dqqqt</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">91fqfqfq</th>
//                   <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">Remarks</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-blue-100 text-center font-mono">
//                 {TIME_SLOTS.map((slot) => {
//                   const dataForSlot = dailyData.synopticData.find((item) => item.timeSlot === slot.value)

//                   if (!dataForSlot || !dataForSlot.hasData) {
//                     // Check if this time slot is in the future
//                     const currentHour = new Date().getHours()
//                     const slotHour = Number.parseInt(slot.value, 10)
//                     const isFutureSlot = slotHour > currentHour

//                     return (
//                       <tr key={slot.value} className={`${isFutureSlot ? "bg-gray-50/50" : "bg-gray-50"} text-gray-400`}>
//                         <td className="border border-blue-200 px-4 py-3 whitespace-nowrap font-semibold">
//                           {slot.label}
//                         </td>
//                         <td colSpan={22} className="border border-blue-200 px-4 py-3 text-center italic">
//                           {isFutureSlot
//                             ? "Data will be available after this time slot"
//                             : dataForSlot?.partialData
//                               ? dataForSlot.message || "Incomplete data for this time slot"
//                               : "No data available for this time slot"}
//                         </td>
//                       </tr>
//                     )
//                   }

//                   return (
//                     <tr key={slot.value} className="bg-white hover:bg-blue-50 print:hover:bg-white">
//                       <td className="border border-blue-200 px-4 py-3 whitespace-nowrap font-semibold text-blue-700">
//                         {slot.label}
//                         {dataForSlot.isMockData && <span className="ml-1 text-xs text-amber-600">(mock)</span>}
//                       </td>
//                       {dataForSlot.measurements?.map((m, i) => (
//                         <td
//                           key={i}
//                           className={`border border-blue-200 px-4 py-3 whitespace-nowrap ${
//                             i % 3 === 0 ? "bg-blue-50/20" : ""
//                           }`}
//                         >
//                           {m}
//                         </td>
//                       ))}
//                       <td className="border border-blue-200 px-4 py-3 whitespace-nowrap text-left text-gray-700">
//                         {dataForSlot.weatherRemark}
//                       </td>
//                     </tr>
//                   )
//                 })}
//               </tbody>
//             </table>

//             {/* Optional footer */}
//             <div className="text-right text-sm text-blue-600 mt-2 pr-4 pb-2 print:hidden">
//               Last Updated: {new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Print styles */}
//       <style jsx global>{`
//         @media print {
//           @page {
//             size: landscape;
//             margin: 0.5cm;
//           }

//           body {
//             font-size: 10pt;
//           }

//           .print\\:bg-blue-700 {
//             background-color: #1d4ed8 !important;
//             -webkit-print-color-adjust: exact;
//             print-color-adjust: exact;
//           }

//           .print\\:bg-white {
//             background-color: white !important;
//             -webkit-print-color-adjust: exact;
//             print-color-adjust: exact;
//           }
//         }
//       `}</style>
//     </div>
//   )
// }




























"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Download, Printer, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

// Time slots for 3-hour intervals
const TIME_SLOTS = [
  { label: "00", value: "00" },
  { label: "03", value: "03" },
  { label: "06", value: "06" },
  { label: "09", value: "09" },
  { label: "12", value: "12" },
  { label: "15", value: "15" },
  { label: "18", value: "18" },
  { label: "21", value: "21" },
]

interface SynopticData {
  timeSlot: string
  actualObservationTime?: string
  hasData: boolean
  stationNo?: string
  measurements?: string[]
  weatherRemark?: string
  partialData?: boolean
  message?: string
  isMockData?: boolean
}

interface DailyData {
  date: string
  synopticData: SynopticData[]
}

export default function SynopticCodeTable() {
  const [dailyData, setDailyData] = useState<DailyData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [headerInfo, setHeaderInfo] = useState({
    dataType: "SY",
    stationNo: "41953",
    year: format(new Date(), "yy"),
    month: format(new Date(), "MM"),
    day: format(new Date(), "dd"),
  })
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  // Function to fetch data for the current date
  const fetchTodayData = async () => {
    setRefreshing(true)
    try {
      const today = new Date()
      const res = await fetch(`/api/synoptic/daily?date=${format(today, "yyyy-MM-dd")}`)

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()

      // Check if we have any data for today
      const hasAnyData = data.synopticData.some((item: SynopticData) => item.hasData)

      if (!hasAnyData) {
        // If no data for today, show a message
        setDailyData({
          date: format(today, "yyyy-MM-dd"),
          synopticData: TIME_SLOTS.map((slot) => ({
            timeSlot: slot.value,
            hasData: false,
          })),
        })
        setDebugInfo("No synoptic data found for any time slot today.")
      } else {
        setDailyData(data)

        // Set debug info about available data
        const availableSlots = data.synopticData
          .filter((item: SynopticData) => item.hasData)
          .map((item: SynopticData) => {
            const actualTime = item.actualObservationTime || item.timeSlot
            return actualTime === item.timeSlot ? actualTime : `${item.timeSlot} (actual: ${actualTime})`
          })
          .join(", ")

        setDebugInfo(`Found synoptic data for time slots: ${availableSlots}`)
      }

      // Update header info with the first available station number
      const firstDataItem = data.synopticData.find((item: SynopticData) => item.hasData)
      setHeaderInfo({
        dataType: "SY",
        stationNo: firstDataItem?.stationNo || "00000",
        year: format(today, "yy"),
        month: format(today, "MM"),
        day: format(today, "dd"),
      })
    } catch (error) {
      console.error("Failed to fetch today's data:", error)
      // Set empty data for all time slots
      const today = new Date()
      setDailyData({
        date: format(today, "yyyy-MM-dd"),
        synopticData: TIME_SLOTS.map((slot) => ({
          timeSlot: slot.value,
          hasData: false,
        })),
      })
      setDebugInfo(`Error fetching data: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchTodayData()

    // Set up auto-refresh every 30 minutes
    const refreshInterval = setInterval(
      () => {
        fetchTodayData()
      },
      30 * 60 * 1000,
    )

    return () => clearInterval(refreshInterval)
  }, [])

  // Function to export data as CSV
  const exportToCSV = () => {
    if (!dailyData) return

    // Create headers
    let csvContent =
      "Time,C1,Iliii,iRiXhvv,Nddff,1SnTTT,2SnTdTdTd,3PPP/4PPP,6RRRtR,7wwW1W2,8NhClCmCh,2SnTnTnTn/InInInIn,56DlDmDh,57CDaEc,Av. Total Clouds,C2,GG,58P24P24P24/59P24P24P24,(6RRRtR)/7R24R24R24,8N5Ch5h5,90dqqqt,91fqfqfq,Weather Remarks\n"

    // Add data rows
    dailyData.synopticData.forEach((item) => {
      if (item.hasData && item.measurements) {
        // Use actualObservationTime if available, otherwise use timeSlot
        const displayTime = item.actualObservationTime || item.timeSlot

        let row = `${displayTime},`
        item.measurements.forEach((measurement) => {
          row += `${measurement},`
        })
        row += `"${item.weatherRemark?.replace(/"/g, '""') || ""}"\n`
        csvContent += row
      }
    })

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `synoptic_data_${headerInfo.year}${headerInfo.month}${headerInfo.day}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Function to print the table
  const printTable = () => {
    window.print()
  }

  // Get today's formatted date for display
  const todayFormatted = format(new Date(), "MMMM d, yyyy")

  return (
    <div className="space-y-6 print:space-y-0">
      <div className="flex justify-between items-center print:hidden">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3v3a2 2 0 0 1-2 2H3" />
              <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
              <path d="M3 16h3a2 2 0 0 1 2 2v3" />
              <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
            </svg>
          </span>
          Today's Synoptic Code Data
          <span className="ml-3 text-sm font-normal text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {todayFormatted}
          </span>
        </h2>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2 text-blue-700 border-blue-300 hover:bg-blue-50"
            onClick={fetchTodayData}
            disabled={refreshing}
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="text-base">Refresh</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 text-blue-700 border-blue-300 hover:bg-blue-50"
            onClick={exportToCSV}
            disabled={!dailyData || !dailyData.synopticData.some((item) => item.hasData)}
          >
            <Download size={18} />
            <span className="text-base">Export CSV</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 text-blue-700 border-blue-300 hover:bg-blue-50"
            onClick={printTable}
            disabled={!dailyData || !dailyData.synopticData.some((item) => item.hasData)}
          >
            <Printer size={18} />
            <span className="text-base">Print</span>
          </Button>
        </div>
      </div>

      {debugInfo && (
        <Alert className="bg-blue-50 border-blue-200 print:hidden">
          <InfoIcon className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Debug Information</AlertTitle>
          <AlertDescription className="text-blue-700">{debugInfo}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <span className="ml-3 text-lg text-gray-700">Loading today's synoptic data...</span>
        </div>
      ) : !dailyData || !dailyData.synopticData.some((item) => item.hasData) ? (
        <div className="flex justify-center items-center h-64 bg-blue-50/50 rounded-lg border-2 border-dashed border-blue-200">
          <div className="text-center p-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-5 text-blue-400"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 8h20" />
              <path d="M6 12h4" />
              <path d="M14 12h4" />
              <path d="M6 16h4" />
              <path d="M14 16h4" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">No Data Available</h3>
            <p className="text-lg text-gray-600 mb-5">
              There is no synoptic data available for today ({todayFormatted}).
            </p>
            <Button
              variant="outline"
              className="bg-white text-blue-700 border-blue-300 hover:bg-blue-50 text-base"
              onClick={fetchTodayData}
            >
              Refresh Data
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full overflow-auto print:overflow-visible">
          {/* Header Section */}
          <div className="mb-4 print:mb-2">
            <div className="text-center border-b-2 border-blue-200 bg-gradient-to-b from-blue-50 to-white py-6 print:py-3 rounded-t-lg">
              <h2 className="text-3xl font-extrabold uppercase mb-5 print:mb-3 text-blue-800">SYNOPTIC CODE</h2>

              <div className="flex flex-wrap justify-center gap-10 print:gap-6 max-w-5xl mx-auto">
                <div className="text-left">
                  <div className="font-bold text-base mb-2 text-gray-600">DATA TYPE</div>
                  <div className="flex">
                    {headerInfo.dataType.split("").map((char, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-lg font-bold text-blue-700 rounded"
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-left">
                  <div className="font-bold text-base mb-2 text-gray-600">STATION NO.</div>
                  <div className="flex">
                    {headerInfo.stationNo.split("").map((char, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-lg font-bold text-blue-700 rounded"
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-left">
                  <div className="font-bold text-base mb-2 text-gray-600">YEAR</div>
                  <div className="flex">
                    {headerInfo.year.split("").map((char, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-lg font-bold text-blue-700 rounded"
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-left">
                  <div className="font-bold text-base mb-2 text-gray-600">MONTH</div>
                  <div className="flex">
                    {headerInfo.month.split("").map((char, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-lg font-bold text-blue-700 rounded"
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-left">
                  <div className="font-bold text-base mb-2 text-gray-600">DAY</div>
                  <div className="flex">
                    {headerInfo.day.split("").map((char, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-lg font-bold text-blue-700 rounded"
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-2 border-blue-200 rounded-lg shadow-lg overflow-x-auto print:overflow-visible bg-white">
            <table className="w-full border-collapse min-w-[1800px] text-base text-gray-800">
              <thead className="bg-gradient-to-b from-blue-600 to-blue-700 text-sm font-bold uppercase text-center text-white print:bg-blue-700">
                <tr>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">Time</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">C1</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">Iliii</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">iRiXhvv</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">Nddff</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">1SnTTT</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">2SnTdTdTd</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">3PPP/4PPP</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">6RRRtR</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">7wwW1W2</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">8NhClCmCh</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">2SnTnTnTn/InInInIn</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">56DlDmDh</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">57CDaEc</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">Av. Total Clouds</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">C2</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">GG</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">58/59P24</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">(6RRRtR)/7R24</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">8N5Ch5h5</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">90dqqqt</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">91fqfqfq</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100 text-center font-mono">
                {TIME_SLOTS.map((slot) => {
                  const dataForSlot = dailyData.synopticData.find((item) => item.timeSlot === slot.value)

                  if (!dataForSlot || !dataForSlot.hasData) {
                    // Check if this time slot is in the future
                    const currentHour = new Date().getHours()
                    const slotHour = Number.parseInt(slot.value, 10)
                    const isFutureSlot = slotHour > currentHour

                    return (
                      <tr key={slot.value} className={`${isFutureSlot ? "bg-gray-50/50" : "bg-gray-50"} text-gray-400`}>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap font-semibold">
                          {slot.label}
                        </td>
                        <td colSpan={22} className="border border-blue-200 px-4 py-3 text-center italic">
                          {isFutureSlot
                            ? "Data will be available after this time slot"
                            : dataForSlot?.partialData
                              ? dataForSlot.message || "Incomplete data for this time slot"
                              : "No data available for this time slot"}
                        </td>
                      </tr>
                    )
                  }

                  // Use the actual observation time from the data if available
                  const displayTime = dataForSlot.actualObservationTime || slot.label
                  const isActualTimeDifferent = displayTime !== slot.label

                  return (
                    <tr key={slot.value} className="bg-white hover:bg-blue-50 print:hover:bg-white">
                      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap font-semibold text-blue-700">
                        {displayTime}
                        {isActualTimeDifferent && (
                          <span className="ml-1 text-xs text-amber-600">(slot: {slot.label})</span>
                        )}
                        {dataForSlot.isMockData && <span className="ml-1 text-xs text-amber-600">(mock)</span>}
                      </td>
                      {dataForSlot.measurements?.map((m, i) => (
                        <td
                          key={i}
                          className={`border border-blue-200 px-4 py-3 whitespace-nowrap ${
                            i % 3 === 0 ? "bg-blue-50/20" : ""
                          }`}
                        >
                          {m}
                        </td>
                      ))}
                      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap text-left text-gray-700">
                        {dataForSlot.weatherRemark}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Optional footer */}
            <div className="text-right text-sm text-blue-600 mt-2 pr-4 pb-2 print:hidden">
              Last Updated: {new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}
            </div>
          </div>
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 0.5cm;
          }

          body {
            font-size: 10pt;
          }

          .print\\:bg-blue-700 {
            background-color: #1d4ed8 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print\\:bg-white {
            background-color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}
