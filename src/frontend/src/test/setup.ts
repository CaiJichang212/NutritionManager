import '@testing-library/jest-dom'

class LocalStorageMock {
  private store: Record<string, string> = {}

  getItem(key: string) {
    return this.store[key] || null
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value)
  }

  removeItem(key: string) {
    delete this.store[key]
  }

  clear() {
    this.store = {}
  }
}

Object.defineProperty(global, 'localStorage', {
  value: new LocalStorageMock(),
})
