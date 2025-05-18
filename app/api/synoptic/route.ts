// import { NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export async function GET() {
//   try {
//     // Get the current date
//     const now = new Date();
//     const today = now.toISOString().split('T')[0];

//     // Fetch most recent records from database
//     const [firstCard, weatherObs] = await Promise.all([
//       prisma.meteorologicalEntry.findFirst({
//         orderBy: { createdAt: 'desc' },
//         where: {
//           timestamp: {
//             contains: today,
//           },
//         },
//       }),
//       prisma.weatherObservation.findFirst({
//         orderBy: { submittedAt: 'desc' },
//         where: {
//           observationTime: {
//             gte: new Date(`${today}T00:00:00.000Z`),
//             lte: new Date(`${today}T23:59:59.999Z`),
//           },
//         },
//       }),
//     ]);

//     // If no data for today, get the most recent records regardless of date
//     const finalFirstCard = firstCard || await prisma.meteorologicalEntry.findFirst({
//       orderBy: { createdAt: 'desc' },
//     });

//     const finalWeatherObs = weatherObs || await prisma.weatherObservation.findFirst({
//       orderBy: { submittedAt: 'desc' },
//     });

//     if (!finalFirstCard || !finalWeatherObs) {
//       return NextResponse.json(
//         { error: 'No weather data available' },
//         { status: 404 }
//       );
//     }

//     // Initialize measurements array
//     const measurements: string[] = Array(21).fill('');

//     // Helper functions
//     const pad = (num: number | string | null | undefined, length: number): string => {
//       return String(num ?? 0).padStart(length, '0');
//     };

//     const getTempValue = (temp: number | null | undefined): string => {
//       const safeTemp = temp ?? 0;
//       const sign = safeTemp >= 0 ? '0' : '1';
//       const absTemp = Math.abs(Math.round(safeTemp * 10));
//       return `${sign}${pad(absTemp, 3)}`;
//     };

//     // 1. C1 (16) - Always 1
//     measurements[0] = '1';

//     // 2. Iliii (17-21) - Station number (5 digits)
//    const stationNo = finalWeatherObs.stationId
//     ? Object.values(finalWeatherObs.stationId).slice(0, 5).join("")
//     : "00000";
//   measurements[1] = stationNo;

//     // 3. iRiXhvv (22-26) - 32 + low cloud height + visibility
//     const lowCloudHeight = (finalWeatherObs.lowCloudHeight);
//     const visibility = pad((Number(finalFirstCard.horizontalVisibility?.toString()?.[0]) || 0) * 10, 2);
//     measurements[2] = `32${lowCloudHeight}${visibility}`;

//     // 4. Nddff (27-31) - Total cloud + wind direction + speed
//     const totalCloud = finalWeatherObs.totalCloudAmount || '0';
//     const windDirectionDeg = Number(finalWeatherObs.windDirection) || 0;
//     const windSpeedKnots = Number(finalWeatherObs.windSpeed) || 0;

//     let dd;
//     if (windSpeedKnots === 0) {
//       dd = '00';
//     } else {
//       let directionCode;
//       if (windDirectionDeg >= 355) {
//         directionCode = 36;
//       } else {
//         directionCode = Math.floor((windDirectionDeg + 5) / 10);
//       }
//       dd = pad(directionCode, 2);
//     }

//     let ff;
//     if (windSpeedKnots >= 100) {
//       const numericDd = parseInt(dd, 10);
//       dd = pad(numericDd + 50, 2);
//       ff = pad(windSpeedKnots - 100, 2);
//     } else {
//       ff = pad(windSpeedKnots, 2);
//     }
//     measurements[3] = `${totalCloud}${dd}${ff}`;

//     // 5. 1SnTTT (32-36) - Dry bulb temperature
//     const dryBulb = Number.parseFloat(finalFirstCard.dryBulbAsRead || '0');
//     measurements[4] = `1${getTempValue(dryBulb)}`;

//     // 6. 2SnTdTdTd (37-41) - Dew point temperature
//     const dewPoint = Number.parseFloat(finalFirstCard.Td || '0');
//     measurements[5] = `2${getTempValue(dewPoint)}`;

//     // 7. 3PPP/4PPP (42-46) - Station/sea level pressure
//     const stationPressure = finalFirstCard.stationLevelPressure?.toString().replace('.', '').slice(0, 4) || '0000';
//     const seaLevelPressure = finalFirstCard.correctedSeaLevelPressure?.toString().replace('.', '').slice(0, 4) || '0000';
//     measurements[6] = `3${stationPressure}/4${seaLevelPressure}`;

//     // 8. 6RRRtR (47-51) - Precipitation
//     const precipitation = finalWeatherObs.rainfallLast24Hours || '0';
//     measurements[7] = `6${pad(precipitation, 4)}0`;

