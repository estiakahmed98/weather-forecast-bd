"use client";
import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, CloudSun, Filter } from 'lucide-react';
import { format, parseISO, differenceInDays, isValid } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { utcToHour } from "@/lib/utils";
import { Download } from 'lucide-react';
import * as Yup from "yup";

interface Station {
    id: string;
    stationId: string;
    name: string;
    securityCode: string;
    latitude: number;
    longitude: number;
    createdAt: string;
    updatedAt: string;
}

interface MeteorologicalEntry {
    id: string;
    observingTimeId: string;
    stationId?: string;
    dataType: string;
    subIndicator: string;
    alteredThermometer: string;
    barAsRead: string;
    correctedForIndex: string;
    heightDifference: string;
    correctionForTemp: string;
    stationLevelPressure: string;
    seaLevelReduction: string;
    correctedSeaLevelPressure: string;
    afternoonReading: string;
    pressureChange24h: string;
    dryBulbAsRead: string;
    wetBulbAsRead: string;
    maxMinTempAsRead: string;
    dryBulbCorrected: string;
    wetBulbCorrected: string;
    maxMinTempCorrected: string;
    Td: string;
    relativeHumidity: string;
    squallConfirmed: string;
    squallForce: string;
    squallDirection: string;
    squallTime: string;
    horizontalVisibility: string;
    miscMeteors: string;
    pastWeatherW1: string;
    pastWeatherW2: string;
    presentWeatherWW: string;
    c2Indicator: string;
    submittedAt?: string;
    createdAt: string;
    updatedAt: string;
    ObservingTime?: {
        stationId: string;
        userId: string;
        utcTime: string;
        station: Station;
    };
}

interface ObservingTimeEntry {
    id: string;
    userId: string;
    stationId: string;
    utcTime: string;
    localTime: string;
    createdAt: string;
    updatedAt: string;
    station: Station;
    MeteorologicalEntry: MeteorologicalEntry[];
}

interface MargeTableProps {
    refreshTrigger?: number;
}

function canEditRecord(record: MeteorologicalEntry, user: any): boolean {
    if (!user) return false;

    // If no submittedAt, allow edit (newly created record)
    if (!record.createdAt) return true;

    try {
        const submissionDate = parseISO(record.createdAt);
        if (!isValid(submissionDate)) return true;

        const now = new Date();
        const daysDifference = differenceInDays(now, submissionDate);

        const role = user.role;
        const userId = user.id;
        const userStationId = user.station?.id;
        const recordStationId = record.ObservingTime?.stationId;

        const recordUserId = record.ObservingTime?.userId;

        if (role === "super_admin") return daysDifference <= 365;

        if (role === "station_admin") {
            return daysDifference <= 30 && userStationId === recordStationId;
        }

        if (role === "observer") {
            return daysDifference <= 2 && userId === recordUserId;
        }

        return false;
    } catch (e) {
        console.warn("Error in canEditRecord:", e);
        return false;
    }
}

