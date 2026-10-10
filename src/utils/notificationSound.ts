// const STORAGE_KEY = 'notification:sound'
// const MIN_GAP_MS = 1500 // nhiều thông báo dồn dập chỉ kêu một lần

// let ctx: AudioContext | null = null
// let lastPlayed = 0

// export const isSoundEnabled = (): boolean => {
//   try {
//     return localStorage.getItem(STORAGE_KEY) !== 'off'
//   } catch {
//     return true
//   }
// }

// export const setSoundEnabled = (enabled: boolean) => {
//   try {
//     localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off')
//   } catch {
//     // bỏ qua nếu trình duyệt chặn storage
//   }
// }

// const getContext = (): AudioContext | null => {
//   if (!ctx) {
//     const Ctor =
//       window.AudioContext ||
//       (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
//     if (!Ctor) return null
//     ctx = new Ctor()
//   }
//   return ctx
// }

// // Trình duyệt chỉ cho phát âm thanh sau khi người dùng đã tương tác với trang
// export const unlockNotificationSound = () => {
//   const c = getContext()
//   if (c && c.state === 'suspended') void c.resume()
// }

// const tone = (c: AudioContext, freq: number, start: number, duration: number) => {
//   const osc = c.createOscillator()
//   const gain = c.createGain()

//   osc.type = 'sine'
//   osc.frequency.value = freq

//   // Vào nhanh, tắt dần để không bị tiếng "tách"
//   gain.gain.setValueAtTime(0.0001, start)
//   gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02)
//   gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

//   osc.connect(gain).connect(c.destination)
//   osc.start(start)
//   osc.stop(start + duration + 0.05)
// }

// export const playNotificationSound = () => {
//   if (!isSoundEnabled()) return

//   const now = Date.now()
//   if (now - lastPlayed < MIN_GAP_MS) return

//   const c = getContext()
//   if (!c || c.state !== 'running') return // chưa được mở khóa thì im lặng, không báo lỗi

//   lastPlayed = now
//   const t = c.currentTime
//   tone(c, 880, t, 0.18)
//   tone(c, 1320, t + 0.12, 0.28)
// }

const STORAGE_KEY = 'notification:sound'

// Các thông báo dồn dập chỉ phát âm thanh một lần trong 1,5 giây
const MIN_GAP_MS = 1500

let ctx: AudioContext | null = null
let lastPlayed = 0

/**
 * Kiểm tra người dùng có bật âm thanh thông báo hay không.
 * Mặc định bật nếu chưa có cài đặt.
 */
export const isSoundEnabled = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

/**
 * Bật hoặc tắt âm thanh thông báo.
 */
export const setSoundEnabled = (enabled: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off')
  } catch {
    // Bỏ qua nếu trình duyệt chặn localStorage
  }
}

/**
 * Khởi tạo AudioContext.
 */
const getContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null

  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (
        window as unknown as {
          webkitAudioContext?: typeof AudioContext
        }
      ).webkitAudioContext

    if (!Ctor) return null

    ctx = new Ctor()
  }

  return ctx
}

/**
 * Mở khóa âm thanh sau khi người dùng tương tác với trang.
 * Nên gọi khi người dùng click hoặc đăng nhập.
 */
export const unlockNotificationSound = (): void => {
  const c = getContext()

  if (c && c.state === 'suspended') {
    void c.resume().catch(() => {
      // Trình duyệt chưa cho phép phát âm thanh
    })
  }
}

/**
 * Tạo một nốt âm thanh có hiệu ứng vào nhanh, tắt dần.
 */
const tone = (
  c: AudioContext,
  freq: number,
  start: number,
  duration: number,
  volume = 0.13
): void => {
  const osc = c.createOscillator()
  const gain = c.createGain()

  osc.type = 'sine'

  osc.frequency.setValueAtTime(freq, start)

  // Âm thanh tăng nhanh rồi giảm dần tự nhiên
  gain.gain.setValueAtTime(0.0001, start)

  gain.gain.exponentialRampToValueAtTime(
    volume,
    start + 0.025
  )

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    start + duration
  )

  osc.connect(gain)
  gain.connect(c.destination)

  osc.start(start)
  osc.stop(start + duration + 0.02)

  // Giải phóng tài nguyên sau khi phát
  osc.onended = () => {
    osc.disconnect()
    gain.disconnect()
  }
}

/**
 * Phát âm thanh thông báo kiểu chat:
 * hai tiếng ting ngắn, nốt thứ hai cao hơn.
 */
export const playNotificationSound = (): void => {
  // Không phát nếu người dùng đã tắt âm thanh
  if (!isSoundEnabled()) return

  // Hạn chế âm thanh khi có nhiều thông báo cùng lúc
  const now = Date.now()

  if (now - lastPlayed < MIN_GAP_MS) return

  const c = getContext()

  // Chưa mở khóa âm thanh thì không phát
  if (!c || c.state !== 'running') return

  lastPlayed = now

  const t = c.currentTime

  // Tiếng ting thứ nhất
  tone(c, 1046.5, t, 0.16, 0.13)

  // Tiếng ting thứ hai, cao hơn và ngân dài hơn
  tone(c, 1318.5, t + 0.12, 0.24, 0.12)
}

/**
 * Đóng AudioContext khi không còn cần sử dụng.
 * Chỉ gọi khi thực sự muốn kết thúc vòng đời âm thanh.
 */
export const closeNotificationSound = async (): Promise<void> => {
  if (!ctx) return

  const current = ctx
  ctx = null
  lastPlayed = 0

  if (current.state !== 'closed') {
    await current.close()
  }
}
