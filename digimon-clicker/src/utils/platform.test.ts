import { describe, expect, it } from 'vitest'
import { MOBILE_BREAKPOINT_PX, getPlatformTarget } from './platform'

describe('getPlatformTarget', () => {
  it('treats viewports at or above the breakpoint as desktop', () => {
    expect(getPlatformTarget(MOBILE_BREAKPOINT_PX)).toBe('desktop')
    expect(getPlatformTarget(1920)).toBe('desktop')
  })

  it('treats viewports below the breakpoint as mobile', () => {
    expect(getPlatformTarget(MOBILE_BREAKPOINT_PX - 1)).toBe('mobile')
    expect(getPlatformTarget(375)).toBe('mobile')
  })
})
