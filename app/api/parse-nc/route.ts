import { type NextRequest, NextResponse } from "next/server"

export const config = {
  api: {
    bodyParser: false,
    responseLimit: "10mb",
  },
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("ncfile") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ncData = await parseNetCDF(buffer)
    const processedData = downsampleForVisualization(ncData)

    return NextResponse.json(processedData)
  } catch (error) {
    console.error("Error processing NetCDF file:", error)
    return NextResponse.json({ error: "Failed to process NetCDF file" }, { status: 500 })
  }
}

async function parseNetCDF(buffer: Buffer) {
  // Simple NetCDF parser implementation
  // In a real implementation, you would use netcdfjs or similar library

  // Mock implementation for demonstration
  const mockData = {
    metadata: {
      dimensions: {
        time: 100,
        lat: 50,
        lon: 100,
        depth: 10,
      },
      globalAttributes: [
        { name: "title", value: "Sample NetCDF Data" },
        { name: "institution", value: "Research Institute" },
        { name: "source", value: "Model simulation" },
        { name: "history", value: "Created with NetCDF Visualizer" },
      ],
    },
    variables: {
      temperature: {
        dimensions: ["time", "lat", "lon"],
        attributes: [
          { name: "units", value: "degrees_C" },
          { name: "long_name", value: "Sea Surface Temperature" },
          { name: "standard_name", value: "sea_surface_temperature" },
        ],
        data: generateMockData(5000, -5, 35), // 100 * 50 time series
      },
      salinity: {
        dimensions: ["time", "depth", "lat", "lon"],
        attributes: [
          { name: "units", value: "psu" },
          { name: "long_name", value: "Sea Water Salinity" },
          { name: "standard_name", value: "sea_water_salinity" },
        ],
        data: generateMockData(50000, 30, 37), // 100 * 10 * 50 time series
      },
      wind_speed: {
        dimensions: ["time"],
        attributes: [
          { name: "units", value: "m/s" },
          { name: "long_name", value: "Wind Speed" },
          { name: "standard_name", value: "wind_speed" },
        ],
        data: generateMockData(100, 0, 25),
      },
      precipitation: {
        dimensions: ["time", "lat", "lon"],
        attributes: [
          { name: "units", value: "mm/day" },
          { name: "long_name", value: "Precipitation Rate" },
          { name: "standard_name", value: "precipitation_flux" },
        ],
        data: generateMockData(5000, 0, 50),
      },
    },
  }

  return mockData
}

function generateMockData(length: number, min: number, max: number): number[] {
  const data = []
  for (let i = 0; i < length; i++) {
    // Generate realistic-looking data with some patterns
    const trend = Math.sin(i * 0.01) * (max - min) * 0.3
    const noise = (Math.random() - 0.5) * (max - min) * 0.2
    const base = (min + max) / 2
    data.push(base + trend + noise)
  }
  return data
}

function downsampleForVisualization(ncData: any) {
  const MAX_POINTS = 10000 // Limit for browser performance

  Object.keys(ncData.variables).forEach((varName) => {
    const variable = ncData.variables[varName]
    const totalPoints = variable.data.length

    if (totalPoints > MAX_POINTS) {
      const step = Math.ceil(totalPoints / MAX_POINTS)
      const downsampled = []
      for (let i = 0; i < totalPoints; i += step) {
        downsampled.push(variable.data[i])
      }
      variable.data = downsampled
      variable.attributes.push({
        name: "processing_note",
        value: `Data downsampled from ${totalPoints} to ${downsampled.length} points for visualization`,
      })
    }
  })

  return ncData
}