//     // 9. 7wwW1W2 (52-56) - Weather codes
//     const presentWeather = finalFirstCard.presentWeatherWW || '00';
//     const pastWeather1 = finalFirstCard.pastWeatherW1 || '0';
//     const pastWeather2 = finalFirstCard.pastWeatherW2 || '0';
//     measurements[8] = `7${presentWeather}${pastWeather1}${pastWeather2}`;

//     // 10. 8NhClCmCh (57-61) - Cloud information
//     const lowAmount = finalWeatherObs.lowCloudAmount || '0';
//     const lowForm = finalWeatherObs.lowCloudForm || '0';
//     const mediumForm = finalWeatherObs.mediumCloudForm || '0';
//     const highForm = finalWeatherObs.highCloudForm || '0';
//     measurements[9] = `8${lowAmount}${lowForm}${mediumForm}${highForm}`;

//     // 11. 2SnTnTnTn/InInInIn (62-66) - Min temperature / ground state
//     const minTemp = Number.parseFloat(finalFirstCard.maxMinTempAsRead || '0');
//     let sN, x;
//     if (minTemp >= 0) {
//       sN = 0;
//       x = 1;
//     } else {
//       sN = 1;
//       x = 2;
//     }
//     let conVertMinTemp = pad(Math.abs(Math.round(minTemp * 10)), 3);
//     measurements[10] = `${x}${sN}${conVertMinTemp}`;

//     // 12. 56DlDmDh (67-71) - Cloud directions
//     const lowDir = finalWeatherObs.lowCloudDirection || '0';
//     const mediumDir = finalWeatherObs.mediumCloudDirection || '0';
//     const highDir = finalWeatherObs.highCloudDirection || '0';
//     measurements[11] = `56${lowDir}${mediumDir}${highDir}`;

//     // 13. 57CDaEc (72-76) - Characteristic of pressure + pressure tendency
//     const pressureTendency = finalFirstCard.pressureChange24h?.toString()[0] || '0';
//     measurements[12] = `57${pressureTendency}00`;

//     // 14. Av. Total Cloud (56) - Total cloud amount
//     measurements[13] = totalCloud;

//     // 15. C2 (16) - Always 2
//     measurements[14] = '2';

//     // 16. GG (17-18) - Observation time (3 hour gap)
//     let hour = '00';
//     if (finalWeatherObs.observationTime) {
//       const obsTime = new Date(finalWeatherObs.observationTime);
//       const hours = obsTime.getHours();
//       hour = pad(Math.floor(hours / 3) * 3, 2);
//     }
//     measurements[15] = hour;

//     // 17. 58P24P24P24/59P24P24P24 (19-23) - Pressure change
//     const pressureChange = Number.parseFloat(finalFirstCard.pressureChange24h || '0');
//     const pressureChangeIndicator = pressureChange >= 0 ? '58' : '59';
//     const absPressureChange = pad(Math.abs(Math.round(pressureChange * 10)), 3);
//     measurements[16] = `${pressureChangeIndicator}${absPressureChange}`;

//     // 18. (6RRRtR)/7R24R24R24 (24-28) - Precipitation
//     measurements[17] = `(${measurements[7]})/7${pad(precipitation, 3)}`;

//     // 19. 8N5Ch5h5 (29-33) - Cloud information
//     let lowFormSig = finalWeatherObs.layer1Form || '0';
//     let mediumFormSig = finalWeatherObs.layer2Form || '0';
//     let highFormSig = finalWeatherObs.layer3Form || '0';

//     let lowAmountSig = finalWeatherObs.layer1Amount || '0';
//     let mediumAmountSig = finalWeatherObs.layer2Amount || '0';
//     let highAmountSig = finalWeatherObs.layer3Amount || '0';

//     let lowHeightSig = pad((Number(finalWeatherObs.layer1Height) || 0) * 10, 2);
//     let mediumHeightSig = pad((Number(finalWeatherObs.layer2Height) || 0) * 10, 2);
//     let highHeightSig = pad((Number(finalWeatherObs.layer3Height) || 0) * 10, 2);

//     measurements[18] = `8${lowAmountSig}${lowFormSig}${lowHeightSig} / 8${mediumAmountSig}${mediumFormSig}${mediumHeightSig} / 8${highAmountSig}${highFormSig}${highHeightSig}`;

//     // 20. 90dqqqt (34-38) - Dew point depression
//     const dewDepression = dryBulb - dewPoint;
//     measurements[19] = `90${pad(Math.round(dewDepression * 10), 3)}`;

//     // 21. 91fqfqfq (39-43) - Relative humidity
//     const humidity = finalFirstCard.relativeHumidity || '0';
//     measurements[20] = `91${pad(humidity, 3)}`;

//     // Create the form values
//     const formValues = {
//       dataType: 'SYNOP',
//       stationNo,
//       year: now.getFullYear().toString(),
//       month: pad(now.getMonth() + 1, 2),
//       day: pad(now.getDate(), 2),
//       weatherRemark: finalWeatherObs.observerInitial || '',
//       measurements,
//     };

