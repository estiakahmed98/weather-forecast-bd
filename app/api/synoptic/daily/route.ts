// import { NextResponse } from "next/server"
// import { PrismaClient } from "@prisma/client"

// const prisma = new PrismaClient()

// export async function GET(request: Request) {
//   try {
//     // Get the requested date from the query parameters
//     const { searchParams } = new URL(request.url)
//     const dateParam = searchParams.get("date")

//     // Use the provided date or default to today
//     const targetDate = dateParam ? new Date(dateParam) : new Date()
//     const dateString = targetDate.toISOString().split("T")[0]

//     // Define the time slots for synoptic observations
//     const timeSlots = ["00", "03", "06", "09", "12", "15", "18", "21"]

//     // Fetch data for each time slot
//     const synopticData = await Promise.all(
//       timeSlots.map(async (timeSlot) => {
//         // Create time range for the slot
//         const startTime = new Date(`${dateString}T${timeSlot}:00:00.000Z`)
//         const endTime = new Date(startTime)
//         endTime.setHours(endTime.getHours() + 3)

//         // Find matching records from both models
//         const [meteorologicalEntry, weatherObservation] = await Promise.all([
//           prisma.meteorologicalEntry.findFirst({
//             where: {
//               timestamp: {
//                 contains: dateString,
//               },
//               observationTime: timeSlot,
//             },
//             orderBy: { createdAt: "desc" },
//           }),
//           prisma.weatherObservation.findFirst({
//             where: {
//               submittedAt: {
//                 gte: startTime,
//                 lt: endTime,
//               },
//               observationTime: timeSlot,
//             },
//             orderBy: { submittedAt: "desc" },
//           }),
//         ])

//         // If we have data for this time slot, generate the synoptic code
//         if (meteorologicalEntry && weatherObservation) {
//           // This would call the same code as in the main synoptic route
//           // For brevity, we'll just return a placeholder
//           return {
//             timeSlot,
//             hasData: true,
//             stationNo: weatherObservation.stationId || "00000",
//             // In a real implementation, you would generate the full measurements array here
//             // using the same logic as in the main synoptic route
//             measurements: Array(21).fill(`Sample data for ${timeSlot}`),
//             weatherRemark: weatherObservation.observerInitial || "",
//           }
//         }

//         return {
//           timeSlot,
//           hasData: false,
//         }
//       }),
//     )

//     return NextResponse.json({
//       date: dateString,
//       synopticData,
//     })
//   } catch (error) {
//     console.error("Error fetching daily synoptic data:", error)
//     return NextResponse.json({ error: "Failed to fetch daily synoptic data" }, { status: 500 })
//   } finally {
//     await prisma.$disconnect()
//   }
// }







// import { NextResponse } from "next/server"
// import { PrismaClient } from "@prisma/client"

// const prisma = new PrismaClient()

// export async function GET(request: Request) {
//   try {
//     // Get the requested date from the query parameters
//     const { searchParams } = new URL(request.url)
//     const dateParam = searchParams.get("date")

//     // Use the provided date or default to today
//     const targetDate = dateParam ? new Date(dateParam) : new Date()
//     const dateString = targetDate.toISOString().split("T")[0]

//     // Define the time slots for synoptic observations
//     const timeSlots = ["00", "03", "06", "09", "12", "15", "18", "21"]

//     // Fetch data for each time slot
//     const synopticData = await Promise.all(
//       timeSlots.map(async (timeSlot) => {
//         try {
//           // Find matching records from both models for this time slot
//           const [meteorologicalEntries, weatherObservations] = await Promise.all([
//             prisma.meteorologicalEntry.findMany({
//               where: {
//                 timestamp: {
//                   contains: dateString,
//                 },
//                 observationTime: timeSlot,
//               },
//               orderBy: { createdAt: "desc" },
//             }),
//             prisma.weatherObservation.findMany({
//               where: {
//                 submittedAt: {
//                   gte: new Date(`${dateString}T00:00:00.000Z`),
//                   lt: new Date(`${dateString}T23:59:59.999Z`),
//                 },
//                 observationTime: timeSlot,
//               },
//               orderBy: { submittedAt: "desc" },
//             }),
//           ])

//           // If we have data for this time slot from both models
//           if (meteorologicalEntries.length > 0 && weatherObservations.length > 0) {
//             const meteorologicalEntry = meteorologicalEntries[0]
//             const weatherObservation = weatherObservations[0]

//             // Initialize measurements array
//             const measurements: string[] = Array(21).fill("")

//             // Helper functions
//             const pad = (num: number | string | null | undefined, length: number): string => {
//               return String(num ?? 0).padStart(length, "0")
//             }

//             const getTempValue = (temp: number | null | undefined): string => {
//               const safeTemp = temp ?? 0
//               const sign = safeTemp >= 0 ? "0" : "1"
//               const absTemp = Math.abs(Math.round(safeTemp * 10))
//               return `${sign}${pad(absTemp, 3)}`
//             }

//             // 1. C1 (16) - Always 1
//             measurements[0] = "1"

//             // 2. Iliii (17-21) - Station number (5 digits)
//             const stationNo = weatherObservation.stationId
//               ? weatherObservation.stationId.toString().padStart(5, "0").substring(0, 5)
//               : "00000"
//             measurements[1] = stationNo