const MargeTable = forwardRef(
    ({ refreshTrigger = 0 }: MargeTableProps, ref) => {
        const [data, setData] = useState<ObservingTimeEntry[]>([]);
        const [flattenedData, setFlattenedData] = useState<MeteorologicalEntry[]>(
            []
        );
        const [loading, setLoading] = useState(true);
        const today = format(new Date(), "yyyy-MM-dd");
        const [startDate, setStartDate] = useState(today);
        const [endDate, setEndDate] = useState(today);
        const [dateError, setDateError] = useState<string | null>(null);
        const [stationFilter, setStationFilter] = useState("all");
        const [stations, setStations] = useState<Station[]>([]);
        const { data: session } = useSession();
        const user = session?.user;
        const isSuperAdmin = user?.role === "super_admin";
        const isStationAdmin = user?.role === "station_admin";
        const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

        // Expose getData method via ref
        useImperativeHandle(ref, () => ({
            getData: () => {
                return flattenedData.map((record) => {
                    const observingTime = data.find(
                        (ot) => ot.id === record.observingTimeId
                    );
                    return {
                        ...record,
                        stationId: observingTime?.stationId || "",
                        stationName: observingTime?.station?.name || "",
                        utcTime: observingTime?.utcTime || "",
                        localTime: observingTime?.localTime || "",
                    };
                });
            },
        }));

        const exportToCSV = () => {
            if (flattenedData.length === 0 || data.length === 0) {
                toast.error("No data to export");
                return;
            }

            // Create CSV header
            const headers = [
                "Time (GMT)",
                "Indicator",
                "Date",
                "Station Name & ID",
                "Station Name",
                "Attached Thermometer (°C)",
                "Bar As Read (hPa)",
                "Corrected for Index",
                "Height Difference Correction (hPa)",
                "Station Level Pressure (QFE)",
                "Sea Level Reduction",
                "Sea Level Pressure (QNH)",
                "Afternoon Reading",
                "24-Hour Pressure Change",
                "Dry Bulb As Read (°C)",
                "Wet Bulb As Read (°C)",
                "MAX/MIN Temp As Read (°C)",
                "Dry Bulb Corrected (°C)",
                "Wet Bulb Corrected (°C)",
                "MAX/MIN Temp Corrected (°C)",
                "Dew Point Temperature (°C)",
                "Relative Humidity (%)",
                "Squall Force (KTS)",
                "Squall Direction (°)",
                "Squall Time",
                "Horizontal Visibility (km)",
                "Misc Meteors (Code)",
                "Past Weather (W₁)",
                "Past Weather (W₂)",
                "Present Weather (ww)",
                "C2 Indicator",
            ];

            // Create CSV rows
            const rows = flattenedData.map((record) => {
                const observingTime = data.find(
                    (ot) => ot.id === record.observingTimeId
                );
                return [
                    utcToHour(observingTime?.utcTime || ""),
                    record.subIndicator || "--",
                    observingTime?.utcTime
                        ? format(new Date(observingTime.utcTime), "yyyy-MM-dd")
                        : "--",
                    observingTime?.station?.name +
                    " " +
                    observingTime?.station?.stationId || "--",
                    observingTime?.station?.name || "--",
                    record.alteredThermometer || "--",
                    record.barAsRead || "--",
                    record.correctedForIndex || "--",
                    record.heightDifference || "--",
                    record.stationLevelPressure || "--",
                    record.seaLevelReduction || "--",
                    record.correctedSeaLevelPressure || "--",
                    record.afternoonReading || "--",
                    record.pressureChange24h || "--",
                    record.dryBulbAsRead || "--",
                    record.wetBulbAsRead || "--",
                    record.maxMinTempAsRead || "--",
                    record.dryBulbCorrected || "--",
                    record.wetBulbCorrected || "--",
                    record.maxMinTempCorrected || "--",
                    record.Td || "--",
                    record.relativeHumidity || "--",
                    record.squallForce || "--",
                    record.squallDirection || "--",
                    record.squallTime || "--",
                    record.horizontalVisibility || "--",
                    record.miscMeteors || "--",
                    record.pastWeatherW1 || "--",
                    record.pastWeatherW2 || "--",
                    record.presentWeatherWW || "--",
                    record.c2Indicator || "--",
                ];
            });

            // Combine header and rows
            const csvContent = [headers, ...rows]
                .map((row) => row.map((field) => `"${field}"`).join(","))
                .join("\n");

            // Create download link
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `meteorological_data_${startDate}_to_${endDate}.csv`
            );
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success("CSV export started");
        };

        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch meteorological data with date range
                const response = await fetch(
                    `/api/first-card-data?startDate=${startDate}&endDate=${endDate}${stationFilter !== "all" ? `&stationId=${stationFilter}` : ""}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                const result = await response.json();
                setData(result.entries || []);

                // Flatten the data for easier display
                const flattened: MeteorologicalEntry[] = [];
                result.entries.forEach((observingTime: ObservingTimeEntry) => {
                    observingTime.MeteorologicalEntry.forEach(
                        (entry: MeteorologicalEntry) => {
                            flattened.push({
                                ...entry,
                                observingTimeId: observingTime.id,
                                stationId: observingTime.stationId,
                                stationCode: observingTime.station?.stationId,
                            });
                        }
                    );
                });
                setFlattenedData(flattened);

                // Fetch stations if super admin
                if (isSuperAdmin) {
                    const stationsResponse = await fetch("/api/stations");
                    if (!stationsResponse.ok) {
                        throw new Error("Failed to fetch stations");
                    }
                    const stationsResult = await stationsResponse.json();
                    setStations(stationsResult);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to fetch meteorological data");
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            fetchData();
        }, [refreshTrigger, startDate, endDate, stationFilter]);

        const goToPreviousWeek = () => {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const daysInRange = differenceInDays(end, start);

            // Calculate the new date range
            const newStart = new Date(start);
            newStart.setDate(start.getDate() - (daysInRange + 1));

            const newEnd = new Date(start);
            newEnd.setDate(start.getDate() - 1);

            // Always update the dates when going back
            setStartDate(format(newStart, "yyyy-MM-dd"));
            setEndDate(format(newEnd, "yyyy-MM-dd"));
            setDateError(null);
        };

        const goToNextWeek = () => {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const daysInRange = differenceInDays(end, start);

            // Calculate the new date range
            const newStart = new Date(start);
            newStart.setDate(start.getDate() + (daysInRange + 1));

            const newEnd = new Date(newStart);
            newEnd.setDate(newStart.getDate() + daysInRange);

            // Get today's date at midnight for comparison
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // If the new range would go beyond today, adjust it
            if (newEnd > today) {
                // If we're already at or beyond today, don't go further
                if (end >= today) {
                    return;
                }
                // Otherwise, set the end to today and adjust the start accordingly
                const adjustedEnd = new Date(today);
                const adjustedStart = new Date(adjustedEnd);
                adjustedStart.setDate(adjustedEnd.getDate() - daysInRange);

                setStartDate(format(adjustedStart, "yyyy-MM-dd"));
                setEndDate(format(adjustedEnd, "yyyy-MM-dd"));
            } else {
                // Update to the new range if it's valid
                setStartDate(format(newStart, "yyyy-MM-dd"));
                setEndDate(format(newEnd, "yyyy-MM-dd"));
            }

            setDateError(null);
        };

        const getWeatherStatusColor = (humidity: string) => {
            const humidityValue = Number.parseInt(humidity || "0");
            if (humidityValue >= 80) return "bg-blue-500";
            if (humidityValue >= 60) return "bg-green-500";
            if (humidityValue >= 40) return "bg-yellow-500";
            if (humidityValue >= 20) return "bg-orange-500";
            return "bg-red-500";
        };

        const handleEditClick = (
            record: MeteorologicalEntry,
            observingTime: ObservingTimeEntry
        ) => {
            if (user && canEditRecord(record, user)) {
                setSelectedRecord(record);
                setSelectedObservingTime(observingTime);
                setIsEditDialogOpen(true);
            } else {
                setIsPermissionDeniedOpen(true);
            }
        };

        const handleDateChange = (type: "start" | "end", newDate: string) => {
            const date = new Date(newDate);
            const otherDate =
                type === "start" ? new Date(endDate) : new Date(startDate);

            if (isNaN(date.getTime())) {
                setDateError("Invalid date format");
                return;
            }

            // Reset error if dates are valid
            setDateError(null);

            if (type === "start") {
                if (date > otherDate) {
                    setDateError("Start date cannot be after end date");
                    return;
                }
                setStartDate(newDate);
            } else {
                if (date < otherDate) {
                    setDateError("End date cannot be before start date");
                    return;
                }
                setEndDate(newDate);
            }
        };

        return (
            <Card className="shadow-xl border-none overflow-hidden bg-gradient-to-br from-white to-slate-50">
                <div className="text-center font-bold text-xl border-b-2 border-indigo-600 pb-2 text-indigo-800">
                    Meteorological Data Table
                </div>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:justify-between mb-6 gap-4 bg-slate-100 p-3 sm:p-4 rounded-lg">

                        {/* Date Navigation Section */}
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">

                            {/* Navigation Controls - Responsive Layout */}
                            <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-3 w-full sm:w-auto">

                                {/* Previous/Next Buttons with Date Inputs */}
                                <div className="flex items-center gap-2 w-full xs:w-auto">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={goToPreviousWeek}
                                        className="hover:bg-slate-200 flex-shrink-0"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>

                                    {/* Date Range Inputs - Responsive */}

                                    <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => handleDateChange("start", e.target.value)}
                                            max={endDate}
                                            className="text-xs sm:text-sm p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded w-full xs:w-auto min-w-0"
                                        />
                                        <span className="text-sm text-slate-600 whitespace-nowrap">to</span>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => handleDateChange("end", e.target.value)}
                                            min={startDate}
                                            max={format(new Date(), "yyyy-MM-dd")}
                                            className="text-xs sm:text-sm p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded w-full xs:w-auto min-w-0"
                                        />
                                    </div>


                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={goToNextWeek}
                                        className="hover:bg-slate-200 flex-shrink-0"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Actions and Filters Section */}
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                            {/* Export Button */}
                            {(isSuperAdmin || isStationAdmin) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={exportToCSV}
                                    className="flex items-center gap-2 hover:bg-green-50 border-green-200 text-green-700 w-full sm:w-auto justify-center sm:justify-start"
                                    disabled={flattenedData.length === 0}
                                >
                                    <Download className="h-4 w-4 flex-shrink-0" />
                                    <span className="whitespace-nowrap">Export CSV</span>
                                </Button>
                            )}

                            {/* Station Filter - Super Admin Only */}
                            {isSuperAdmin && (
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 w-full md:w-auto">
                                    <div className="flex items-center gap-2">
                                        <Filter size={16} className="text-purple-500 flex-shrink-0" />
                                        <Label
                                            htmlFor="stationFilter"
                                            className="whitespace-nowrap font-medium text-slate-700 text-sm"
                                        >
                                            Station:
                                        </Label>
                                    </div>
                                    <Select
                                        value={stationFilter}
                                        onValueChange={setStationFilter}
                                    >
                                        <SelectTrigger className="w-full xs:w-[180px] sm:w-[200px] border-slate-300 focus:ring-purple-500 text-sm">
                                            <SelectValue placeholder="All Stations" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Stations</SelectItem>
                                            {stations.map((station) => (
                                                <SelectItem key={station.id} value={station.id}>
                                                    <span className="block truncate">
                                                        {station.name} ({station.stationId})
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">

                        <div className="flex flex-col md:flex-row md:justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-100 to-slate-200 border-b border-slate-300 gap-3 sm:gap-4">
                            <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
                                <div className="flex flex-col items-center min-w-[100px]">
                                    <Label className="text-xs sm:text-sm font-medium text-slate-900 mb-1 sm:mb-2 text-center">
                                        DATA TYPE
                                    </Label>
                                    <div className="flex gap-1">
                                        {["S", "Y"].map((char, i) => (
                                            <Input
                                                key={`dataType-${i}`}
                                                className="w-8 sm:w-10 h-8 sm:h-9 text-center p-1 bg-slate-100 border border-slate-400 shadow-sm text-xs sm:text-sm"
                                                defaultValue={char}
                                                readOnly
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col items-center min-w-[100px]">
                                    <div className="text-xs sm:text-sm font-bold uppercase text-slate-600 mb-1 sm:mb-2 text-center">
                                        STATION NO
                                    </div>
                                    <div className="flex h-8 sm:h-9 w-full min-w-[80px] sm:min-w-[100px] border border-slate-400 rounded-lg px-2 items-center justify-center bg-white text-xs sm:text-sm font-mono truncate">
                                        {user?.station?.stationId || "N/A"}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
                                <div className="flex flex-col items-center min-w-[100px]">
                                    <div className="text-xs sm:text-sm font-bold uppercase text-slate-600 mb-1 sm:mb-2 text-center">
                                        YEAR
                                    </div>
                                    <div className="flex">
                                        <div className="w-8 sm:w-10 h-8 sm:h-9 border border-slate-400 flex items-center justify-center p-1 font-mono rounded-l-md bg-white text-xs sm:text-sm">
                                            {new Date().getFullYear().toString().slice(-2, -1)}
                                        </div>
                                        <div className="w-8 sm:w-10 h-8 sm:h-9 border-t border-r border-b border-slate-400 flex items-center justify-center p-1 font-mono rounded-r-md bg-white text-xs sm:text-sm">
                                            {new Date().getFullYear().toString().slice(-1)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center min-w-[120px] sm:min-w-[150px]">
                                    <div className="text-xs sm:text-sm font-bold uppercase text-slate-600 mb-1 sm:mb-2 text-center">
                                        STATION
                                    </div>
                                    <div className="h-8 sm:h-9 w-full border border-slate-400 px-2 flex items-center justify-center font-mono rounded-md bg-white text-xs sm:text-sm text-center truncate">
                                        {user?.station?.name || "N/A"}
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="p-4">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th
                                                colSpan={29}
                                                className="border border-sky-400 bg-gradient-to-b from-sky-50 to-sky-100 p-1 text-sky-800"
                                            >
                                                First Card
                                            </th>
                                            <th
                                                colSpan={60}
                                                className="border border-purple-300 bg-gradient-to-b from-purple-50 to-purple-100 p-1 text-purple-800"
                                            >
                                                Second Card
                                            </th>
                                        </tr>
                                        <tr>
                                            <th
                                                rowSpan={2}
                                                className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
                                            >
                                                GG
                                            </th>
                                            <th
                                                rowSpan={2}
                                                className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
                                            >
                                                CI
                                            </th>
                                            <th
                                                rowSpan={2}
                                                className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
                                            >
                                                Date
                                            </th>
                                            <th
                                                rowSpan={2}
                                                className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
                                            >
                                                Station
                                            </th>
                                            <th
                                                rowSpan={2}
                                                colSpan={9}
                                                className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 p-1 text-purple-800"
                                            >
                                                BAR PRESSURE
                                            </th>
                                            <th
                                                colSpan={6}
                                                className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 p-1 text-cyan-800"
                                            >
                                                TEMPERATURE
                                            </th>
                                            <th
                                                rowSpan={2}
                                                colSpan={1}
                                                className="border border-slate-300 bg-gradient-to-b from-teal-50 to-teal-100 p-1 text-teal-800"
                                            >
                                                Td
                                            </th>
                                            <th
                                                rowSpan={2}
                                                colSpan={1}
                                                className="border border-slate-300 bg-gradient-to-b from-teal-50 to-teal-100 p-1 text-teal-800"
                                            >
                                                R.H.
                                            </th>
                                            <th
                                                rowSpan={2}
                                                colSpan={3}
                                                className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 p-1 text-amber-800"
                                            >
                                                SQUALL
                                            </th>
                                            <th
                                                rowSpan={2}
                                                colSpan={1}
                                                className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
                                            >
                                                VV
                                            </th>
                                            <th
                                                rowSpan={2}
                                                colSpan={1}
                                                className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
                                            ></th>
                                            <th
                                                rowSpan={2}
                                                colSpan={3}
                                                className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 text-emerald-800"
                                            >
                                                WEATHER
                                            </th>
                                            <th rowSpan={3} className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 p-1 text-sky-800">
                                                C2 Indicator
                                            </th>
                                            <th colSpan={11} className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800">
                                                CLOUD
                                            </th>
                                            <th rowSpan={3} className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 p-1 text-sky-800">
                                                TOTAL CLOUD Amount (Octa)
                                            </th>

                                            <th colSpan={12} className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800">
                                                SIGNIFICANT CLOUD
                                            </th>

                                            <th colSpan={5} rowSpan={2} className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 text-emerald-800">
                                                RAINFALL
                                            </th>
                                            <th colSpan={4} rowSpan={2} className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 p-1 text-amber-800">
                                                WIND
                                            </th>
                                            <th rowSpan={3} className="border border-slate-300 bg-gradient-to-b from-gray-50 to-gray-100 p-1 text-gray-800">
                                                OBSERVER
                                            </th>
                                        </tr>
                                        <tr>
                                            {/* Row for temperature column groups */}
                                            <th
                                                colSpan={3}
                                                className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1 text-cyan-800 text-center"
                                            >
                                                As Read
                                            </th>
                                            <th
                                                colSpan={3}
                                                className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1 text-cyan-800 text-center"
                                            >
                                                Corrected
                                            </th>


                                            <th colSpan={4} className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800">
                                                LOW
                                            </th>
                                            <th colSpan={4} className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800">
                                                MEDIUM
                                            </th>
                                            <th colSpan={3} className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800">
                                                HIGH
                                            </th>


                                            <th colSpan={3} className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800">
                                                1st Layer
                                            </th>
                                            <th colSpan={3} className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800">
                                                2nd Layer
                                            </th>
                                            <th colSpan={3} className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800">
                                                3rd Layer
                                            </th>
                                            <th colSpan={3} className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800">
                                                4th Layer
                                            </th>
                                        </tr>


                                        <tr>
                                            <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                                                <div className="h-16 text-indigo-800">
                                                    Time of Observation (UTC)
                                                </div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                                                <div className="h-16 text-indigo-800">Indicator</div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                                                <div className="h-16 text-indigo-800">Date</div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                                                <div className="h-16 text-indigo-800">
                                                    Station Name & ID
                                                </div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                                                <div className="h-16 text-purple-800">
                                                    Attached Thermometer (°C)
                                                </div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                                                <div className="h-16 text-purple-800">
                                                    Bar As Read (hPa)
                                                </div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                                                <div className="h-16 text-purple-800">
                                                    Corrected for Index
                                                </div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                                                <div className="h-16 text-purple-800">
                                                    Height Difference Correction (hPa)
                                                </div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                                                <div className="h-16 text-purple-800">
                                                    Station Level Pressure (QFE)
                                                </div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                                                <div className="h-16 text-purple-800">
                                                    Sea Level Reduction
                                                </div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                                                <div className="h-16 text-purple-800">
                                                    Sea Level Pressure (QNH)
                                                </div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                                                <div className="h-16 text-purple-800">
                                                    Altimeter setting (QNH)
                                                </div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                                                <div className="h-16 text-purple-800">
                                                    24-Hour Pressure Change
                                                </div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
                                                <div className="h-16 text-cyan-800">Dry Bulb (°C)</div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
                                                <div className="h-16 text-cyan-800">Wet Bulb (°C)</div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
                                                <div className="h-16 text-cyan-800">MAX/MIN (°C)</div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
                                                <div className="h-16 text-cyan-800">Dry Bulb (°C)</div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
                                                <div className="h-16 text-cyan-800">Wet Bulb (°C)</div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
                                                <div className="h-16 text-cyan-800">MAX/MIN (°C)</div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-teal-50 to-teal-100 text-xs p-1">
                                                <div className="h-16 text-teal-800">
                                                    Dew Point Temperature (°C)
                                                </div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-teal-50 to-teal-100 text-xs p-1">
                                                <div className="h-16 text-teal-800">
                                                    Relative Humidity (%)
                                                </div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 text-xs p-1">
                                                <div className="h-16 text-amber-800">Force (KTS)</div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 text-xs p-1">
                                                <div className="h-16 text-amber-800">
                                                    Direction (dq)
                                                </div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 text-xs p-1">
                                                <div className="h-16 text-amber-800">Time (q1)</div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                                                <div className="h-16 text-blue-800">
                                                    Horizontal Visibility (km)
                                                </div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                                                <div className="h-16 text-blue-800">
                                                    Misc. Meteors (Code)
                                                </div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
                                                <div className="h-16 text-emerald-800">Past W₁</div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
                                                <div className="h-16 text-emerald-800">Past W2</div>
                                            </th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
                                                <div className="h-16 text-emerald-800">Present ww</div>
                                            </th>

                                            <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">Form (Code)</th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">Amount (Octa)</th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">Direction (Code)</th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">Height Of Base (Code)</th>

                                            {/* MEDIUM CLOUD */}
                                            <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">Form (Code)</th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">Amount (Octa)</th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">Direction (Code)</th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">Height Of Base (Code)</th>


                                            {/* HIGH CLOUD */}
                                            <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">Form (Code)</th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">Amount (Octa)</th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">Direction (Code)</th>


                                            {/* SIGNIFICANT CLOUD */}
                                            <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">Form (Code)</th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">Amount (Octa)</th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">Height of Base (Code)</th>

                                            <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">Form (Code)</th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">Amount (Octa)</th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">Height of Base (Code)</th>

                                            <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">Form (Code)</th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">Amount (Octa)</th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">Height of Base (Code)</th>

                                            <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">Form (Code)</th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">Amount (Octa)</th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">Height of Base (Code)</th>

                                            {/* RainFall */}
                                            <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 font-medium text-emerald-800">Time Of Start</th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 font-medium text-emerald-800">Time Of End</th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 font-medium text-emerald-800">Since Previous</th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 font-medium text-emerald-800">During Previous</th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 font-medium text-emerald-800">Last 24 Hours</th>

                                            {/* Wind */}
                                            <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 p-1 font-medium text-amber-800">First Anemometer Reading</th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 p-1 font-medium text-amber-800">Second Anemometer Reading</th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 p-1 font-medium text-amber-800">Speed (KTS)</th>
                                            <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 p-1 font-medium text-amber-800">Direction</th>

                                        </tr>

                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan={27} className="text-center py-8">
                                                    <div className="flex justify-center items-center">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                                        <span className="ml-3 text-indigo-600 font-medium">
                                                            Loading data...
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : data.length === 0 ? (
                                            <tr>
                                                <td colSpan={27} className="text-center py-12">
                                                    <div className="flex flex-col items-center justify-center text-slate-500">
                                                        <CloudSun
                                                            size={48}
                                                            className="text-slate-400 mb-3"
                                                        />
                                                        <p className="text-lg font-medium">
                                                            No meteorological data found
                                                        </p>
                                                        <p className="text-sm">
                                                            Try selecting a different date or station
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            data.flatMap((observingTime, obsIndex) =>
                                                observingTime.MeteorologicalEntry.map(
                                                    (record, entryIndex) => {
                                                        const humidityClass = getWeatherStatusColor(
                                                            record.relativeHumidity
                                                        );
                                                        const recordDate = observingTime.utcTime
                                                            ? format(
                                                                new Date(observingTime.utcTime),
                                                                "yyyy-MM-dd"
                                                            )
                                                            : "--";
                                                        const canEdit = user && canEditRecord(record, user);
                                                        const rowIndex =
                                                            obsIndex *
                                                            observingTime.MeteorologicalEntry.length +
                                                            entryIndex;

                                                        return (
                                                            <tr
                                                                key={record.id}
                                                                className={`text-center font-mono hover:bg-slate-50 transition-colors ${rowIndex % 2 === 0
                                                                    ? "bg-white"
                                                                    : "bg-slate-50"
                                                                    }`}
                                                            >
                                                                <td className="border border-slate-300 p-1 font-medium text-indigo-700">
                                                                    {utcToHour(observingTime.utcTime.toString())}
                                                                </td>
                                                                <td className="border border-slate-300 p-1">
                                                                    {record.subIndicator || "--"}
                                                                </td>
                                                                <td className="border border-slate-300 p-1 font-medium text-indigo-700 whitespace-nowrap">
                                                                    {" "}
                                                                    {new Date(
                                                                        observingTime.utcTime
                                                                    ).toLocaleDateString()}
                                                                </td>
                                                                <td className="border border-slate-300 p-1">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="font-mono"
                                                                    >
                                                                        {observingTime.station?.name +
                                                                            " " +
                                                                            observingTime.station?.stationId || "--"}
                                                                    </Badge>
                                                                </td>
                                                                <td className="border border-slate-300 p-1">
                                                                    {record.alteredThermometer || "--"}
                                                                </td>
                                                                <td className="border border-slate-300 p-1 font-medium text-purple-700">
                                                                    {record.barAsRead || "--"}
                                                                </td>
                                                                <td className="border border-slate-300 p-1">
                                                                    {record.correctedForIndex || "--"}
                                                                </td>
                                                                <td className="border border-slate-300 p-1">
                                                                    {record.heightDifference || "--"}
                                                                </td>
                                                                <td className="border border-slate-300 p-1 font-medium text-purple-700">
                                                                    {record.stationLevelPressure || "--"}
                                                                </td>
                                                                <td className="border border-slate-300 p-1">
                                                                    {record.seaLevelReduction || "--"}
                                                                </td>
                                                                <td className="border border-slate-300 p-1 font-medium text-purple-700">
                                                                    {record.correctedSeaLevelPressure || "--"}
                                                                </td>
                                                                <td className="border border-slate-300 p-1">
                                                                    {record.afternoonReading || "--"}
                                                                </td>
                                                                <td className="border border-slate-300 p-1">
                                                                    {record.pressureChange24h || "--"}
                                                                </td>
                                                                <td className="border border-slate-300 p-1 font-medium text-cyan-700">
                                                                    {record.dryBulbAsRead || "--"}
                                                                </td>
                                                                <td className="border border-slate-300 p-1">
                                                                    {record.wetBulbAsRead || "--"}
                                                                </td>
                                                                <td className="border border-slate-300 p-1">
                                                                    {record.maxMinTempAsRead || "--"}
                                                                </td>
                                                                <td className="border border-slate-300 p-1 font-medium text-cyan-700">
                                                                    {record.dryBulbCorrected || "--"}
                                                                </td>
                                                                <td className="border border-slate-300 p-1">
                                                                    {record.wetBulbCorrected || "--"}
                                                                </td>
                                                                <td className="border border-slate-300 p-1">
                                                                    {record.maxMinTempCorrected || "--"}
                                                                </td>
                                                                <td className="border border-slate-300 p-1 font-medium text-teal-700">
                                                                    {record.Td || "--"}
                                                                </td>
                                                                <td className="border border-slate-300 p-1">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={`${humidityClass} text-white`}
                                                                    >
                                                                        {record.relativeHumidity || "--"}
                                                                    </Badge>
                                                                </td>
                                                                <td className="border border-slate-300 p-1 font-medium text-amber-700">
                                                                    {record.squallForce || "--"}
                                                                </td>
                                                                <td className="border border-slate-300 p-1">
                                                                    {record.squallDirection || "--"}
                                                                </td>
                                                                <td className="border border-slate-300 p-1">
                                                                    {record.squallTime || "--"}
                                                                </td>
                                                                <td className="border border-slate-300 p-1 font-medium text-blue-700">
                                                                    {record.horizontalVisibility
                                                                        ? Number.parseInt(
                                                                            record.horizontalVisibility
                                                                        ) %
                                                                            10 ===
                                                                            0
                                                                            ? Number.parseInt(
                                                                                record.horizontalVisibility,
                                                                                10
                                                                            ) / 10
                                                                            : (
                                                                                Number.parseInt(
                                                                                    record.horizontalVisibility,
                                                                                    10
                                                                                ) / 10
                                                                            ).toFixed(1)
                                                                        : "--"}
                                                                </td>

                                                                <td className="border border-slate-300 p-1">
                                                                    {record.miscMeteors || "--"}
                                                                </td>
                                                                <td className="border border-slate-300 p-1">
                                                                    {record.pastWeatherW1 || "--"}
                                                                </td>
                                                                <td className="border border-slate-300 p-1">
                                                                    {record.pastWeatherW2 || "--"}
                                                                </td>
                                                                <td className="border border-slate-300 p-1 font-medium text-emerald-700">
                                                                    {record.presentWeatherWW || "--"}
                                                                </td>
                                                            </tr>
                                                        );
                                                    }
                                                )
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }
);

MargeTable.displayName = "MargeTable";
export default MargeTable;
