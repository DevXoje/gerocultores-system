import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRegister } from './useRegister'

// ─── Mock firebase/auth ────────────────────────────────────────────────────────
const mockCreateUser = vi.fn()
const mockSignInPopup = vi.fn()
const mockUpdateProfile = vi.fn()

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: (...args: unknown[]) => mockCreateUser(...args),
  signInWithPopup: (...args: unknown[]) => mockSignInPopup(...args),
  updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
}))

// ─── Mock firebase.ts ─────────────────────────────────────────────────────────
vi.mock('@/services/firebase', () => ({
  auth: {},
  googleProvider: {},
}))

// ─── Mock router ─────────────────────────────────────────────────────────────
const mockPush = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
}))

// ─── Mock useAuthStore ───────────────────────────────────────────────────────
const mockSetUser = vi.fn()
const mockSetRoleFromUser = vi.fn().mockResolvedValue(undefined)

vi.mock('@/business/auth/useAuthStore', () => ({
  useAuthStore: vi.fn(() => ({
    setUser: mockSetUser,
    setRoleFromUser: mockSetRoleFromUser,
  })),
}))

// ─── Mock fetch ──────────────────────────────────────────────────────────────
const mockFetch = vi.fn()

vi.stubGlobal('fetch', mockFetch)

describe('useRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateUser.mockReset()
    mockSignInPopup.mockReset()
    mockUpdateProfile.mockReset()
    mockPush.mockReset()
    mockFetch.mockReset()
    mockSetUser.mockReset()
    mockSetRoleFromUser.mockReset()
  })

  // ─── TC: Happy path — email/password registration ─────────────────────────

  it('should transition to done on email/password success', async () => {
    mockCreateUser.mockResolvedValue({
      user: {
        uid: 'uid-123',
        email: 'test@example.com',
        getIdToken: vi.fn().mockResolvedValue('id-token-123'),
      },
    })
    mockUpdateProfile.mockResolvedValue(undefined)
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) })
    mockPush.mockResolvedValue(undefined)

    const { state, handleEmailPasswordSubmit, email, passwordInput, confirmPasswordInput } =
      useRegister()
    email.value = 'test@example.com'
    passwordInput.value = 'Test1234!'
    confirmPasswordInput.value = 'Test1234!'

    await handleEmailPasswordSubmit()

    expect(state.value).toBe('done')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/register/set-claims'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('should call createUserWithEmailAndPassword with email and password', async () => {
    mockCreateUser.mockResolvedValue({
      user: { uid: 'uid-1', getIdToken: vi.fn().mockResolvedValue('id-token') },
    })
    mockUpdateProfile.mockResolvedValue(undefined)
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) })
    mockPush.mockResolvedValue(undefined)

    const { handleEmailPasswordSubmit, email, passwordInput, confirmPasswordInput } = useRegister()
    email.value = 'gerocultor@example.com'
    passwordInput.value = 'Password123!'
    confirmPasswordInput.value = 'Password123!'

    await handleEmailPasswordSubmit()

    expect(mockCreateUser).toHaveBeenCalledWith(
      expect.anything(),
      'gerocultor@example.com',
      'Password123!'
    )
  })

  it('should call updateProfile with displayName derived from email local-part', async () => {
    const mockUser = {
      uid: 'uid-1',
      email: 'john.doe@example.com',
      getIdToken: vi.fn().mockResolvedValue('id-token'),
    }
    mockCreateUser.mockResolvedValue({ user: mockUser })
    mockUpdateProfile.mockResolvedValue(undefined)
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) })
    mockPush.mockResolvedValue(undefined)

    const { handleEmailPasswordSubmit, email, passwordInput, confirmPasswordInput } = useRegister()
    email.value = 'john.doe@example.com'
    passwordInput.value = 'Password123!'
    confirmPasswordInput.value = 'Password123!'

    await handleEmailPasswordSubmit()

    expect(mockUpdateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'john.doe' })
  })

  it('should call POST /register/set-claims with Bearer token', async () => {
    mockCreateUser.mockResolvedValue({
      user: { uid: 'uid-1', getIdToken: vi.fn().mockResolvedValue('firebase-id-token') },
    })
    mockUpdateProfile.mockResolvedValue(undefined)
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) })
    mockPush.mockResolvedValue(undefined)

    const { handleEmailPasswordSubmit, email, passwordInput, confirmPasswordInput } = useRegister()
    email.value = 'test@example.com'
    passwordInput.value = 'Password123!'
    confirmPasswordInput.value = 'Password123!'

    await handleEmailPasswordSubmit()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/register/set-claims'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer firebase-id-token',
        }),
      })
    )
  })

  // ─── TC: Error handling ──────────────────────────────────────────────────

  it('should transition to error state when createUser fails with email-already-in-use', async () => {
    const authError = Object.assign(new Error('auth/email-already-in-use'), {
      code: 'auth/email-already-in-use',
    })
    mockCreateUser.mockRejectedValue(authError)

    const {
      state,
      errorMessage,
      handleEmailPasswordSubmit,
      email,
      passwordInput,
      confirmPasswordInput,
    } = useRegister()
    email.value = 'taken@example.com'
    passwordInput.value = 'Password123!'
    confirmPasswordInput.value = 'Password123!'

    await handleEmailPasswordSubmit()

    expect(state.value).toBe('error')
    expect(errorMessage.value).toMatch(/correo/i)
  })

  it('should map auth/weak-password to a readable error', async () => {
    const authError = Object.assign(new Error('auth/weak-password'), { code: 'auth/weak-password' })
    mockCreateUser.mockRejectedValue(authError)

    const { errorMessage, handleEmailPasswordSubmit, email, passwordInput, confirmPasswordInput } =
      useRegister()
    email.value = 'test@example.com'
    passwordInput.value = '123'
    confirmPasswordInput.value = '123'

    await handleEmailPasswordSubmit()

    expect(errorMessage.value).toMatch(/contraseña/i)
  })

  it('should transition to error when REST endpoint fails', async () => {
    mockCreateUser.mockResolvedValue({
      user: { uid: 'uid-1', getIdToken: vi.fn().mockResolvedValue('id-token') },
    })
    mockUpdateProfile.mockResolvedValue(undefined)
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal error' }),
    })

    const {
      state,
      errorMessage,
      handleEmailPasswordSubmit,
      email,
      passwordInput,
      confirmPasswordInput,
    } = useRegister()
    email.value = 'test@example.com'
    passwordInput.value = 'Password123!'
    confirmPasswordInput.value = 'Password123!'

    await handleEmailPasswordSubmit()

    expect(state.value).toBe('error')
    expect(errorMessage.value).toBeTruthy()
  })

  // ─── TC: Form validation ─────────────────────────────────────────────────

  it('should not call createUser when passwords do not match', async () => {
    const {
      state,
      errorMessage,
      handleEmailPasswordSubmit,
      email,
      passwordInput,
      confirmPasswordInput,
    } = useRegister()
    email.value = 'test@example.com'
    passwordInput.value = 'Password123!'
    confirmPasswordInput.value = 'DifferentPassword!'

    await handleEmailPasswordSubmit()

    expect(mockCreateUser).not.toHaveBeenCalled()
    expect(errorMessage.value).toMatch(/coinciden/)
    expect(state.value).toBe('idle')
  })

  it('should not call createUser when any field is empty', async () => {
    const { handleEmailPasswordSubmit } = useRegister()
    await handleEmailPasswordSubmit()

    expect(mockCreateUser).not.toHaveBeenCalled()
  })

  // ─── TC: Google OAuth ────────────────────────────────────────────────────

  it('should transition to done on Google OAuth success', async () => {
    mockSignInPopup.mockResolvedValue({
      user: { uid: 'uid-google', getIdToken: vi.fn().mockResolvedValue('google-id-token') },
    })
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) })
    mockPush.mockResolvedValue(undefined)

    const { state, handleGoogleSubmit } = useRegister()
    await handleGoogleSubmit()

    expect(state.value).toBe('done')
    expect(mockSignInPopup).toHaveBeenCalled()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/register/set-claims'),
      expect.objectContaining({ method: 'POST' })
    )
    expect(mockPush).toHaveBeenCalled()
  })

  it('should transition to error when Google popup fails', async () => {
    const authError = Object.assign(new Error('auth/popup-closed-by-user'), {
      code: 'auth/popup-closed-by-user',
    })
    mockSignInPopup.mockRejectedValue(authError)

    const { state, errorMessage, handleGoogleSubmit } = useRegister()
    await handleGoogleSubmit()

    expect(state.value).toBe('error')
    expect(errorMessage.value).toBeTruthy()
  })

  // ─── TC: UI helpers ─────────────────────────────────────────────────────

  it('should toggle showPassword', () => {
    const { showPassword, togglePassword } = useRegister()
    expect(showPassword.value).toBe(false)
    togglePassword()
    expect(showPassword.value).toBe(true)
    togglePassword()
    expect(showPassword.value).toBe(false)
  })

  it('should expose all required return values', () => {
    const result = useRegister()
    expect(result).toHaveProperty('email')
    expect(result).toHaveProperty('passwordInput')
    expect(result).toHaveProperty('confirmPasswordInput')
    expect(result).toHaveProperty('showPassword')
    expect(result).toHaveProperty('errorMessage')
    expect(result).toHaveProperty('state')
    expect(result).toHaveProperty('isLoading')
    expect(typeof result.handleEmailPasswordSubmit).toBe('function')
    expect(typeof result.handleGoogleSubmit).toBe('function')
    expect(typeof result.togglePassword).toBe('function')
  })

  it('isLoading should be true during creating, setting-claims, and signing-in states', () => {
    const { state, isLoading } = useRegister()

    state.value = 'idle'
    expect(isLoading.value).toBe(false)

    state.value = 'creating'
    expect(isLoading.value).toBe(true)

    state.value = 'setting-claims'
    expect(isLoading.value).toBe(true)

    state.value = 'signing-in'
    expect(isLoading.value).toBe(true)

    state.value = 'done'
    expect(isLoading.value).toBe(false)

    state.value = 'error'
    expect(isLoading.value).toBe(false)
  })
})