//             // 3. iRiXhvv (22-26) - 32 + low cloud height + visibility
//             const lowCloudHeight = weatherObservation.lowCloudHeight || "0"
//             const visibility = pad((Number(meteorologicalEntry.horizontalVisibility?.toString()?.[0]) || 0) * 10, 2)
//             measurements[2] = `32${lowCloudHeight}${visibility}`

//             // 4. Nddff (27-31) - Total cloud + wind direction + speed
//             const totalCloud = weatherObservation.totalCloudAmount || "0"
//             const windDirectionDeg = Number(weatherObservation.windDirection) || 0
//             const windSpeedKnots = Number(weatherObservation.windSpeed) || 0

//             let dd
//             if (windSpeedKnots === 0) {
//               dd = "00"
//             } else {
//               let directionCode
//               if (windDirectionDeg >= 355) {
//                 directionCode = 36
//               } else {
//                 directionCode = Math.floor((windDirectionDeg + 5) / 10)
//               }
//               dd = pad(directionCode, 2)
//             }

//             let ff
//             if (windSpeedKnots >= 100) {
//               const numericDd = Number.parseInt(dd, 10)
//               dd = pad(numericDd + 50, 2)
//               ff = pad(windSpeedKnots - 100, 2)
//             } else {
//               ff = pad(windSpeedKnots, 2)
//             }
//             measurements[3] = `${totalCloud}${dd}${ff}`

//             // 5. 1SnTTT (32-36) - Dry bulb temperature
//             const dryBulb = Number.parseFloat(meteorologicalEntry.dryBulbAsRead || "0")
//             measurements[4] = `1${getTempValue(dryBulb)}`

//             // 6. 2SnTdTdTd (37-41) - Dew point temperature
//             const dewPoint = Number.parseFloat(meteorologicalEntry.Td || "0")
//             measurements[5] = `2${getTempValue(dewPoint)}`

//             // 7. 3PPP/4PPP (42-46) - Station/sea level pressure
//             const stationPressure =
//               meteorologicalEntry.stationLevelPressure?.toString().replace(".", "").slice(0, 4) || "0000"
//             const seaLevelPressure =
//               meteorologicalEntry.correctedSeaLevelPressure?.toString().replace(".", "").slice(0, 4) || "0000"
//             measurements[6] = `3${stationPressure}/4${seaLevelPressure}`

//             // 8. 6RRRtR (47-51) - Precipitation
//             const precipitation = weatherObservation.rainfallLast24Hours || "0"
//             measurements[7] = `6${pad(precipitation, 4)}0`

//             // 9. 7wwW1W2 (52-56) - Weather codes
//             const presentWeather = meteorologicalEntry.presentWeatherWW || "00"
//             const pastWeather1 = meteorologicalEntry.pastWeatherW1 || "0"
//             const pastWeather2 = meteorologicalEntry.pastWeatherW2 || "0"
//             measurements[8] = `7${presentWeather}${pastWeather1}${pastWeather2}`

//             // 10. 8NhClCmCh (57-61) - Cloud information
//             const lowAmount = weatherObservation.lowCloudAmount || "0"
//             const lowForm = weatherObservation.lowCloudForm || "0"
//             const mediumForm = weatherObservation.mediumCloudForm || "0"
//             const highForm = weatherObservation.highCloudForm || "0"
//             measurements[9] = `8${lowAmount}${lowForm}${mediumForm}${highForm}`

//             // 11. 2SnTnTnTn/InInInIn (62-66) - Min temperature / ground state
//             const minTemp = Number.parseFloat(meteorologicalEntry.maxMinTempAsRead || "0")
//             let sN, x
//             if (minTemp >= 0) {
//               sN = 0
//               x = 1
//             } else {
//               sN = 1
//               x = 2
//             }
//             const conVertMinTemp = pad(Math.abs(Math.round(minTemp * 10)), 3)
//             measurements[10] = `${x}${sN}${conVertMinTemp}`

//             // 12. 56DlDmDh (67-71) - Cloud directions
//             const lowDir = weatherObservation.lowCloudDirection || "0"
//             const mediumDir = weatherObservation.mediumCloudDirection || "0"
//             const highDir = weatherObservation.highCloudDirection || "0"
//             measurements[11] = `56${lowDir}${mediumDir}${highDir}`

//             // 13. 57CDaEc (72-76) - Characteristic of pressure + pressure tendency
//             const pressureTendency = meteorologicalEntry.pressureChange24h?.toString()[0] || "0"
//             measurements[12] = `57${pressureTendency}00`

//             // 14. Av. Total Cloud (56) - Total cloud amount
//             measurements[13] = totalCloud

//             // 15. C2 (16) - Always 2
//             measurements[14] = "2"

//             // 16. GG (17-18) - Observation time (3 hour gap)
//             measurements[15] = timeSlot

//             // 17. 58P24P24P24/59P24P24P24 (19-23) - Pressure change
//             const pressureChange = Number.parseFloat(meteorologicalEntry.pressureChange24h || "0")
//             const pressureChangeIndicator = pressureChange >= 0 ? "58" : "59"
//             const absPressureChange = pad(Math.abs(Math.round(pressureChange * 10)), 3)
//             measurements[16] = `${pressureChangeIndicator}${absPressureChange}`

