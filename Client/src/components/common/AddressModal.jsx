import { openDaumPostcode } from '../../utils/openDaumPostcode'

const AddressModal = ({ isOpen, onClose, address, onChange, onConfirm, loading }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 모달 본체 */}
      <div className="relative bg-white w-full max-w-md mx-4 rounded shadow-xl z-10">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-bold text-gray-800">배송지 입력</h3>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-black leading-none">×</button>
        </div>

        {/* 폼 */}
        <div className="px-6 py-5 space-y-4">
          {/* 받는분 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">받는분</label>
            <input
              type="text"
              name="name"
              value={address.name || ''}
              onChange={onChange}
              placeholder="받는분 이름"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>

          {/* 연락처 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
            <input
              type="tel"
              name="phone"
              value={address.phone || ''}
              onChange={onChange}
              placeholder="010-0000-0000"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>

          {/* 우편번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">우편번호</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="zip"
                value={address.zip || ''}
                onChange={onChange}
                placeholder="우편번호"
                readOnly
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 outline-none"
              />
              <button
                type="button"
                onClick={() => openDaumPostcode(onChange)}
                className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 whitespace-nowrap"
              >
                주소검색
              </button>
            </div>
          </div>

          {/* 기본주소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">기본주소</label>
            <input
              type="text"
              name="address"
              value={address.address || ''}
              onChange={onChange}
              readOnly
              placeholder="주소검색 버튼을 클릭하세요"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 outline-none"
            />
          </div>

          {/* 상세주소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상세주소</label>
            <input
              type="text"
              name="detail"
              value={address.detail || ''}
              onChange={onChange}
              placeholder="상세주소 입력"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 py-2.5 text-sm text-gray-600 rounded hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-black text-white py-2.5 text-sm rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? '처리 중...' : '결제하기'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddressModal
