"use client"

import { useState, useEffect } from "react"
import { Search, Filter, ChevronDown, ChevronUp, MapPin } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatIndianRupees } from "@/lib/utils"
import type { Plot } from "@/lib/models"

interface PlotListProps {
  plots: Plot[]
  onPlotSelect: (plot: Plot) => void
  selectedPlotId?: string
  showFilters?: boolean
  showSearch?: boolean
  clientId?: string
}

export default function PlotList({
  plots,
  onPlotSelect,
  selectedPlotId,
  showFilters = true,
  showSearch = true,
  clientId,
}: PlotListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("plotNumber")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filteredPlots, setFilteredPlots] = useState<Plot[]>(plots)
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if on mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // Filter and sort plots when dependencies change
  useEffect(() => {
    let result = [...plots]

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (plot) =>
          plot.plotNumber.toString().toLowerCase().includes(term) ||
          plot.area.toString().includes(term) ||
          (plot.price && plot.price.toString().includes(term)),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((plot) => plot.status === statusFilter)
    }

    // Filter by client ownership if clientId is provided
    if (clientId) {
      const ownedPlots = result.filter((plot) => plot.ownerId === clientId)
      const otherPlots = result.filter((plot) => plot.ownerId !== clientId)

      // Sort owned plots first, then other plots
      result = [...ownedPlots, ...otherPlots]
    }

    // Sort plots
    result.sort((a, b) => {
      let valueA, valueB

      switch (sortBy) {
        case "plotNumber":
          valueA = Number.parseInt(a.plotNumber)
          valueB = Number.parseInt(b.plotNumber)
          break
        case "area":
          valueA = a.area
          valueB = b.area
          break
        case "price":
          valueA = a.price || 0
          valueB = b.price || 0
          break
        default:
          valueA = a.plotNumber
          valueB = b.plotNumber
      }

      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1
      } else {
        return valueA < valueB ? 1 : -1
      }
    })

    setFilteredPlots(result)
  }, [plots, searchTerm, statusFilter, sortBy, sortDirection, clientId])

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "sold":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
      case "reserved":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  // Check if plot is owned by current client
  const isOwnedByClient = (plot: Plot) => {
    return clientId && plot.ownerId === clientId
  }

  return (
    <div className="space-y-4">
      {/* Search and filter controls */}
      {(showSearch || showFilters) && (
        <div className="space-y-3">
          {/* Mobile filter toggle */}
          {isMobile && showFilters && (
            <Button
              variant="outline"
              className="w-full flex items-center justify-between text-blue-600 border-blue-200 bg-blue-50"
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            >
              <span className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filters & Sorting
              </span>
              {isFilterExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}

          {/* Search input - always visible */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search plots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
          )}

          {/* Filter controls - conditionally visible on mobile */}
          <AnimatePresence>
            {showFilters && (!isMobile || isFilterExpanded) && (
              <motion.div
                initial={isMobile ? { height: 0, opacity: 0 } : false}
                animate={isMobile ? { height: "auto", opacity: 1 } : false}
                exit={isMobile ? { height: 0, opacity: 0 } : false}
                className="grid grid-cols-1 sm:grid-cols-3 gap-2 overflow-hidden"
              >
                <div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plotNumber">Plot Number</SelectItem>
                      <SelectItem value="area">Area</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  onClick={toggleSortDirection}
                  className="flex items-center justify-center bg-white"
                >
                  {sortDirection === "asc" ? (
                    <>
                      <ChevronUp className="mr-2 h-4 w-4" />
                      Ascending
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-2 h-4 w-4" />
                      Descending
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-gray-500">
        {filteredPlots.length} plot{filteredPlots.length !== 1 ? "s" : ""} found
      </div>

      {/* Plot list */}
      <div className="space-y-3">
        {filteredPlots.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No plots found matching your criteria</p>
          </div>
        ) : (
          filteredPlots.map((plot) => (
            <motion.div
              key={plot.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPlotSelect(plot)}
              className={`
                relative p-3 sm:p-4 rounded-lg cursor-pointer transition-all
                ${
                  selectedPlotId === plot.id
                    ? "bg-blue-50 border-blue-300 border-2"
                    : "bg-white border border-gray-200 hover:border-blue-200 hover:shadow-sm"
                }
                ${isOwnedByClient(plot) ? "ring-1 ring-blue-500" : ""}
              `}
            >
              {/* Mobile-optimized layout */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                {/* Plot number and status */}
                <div className="flex justify-between items-center sm:w-1/4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-blue-500 mr-1.5" />
                    <span className="font-medium text-blue-700">Plot {plot.plotNumber}</span>
                  </div>
                  <Badge className={`${getStatusColor(plot.status)} sm:hidden`}>
                    {plot.status.charAt(0).toUpperCase() + plot.status.slice(1)}
                  </Badge>
                </div>

                {/* Plot details */}
                <div className="flex flex-col sm:flex-row sm:flex-1 gap-2 sm:gap-4">
                  <div className="flex justify-between sm:justify-start sm:w-1/3">
                    <span className="text-gray-500 sm:hidden">Area:</span>
                    <span>{plot.area} sq.ft.</span>
                  </div>

                  <div className="flex justify-between sm:justify-start sm:w-1/3">
                    <span className="text-gray-500 sm:hidden">Price:</span>
                    <span className="font-medium text-gray-900">
                      {plot.price ? `₹${formatIndianRupees(plot.price)}` : "N/A"}
                    </span>
                  </div>

                  <Badge className={`${getStatusColor(plot.status)} hidden sm:inline-flex sm:ml-auto`}>
                    {plot.status.charAt(0).toUpperCase() + plot.status.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Client ownership indicator */}
              {isOwnedByClient(plot) && (
                <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
                  <Badge className="bg-blue-500 text-white hover:bg-blue-600">Your Plot</Badge>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

