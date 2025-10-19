// src/utils/useRafThrottle.js
import { useRef, useCallback } from 'react'

export default function useRafThrottle(fn) {
  const ref = useRef({ raf: 0 })
  return useCallback((...args) => {
    if (ref.current.raf) return
    ref.current.raf = requestAnimationFrame(() => {
      ref.current.raf = 0
      fn(...args)
    })
  }, [fn])
}