//     return NextResponse.json(formValues);

//   } catch (error) {
//     console.error('Error generating synoptic code:', error);
//     return NextResponse.json(
//       { error: 'Failed to generate synoptic code' },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }





















// import { NextResponse } from "next/server"
// import { PrismaClient } from "@prisma/client"

// const prisma = new PrismaClient()

// export async function GET(request: Request) {
//   try {
//     // Get the requested time slot from the query parameters
//     const { searchParams } = new URL(request.url)
//     const requestedTime = searchParams.get("time")

//     // Get the current date
//     const now = new Date()
//     const today = now.toISOString().split("T")[0]

//     // Determine the time slot to fetch
//     let timeSlot = requestedTime
//     if (!timeSlot) {
//       // If no time slot is specified, use the current 3-hour interval
//       const currentHour = now.getHours()
//       const currentSlot = Math.floor(currentHour / 3) * 3
//       timeSlot = currentSlot.toString().padStart(2, "0")
//     }

//     // Create time range for the requested slot
//     const startTime = new Date(`${today}T${timeSlot}:00:00.000Z`)
//     const endTime = new Date(startTime)
//     endTime.setHours(endTime.getHours() + 3)

//     // Fetch matching records from both models for the specified time slot
//     const [meteorologicalEntry, weatherObservation] = await Promise.all([
//       prisma.meteorologicalEntry.findFirst({
//         where: {
//           timestamp: {
//             contains: today,
//           },
//           observationTime: timeSlot,
//         },
//         orderBy: { createdAt: "desc" },
//       }),
//       prisma.weatherObservation.findFirst({
//         where: {
//           submittedAt: {
//             gte: startTime,
//             lt: endTime,
//           },
//           observationTime: timeSlot,
//         },
//         orderBy: { submittedAt: "desc" },
//       }),
//     ])

//     // If no data for the requested time slot, try to get the most recent records
//     const finalMeteorologicalEntry =
//       meteorologicalEntry ||
//       (await prisma.meteorologicalEntry.findFirst({
//         orderBy: { createdAt: "desc" },
//       }))

//     const finalWeatherObservation =
//       weatherObservation ||
//       (await prisma.weatherObservation.findFirst({
//         orderBy: { submittedAt: "desc" },
//       }))

//     if (!finalMeteorologicalEntry || !finalWeatherObservation) {
//       return NextResponse.json({ error: "No weather data available" }, { status: 404 })
//     }

//     // Initialize measurements array
//     const measurements: string[] = Array(21).fill("")

//     // Helper functions
//     const pad = (num: number | string | null | undefined, length: number): string => {
//       return String(num ?? 0).padStart(length, "0")
//     }

//     const getTempValue = (temp: number | null | undefined): string => {
//       const safeTemp = temp ?? 0
//       const sign = safeTemp >= 0 ? "0" : "1"
//       const absTemp = Math.abs(Math.round(safeTemp * 10))
//       return `${sign}${pad(absTemp, 3)}`
//     }

//     // 1. C1 (16) - Always 1
//     measurements[0] = "1"

//     // 2. Iliii (17-21) - Station number (5 digits)
//     const stationNo = finalWeatherObservation.stationId
//       ? finalWeatherObservation.stationId.toString().padStart(5, "0").substring(0, 5)
//       : "00000"
//     measurements[1] = stationNo

//     // 3. iRiXhvv (22-26) - 32 + low cloud height + visibility
//     const lowCloudHeight = finalWeatherObservation.lowCloudHeight || "0"
//     const visibility = pad((Number(finalMeteorologicalEntry.horizontalVisibility?.toString()?.[0]) || 0) * 10, 2)
//     measurements[2] = `32${lowCloudHeight}${visibility}`

//     // 4. Nddff (27-31) - Total cloud + wind direction + speed
//     const totalCloud = finalWeatherObservation.totalCloudAmount || "0"
//     const windDirectionDeg = Number(finalWeatherObservation.windDirection) || 0
//     const windSpeedKnots = Number(finalWeatherObservation.windSpeed) || 0

//     let dd
//     if (windSpeedKnots === 0) {
//       dd = "00"
//     } else {
//       let directionCode
//       if (windDirectionDeg >= 355) {
//         directionCode = 36
//       } else {
//         directionCode = Math.floor((windDirectionDeg + 5) / 10)
//       }
//       dd = pad(directionCode, 2)
//     }

//     let ff
//     if (windSpeedKnots >= 100) {
//       const numericDd = Number.parseInt(dd, 10)
//       dd = pad(numericDd + 50, 2)
//       ff = pad(windSpeedKnots - 100, 2)
//     } else {
//       ff = pad(windSpeedKnots, 2)
//     }
//     measurements[3] = `${totalCloud}${dd}${ff}`

//     // 5. 1SnTTT (32-36) - Dry bulb temperature
//     const dryBulb = Number.parseFloat(finalMeteorologicalEntry.dryBulbAsRead || "0")
//     measurements[4] = `1${getTempValue(dryBulb)}`

//     // 6. 2SnTdTdTd (37-41) - Dew point temperature
//     const dewPoint = Number.parseFloat(finalMeteorologicalEntry.Td || "0")
//     measurements[5] = `2${getTempValue(dewPoint)}`

//     // 7. 3PPP/4PPP (42-46) - Station/sea level pressure
//     const stationPressure =
//       finalMeteorologicalEntry.stationLevelPressure?.toString().replace(".", "").slice(0, 4) || "0000"
//     const seaLevelPressure =
//       finalMeteorologicalEntry.correctedSeaLevelPressure?.toString().replace(".", "").slice(0, 4) || "0000"
//     measurements[6] = `3${stationPressure}/4${seaLevelPressure}`

//     // 8. 6RRRtR (47-51) - Precipitation
//     const precipitation = finalWeatherObservation.rainfallLast24Hours || "0"
//     measurements[7] = `6${pad(precipitation, 4)}0`

//     // 9. 7wwW1W2 (52-56) - Weather codes
//     const presentWeather = finalMeteorologicalEntry.presentWeatherWW || "00"
//     const pastWeather1 = finalMeteorologicalEntry.pastWeatherW1 || "0"
//     const pastWeather2 = finalMeteorologicalEntry.pastWeatherW2 || "0"
//     measurements[8] = `7${presentWeather}${pastWeather1}${pastWeather2}`

//     // 10. 8NhClCmCh (57-61) - Cloud information
//     const lowAmount = finalWeatherObservation.lowCloudAmount || "0"
//     const lowForm = finalWeatherObservation.lowCloudForm || "0"
//     const mediumForm = finalWeatherObservation.mediumCloudForm || "0"
//     const highForm = finalWeatherObservation.highCloudForm || "0"
//     measurements[9] = `8${lowAmount}${lowForm}${mediumForm}${highForm}`

//     // 11. 2SnTnTnTn/InInInIn (62-66) - Min temperature / ground state
//     const minTemp = Number.parseFloat(finalMeteorologicalEntry.maxMinTempAsRead || "0")
//     let sN, x
//     if (minTemp >= 0) {
//       sN = 0
//       x = 1
//     } else {
//       sN = 1
//       x = 2
//     }
//     const conVertMinTemp = pad(Math.abs(Math.round(minTemp * 10)), 3)
//     measurements[10] = `${x}${sN}${conVertMinTemp}`

//     // 12. 56DlDmDh (67-71) - Cloud directions
//     const lowDir = finalWeatherObservation.lowCloudDirection || "0"
//     const mediumDir = finalWeatherObservation.mediumCloudDirection || "0"
//     const highDir = finalWeatherObservation.highCloudDirection || "0"
//     measurements[11] = `56${lowDir}${mediumDir}${highDir}`

//     // 13. 57CDaEc (72-76) - Characteristic of pressure + pressure tendency
//     const pressureTendency = finalMeteorologicalEntry.pressureChange24h?.toString()[0] || "0"
//     measurements[12] = `57${pressureTendency}00`

//     // 14. Av. Total Cloud (56) - Total cloud amount
//     measurements[13] = totalCloud

//     // 15. C2 (16) - Always 2
//     measurements[14] = "2"

//     // 16. GG (17-18) - Observation time (3 hour gap)
//     measurements[15] = timeSlot

//     // 17. 58P24P24P24/59P24P24P24 (19-23) - Pressure change
//     const pressureChange = Number.parseFloat(finalMeteorologicalEntry.pressureChange24h || "0")
//     const pressureChangeIndicator = pressureChange >= 0 ? "58" : "59"
//     const absPressureChange = pad(Math.abs(Math.round(pressureChange * 10)), 3)
//     measurements[16] = `${pressureChangeIndicator}${absPressureChange}`

//     // 18. (6RRRtR)/7R24R24R24 (24-28) - Precipitation
//     measurements[17] = `(${measurements[7]})/7${pad(precipitation, 3)}`

//     // 19. 8N5Ch5h5 (29-33) - Cloud information
//     const lowFormSig = finalWeatherObservation.layer1Form || "0"
//     const mediumFormSig = finalWeatherObservation.layer2Form || "0"
//     const highFormSig = finalWeatherObservation.layer3Form || "0"

//     const lowAmountSig = finalWeatherObservation.layer1Amount || "0"
//     const mediumAmountSig = finalWeatherObservation.layer2Amount || "0"
//     const highAmountSig = finalWeatherObservation.layer3Amount || "0"

//     const lowHeightSig = pad((Number(finalWeatherObservation.layer1Height) || 0) * 10, 2)
//     const mediumHeightSig = pad((Number(finalWeatherObservation.layer2Height) || 0) * 10, 2)
//     const highHeightSig = pad((Number(finalWeatherObservation.layer3Height) || 0) * 10, 2)

