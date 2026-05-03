import { describe, expect, it } from 'vitest'
import {
  calcularEdad,
  formatResidenteDateLong,
  formatResidenteDateShort,
} from '@/business/residents/domain/ResidenteDate'

describe('ResidenteDate helpers', () => {
  it('formats short resident date', () => {
    expect(formatResidenteDateShort('1940-05-12')).toBe('12/05/1940')
  })

  it('formats long resident date', () => {
    expect(formatResidenteDateLong('1940-05-12')).toContain('1940')
  })

  it('calculates non-negative age', () => {
    expect(calcularEdad('1940-05-12')).toBeGreaterThan(0)
  })
})
