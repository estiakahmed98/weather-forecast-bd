"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Thermometer, Wind, Eye, Cloud, Clock, BarChart3 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { hygrometricTable } from "../../../data/hygrometric-table"; // Import the hygrometric table data
import { stationPressure } from "../../../data/station-pressure"; // Import the station pressure data

// Add this after the imports but before the component definition

export function MeteorologicalDataForm() {
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState("temperature");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hygrometricData, setHygrometricData] = useState({
    dryBulb: "",
    wetBulb: "",
    difference: "",
    dewPoint: "",
    relativeHumidity: "",
  });

  // Refs for multi-box inputs to handle auto-focus
  const dataTypeRefs = [useRef(null), useRef(null)];
  const stationNoRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];
  const yearRefs = [useRef(null), useRef(null)];

  // Tab styles with gradients and more vibrant colors
  const tabStyles = {
    temperature: {
      tab: "from-blue-300 to-blue-200 text-blue-800 hover:opacity-90 shadow-sm shadow-blue-100/50",
      card: "bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-200 shadow-sm",
      icon: <Thermometer className="h-4 w-4 mr-1" />,
    },
    pressure: {
      tab: "from-rose-300 to-rose-200 text-rose-800 hover:opacity-90 shadow-sm shadow-rose-100/50",
      card: "bg-gradient-to-br from-rose-50 to-white border-l-4 border-rose-200 shadow-sm",
      icon: <BarChart3 className="h-4 w-4 mr-1" />,
    },
    squall: {
      tab: "from-amber-300 to-amber-200 text-amber-800 hover:opacity-90 shadow-sm shadow-amber-100/50",
      card: "bg-gradient-to-br from-amber-50 to-white border-l-4 border-amber-200 shadow-sm",
      icon: <Wind className="h-4 w-4 mr-1" />,
    },
    "V.V": {
      tab: "from-orange-300 to-orange-200 text-orange-800 hover:opacity-90 shadow-sm shadow-orange-100/50",
      card: "bg-gradient-to-br from-orange-50 to-white border-l-4 border-orange-200 shadow-sm",
      icon: <Eye className="h-4 w-4 mr-1" />,
    },
    weather: {
      tab: "from-cyan-300 to-cyan-200 text-cyan-800 hover:opacity-90 shadow-sm shadow-cyan-100/50",
      card: "bg-gradient-to-br from-cyan-50 to-white border-l-4 border-cyan-200 shadow-sm",
      icon: <Cloud className="h-4 w-4 mr-1" />,
    },
    indicators: {
      tab: "from-fuchsia-300 to-fuchsia-200 text-fuchsia-800 hover:opacity-90 shadow-sm shadow-fuchsia-100/50",
      card: "bg-gradient-to-br from-fuchsia-50 to-white border-l-4 border-fuchsia-200 shadow-sm",
      icon: <Clock className="h-4 w-4 mr-1" />,
    },
  };

  // Debug logging for formData changes
  useEffect(() => {
    console.log("Form data updated:", formData);
  }, [formData]);

  // Add this function after the state declarations
  // const calculateDewPointAndHumidity = (dryBulb, wetBulb) => {
  //   if (!dryBulb || !wetBulb) return;

  //   // Parse input values to numbers
  //   const dryBulbValue = Number.parseFloat(dryBulb);
  //   const wetBulbValue = Number.parseFloat(wetBulb);

  //   // Calculate difference
  //   const difference = Math.abs(dryBulbValue - wetBulbValue).toFixed(1);

  //   // Round dry bulb to nearest integer
  //   const roundedDryBulb = Math.round(dryBulbValue);

  //   // Check if values are within range of the table
  //   if (roundedDryBulb < 1 || roundedDryBulb > 25 || Number(difference) > 1.9) {
  //     toast.error(
  //       "Temperature values are outside the range of the hygrometric table"
  //     );
  //     return;
  //   }

  //   // Look up values in the hygrometric table
  //   const tableEntry =
  //     hygrometricTable[
  //       roundedDryBulb.toString() as keyof typeof hygrometricTable
  //     ];
  //   console.log("Table Entry:", tableEntry);

  //   if (!tableEntry) {
  //     toast.error("Could not find dry bulb temperature in hygrometric table");
  //     return;
  //   }

  //   const valueEntry =
  //     tableEntry[difference.toString() as keyof typeof tableEntry];
  //   console.log("Value Entry:", valueEntry);

  //   if (!valueEntry) {
  //     toast.error("Could not find temperature difference in hygrometric table");
  //     return;
  //   }

  //   // Parse the dew point and relative humidity from the table entry
  //   const [dewPoint, relativeHumidity] = valueEntry.split("/");

  //   // Update the state
  //   setHygrometricData({
  //     dryBulb: dryBulbValue.toString(),
  //     wetBulb: wetBulbValue.toString(),
  //     difference: difference.toString(),
  //     dewPoint,
  //     relativeHumidity,
  //   });

  //   // Update the form data
  //   setFormData((prev) => ({
  //     ...prev,
  //     Td: dewPoint,
  //     relativeHumidity,
  //   }));

  //   // Show success message
  //   toast.success("Dew point and relative humidity calculated successfully");
  // };

  const calculateDewPointAndHumidity = (dryBulb, wetBulb) => {
    if (!dryBulb || !wetBulb) return;
  
    const dryBulbValue = Number.parseFloat(dryBulb);
    const wetBulbValue = Number.parseFloat(wetBulb);
    const difference = Number(Math.abs(dryBulbValue - wetBulbValue).toFixed(1));
    const roundedDryBulb = Math.round(dryBulbValue);
  
    // Validate ranges
    if (roundedDryBulb < 0 || roundedDryBulb > 50 || difference > 30.0) {
      toast.error("Temperature values are outside the range of the hygrometric table");
      return;
    }
  
    // Find index of the difference in 'differences'
    const diffIndex = hygrometricTable.differences.indexOf(difference);
    if (diffIndex === -1) {
      toast.error("Invalid temperature difference for lookup");
      return;
    }
  
    // Find the dbT entry
    const dbtEntry = hygrometricTable.data.find(entry => entry.dbT === roundedDryBulb);
    if (!dbtEntry || !dbtEntry.values || !dbtEntry.values[diffIndex]) {
      toast.error("Could not find matching dry bulb temperature or difference in the table");
      return;
    }
  
    const { DpT, RH } = dbtEntry.values[diffIndex];
  
    // Update state
    setHygrometricData({
      dryBulb: dryBulbValue.toString(),
      wetBulb: wetBulbValue.toString(),
      difference: difference.toString(),
      dewPoint: DpT.toString(),
      relativeHumidity: RH.toString(),
    });
  
    setFormData(prev => ({
      ...prev,
      Td: DpT.toString(),
      relativeHumidity: RH.toString(),
    }));
  
    toast.success("Dew point and relative humidity calculated successfully");
  };
  

  // Update the handleSubmit function to save the JSON file on the server

  const calculatePressureValues = (dryBulb, barAsRead) => {
    if (!dryBulb || !barAsRead) return;

    try {
      // Parse input values to numbers
      const dryBulbValue = Number.parseFloat(dryBulb);
      const barAsReadValue = Number.parseFloat(barAsRead);

      // Round dry bulb to nearest integer
      const roundedDryBulb = Math.round(dryBulbValue);
      const dryBulbKey = `${roundedDryBulb}.0`;

      // Check if the rounded dry bulb temperature exists in the table
      if (!stationPressure[dryBulbKey]) {
        toast.error(
          `Temperature ${roundedDryBulb}°C not found in station pressure table`
        );
        return;
      }

      // Get all available pressure values for this temperature
      const availablePressures = Object.keys(stationPressure[dryBulbKey])
        .map(Number)
        .sort((a, b) => a - b);
      console.log("Available Pressures:", availablePressures);

      // Find the closest pressure to barAsReadValue for height difference correction
      let closestPressureForCorrection = availablePressures[0];
      console.log(
        "Closest Pressure for Correction:",
        closestPressureForCorrection
      );

      let minDiff = Math.abs(availablePressures[0] - barAsReadValue);

      for (const pressure of availablePressures) {
        const diff = Math.abs(pressure - barAsReadValue);
        if (diff < minDiff) {
          minDiff = diff;
          closestPressureForCorrection = pressure;
        }
      }

      // Now use the closest pressure to get the height difference correction
      const heightDifferenceCorrection =
        stationPressure[dryBulbKey][closestPressureForCorrection.toString()];
      console.log(
        "Closest Pressure for Correction:",
        closestPressureForCorrection
      );
      console.log("Height Difference Correction:", heightDifferenceCorrection);

      if (!heightDifferenceCorrection) {
        toast.error(
          "Could not find temperature difference in hygrometric table"
        );
        return;
      }

      // Calculate Station Level Pressure
      const stationLevelPressure = barAsReadValue + heightDifferenceCorrection;

      // Round station level pressure to nearest 5 for lookup
      const roundedStationPressure = Math.round(stationLevelPressure / 5) * 5;
      console.log("Rounded Station Pressure:", roundedStationPressure);

      // Find the closest available pressure in the table for sea level reduction
      let closestPressure = availablePressures[availablePressures.length - 1]; // Default to highest
      for (const pressure of availablePressures) {
        if (pressure >= roundedStationPressure) {
          closestPressure = pressure;
          break;
        }
      }

      // Look up Sea Level Reduction Constant in the table
      let seaLevelReductionConstant = 0;
      if (stationPressure[dryBulbKey][closestPressure.toString()]) {
        seaLevelReductionConstant =
          stationPressure[dryBulbKey][closestPressure.toString()];
      } else {
        toast.error("Could not find sea level reduction constant in table");
        return;
      }
      console.log("Sea Level Reduction Constant:", seaLevelReductionConstant);

      // Calculate Sea-Level Pressure
      const seaLevelPressure = stationLevelPressure + seaLevelReductionConstant;

      // Format values for display
      const heightDifferenceStr = heightDifferenceCorrection.toFixed(2);
      const stationLevelPressureStr = stationLevelPressure.toFixed(2);
      const seaLevelReductionStr = seaLevelReductionConstant.toFixed(2);
      const seaLevelPressureStr = seaLevelPressure.toFixed(2);

      console.log("Calculated pressure values:", {
        heightDifference: heightDifferenceStr,
        stationLevelPressure: stationLevelPressureStr,
        seaLevelReduction: seaLevelReductionStr,
        correctedSeaLevelPressure: seaLevelPressureStr,
      });

      // Update the form data with a new object to ensure state change is detected
      setFormData((prev) => {
        const newData = {
          ...prev,
          heightDifference: heightDifferenceStr,
          stationLevelPressure: stationLevelPressureStr,
          seaLevelReduction: seaLevelReductionStr,
          correctedSeaLevelPressure: seaLevelPressureStr,
        };
        return newData;
      });

      // Show success message
      toast.success("Pressure values calculated successfully");
    } catch (error) {
      console.error("Error calculating pressure values:", error);
      toast.error(
        "Failed to calculate pressure values. Please check your inputs."
      );
    }
  };

  

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);
  
  //   try {
  //     // Add timestamp to the form data
  //     const submissionData = {
  //       ...formData,
  //       timestamp: new Date().toISOString(),
  //       stationInfo: {
  //         stationName: formData.stationName,
  //         stationNo: formData.stationNo,
  //         year: formData.year
  //       }
  //     };
  
  //     const response = await fetch("/api/first-card-data", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(submissionData),
  //     });
  
  //     const result = await response.json();
  
  //     if (!response.ok) {
  //       throw new Error(result.message || "Failed to save data");
  //     }
  
  //     toast.success("Meteorological data saved successfully!", {
  //       description: `Entry #${result.dataCount} saved at ${new Date().toLocaleTimeString()}`,
  //       action: {
  //         label: "View All",
  //         onClick: () => {
  //           // Optional: Add navigation to view all data
  //           console.log("View all data clicked");
  //         },
  //       },
  //     });
  
  //     // Reset form after successful submission if needed
  //     setFormData({
  //       // Keep station info but clear measurements
  //       ...(formData.stationName && { stationName: formData.stationName }),
  //       ...(formData.stationNo && { stationNo: formData.stationNo }),
  //       ...(formData.year && { year: formData.year }),
  //     });
  
  //     // Reset hygrometric data
  //     setHygrometricData({
  //       dryBulb: "",
  //       wetBulb: "",
  //       difference: "",
  //       dewPoint: "",
  //       relativeHumidity: "",
  //     });
  
  //   } catch (error) {
  //     console.error("Error saving data:", error);
  //     toast.error("Failed to save data", {
  //       description: error instanceof Error ? error.message : "Please check your connection and try again.",
  //       action: {
  //         label: "Retry",
  //         onClick: () => handleSubmit(e),
  //       },
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
  
    try {
      // Prepare data (removed redundant stationInfo nesting)
      const submissionData = {
        ...formData,
        ...hygrometricData, // Include hygrometric data directly
        timestamp: new Date().toISOString()
      };
  
      const response = await fetch("/api/first-card-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save data");
      }
  
      const result = await response.json();
  
      toast.success("Data saved successfully!", {
        description: `Entry #${result.dataCount} saved`,
        action: {
          label: "View All",
          onClick: () => router.push("/data"), // Example: Navigate to data view
        },
      });
  
      // Reset only measurement fields (preserves station info)
      setFormData(prev => ({
        stationName: prev.stationName,
        stationNo: prev.stationNo,
        year: prev.year,
        // Clear other fields
        cloudCover: "",
        visibility: "",
        // ... other fields to reset
      }));
  
      setHygrometricData({
        dryBulb: "",
        wetBulb: "",
        difference: "",
        dewPoint: "",
        relativeHumidity: "",
      });
  
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Submission failed", {
        description: error instanceof Error ? error.message : "Network error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // If dry-bulb or wet-bulb values change, calculate dew point and humidity
    if (name === "dryBulbAsRead" || name === "wetBulbAsRead") {
      const dryBulb = name === "dryBulbAsRead" ? value : formData.dryBulbAsRead;
      const wetBulb = name === "wetBulbAsRead" ? value : formData.wetBulbAsRead;

      if (dryBulb && wetBulb) {
        calculateDewPointAndHumidity(dryBulb, wetBulb);
      }
    }

    // If dry-bulb or barAsRead values change, calculate pressure values
    if (name === "dryBulbAsRead" || name === "barAsRead") {
      const dryBulb = name === "dryBulbAsRead" ? value : formData.dryBulbAsRead;
      const barAsRead = name === "barAsRead" ? value : formData.barAsRead;

      if (dryBulb && barAsRead) {
        calculatePressureValues(dryBulb, barAsRead);
      }
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle input for segmented boxes with auto-focus to next box
  const handleSegmentedInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    refs: React.RefObject<HTMLInputElement>[],
    fieldName: string
  ) => {
    const { value } = e.target;

    // Update form data with the specific segment
    setFormData((prev) => {
      const updatedField = {
        ...(prev[fieldName] || {}),
        [index]: value,
      };

      return {
        ...prev,
        [fieldName]: updatedField,
      };
    });

    // Auto-focus to next input if value is entered and not the last box
    if (value && index < refs.length - 1) {
      refs[index + 1].current?.focus();
    }
  };

  // Reset form function
  const handleReset = () => {
    // Clear all form data
    setFormData({});
    setHygrometricData({
      dryBulb: "",
      wetBulb: "",
      difference: "",
      dewPoint: "",
      relativeHumidity: "",
    });

    // Show toast notification
    toast.info("All form data has been cleared.");
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <form onSubmit={handleSubmit} className="w-full mx-auto">
        {/* Header Section - Single Line */}
        <Card className="mb-6 overflow-hidden border-none shadow-lg">
          <div className="absolute " />
          <CardHeader className="relative">
            <CardTitle className="text-2xl text-center text-black font-bold">
              First Card
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex flex-wrap justify-between gap-8">
              {/* Data Type */}
              <div className="space-y-2">
                <Label htmlFor="dataType" className="text-black font-medium">
                  Data Type
                </Label>
                <div className="flex space-x-1 ">
                  {[0, 1].map((i) => (
                    <Input
                      key={`dataType-${i}`}
                      id={`dataType-${i}`}
                      ref={dataTypeRefs[i]}
                      className="w-10 text-center p-2 bg-white/90 border-2 shadow-sm focus:ring-2 focus:ring-blue-500"
                      maxLength={1}
                      value={formData.dataType?.[i] || ""}
                      onChange={(e) =>
                        handleSegmentedInput(e, i, dataTypeRefs, "dataType")
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Station No */}
              <div className="space-y-2 ">
                <Label htmlFor="stationNo" className="text-black font-medium">
                  Station No
                </Label>
                <div className="flex space-x-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Input
                      key={`stationNo-${i}`}
                      id={`stationNo-${i}`}
                      ref={stationNoRefs[i]}
                      className=" w-10 text-center p-2 bg-white/90 border-2 shadow-sm focus:ring-2 focus:ring-blue-500"
                      maxLength={1}
                      value={formData.stationNo?.[i] || ""}
                      onChange={(e) =>
                        handleSegmentedInput(e, i, stationNoRefs, "stationNo")
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Station Name */}
              <div className="space-y-2 flex-1">
                <Label htmlFor="stationName" className="text-black font-medium">
                  Station Name
                </Label>
                <Input
                  id="stationName"
                  name="stationName"
                  value={formData.stationName || ""}
                  onChange={handleChange}
                  className="bg-white/90 border-2 shadow-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Year */}
              <div className="space-y-2">
                <Label htmlFor="year" className="text-black font-medium">
                  Year
                </Label>
                <div className="flex space-x-1">
                  {[0, 1].map((i) => (
                    <Input
                      key={`year-${i}`}
                      id={`year-${i}`}
                      ref={yearRefs[i]}
                      className="w-10 text-center p-2 bg-white/90 border-2 shadow-sm focus:ring-2 focus:ring-blue-500"
                      maxLength={1}
                      value={formData.year?.[i] || ""}
                      onChange={(e) =>
                        handleSegmentedInput(e, i, yearRefs, "year")
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/*Card Body */}
        <Card className="border-none shadow-xl overflow-hidden">
          <CardContent className="p-6">
            <Tabs
              defaultValue="temperature"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-3 rounded-xl p-1 border-0 bg-transparent">
                {Object.entries(tabStyles).map(([key, style]) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className={cn(
                      "rounded-lg bg-gradient-to-br transition-all duration-300 transform hover:scale-105",
                      style.tab,
                      activeTab === key ? "ring-2 ring-white ring-offset-1" : ""
                    )}
                  >
                    <div className="flex items-center justify-center">
                      {style.icon}
                      <span className="hidden md:inline">
                        {key === "V.V" ? "VV" : key}
                      </span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Bar Pressure Tab */}
              <TabsContent
                value="pressure"
                className="mt-6 transition-all duration-500"
              >
                <Card
                  className={cn("overflow-hidden", tabStyles.pressure.card)}
                >
                  <div className="p-4 bg-rose-200 text-rose-800">
                    <h3 className="text-lg font-semibold flex items-center">
                      <BarChart3 className="mr-2" /> Bar Pressure Measurements
                    </h3>
                  </div>
                  <CardContent className="pt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="subIndicator">1st Card Indicator</Label>
                      <Input
                        id="subIndicator"
                        name="subIndicator"
                        value={formData.subIndicator || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="alteredThermometer">
                        Altered Thermometer
                      </Label>
                      <Input
                        id="alteredThermometer"
                        name="alteredThermometer"
                        value={formData.alteredThermometer || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="barAsRead">Bar As Read(hPa)</Label>
                      <Input
                        id="barAsRead"
                        name="barAsRead"
                        value={formData.barAsRead || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="correctedForIndex">
                        Corrected for Index Temp-gravity(hPa)
                      </Label>
                      <Input
                        id="correctedForIndex"
                        name="correctedForIndex"
                        value={formData.correctedForIndex || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="heightDifference">
                        Height Difference Correction(hPa)
                      </Label>
                      <Input
                        id="heightDifference"
                        name="heightDifference"
                        value={formData.heightDifference || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="correctionForTemp">
                        Correction for Temp
                      </Label>
                      <Input
                        id="correctionForTemp"
                        name="correctionForTemp"
                        value={formData.correctionForTemp || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stationLevelPressure">
                        Station Level Pressure (P.P.P.P.hpa)
                      </Label>
                      <Input
                        id="stationLevelPressure"
                        name="stationLevelPressure"
                        value={formData.stationLevelPressure || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seaLevelReduction">
                        Sea Level Reduction Constant
                      </Label>
                      <Input
                        id="seaLevelReduction"
                        name="seaLevelReduction"
                        value={formData.seaLevelReduction || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="correctedSeaLevelPressure">
                        Sea-Level Pressure(PPPP)hpa
                      </Label>
                      <Input
                        id="correctedSeaLevelPressure"
                        name="correctedSeaLevelPressure"
                        value={formData.correctedSeaLevelPressure || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="afternoonReading">
                        Altimeter setting(QNH)
                      </Label>
                      <Input
                        id="afternoonReading"
                        name="afternoonReading"
                        value={formData.afternoonReading || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pressureChange24h">
                        24-Hour Pressure Change
                      </Label>
                      <Input
                        id="pressureChange24h"
                        name="pressureChange24h"
                        value={formData.pressureChange24h || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Temperature Tab */}
              <TabsContent
                value="temperature"
                className="mt-6 transition-all duration-500"
              >
                <Card
                  className={cn("overflow-hidden", tabStyles.temperature.card)}
                >
                  <div className="p-4 bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Thermometer className="mr-2" /> Temperature
                    </h3>
                  </div>
                  <CardContent className="pt-6">
                    <Tabs defaultValue="temperature" className="w-full">
                      {/* Temperature Values */}
                      <TabsContent value="temperature" className="mt-4">
                        <Tabs defaultValue="as-read" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 bg-blue-50/50 rounded-lg">
                            <TabsTrigger
                              value="as-read"
                              className="data-[state=active]:bg-blue-200 data-[state=active]:text-blue-800"
                            >
                              As Read
                            </TabsTrigger>
                            <TabsTrigger
                              value="corrected"
                              className="data-[state=active]:bg-blue-200 data-[state=active]:text-blue-800"
                            >
                              Corrected
                            </TabsTrigger>
                          </TabsList>

                          {/* As Read Temperature Values */}
                          <TabsContent value="as-read" className="mt-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="dryBulbAsRead">
                                  Dry-bulb (°C)
                                </Label>
                                <Input
                                  id="dryBulbAsRead"
                                  name="dryBulbAsRead"
                                  value={formData.dryBulbAsRead || ""}
                                  onChange={handleChange}
                                  className="border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="wetBulbAsRead">
                                  Wet-bulb (°C)
                                </Label>
                                <Input
                                  id="wetBulbAsRead"
                                  name="wetBulbAsRead"
                                  value={formData.wetBulbAsRead || ""}
                                  onChange={handleChange}
                                  className=" border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="maxMinTempAsRead">
                                  MAX/MIN (°C)
                                </Label>
                                <Input
                                  id="maxMinTempAsRead"
                                  name="maxMinTempAsRead"
                                  value={formData.maxMinTempAsRead || ""}
                                  onChange={handleChange}
                                  className="border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30"
                                />
                              </div>
                            </div>
                          </TabsContent>

                          {/* Corrected Temperature Values */}
                          <TabsContent value="corrected" className="mt-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="dryBulbCorrected">
                                  Dry-bulb (°C)
                                </Label>
                                <Input
                                  id="dryBulbCorrected"
                                  name="dryBulbCorrected"
                                  value={formData.dryBulbCorrected || ""}
                                  onChange={handleChange}
                                  className="transition-all focus:border-blue-400 focus:ring-blue-500/30"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="wetBulbCorrected">
                                  Wet-bulb (°C)
                                </Label>
                                <Input
                                  id="wetBulbCorrected"
                                  name="wetBulbCorrected"
                                  value={formData.wetBulbCorrected || ""}
                                  onChange={handleChange}
                                  className="border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="maxMinTempCorrected">
                                  MAX/MIN (°C)
                                </Label>
                                <Input
                                  id="maxMinTempCorrected"
                                  name="maxMinTempCorrected"
                                  value={formData.maxMinTempCorrected || ""}
                                  onChange={handleChange}
                                  className="border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30"
                                />
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>

                        <div className="mt-6 space-y-4">
                          <div className="p-4 bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800">
                            <h3 className="text-lg font-semibold flex items-center">
                              <Thermometer className="mr-2" /> Dew-Point & Humidity
                            </h3>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="Td">
                                Dew-Point Temperature (&deg;C)
                              </Label>
                              <Input
                                id="Td"
                                name="Td"
                                value={formData.Td || ""}
                                onChange={handleChange}
                                className="border-slate-600 transition-all focus:border-emerald-500 focus:ring-emerald-500/30"
                                readOnly
                              />
                              {hygrometricData.difference && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Calculated from Dry-bulb:{" "}
                                  {hygrometricData.dryBulb}°C, Wet-bulb:{" "}
                                  {hygrometricData.wetBulb}
                                  °C, Difference: {hygrometricData.difference}
                                  °C
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="relativeHumidity">
                                Relative Humidity (%)
                              </Label>
                              <Input
                                id="relativeHumidity"
                                name="relativeHumidity"
                                value={formData.relativeHumidity || ""}
                                onChange={handleChange}
                                className="border-slate-600 transition-all focus:border-violet-500 focus:ring-violet-500/30"
                                readOnly
                              />
                              {hygrometricData.difference && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Calculated from Dry-bulb:{" "}
                                  {hygrometricData.dryBulb}°C, Wet-bulb:{" "}
                                  {hygrometricData.wetBulb}
                                  °C, Difference: {hygrometricData.difference}
                                  °C
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Squall Tab */}
              <TabsContent
  value="squall"
  className="mt-6 transition-all duration-500"
>
  <Card className={cn("overflow-hidden", tabStyles.squall.card)}>
    <div className="p-4 bg-gradient-to-r from-amber-200 to-amber-300 text-amber-800">
      <h3 className="text-lg font-semibold flex items-center">
        <Wind className="mr-2" /> Squall Measurements
      </h3>
    </div>
    <CardContent className="pt-6 space-y-4">
      {formData.squallConfirmed === undefined ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-amber-800 font-medium mb-3">Are you sure you want to fill up squall measurements?</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-amber-500 text-amber-700 hover:bg-amber-50"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  squallConfirmed: false,
                  squallForce: "",
                  squallDirection: "",
                  squallTime: ""
                }));
                // Skip to next tab (replace "next-tab-value" with your actual next tab value)
                setTabValue("next-tab-value");
              }}
            >
              No, Skip
            </Button>
            <Button
              type="button"
              className="bg-amber-500 hover:bg-amber-600"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  squallConfirmed: true
                }));
              }}
            >
              Yes, Continue
            </Button>
          </div>
        </div>
      ) : formData.squallConfirmed ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="squallForce">Force (KTS)</Label>
            <Input
              id="squallForce"
              name="squallForce"
              value={formData.squallForce || ""}
              onChange={handleChange}
              className="border-slate-600 transition-all focus:border-amber-500 focus:ring-amber-500/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="squallDirection">Direction (°d)</Label>
            <Input
              id="squallDirection"
              name="squallDirection"
              type="number"
              min="0"
              max="360"
              value={formData.squallDirection || ""}
              onChange={handleChange}
              className="border-slate-600 transition-all focus:border-amber-500 focus:ring-amber-500/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="squallTime">Time (qt)</Label>
            <Input
              id="squallTime"
              name="squallTime"
              value={formData.squallTime || ""}
              onChange={handleChange}
              className="border-slate-600 transition-all focus:border-amber-500 focus:ring-amber-500/30"
            />
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md flex justify-between items-center">
          <p className="text-slate-600">Squall measurements skipped</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                squallConfirmed: true
              }));
            }}
          >
            Fill Measurements
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>

              {/* VV Tab */}
              <TabsContent
                value="V.V"
                className="mt-6 transition-all duration-500"
              >
                <Card className={cn("overflow-hidden", tabStyles["V.V"].card)}>
                  <div className="p-4 bg-gradient-to-r from-orange-200 to-orange-300 text-orange-800">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Eye className="mr-2" /> Visibility Measurements
                    </h3>
                  </div>
                  <CardContent className="pt-6 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="horizontalVisibility">
                        Horizontal Visibility
                      </Label>
                      <Input
                        id="horizontalVisibility"
                        name="horizontalVisibility"
                        value={formData.horizontalVisibility || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-orange-500 focus:ring-orange-500/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="miscMeteors">Misc Meteors(Code)</Label>
                      <Input
                        id="miscMeteors"
                        name="miscMeteors"
                        value={formData.miscMeteors || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-orange-500 focus:ring-orange-500/30"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Weather Tab */}
              <TabsContent
                value="weather"
                className="mt-6 transition-all duration-500"
              >
                <Card className={cn("overflow-hidden", tabStyles.weather.card)}>
                  <div className="p-4 bg-gradient-to-r from-cyan-200 to-cyan-300 text-cyan-800">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Cloud className="mr-2" /> Weather Conditions
                    </h3>
                  </div>
                  <CardContent className="pt-6">
                    <Tabs defaultValue="past" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-cyan-50 rounded-lg">
                        <TabsTrigger
                          value="past"
                          className="data-[state=active]:bg-cyan-200 data-[state=active]:text-cyan-800"
                        >
                          Past
                        </TabsTrigger>
                        <TabsTrigger
                          value="present"
                          className="data-[state=active]:bg-cyan-200 data-[state=active]:text-cyan-800"
                        >
                          Present
                        </TabsTrigger>
                      </TabsList>

                      {/* Past Weather */}
                      <TabsContent value="past" className="mt-4">
                        <Tabs defaultValue="w1" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 bg-cyan-50/50 rounded-lg">
                            <TabsTrigger
                              value="w1"
                              className="data-[state=active]:bg-cyan-200 data-[state=active]:text-cyan-800"
                            >
                              W1
                            </TabsTrigger>
                            <TabsTrigger
                              value="w2"
                              className="data-[state=active]:bg-cyan-200 data-[state=active]:text-cyan-800"
                            >
                              W2
                            </TabsTrigger>
                          </TabsList>

                          {/* W1 Past Weather */}
                          <TabsContent value="w1" className="mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="pastWeatherW1">
                                Past Weather (W1)
                              </Label>
                              <Input
                                id="pastWeatherW1"
                                name="pastWeatherW1"
                                placeholder="Enter past weather code (0-9)"
                                value={formData.pastWeatherW1 || ""}
                                onChange={handleChange}
                                className="border-slate-600 transition-all focus:border-cyan-500 focus:ring-cyan-500/30"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Weather code for the first part of the
                                observation period
                              </p>
                            </div>
                          </TabsContent>

                          {/* W2 Past Weather */}
                          <TabsContent value="w2" className="mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="pastWeatherW2">
                                Past Weather (W2)
                              </Label>
                              <Input
                                id="pastWeatherW2"
                                name="pastWeatherW2"
                                placeholder="Enter past weather code (0-9)"
                                value={formData.pastWeatherW2 || ""}
                                onChange={handleChange}
                                className="border-slate-600 transition-all focus:border-cyan-500 focus:ring-cyan-500/30"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Weather code for the second part of the
                                observation period
                              </p>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </TabsContent>

                      {/* Present Weather */}
                      <TabsContent value="present" className="mt-4">
                        <Tabs defaultValue="ww" className="w-full">
                          <TabsList className="grid w-full grid-cols-1 bg-cyan-50/50 rounded-lg">
                            <TabsTrigger
                              value="ww"
                              className="data-[state=active]:bg-cyan-200 data-[state=active]:text-cyan-800"
                            >
                              WW
                            </TabsTrigger>
                          </TabsList>

                          {/* WW Present Weather */}
                          <TabsContent value="ww" className="mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="presentWeatherWW">
                                Present Weather (WW)
                              </Label>
                              <Input
                                id="presentWeatherWW"
                                name="presentWeatherWW"
                                placeholder="Enter present weather code (00-99)"
                                value={formData.presentWeatherWW || ""}
                                onChange={handleChange}
                                className="border-slate-600 transition-all focus:border-cyan-500 focus:ring-cyan-500/30"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Current weather conditions at time of
                                observation
                              </p>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Indicators Tab */}
              <TabsContent
                value="indicators"
                className="mt-6 transition-all duration-500"
              >
                <Card
                  className={cn("overflow-hidden", tabStyles.indicators.card)}
                >
                  <div className="p-4 bg-gradient-to-r from-fuchsia-200 to-fuchsia-300 text-fuchsia-800">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Clock className="mr-2" /> Time Indicators
                    </h3>
                  </div>
                  <CardContent className="pt-6 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="c2Indicator">
                        C2: 2nd Card Indicator
                      </Label>
                      <Input
                        id="c2Indicator"
                        name="c2Indicator"
                        value={formData.c2Indicator || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-fuchsia-500 focus:ring-fuchsia-500/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="observationTime">
                        GG: Time of Observation (UTC)
                      </Label>
                      <Input
                        id="observationTime"
                        name="observationTime"
                        type="time"
                        value={formData.observationTime || ""}
                        onChange={handleChange}
                        className="border-slate-600 transition-all focus:border-fuchsia-500 focus:ring-fuchsia-500/30"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                className="border-slate-600 hover:bg-slate-100 transition-all duration-300"
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 transition-all duration-300 shadow-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Submit Data"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </>
  );
}