//     measurements[18] = `8${lowAmountSig}${lowFormSig}${lowHeightSig} / 8${mediumAmountSig}${mediumFormSig}${mediumHeightSig} / 8${highAmountSig}${highFormSig}${highHeightSig}`

//     // 20. 90dqqqt (34-38) - Dew point depression
//     const dewDepression = dryBulb - dewPoint
//     measurements[19] = `90${pad(Math.round(dewDepression * 10), 3)}`

//     // 21. 91fqfqfq (39-43) - Relative humidity
//     const humidity = finalMeteorologicalEntry.relativeHumidity || "0"
//     measurements[20] = `91${pad(humidity, 3)}`

//     // Create the form values
//     const formValues = {
//       dataType: "SYNOP",
//       stationNo,
//       year: now.getFullYear().toString(),
//       month: pad(now.getMonth() + 1, 2),
//       day: pad(now.getDate(), 2),
//       weatherRemark: finalWeatherObservation.observerInitial || "",
//       measurements,
//     }

//     return NextResponse.json(formValues)
//   } catch (error) {
//     console.error("Error generating synoptic code:", error)
//     return NextResponse.json({ error: "Failed to generate synoptic code" }, { status: 500 })
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const data = await request.json()

//     // Here you would save the synoptic code to your database
//     // This is a placeholder for the actual implementation

//     return NextResponse.json({ success: true })
//   } catch (error) {
//     console.error("Error saving synoptic code:", error)
//     return NextResponse.json({ error: "Failed to save synoptic code" }, { status: 500 })
//   } finally {
//     await prisma.$disconnect()
//   }
// }














// import { NextResponse } from "next/server"
// import { PrismaClient } from "@prisma/client"

// const prisma = new PrismaClient()

// export async function GET(request: Request) {
//   try {
//     // Get the requested time slot from the query parameters
//     const { searchParams } = new URL(request.url)
//     const requestedTime = searchParams.get("time")

//     // Get the current date
//     const now = new Date()
//     const today = now.toISOString().split("T")[0]

//     // Determine the time slot to fetch
//     let timeSlot = requestedTime
//     if (!timeSlot) {
//       // If no time slot is specified, use the current 3-hour interval
//       const currentHour = now.getHours()
//       const currentSlot = Math.floor(currentHour / 3) * 3
//       timeSlot = currentSlot.toString().padStart(2, "0")
//     }

//     console.log(`Fetching synoptic data for time slot: ${timeSlot}`)

//     // First, check if we have data specifically for the requested time slot
//     const [specificMeteorologicalEntries, specificWeatherObservations] = await Promise.all([
//       prisma.meteorologicalEntry.findMany({
//         where: {
//           timestamp: {
//             contains: today,
//           },
//           observationTime: timeSlot,
//         },
//         orderBy: { createdAt: "desc" },
//       }),
//       prisma.weatherObservation.findMany({
//         where: {
//           submittedAt: {
//             gte: new Date(`${today}T00:00:00.000Z`),
//             lt: new Date(`${today}T23:59:59.999Z`),
//           },
//           observationTime: timeSlot,
//         },
//         orderBy: { submittedAt: "desc" },
//       }),
//     ])

//     console.log(`Found ${specificMeteorologicalEntries.length} meteorological entries for time slot ${timeSlot}`)
//     console.log(`Found ${specificWeatherObservations.length} weather observations for time slot ${timeSlot}`)

//     // Use the specific time slot data if available
//     let meteorologicalEntry = specificMeteorologicalEntries.length > 0 ? specificMeteorologicalEntries[0] : null
//     let weatherObservation = specificWeatherObservations.length > 0 ? specificWeatherObservations[0] : null

//     // If no data for the specific time slot, get all data for today and find the most recent
//     if (!meteorologicalEntry || !weatherObservation) {
//       console.log("No specific data found for the requested time slot, fetching all data for today")

//       const [allMeteorologicalEntries, allWeatherObservations] = await Promise.all([
//         prisma.meteorologicalEntry.findMany({
//           where: {
//             timestamp: {
//               contains: today,
//             },
//           },
//           orderBy: { createdAt: "desc" },
//         }),
//         prisma.weatherObservation.findMany({
//           where: {
//             submittedAt: {
//               gte: new Date(`${today}T00:00:00.000Z`),
//               lt: new Date(`${today}T23:59:59.999Z`),
//             },
//           },
//           orderBy: { submittedAt: "desc" },
//         }),
//       ])

//       console.log(`Found ${allMeteorologicalEntries.length} total meteorological entries for today`)
//       console.log(`Found ${allWeatherObservations.length} total weather observations for today`)

//       if (allMeteorologicalEntries.length > 0) {
//         console.log(
//           "Available observation times (MeteorologicalEntry):",
//           allMeteorologicalEntries.map((entry) => entry.observationTime),
//         )
//       }

//       if (allWeatherObservations.length > 0) {
//         console.log(
//           "Available observation times (WeatherObservation):",
//           allWeatherObservations.map((obs) => obs.observationTime),
//         )
//       }