//             // 18. (6RRRtR)/7R24R24R24 (24-28) - Precipitation
//             measurements[17] = `(${measurements[7]})/7${pad(precipitation, 3)}`

//             // 19. 8N5Ch5h5 (29-33) - Cloud information
//             const lowFormSig = weatherObservation.layer1Form || "0"
//             const mediumFormSig = weatherObservation.layer2Form || "0"
//             const highFormSig = weatherObservation.layer3Form || "0"

//             const lowAmountSig = weatherObservation.layer1Amount || "0"
//             const mediumAmountSig = weatherObservation.layer2Amount || "0"
//             const highAmountSig = weatherObservation.layer3Amount || "0"

//             const lowHeightSig = pad((Number(weatherObservation.layer1Height) || 0) * 10, 2)
//             const mediumHeightSig = pad((Number(weatherObservation.layer2Height) || 0) * 10, 2)
//             const highHeightSig = pad((Number(weatherObservation.layer3Height) || 0) * 10, 2)

//             measurements[18] = `8${lowAmountSig}${lowFormSig}${lowHeightSig} / 8${mediumAmountSig}${mediumFormSig}${mediumHeightSig} / 8${highAmountSig}${highFormSig}${highHeightSig}`

//             // 20. 90dqqqt (34-38) - Dew point depression
//             const dewDepression = dryBulb - dewPoint
//             measurements[19] = `90${pad(Math.round(dewDepression * 10), 3)}`

//             // 21. 91fqfqfq (39-43) - Relative humidity
//             const humidity = meteorologicalEntry.relativeHumidity || "0"
//             measurements[20] = `91${pad(humidity, 3)}`

//             return {
//               timeSlot,
//               hasData: true,
//               stationNo,
//               measurements,
//               weatherRemark: weatherObservation.observerInitial || "",
//             }
//           }

//           // If we don't have data for this time slot, check if we should generate mock data
//           // This is for demonstration purposes only
//           const currentHour = new Date().getHours()
//           const currentSlot = Math.floor(currentHour / 3) * 3
//           const isCurrentDay = dateString === new Date().toISOString().split("T")[0]
//           const shouldGenerateMockData = isCurrentDay && Number(timeSlot) <= currentSlot

//           if (shouldGenerateMockData) {
//             // Generate mock data for demonstration
//             return {
//               timeSlot,
//               hasData: true,
//               stationNo: "41953",
//               measurements: Array(21)
//                 .fill("")
//                 .map((_, i) => {
//                   if (i === 0) return "1"
//                   if (i === 1) return "41953"
//                   if (i === 2) return "32150"
//                   if (i === 3) return "51805"
//                   if (i === 4) return "10267"
//                   if (i === 5) return "20198"
//                   if (i === 6) return "30145/40102"
//                   if (i === 7) return "60000"
//                   if (i === 8) return "70200"
//                   if (i === 9) return "80123"
//                   if (i === 10) return "10267"
//                   if (i === 11) return "56123"
//                   if (i === 12) return "57100"
//                   if (i === 13) return "5"
//                   if (i === 14) return "2"
//                   if (i === 15) return timeSlot
//                   if (i === 16) return "58002"
//                   if (i === 17) return "(60000)/7000"
//                   if (i === 18) return "81120 / 82230 / 83340"
//                   if (i === 19) return "90069"
//                   if (i === 20) return "91075"
//                   return ""
//                 }),
//               weatherRemark: "Observer notes for " + timeSlot,
//             }
//           }

//           return {
//             timeSlot,
//             hasData: false,
//           }
//         } catch (error) {
//           console.error(`Error processing time slot ${timeSlot}:`, error)
//           return {
//             timeSlot,
//             hasData: false,
//             error: error instanceof Error ? error.message : "Unknown error",
//           }
//         }
//       }),
//     )

//     return NextResponse.json({
//       date: dateString,
//       synopticData,
//     })
//   } catch (error) {
//     console.error("Error fetching daily synoptic data:", error)
//     return NextResponse.json({ error: "Failed to fetch daily synoptic data" }, { status: 500 })
//   } finally {
//     await prisma.$disconnect()
//   }
// }





























// import { NextResponse } from "next/server"
// import { PrismaClient } from "@prisma/client"

// const prisma = new PrismaClient()

// export async function GET(request: Request) {
//   try {
//     // Get the requested date from the query parameters
//     const { searchParams } = new URL(request.url)
//     const dateParam = searchParams.get("date")

//     // Use the provided date or default to today
//     const targetDate = dateParam ? new Date(dateParam) : new Date()
//     const dateString = targetDate.toISOString().split("T")[0]

//     // Check if the requested date is today
//     const today = new Date().toISOString().split("T")[0]
//     if (dateString !== today) {
//       // If not today, return empty data
//       return NextResponse.json(
//         {
//           date: dateString,
//           synopticData: [],
//           message: "Only current date data is available",
//         },
//         { status: 400 },
//       )
//     }

//     // Define the time slots for synoptic observations
//     const timeSlots = ["00", "03", "06", "09", "12", "15", "18", "21"]

//     // First, get all available meteorological entries and weather observations for today
//     const [allMeteorologicalEntries, allWeatherObservations] = await Promise.all([
//       prisma.meteorologicalEntry.findMany({
//         where: {
//           timestamp: {
//             contains: dateString,
//           },
//         },
//         orderBy: { createdAt: "desc" },
//       }),
//       prisma.weatherObservation.findMany({
//         where: {
//           submittedAt: {
//             gte: new Date(`${dateString}T00:00:00.000Z`),
//             lt: new Date(`${dateString}T23:59:59.999Z`),
//           },
//         },
//         orderBy: { submittedAt: "desc" },
//       }),
//     ])

//     // Log the available data for debugging
//     console.log(`Found ${allMeteorologicalEntries.length} meteorological entries for today`)
//     console.log(`Found ${allWeatherObservations.length} weather observations for today`)

//     if (allMeteorologicalEntries.length > 0) {
//       console.log(
//         "Available observation times (MeteorologicalEntry):",
//         allMeteorologicalEntries.map((entry) => entry.observationTime),
//       )
//     }

//     if (allWeatherObservations.length > 0) {
//       console.log(
//         "Available observation times (WeatherObservation):",
//         allWeatherObservations.map((obs) => obs.observationTime),
//       )
//     }

//     // Process each time slot
//     const synopticData = await Promise.all(
//       timeSlots.map(async (timeSlot) => {
//         try {
//           // Filter entries for this specific time slot
//           const meteorologicalEntries = allMeteorologicalEntries.filter((entry) => entry.observationTime === timeSlot)

//           const weatherObservations = allWeatherObservations.filter((obs) => obs.observationTime === timeSlot)

//           // If we have data for this time slot from both models
//           if (meteorologicalEntries.length > 0 && weatherObservations.length > 0) {
//             const meteorologicalEntry = meteorologicalEntries[0]
//             const weatherObservation = weatherObservations[0]

//             // Initialize measurements array
//             const measurements: string[] = Array(21).fill("")

//             // Helper functions
//             const pad = (num: number | string | null | undefined, length: number): string => {
//               return String(num ?? 0).padStart(length, "0")
//             }

//             const getTempValue = (temp: number | null | undefined): string => {
//               const safeTemp = temp ?? 0
//               const sign = safeTemp >= 0 ? "0" : "1"
//               const absTemp = Math.abs(Math.round(safeTemp * 10))
//               return `${sign}${pad(absTemp, 3)}`
//             }

//             // 1. C1 (16) - Always 1
//             measurements[0] = "1"

//             // 2. Iliii (17-21) - Station number (5 digits)
//             const stationNo = weatherObservation.stationId
//               ? weatherObservation.stationId.toString().padStart(5, "0").substring(0, 5)
//               : "00000"
//             measurements[1] = stationNo

//             // 3. iRiXhvv (22-26) - 32 + low cloud height + visibility
//             const lowCloudHeight = weatherObservation.lowCloudHeight || "0"
//             const visibility = pad((Number(meteorologicalEntry.horizontalVisibility?.toString()?.[0]) || 0) * 10, 2)
//             measurements[2] = `32${lowCloudHeight}${visibility}`

//             // 4. Nddff (27-31) - Total cloud + wind direction + speed
//             const totalCloud = weatherObservation.totalCloudAmount || "0"
//             const windDirectionDeg = Number(weatherObservation.windDirection) || 0
//             const windSpeedKnots = Number(weatherObservation.windSpeed) || 0

//             let dd
//             if (windSpeedKnots === 0) {
//               dd = "00"
//             } else {
//               let directionCode
//               if (windDirectionDeg >= 355) {
//                 directionCode = 36
//               } else {
//                 directionCode = Math.floor((windDirectionDeg + 5) / 10)
//               }
//               dd = pad(directionCode, 2)
//             }

//             let ff
//             if (windSpeedKnots >= 100) {
//               const numericDd = Number.parseInt(dd, 10)
//               dd = pad(numericDd + 50, 2)
//               ff = pad(windSpeedKnots - 100, 2)
//             } else {
//               ff = pad(windSpeedKnots, 2)
//             }
//             measurements[3] = `${totalCloud}${dd}${ff}`

//             // 5. 1SnTTT (32-36) - Dry bulb temperature
//             const dryBulb = Number.parseFloat(meteorologicalEntry.dryBulbAsRead || "0")
//             measurements[4] = `1${getTempValue(dryBulb)}`

//             // 6. 2SnTdTdTd (37-41) - Dew point temperature
//             const dewPoint = Number.parseFloat(meteorologicalEntry.Td || "0")
//             measurements[5] = `2${getTempValue(dewPoint)}`

//             // 7. 3PPP/4PPP (42-46) - Station/sea level pressure
//             const stationPressure =
//               meteorologicalEntry.stationLevelPressure?.toString().replace(".", "").slice(0, 4) || "0000"
//             const seaLevelPressure =
//               meteorologicalEntry.correctedSeaLevelPressure?.toString().replace(".", "").slice(0, 4) || "0000"
//             measurements[6] = `3${stationPressure}/4${seaLevelPressure}`

//             // 8. 6RRRtR (47-51) - Precipitation
//             const precipitation = weatherObservation.rainfallLast24Hours || "0"
//             measurements[7] = `6${pad(precipitation, 4)}0`

//             // 9. 7wwW1W2 (52-56) - Weather codes
//             const presentWeather = meteorologicalEntry.presentWeatherWW || "00"
//             const pastWeather1 = meteorologicalEntry.pastWeatherW1 || "0"
//             const pastWeather2 = meteorologicalEntry.pastWeatherW2 || "0"
//             measurements[8] = `7${presentWeather}${pastWeather1}${pastWeather2}`

//             // 10. 8NhClCmCh (57-61) - Cloud information
//             const lowAmount = weatherObservation.lowCloudAmount || "0"
//             const lowForm = weatherObservation.lowCloudForm || "0"
//             const mediumForm = weatherObservation.mediumCloudForm || "0"
//             const highForm = weatherObservation.highCloudForm || "0"
//             measurements[9] = `8${lowAmount}${lowForm}${mediumForm}${highForm}`

//             // 11. 2SnTnTnTn/InInInIn (62-66) - Min temperature / ground state
//             const minTemp = Number.parseFloat(meteorologicalEntry.maxMinTempAsRead || "0")
//             let sN, x
//             if (minTemp >= 0) {
//               sN = 0
//               x = 1
//             } else {
//               sN = 1
//               x = 2
//             }
//             const conVertMinTemp = pad(Math.abs(Math.round(minTemp * 10)), 3)
//             measurements[10] = `${x}${sN}${conVertMinTemp}`

//             // 12. 56DlDmDh (67-71) - Cloud directions
//             const lowDir = weatherObservation.lowCloudDirection || "0"
//             const mediumDir = weatherObservation.mediumCloudDirection || "0"
//             const highDir = weatherObservation.highCloudDirection || "0"
//             measurements[11] = `56${lowDir}${mediumDir}${highDir}`

//             // 13. 57CDaEc (72-76) - Characteristic of pressure + pressure tendency
//             const pressureTendency = meteorologicalEntry.pressureChange24h?.toString()[0] || "0"
//             measurements[12] = `57${pressureTendency}00`

//             // 14. Av. Total Cloud (56) - Total cloud amount
//             measurements[13] = totalCloud

//             // 15. C2 (16) - Always 2
//             measurements[14] = "2"

//             // 16. GG (17-18) - Observation time (3 hour gap)
//             measurements[15] = timeSlot

//             // 17. 58P24P24P24/59P24P24P24 (19-23) - Pressure change
//             const pressureChange = Number.parseFloat(meteorologicalEntry.pressureChange24h || "0")
//             const pressureChangeIndicator = pressureChange >= 0 ? "58" : "59"
//             const absPressureChange = pad(Math.abs(Math.round(pressureChange * 10)), 3)
//             measurements[16] = `${pressureChangeIndicator}${absPressureChange}`

//             // 18. (6RRRtR)/7R24R24R24 (24-28) - Precipitation
//             measurements[17] = `(${measurements[7]})/7${pad(precipitation, 3)}`

//             // 19. 8N5Ch5h5 (29-33) - Cloud information
//             const lowFormSig = weatherObservation.layer1Form || "0"
//             const mediumFormSig = weatherObservation.layer2Form || "0"
//             const highFormSig = weatherObservation.layer3Form || "0"

//             const lowAmountSig = weatherObservation.layer1Amount || "0"
//             const mediumAmountSig = weatherObservation.layer2Amount || "0"
//             const highAmountSig = weatherObservation.layer3Amount || "0"

//             const lowHeightSig = pad((Number(weatherObservation.layer1Height) || 0) * 10, 2)
//             const mediumHeightSig = pad((Number(weatherObservation.layer2Height) || 0) * 10, 2)
//             const highHeightSig = pad((Number(weatherObservation.layer3Height) || 0) * 10, 2)

//             measurements[18] = `8${lowAmountSig}${lowFormSig}${lowHeightSig} / 8${mediumAmountSig}${mediumFormSig}${mediumHeightSig} / 8${highAmountSig}${highFormSig}${highHeightSig}`

//             // 20. 90dqqqt (34-38) - Dew point depression
//             const dewDepression = dryBulb - dewPoint
//             measurements[19] = `90${pad(Math.round(dewDepression * 10), 3)}`

//             // 21. 91fqfqfq (39-43) - Relative humidity
//             const humidity = meteorologicalEntry.relativeHumidity || "0"
//             measurements[20] = `91${pad(humidity, 3)}`

//             return {
//               timeSlot,
//               hasData: true,
//               stationNo,
//               measurements,
//               weatherRemark: weatherObservation.observerInitial || "",
//             }
//           }

//           // If we don't have matching data for this time slot, check if we have partial data
//           // that we can use to generate a synoptic code
//           if (meteorologicalEntries.length > 0 || weatherObservations.length > 0) {
//             console.log(`Partial data available for time slot ${timeSlot}:`, {
//               meteorologicalEntries: meteorologicalEntries.length,
//               weatherObservations: weatherObservations.length,
//             })

//             // If we have meteorological data but no weather observation, or vice versa,
//             // we could try to find the closest matching entry from the other model
//             // This is a simplified approach - in a real system, you might want more sophisticated matching

