import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore, User } from '../stores/authStore'

describe('AuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    })
  })

  it('should have correct initial state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('should login correctly', () => {
    const mockUser: User = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
    }
    const mockToken = 'test-token-123'

    useAuthStore.getState().login(mockUser, mockToken)

    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.token).toBe(mockToken)
    expect(state.isAuthenticated).toBe(true)
  })

  it('should logout correctly', () => {
    const mockUser: User = {
      id: '1',
      username: 'testuser',
    }
    useAuthStore.setState({
      user: mockUser,
      token: 'token',
      isAuthenticated: true,
    })

    useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('should update user correctly', () => {
    const mockUser: User = {
      id: '1',
      username: 'testuser',
    }
    useAuthStore.setState({
      user: mockUser,
      token: 'token',
      isAuthenticated: true,
    })

    useAuthStore.getState().updateUser({ age: 25, weight: 70 })

    const state = useAuthStore.getState()
    expect(state.user?.age).toBe(25)
    expect(state.user?.weight).toBe(70)
    expect(state.user?.username).toBe('testuser')
  })

  it('should not update user when user is null', () => {
    useAuthStore.getState().updateUser({ age: 25 })

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
  })
})