//       // If we still don't have data, use the most recent entries regardless of time slot
//       meteorologicalEntry =
//         meteorologicalEntry || (allMeteorologicalEntries.length > 0 ? allMeteorologicalEntries[0] : null)
//       weatherObservation = weatherObservation || (allWeatherObservations.length > 0 ? allWeatherObservations[0] : null)
//     }

//     // If we still don't have data, try to get the most recent entries from any date
//     if (!meteorologicalEntry || !weatherObservation) {
//       console.log("No data found for today, fetching most recent data from any date")

//       const [fallbackMeteorologicalEntry, fallbackWeatherObservation] = await Promise.all([
//         prisma.meteorologicalEntry.findFirst({
//           orderBy: { createdAt: "desc" },
//         }),
//         prisma.weatherObservation.findFirst({
//           orderBy: { submittedAt: "desc" },
//         }),
//       ])

//       meteorologicalEntry = meteorologicalEntry || fallbackMeteorologicalEntry
//       weatherObservation = weatherObservation || fallbackWeatherObservation
//     }

//     if (!meteorologicalEntry || !weatherObservation) {
//       return NextResponse.json({ error: "No weather data available" }, { status: 404 })
//     }

//     // Initialize measurements array
//     const measurements: string[] = Array(21).fill("")

//     // Helper functions
//     const pad = (num: number | string | null | undefined, length: number): string => {
//       return String(num ?? 0).padStart(length, "0")
//     }

//     const getTempValue = (temp: number | null | undefined): string => {
//       const safeTemp = temp ?? 0
//       const sign = safeTemp >= 0 ? "0" : "1"
//       const absTemp = Math.abs(Math.round(safeTemp * 10))
//       return `${sign}${pad(absTemp, 3)}`
//     }

//     // 1. C1 (16) - Always 1
//     measurements[0] = "1"

//     // 2. Iliii (17-21) - Station number (5 digits)
//     const stationNo = weatherObservation.stationId
//       ? weatherObservation.stationId.toString().padStart(5, "0").substring(0, 5)
//       : "00000"
//     measurements[1] = stationNo

//     // 3. iRiXhvv (22-26) - 32 + low cloud height + visibility
//     const lowCloudHeight = weatherObservation.lowCloudHeight || "0"
//     const visibility = pad((Number(meteorologicalEntry.horizontalVisibility?.toString()?.[0]) || 0) * 10, 2)
//     measurements[2] = `32${lowCloudHeight}${visibility}`

//     // 4. Nddff (27-31) - Total cloud + wind direction + speed
//     const totalCloud = weatherObservation.totalCloudAmount || "0"
//     const windDirectionDeg = Number(weatherObservation.windDirection) || 0
//     const windSpeedKnots = Number(weatherObservation.windSpeed) || 0

//     let dd
//     if (windSpeedKnots === 0) {
//       dd = "00"
//     } else {
//       let directionCode
//       if (windDirectionDeg >= 355) {
//         directionCode = 36
//       } else {
//         directionCode = Math.floor((windDirectionDeg + 5) / 10)
//       }
//       dd = pad(directionCode, 2)
//     }

//     let ff
//     if (windSpeedKnots >= 100) {
//       const numericDd = Number.parseInt(dd, 10)
//       dd = pad(numericDd + 50, 2)
//       ff = pad(windSpeedKnots - 100, 2)
//     } else {
//       ff = pad(windSpeedKnots, 2)
//     }
//     measurements[3] = `${totalCloud}${dd}${ff}`

//     // 5. 1SnTTT (32-36) - Dry bulb temperature
//     const dryBulb = Number.parseFloat(meteorologicalEntry.dryBulbAsRead || "0")
//     measurements[4] = `1${getTempValue(dryBulb)}`

//     // 6. 2SnTdTdTd (37-41) - Dew point temperature
//     const dewPoint = Number.parseFloat(meteorologicalEntry.Td || "0")
//     measurements[5] = `2${getTempValue(dewPoint)}`

//     // 7. 3PPP/4PPP (42-46) - Station/sea level pressure
//     const stationPressure = meteorologicalEntry.stationLevelPressure?.toString().replace(".", "").slice(0, 4) || "0000"
//     const seaLevelPressure =
//       meteorologicalEntry.correctedSeaLevelPressure?.toString().replace(".", "").slice(0, 4) || "0000"
//     measurements[6] = `3${stationPressure}/4${seaLevelPressure}`

//     // 8. 6RRRtR (47-51) - Precipitation
//     const precipitation = weatherObservation.rainfallLast24Hours || "0"
//     measurements[7] = `6${pad(precipitation, 4)}0`

//     // 9. 7wwW1W2 (52-56) - Weather codes
//     const presentWeather = meteorologicalEntry.presentWeatherWW || "00"
//     const pastWeather1 = meteorologicalEntry.pastWeatherW1 || "0"
//     const pastWeather2 = meteorologicalEntry.pastWeatherW2 || "0"
//     measurements[8] = `7${presentWeather}${pastWeather1}${pastWeather2}`

