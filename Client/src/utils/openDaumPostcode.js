export function openDaumPostcode(onChange) {
  new window.daum.Postcode({
    oncomplete: (data) => {
      onChange({ target: { name: 'zip',     value: data.zonecode } })
      onChange({ target: { name: 'address', value: data.roadAddress || data.jibunAddress } })
    },
  }).open()
}