//             // For now, we'll just return that we don't have complete data
//             return {
//               timeSlot,
//               hasData: false,
//               partialData: true,
//               message: "Incomplete data for this time slot",
//             }
//           }

//           // If we don't have data for this time slot, check if we should generate mock data
//           // This is for demonstration purposes only - DISABLED for now to ensure real data is prioritized
//           const generateMockData = false // Set to true if you want mock data for empty slots

//           if (generateMockData) {
//             const currentHour = new Date().getHours()
//             const currentSlot = Math.floor(currentHour / 3) * 3
//             const shouldGenerateMockData = Number(timeSlot) <= currentSlot

//             if (shouldGenerateMockData) {
//               // Generate mock data for demonstration
//               return {
//                 timeSlot,
//                 hasData: true,
//                 stationNo: "41953",
//                 measurements: Array(21)
//                   .fill("")
//                   .map((_, i) => {
//                     if (i === 0) return "1"
//                     if (i === 1) return "41953"
//                     if (i === 2) return "32150"
//                     if (i === 3) return "51805"
//                     if (i === 4) return "10267"
//                     if (i === 5) return "20198"
//                     if (i === 6) return "30145/40102"
//                     if (i === 7) return "60000"
//                     if (i === 8) return "70200"
//                     if (i === 9) return "80123"
//                     if (i === 10) return "10267"
//                     if (i === 11) return "56123"
//                     if (i === 12) return "57100"
//                     if (i === 13) return "5"
//                     if (i === 14) return "2"
//                     if (i === 15) return timeSlot
//                     if (i === 16) return "58002"
//                     if (i === 17) return "(60000)/7000"
//                     if (i === 18) return "81120 / 82230 / 83340"
//                     if (i === 19) return "90069"
//                     if (i === 20) return "91075"
//                     return ""
//                   }),
//                 weatherRemark: "Mock data for " + timeSlot,
//                 isMockData: true,
//               }
//             }
//           }

//           return {
//             timeSlot,
//             hasData: false,
//           }
//         } catch (error) {
//           console.error(`Error processing time slot ${timeSlot}:`, error)
//           return {
//             timeSlot,
//             hasData: false,
//             error: error instanceof Error ? error.message : "Unknown error",
//           }
//         }
//       }),
//     )

//     return NextResponse.json({
//       date: dateString,
//       synopticData,
//     })
//   } catch (error) {
//     console.error("Error fetching daily synoptic data:", error)
//     return NextResponse.json({ error: "Failed to fetch daily synoptic data" }, { status: 500 })
//   } finally {
//     await prisma.$disconnect()
//   }
// }