//     // 10. 8NhClCmCh (57-61) - Cloud information
//     const lowAmount = weatherObservation.lowCloudAmount || "0"
//     const lowForm = weatherObservation.lowCloudForm || "0"
//     const mediumForm = weatherObservation.mediumCloudForm || "0"
//     const highForm = weatherObservation.highCloudForm || "0"
//     measurements[9] = `8${lowAmount}${lowForm}${mediumForm}${highForm}`

//     // 11. 2SnTnTnTn/InInInIn (62-66) - Min temperature / ground state
//     const minTemp = Number.parseFloat(meteorologicalEntry.maxMinTempAsRead || "0")
//     let sN, x
//     if (minTemp >= 0) {
//       sN = 0
//       x = 1
//     } else {
//       sN = 1
//       x = 2
//     }
//     const conVertMinTemp = pad(Math.abs(Math.round(minTemp * 10)), 3)
//     measurements[10] = `${x}${sN}${conVertMinTemp}`

//     // 12. 56DlDmDh (67-71) - Cloud directions
//     const lowDir = weatherObservation.lowCloudDirection || "0"
//     const mediumDir = weatherObservation.mediumCloudDirection || "0"
//     const highDir = weatherObservation.highCloudDirection || "0"
//     measurements[11] = `56${lowDir}${mediumDir}${highDir}`

//     // 13. 57CDaEc (72-76) - Characteristic of pressure + pressure tendency
//     const pressureTendency = meteorologicalEntry.pressureChange24h?.toString()[0] || "0"
//     measurements[12] = `57${pressureTendency}00`

//     // 14. Av. Total Cloud (56) - Total cloud amount
//     measurements[13] = totalCloud

//     // 15. C2 (16) - Always 2
//     measurements[14] = "2"

//     // 16. GG (17-18) - Observation time (3 hour gap)
//     // Use the actual observation time from the data, not the requested time slot
//     measurements[15] = meteorologicalEntry.observationTime || timeSlot

//     // 17. 58P24P24P24/59P24P24P24 (19-23) - Pressure change
//     const pressureChange = Number.parseFloat(meteorologicalEntry.pressureChange24h || "0")
//     const pressureChangeIndicator = pressureChange >= 0 ? "58" : "59"
//     const absPressureChange = pad(Math.abs(Math.round(pressureChange * 10)), 3)
//     measurements[16] = `${pressureChangeIndicator}${absPressureChange}`

//     // 18. (6RRRtR)/7R24R24R24 (24-28) - Precipitation
//     measurements[17] = `(${measurements[7]})/7${pad(precipitation, 3)}`

//     // 19. 8N5Ch5h5 (29-33) - Cloud information
//     const lowFormSig = weatherObservation.layer1Form || "0"
//     const mediumFormSig = weatherObservation.layer2Form || "0"
//     const highFormSig = weatherObservation.layer3Form || "0"

//     const lowAmountSig = weatherObservation.layer1Amount || "0"
//     const mediumAmountSig = weatherObservation.layer2Amount || "0"
//     const highAmountSig = weatherObservation.layer3Amount || "0"

//     const lowHeightSig = pad((Number(weatherObservation.layer1Height) || 0) * 10, 2)
//     const mediumHeightSig = pad((Number(weatherObservation.layer2Height) || 0) * 10, 2)
//     const highHeightSig = pad((Number(weatherObservation.layer3Height) || 0) * 10, 2)

//     measurements[18] = `8${lowAmountSig}${lowFormSig}${lowHeightSig} / 8${mediumAmountSig}${mediumFormSig}${mediumHeightSig} / 8${highAmountSig}${highFormSig}${highHeightSig}`

//     // 20. 90dqqqt (34-38) - Dew point depression
//     const dewDepression = dryBulb - dewPoint
//     measurements[19] = `90${pad(Math.round(dewDepression * 10), 3)}`

//     // 21. 91fqfqfq (39-43) - Relative humidity
//     const humidity = meteorologicalEntry.relativeHumidity || "0"
//     measurements[20] = `91${pad(humidity, 3)}`

//     // Create the form values
//     const formValues = {
//       dataType: "SYNOP",
//       stationNo,
//       year: now.getFullYear().toString(),
//       month: pad(now.getMonth() + 1, 2),
//       day: pad(now.getDate(), 2),
//       weatherRemark: weatherObservation.observerInitial || "",
//       measurements,
//       actualObservationTime: meteorologicalEntry.observationTime || timeSlot,
//     }

//     return NextResponse.json(formValues)
//   } catch (error) {
//     console.error("Error generating synoptic code:", error)
//     return NextResponse.json({ error: "Failed to generate synoptic code" }, { status: 500 })
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const data = await request.json()

