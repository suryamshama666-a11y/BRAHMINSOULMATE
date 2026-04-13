import React from 'react';
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]",
        className
      )}
      style={{
        animation: "shimmer 1.5s ease-in-out infinite",
      }}
      {...props}
    />
  )
}

// Profile Card Skeleton - mimics the ProfileCard layout
function ProfileCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      "bg-white rounded-xl border-2 border-gray-100 overflow-hidden min-h-[300px]",
      className
    )}>
      <div className="flex h-full">
        {/* Left: Image placeholder */}
        <div className="flex-shrink-0 flex flex-col border-r border-gray-100 w-40">
          <Skeleton className="w-40 h-48" />
          <div className="flex-1 px-2 py-3 space-y-2">
            <div className="flex justify-center">
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-7 w-full rounded" />
            <Skeleton className="h-7 w-full rounded" />
          </div>
        </div>
        
        {/* Right: Details placeholder */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="mt-auto pt-4 space-y-2">
            <div className="flex space-x-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
            </div>
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Dashboard Stats Skeleton
function StatsCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      "bg-white rounded-2xl p-6 shadow-sm border border-gray-100",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-16" />
        </div>
        <Skeleton className="h-16 w-16 rounded-2xl" />
      </div>
    </div>
  )
}

// Online Member Avatar Skeleton
function AvatarSkeleton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-20 w-20",
    lg: "h-24 w-24"
  }
  
  return (
    <div className="flex flex-col items-center">
      <Skeleton className={cn("rounded-full", sizeClasses[size])} />
      <Skeleton className="h-3 w-14 mt-2" />
      <Skeleton className="h-2 w-10 mt-1" />
    </div>
  )
}

// Message List Item Skeleton
function MessageItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 p-3", className)}>
      <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-3 w-12" />
    </div>
  )
}

// Full Page Loading Skeleton
function PageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 space-y-6", className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <ProfileCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

// Matches Page Skeleton
function MatchesPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
      
      {/* Filters + Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
        
        {/* Grid */}
        <div className="md:col-span-3 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <ProfileCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

export { 
  Skeleton, 
  ProfileCardSkeleton, 
  StatsCardSkeleton, 
  AvatarSkeleton, 
  MessageItemSkeleton,
  PageSkeleton,
  MatchesPageSkeleton
}