import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    // Get the requested date from the query parameters
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date")

    // Use the provided date or default to today
    const targetDate = dateParam ? new Date(dateParam) : new Date()
    const dateString = targetDate.toISOString().split("T")[0]

    // Check if the requested date is today
    const today = new Date().toISOString().split("T")[0]
    if (dateString !== today) {
      // If not today, return empty data
      return NextResponse.json(
        {
          date: dateString,
          synopticData: [],
          message: "Only current date data is available",
        },
        { status: 400 },
      )
    }

    // Define the time slots for synoptic observations
    const timeSlots = ["00", "03", "06", "09", "12", "15", "18", "21"]

    // First, get all available meteorological entries and weather observations for today
    const [allMeteorologicalEntries, allWeatherObservations] = await Promise.all([
      prisma.meteorologicalEntry.findMany({
        where: {
          timestamp: {
            contains: dateString,
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.weatherObservation.findMany({
        where: {
          submittedAt: {
            gte: new Date(`${dateString}T00:00:00.000Z`),
            lt: new Date(`${dateString}T23:59:59.999Z`),
          },
        },
        orderBy: { submittedAt: "desc" },
      }),
    ])

    // Log the available data for debugging
    console.log(`Found ${allMeteorologicalEntries.length} meteorological entries for today`)
    console.log(`Found ${allWeatherObservations.length} weather observations for today`)

    if (allMeteorologicalEntries.length > 0) {
      console.log(
        "Available observation times (MeteorologicalEntry):",
        allMeteorologicalEntries.map((entry) => entry.observationTime),
      )
    }

    if (allWeatherObservations.length > 0) {
      console.log(
        "Available observation times (WeatherObservation):",
        allWeatherObservations.map((obs) => obs.observationTime),
      )
    }

    // Process each time slot
    const synopticData = await Promise.all(
      timeSlots.map(async (timeSlot) => {
        try {
          // Filter entries for this specific time slot
          const meteorologicalEntries = allMeteorologicalEntries.filter((entry) => entry.observationTime === timeSlot)

          const weatherObservations = allWeatherObservations.filter((obs) => obs.observationTime === timeSlot)

          // If we have data for this time slot from both models
          if (meteorologicalEntries.length > 0 && weatherObservations.length > 0) {
            const meteorologicalEntry = meteorologicalEntries[0]
            const weatherObservation = weatherObservations[0]

            // Initialize measurements array
            const measurements: string[] = Array(21).fill("")

            // Helper functions
            const pad = (num: number | string | null | undefined, length: number): string => {
              return String(num ?? 0).padStart(length, "0")
            }

            const getTempValue = (temp: number | null | undefined): string => {
              const safeTemp = temp ?? 0
              const sign = safeTemp >= 0 ? "0" : "1"
              const absTemp = Math.abs(Math.round(safeTemp * 10))
              return `${sign}${pad(absTemp, 3)}`
            }

            // 1. C1 (16) - Always 1
            measurements[0] = "1"

            // 2. Iliii (17-21) - Station number (5 digits)
            const stationNo = weatherObservation.stationId
              ? weatherObservation.stationId.toString().padStart(5, "0").substring(0, 5)
              : "00000"
            measurements[1] = stationNo

            // 3. iRiXhvv (22-26) - 32 + low cloud height + visibility
            const lowCloudHeight = weatherObservation.lowCloudHeight || "0"
            const visibility = pad((Number(meteorologicalEntry.horizontalVisibility?.toString()?.[0]) || 0) * 10, 2)
            measurements[2] = `32${lowCloudHeight}${visibility}`

            // 4. Nddff (27-31) - Total cloud + wind direction + speed
            const totalCloud = weatherObservation.totalCloudAmount || "0"
            const windDirectionDeg = Number(weatherObservation.windDirection) || 0
            const windSpeedKnots = Number(weatherObservation.windSpeed) || 0

            let dd
            if (windSpeedKnots === 0) {
              dd = "00"
            } else {
              let directionCode
              if (windDirectionDeg >= 355) {
                directionCode = 36
              } else {
                directionCode = Math.floor((windDirectionDeg + 5) / 10)
              }
              dd = pad(directionCode, 2)
            }

            let ff
            if (windSpeedKnots >= 100) {
              const numericDd = Number.parseInt(dd, 10)
              dd = pad(numericDd + 50, 2)
              ff = pad(windSpeedKnots - 100, 2)
            } else {
              ff = pad(windSpeedKnots, 2)
            }
            measurements[3] = `${totalCloud}${dd}${ff}`

            // 5. 1SnTTT (32-36) - Dry bulb temperature
            const dryBulb = Number.parseFloat(meteorologicalEntry.dryBulbAsRead || "0")
            measurements[4] = `1${getTempValue(dryBulb)}`

            // 6. 2SnTdTdTd (37-41) - Dew point temperature
            const dewPoint = Number.parseFloat(meteorologicalEntry.Td || "0")
            measurements[5] = `2${getTempValue(dewPoint)}`

            // 7. 3PPP/4PPP (42-46) - Station/sea level pressure
            const stationPressure =
              meteorologicalEntry.stationLevelPressure?.toString().replace(".", "").slice(0, 4) || "0000"
            const seaLevelPressure =
              meteorologicalEntry.correctedSeaLevelPressure?.toString().replace(".", "").slice(0, 4) || "0000"
            measurements[6] = `3${stationPressure}/4${seaLevelPressure}`

            // 8. 6RRRtR (47-51) - Precipitation
            const precipitation = weatherObservation.rainfallLast24Hours || "0"
            measurements[7] = `6${pad(precipitation, 4)}0`

            // 9. 7wwW1W2 (52-56) - Weather codes
            const presentWeather = meteorologicalEntry.presentWeatherWW || "00"
            const pastWeather1 = meteorologicalEntry.pastWeatherW1 || "0"
            const pastWeather2 = meteorologicalEntry.pastWeatherW2 || "0"
            measurements[8] = `7${presentWeather}${pastWeather1}${pastWeather2}`

            // 10. 8NhClCmCh (57-61) - Cloud information
            const lowAmount = weatherObservation.lowCloudAmount || "0"
            const lowForm = weatherObservation.lowCloudForm || "0"
            const mediumForm = weatherObservation.mediumCloudForm || "0"
            const highForm = weatherObservation.highCloudForm || "0"
            measurements[9] = `8${lowAmount}${lowForm}${mediumForm}${highForm}`

            // 11. 2SnTnTnTn/InInInIn (62-66) - Min temperature / ground state
            const minTemp = Number.parseFloat(meteorologicalEntry.maxMinTempAsRead || "0")
            let sN, x
            if (minTemp >= 0) {
              sN = 0
              x = 1
            } else {
              sN = 1
              x = 2
            }
            const conVertMinTemp = pad(Math.abs(Math.round(minTemp * 10)), 3)
            measurements[10] = `${x}${sN}${conVertMinTemp}`

            // 12. 56DlDmDh (67-71) - Cloud directions
            const lowDir = weatherObservation.lowCloudDirection || "0"
            const mediumDir = weatherObservation.mediumCloudDirection || "0"
            const highDir = weatherObservation.highCloudDirection || "0"
            measurements[11] = `56${lowDir}${mediumDir}${highDir}`

            // 13. 57CDaEc (72-76) - Characteristic of pressure + pressure tendency
            const pressureTendency = meteorologicalEntry.pressureChange24h?.toString()[0] || "0"
            measurements[12] = `57${pressureTendency}00`

            // 14. Av. Total Cloud (56) - Total cloud amount
            measurements[13] = totalCloud

            // 15. C2 (16) - Always 2
            measurements[14] = "2"

            // 16. GG (17-18) - Observation time (3 hour gap)
            // Use the actual observation time from the data
            const actualObservationTime = meteorologicalEntry.observationTime || timeSlot
            measurements[15] = actualObservationTime

            // 17. 58P24P24P24/59P24P24P24 (19-23) - Pressure change
            const pressureChange = Number.parseFloat(meteorologicalEntry.pressureChange24h || "0")
            const pressureChangeIndicator = pressureChange >= 0 ? "58" : "59"
            const absPressureChange = pad(Math.abs(Math.round(pressureChange * 10)), 3)
            measurements[16] = `${pressureChangeIndicator}${absPressureChange}`

            // 18. (6RRRtR)/7R24R24R24 (24-28) - Precipitation
            measurements[17] = `(${measurements[7]})/7${pad(precipitation, 3)}`

            // 19. 8N5Ch5h5 (29-33) - Cloud information
            const lowFormSig = weatherObservation.layer1Form || "0"
            const mediumFormSig = weatherObservation.layer2Form || "0"
            const highFormSig = weatherObservation.layer3Form || "0"

            const lowAmountSig = weatherObservation.layer1Amount || "0"
            const mediumAmountSig = weatherObservation.layer2Amount || "0"
            const highAmountSig = weatherObservation.layer3Amount || "0"

            const lowHeightSig = pad((Number(weatherObservation.layer1Height) || 0) * 10, 2)
            const mediumHeightSig = pad((Number(weatherObservation.layer2Height) || 0) * 10, 2)
            const highHeightSig = pad((Number(weatherObservation.layer3Height) || 0) * 10, 2)

            measurements[18] = `8${lowAmountSig}${lowFormSig}${lowHeightSig} / 8${mediumAmountSig}${mediumFormSig}${mediumHeightSig} / 8${highAmountSig}${highFormSig}${highHeightSig}`

            // 20. 90dqqqt (34-38) - Dew point depression
            const dewDepression = dryBulb - dewPoint
            measurements[19] = `90${pad(Math.round(dewDepression * 10), 3)}`

            // 21. 91fqfqfq (39-43) - Relative humidity
            const humidity = meteorologicalEntry.relativeHumidity || "0"
            measurements[20] = `91${pad(humidity, 3)}`

            return {
              timeSlot,
              actualObservationTime: actualObservationTime,
              hasData: true,
              stationNo,
              measurements,
              weatherRemark: weatherObservation.observerInitial || "",
            }
          }

          // If we don't have matching data for this time slot, check if we have partial data
          // that we can use to generate a synoptic code
          if (meteorologicalEntries.length > 0 || weatherObservations.length > 0) {
            console.log(`Partial data available for time slot ${timeSlot}:`, {
              meteorologicalEntries: meteorologicalEntries.length,
              weatherObservations: weatherObservations.length,
            })

            // If we have meteorological data but no weather observation, or vice versa,
            // we could try to find the closest matching entry from the other model
            // This is a simplified approach - in a real system, you might want more sophisticated matching

            // For now, we'll just return that we don't have complete data
            return {
              timeSlot,
              hasData: false,
              partialData: true,
              message: "Incomplete data for this time slot",
            }
          }

          // If we don't have data for this time slot, check if we should generate mock data
          // This is for demonstration purposes only - DISABLED for now to ensure real data is prioritized
          const generateMockData = false // Set to true if you want mock data for empty slots

          if (generateMockData) {
            const currentHour = new Date().getHours()
            const currentSlot = Math.floor(currentHour / 3) * 3
            const shouldGenerateMockData = Number(timeSlot) <= currentSlot

            if (shouldGenerateMockData) {
              // Generate mock data for demonstration
              return {
                timeSlot,
                actualObservationTime: timeSlot,
                hasData: true,
                stationNo: "41953",
                measurements: Array(21)
                  .fill("")
                  .map((_, i) => {
                    if (i === 0) return "1"
                    if (i === 1) return "41953"
                    if (i === 2) return "32150"
                    if (i === 3) return "51805"
                    if (i === 4) return "10267"
                    if (i === 5) return "20198"
                    if (i === 6) return "30145/40102"
                    if (i === 7) return "60000"
                    if (i === 8) return "70200"
                    if (i === 9) return "80123"
                    if (i === 10) return "10267"
                    if (i === 11) return "56123"
                    if (i === 12) return "57100"
                    if (i === 13) return "5"
                    if (i === 14) return "2"
                    if (i === 15) return timeSlot
                    if (i === 16) return "58002"
                    if (i === 17) return "(60000)/7000"
                    if (i === 18) return "81120 / 82230 / 83340"
                    if (i === 19) return "90069"
                    if (i === 20) return "91075"
                    return ""
                  }),
                weatherRemark: "Mock data for " + timeSlot,
                isMockData: true,
              }
            }
          }

          return {
            timeSlot,
            hasData: false,
          }
        } catch (error) {
          console.error(`Error processing time slot ${timeSlot}:`, error)
          return {
            timeSlot,
            hasData: false,
            error: error instanceof Error ? error.message : "Unknown error",
          }
        }
      }),
    )

    return NextResponse.json({
      date: dateString,
      synopticData,
    })
  } catch (error) {
    console.error("Error fetching daily synoptic data:", error)
    return NextResponse.json({ error: "Failed to fetch daily synoptic data" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