//     // Here you would save the synoptic code to your database
//     // This is a placeholder for the actual implementation

//     return NextResponse.json({ success: true })
//   } catch (error) {
//     console.error("Error saving synoptic code:", error)
//     return NextResponse.json({ error: "Failed to save synoptic code" }, { status: 500 })
//   } finally {
//     await prisma.$disconnect()
//   }
// }
















import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    // Get the requested time slot from the query parameters
    const { searchParams } = new URL(request.url)
    const requestedTime = searchParams.get("time")

    // Get the current date
    const now = new Date()
    const today = now.toISOString().split("T")[0]

    // Determine the time slot to fetch
    let timeSlot = requestedTime
    if (!timeSlot) {
      // If no time slot is specified, use the current 3-hour interval
      const currentHour = now.getHours()
      const currentSlot = Math.floor(currentHour / 3) * 3
      timeSlot = currentSlot.toString().padStart(2, "0")
    }

    console.log(`Fetching synoptic data for time slot: ${timeSlot}`)

    // First, check if we have data specifically for the requested time slot
    const [specificMeteorologicalEntries, specificWeatherObservations] = await Promise.all([
      prisma.meteorologicalEntry.findMany({
        where: {
          timestamp: {
            contains: today,
          },
          observationTime: timeSlot,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.weatherObservation.findMany({
        where: {
          submittedAt: {
            gte: new Date(`${today}T00:00:00.000Z`),
            lt: new Date(`${today}T23:59:59.999Z`),
          },
          observationTime: timeSlot,
        },
        orderBy: { submittedAt: "desc" },
      }),
    ])

    console.log(`Found ${specificMeteorologicalEntries.length} meteorological entries for time slot ${timeSlot}`)
    console.log(`Found ${specificWeatherObservations.length} weather observations for time slot ${timeSlot}`)

    // Use the specific time slot data if available
    let meteorologicalEntry = specificMeteorologicalEntries.length > 0 ? specificMeteorologicalEntries[0] : null
    let weatherObservation = specificWeatherObservations.length > 0 ? specificWeatherObservations[0] : null

    // If no data for the specific time slot, get all data for today and find the most recent
    if (!meteorologicalEntry || !weatherObservation) {
      console.log("No specific data found for the requested time slot, fetching all data for today")

      const [allMeteorologicalEntries, allWeatherObservations] = await Promise.all([
        prisma.meteorologicalEntry.findMany({
          where: {
            timestamp: {
              contains: today,
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.weatherObservation.findMany({
          where: {
            submittedAt: {
              gte: new Date(`${today}T00:00:00.000Z`),
              lt: new Date(`${today}T23:59:59.999Z`),
            },
          },
          orderBy: { submittedAt: "desc" },
        }),
      ])

      console.log(`Found ${allMeteorologicalEntries.length} total meteorological entries for today`)
      console.log(`Found ${allWeatherObservations.length} total weather observations for today`)

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

      // If we still don't have data, use the most recent entries regardless of time slot
      meteorologicalEntry =
        meteorologicalEntry || (allMeteorologicalEntries.length > 0 ? allMeteorologicalEntries[0] : null)
      weatherObservation = weatherObservation || (allWeatherObservations.length > 0 ? allWeatherObservations[0] : null)
    }

    // If we still don't have data, try to get the most recent entries from any date
    if (!meteorologicalEntry || !weatherObservation) {
      console.log("No data found for today, fetching most recent data from any date")

      const [fallbackMeteorologicalEntry, fallbackWeatherObservation] = await Promise.all([
        prisma.meteorologicalEntry.findFirst({
          orderBy: { createdAt: "desc" },
        }),
        prisma.weatherObservation.findFirst({
          orderBy: { submittedAt: "desc" },
        }),
      ])

      meteorologicalEntry = meteorologicalEntry || fallbackMeteorologicalEntry
      weatherObservation = weatherObservation || fallbackWeatherObservation
    }

    if (!meteorologicalEntry || !weatherObservation) {
      return NextResponse.json({ error: "No weather data available" }, { status: 404 })
    }

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
    const stationPressure = meteorologicalEntry.stationLevelPressure?.toString().replace(".", "").slice(0, 4) || "0000"
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
    // Use the actual observation time from the data, not the requested time slot
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

    // Create the form values
    const formValues = {
      dataType: "SYNOP",
      stationNo,
      year: now.getFullYear().toString(),
      month: pad(now.getMonth() + 1, 2),
      day: pad(now.getDate(), 2),
      weatherRemark: weatherObservation.observerInitial || "",
      measurements,
      actualObservationTime,
    }

    return NextResponse.json(formValues)
  } catch (error) {
    console.error("Error generating synoptic code:", error)
    return NextResponse.json({ error: "Failed to generate synoptic code" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Here you would save the synoptic code to your database
    // This is a placeholder for the actual implementation

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving synoptic code:", error)
    return NextResponse.json({ error: "Failed to save synoptic code" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
