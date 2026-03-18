import { useNavigate } from 'react-router-dom'
import { optimizeImage } from '../../utils/imageUrl'

const ProductCard = ({ product }) => {
  const navigate = useNavigate()
  const isSoldOut = product.stock === 0
  const isNew  = product.tags?.includes('new')
  const isSale = product.tags?.includes('sale')

  return (
    <div
      onClick={() => !isSoldOut && navigate(`/products/detail/${product._id}`)}
      className={`bg-white rounded overflow-hidden group transition-all duration-300
        hover:-translate-y-1 hover:shadow-lg
        ${isSoldOut ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
    >
      {/* 이미지 */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={optimizeImage(product.cloudinaryUrl, 300)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* 배지 */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew  && <span className="bg-black text-white text-[10px] font-bold px-1.5 py-0.5">NEW</span>}
          {isSale && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5">SALE</span>}
        </div>
        {/* SOLD OUT 오버레이 */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold tracking-widest text-sm">SOLD OUT</span>
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="p-3">
        {product.colorCount > 1 && (
          <p className="text-xs text-gray-400 mb-1">{product.colorCount}color</p>
        )}
        <p className="text-sm text-gray-800 leading-snug line-clamp-2 mb-2">{product.name}</p>
        <div className="flex items-baseline gap-2">
          {product.originalPrice > product.salePrice && (
            <span className="text-xs text-gray-400 line-through">
              ₩{product.originalPrice.toLocaleString()}
            </span>
          )}
          <span className="text-sm font-bold text-gray-900">
            ₩{product.salePrice.toLocaleString()}
          </span>
          {product.discountRate > 0 && (
            <span className="text-xs text-red-500 font-semibold">{product.discountRate}%</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard
