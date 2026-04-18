/**
 * UsersView.spec.ts
 *
 * Component tests for the UsersView admin view.
 * useUsers and useAuthStore are fully mocked — no HTTP calls, no Firebase.
 *
 * Coverage targets (frontend-specialist.md §9):
 *  - Loading skeleton renders when loading === true
 *  - User table renders with displayName, email, role columns when loaded
 *  - Error message renders when error is set
 *  - Role <select> calls updateRole on change
 *  - Disable button calls disableUser on click
 *  - Disable button is NOT rendered for the currently logged-in user
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import type { UserResponse } from '../../domain/entities/user.types'

// ── Mock firebase/auth (transitive dep) ──────────────────────────────────────
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  connectAuthEmulator: vi.fn(),
}))

vi.mock('@/services/firebase', () => ({
  auth: { currentUser: null },
}))

// ── Shared mock state — overwritten per-test via resetMocks() ─────────────────
let mockUsers = ref<UserResponse[]>([])
let mockLoading = ref(false)
let mockError = ref<string | null>(null)
let mockFetchUsers = vi.fn()
let mockUpdateRole = vi.fn()
let mockDisableUser = vi.fn()

vi.mock('../composables/useUsers', () => ({
  useUsers: () => ({
    users: mockUsers,
    loading: mockLoading,
    error: mockError,
    fetchUsers: mockFetchUsers,
    updateRole: mockUpdateRole,
    disableUser: mockDisableUser,
  }),
}))

// ── Mock useAuthStore ─────────────────────────────────────────────────────────
let mockCurrentUid = ref<string | null>('current-uid')

vi.mock('@/business/auth/useAuthStore', () => ({
  useAuthStore: () => ({
    user: { uid: mockCurrentUid.value },
  }),
}))

import UsersView from './UsersView.vue'

// ── Test fixtures ─────────────────────────────────────────────────────────────

const SAMPLE_USERS: UserResponse[] = [
  {
    uid: 'uid-1',
    displayName: 'Ana García',
    email: 'ana@example.com',
    role: 'gerocultor',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    uid: 'uid-2',
    displayName: 'Carlos López',
    email: 'carlos@example.com',
    role: 'admin',
    active: true,
    createdAt: '2026-01-02T00:00:00Z',
  },
  {
    uid: 'current-uid',
    displayName: 'Me, Logged In',
    email: 'me@example.com',
    role: 'admin',
    active: true,
    createdAt: '2026-01-03T00:00:00Z',
  },
]

function resetMocks() {
  mockUsers = ref<UserResponse[]>([])
  mockLoading = ref(false)
  mockError = ref<string | null>(null)
  mockFetchUsers = vi.fn().mockResolvedValue(undefined)
  mockUpdateRole = vi.fn().mockResolvedValue(undefined)
  mockDisableUser = vi.fn().mockResolvedValue(undefined)
  mockCurrentUid = ref<string | null>('current-uid')
}

function mountView() {
  return mount(UsersView, {
    global: {
      stubs: {
        // Stub router-link if it appears (it doesn't here but good practice)
        RouterLink: { template: '<a><slot /></a>' },
      },
    },
  })
}

describe('UsersView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetMocks()
  })

  // ─── Loading skeleton ──────────────────────────────────────────────────────

  it('renders loading skeleton when loading is true', async () => {
    mockLoading.value = true

    const wrapper = mountView()
    await flushPromises()

    // Skeleton has aria-busy="true"
    const skeleton = wrapper.find('[aria-busy="true"]')
    expect(skeleton.exists()).toBe(true)

    // Table must NOT be rendered while loading
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it('does not render table when loading is true', async () => {
    mockLoading.value = true

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('.users-view__table').exists()).toBe(false)
  })

  // ─── User table ────────────────────────────────────────────────────────────

  it('renders user table with displayName, email, and role columns when users are loaded', async () => {
    mockUsers.value = SAMPLE_USERS

    const wrapper = mountView()
    await flushPromises()

    // Table must exist
    expect(wrapper.find('table').exists()).toBe(true)

    // Column headers
    const headers = wrapper.findAll('th').map(th => th.text())
    expect(headers.some(h => /nombre/i.test(h))).toBe(true)
    expect(headers.some(h => /email/i.test(h))).toBe(true)
    expect(headers.some(h => /rol/i.test(h))).toBe(true)

    // At least the first user's data must be visible
    expect(wrapper.text()).toContain('Ana García')
    expect(wrapper.text()).toContain('ana@example.com')
  })

  it('renders one row per user in the list', async () => {
    mockUsers.value = SAMPLE_USERS

    const wrapper = mountView()
    await flushPromises()

    // tbody rows (excludes header row)
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(SAMPLE_USERS.length)
  })

  it('shows empty state message when users list is empty', async () => {
    mockUsers.value = []

    const wrapper = mountView()
    await flushPromises()

    // Loading is false and error is null, so the table wrapper renders
    const tableWrapper = wrapper.find('.users-view__table-wrapper')
    expect(tableWrapper.exists()).toBe(true)

    // Empty state must be present
    expect(wrapper.find('.users-view__empty').exists()).toBe(true)
  })

  // ─── Error state ───────────────────────────────────────────────────────────

  it('renders error message when error ref is set', async () => {
    mockError.value = 'Failed to fetch users'

    const wrapper = mountView()
    await flushPromises()

    const errorEl = wrapper.find('[role="alert"]')
    expect(errorEl.exists()).toBe(true)
    expect(errorEl.text()).toContain('Failed to fetch users')
  })

  it('does not render table when error is set', async () => {
    mockError.value = 'Something went wrong'

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('table').exists()).toBe(false)
  })

  // ─── Role select ───────────────────────────────────────────────────────────

  it('calls updateRole with correct uid and new role when <select> changes', async () => {
    mockUsers.value = [SAMPLE_USERS[0]] // Ana García, uid-1, role: gerocultor

    const wrapper = mountView()
    await flushPromises()

    const select = wrapper.find('.users-view__role-select')
    expect(select.exists()).toBe(true)

    // setValue sets the element's value AND dispatches input + change events
    await select.setValue('admin')
    await flushPromises()

    expect(mockUpdateRole).toHaveBeenCalledOnce()
    // First argument must be the user's uid
    expect(mockUpdateRole.mock.calls[0][0]).toBe('uid-1')
  })

  // ─── Disable button ────────────────────────────────────────────────────────

  it('calls disableUser with correct uid when disable button is clicked', async () => {
    // Only show non-current users so the button renders
    mockUsers.value = [SAMPLE_USERS[0]] // uid-1, not current-uid

    const wrapper = mountView()
    await flushPromises()

    const disableBtn = wrapper.find('.users-view__disable-btn')
    expect(disableBtn.exists()).toBe(true)

    await disableBtn.trigger('click')
    await flushPromises()

    expect(mockDisableUser).toHaveBeenCalledOnce()
    expect(mockDisableUser).toHaveBeenCalledWith('uid-1')
  })

  // ─── Current user guard ────────────────────────────────────────────────────

  it('does NOT render disable button for the currently logged-in user', async () => {
    // Include the user whose uid matches current-uid
    mockUsers.value = [SAMPLE_USERS[2]] // uid: 'current-uid'

    const wrapper = mountView()
    await flushPromises()

    // The self-label "Tú" must be shown instead of the button
    expect(wrapper.find('.users-view__self-label').exists()).toBe(true)
    expect(wrapper.find('.users-view__disable-btn').exists()).toBe(false)
  })

  it('renders disable button for OTHER users and self-label only for current user', async () => {
    mockUsers.value = SAMPLE_USERS // uid-1, uid-2, current-uid

    const wrapper = mountView()
    await flushPromises()

    const disableBtns = wrapper.findAll('.users-view__disable-btn')
    const selfLabels = wrapper.findAll('.users-view__self-label')

    // 2 other users get buttons, 1 current user gets self-label
    expect(disableBtns).toHaveLength(2)
    expect(selfLabels).toHaveLength(1)
  })

  // ─── onMounted ─────────────────────────────────────────────────────────────

  it('calls fetchUsers on mount', async () => {
    const wrapper = mountView()
    await flushPromises()

    expect(mockFetchUsers).toHaveBeenCalledOnce()
  })
})
