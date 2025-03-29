"use client"

import { MapPin, Ruler, IndianRupee, Calendar, User, CheckCircle } from "lucide-react"
import { formatIndianRupees, formatDate } from "@/lib/utils"
import type { Plot } from "@/lib/models"

interface PlotDetailsProps {
  plot: Plot
}

export default function PlotDetails({ plot }: PlotDetailsProps) {
  return (
    <div className="space-y-4">
      {/* Plot number and status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <MapPin className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium">Plot {plot.plotNumber}</h3>
        </div>
        <div
          className={`
          px-2.5 py-0.5 rounded-full text-sm font-medium
          ${
            plot.status === "available"
              ? "bg-green-100 text-green-800"
              : plot.status === "sold"
                ? "bg-gray-100 text-gray-800"
                : "bg-yellow-100 text-yellow-800"
          }
        `}
        >
          {plot.status.charAt(0).toUpperCase() + plot.status.slice(1)}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Plot details */}
      <div className="grid grid-cols-1 gap-4">
        {/* Area */}
        <div className="flex items-start">
          <Ruler className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-500">Area</p>
            <p className="mt-1">{plot.area} sq.ft.</p>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-start">
          <IndianRupee className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-500">Price</p>
            <p className="mt-1 font-medium">{plot.price ? `₹${formatIndianRupees(plot.price)}` : "Not available"}</p>
          </div>
        </div>

        {/* Owner information (if sold) */}
        {plot.status === "sold" && plot.ownerName && (
          <div className="flex items-start">
            <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Owner</p>
              <p className="mt-1">{plot.ownerName}</p>
            </div>
          </div>
        )}

        {/* Sale date (if sold) */}
        {plot.status === "sold" && plot.saleDate && (
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Sale Date</p>
              <p className="mt-1">{formatDate(plot.saleDate)}</p>
            </div>
          </div>
        )}

        {/* Features/Amenities */}
        {plot.features && plot.features.length > 0 && (
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Features</p>
              <ul className="mt-1 space-y-1">
                {plot.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Description */}
        {plot.description && (
          <div className="mt-2 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
            <p className="text-gray-700">{plot.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}

