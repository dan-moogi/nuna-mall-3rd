const SkeletonCard = () => (
  <div className="bg-white rounded overflow-hidden animate-pulse">
    {/* 이미지 영역 */}
    <div className="bg-gray-200 aspect-[3/4] w-full" />
    {/* 정보 영역 */}
    <div className="p-3 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-4/6" />
      <div className="flex gap-2 mt-1">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  </div>
)

export default SkeletonCard
