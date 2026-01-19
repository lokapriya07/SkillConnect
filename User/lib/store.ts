import AsyncStorage from "@react-native-async-storage/async-storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"


export interface Service {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  duration: string
  image: string
  rating: number
  reviews: number
  category: string
}

export interface CartItem {
  service: Service
  quantity: number
  scheduledDate?: string
  scheduledTime?: string
}

export interface Address {
  id: string
  type: "home" | "work" | "other"
  fullAddress: string
  landmark?: string
  isDefault: boolean
}

export interface Booking {
  id: string
  items: CartItem[]
  total: number
  status: "confirmed" | "in-progress" | "completed" | "cancelled"
  date: string
  time: string
  address: string
  professional?: {
    name: string
    rating: number
    image: string
  }
}

interface AppState {
  isAuthenticated: boolean
  user: {
    phone: string
    name?: string
    email?: string
  } | null
  currentLocation: {
    address: string
    coordinates?: { lat: number; lng: number }
  } | null
  savedAddresses: Address[]
  cart: CartItem[]
  bookings: Booking[]
  activeJob: {
    description: string;
    budget: string;
    status: 'finding' | 'bidding' | 'scheduled' | 'tracking';
  } | null;
  setActiveJob: (job: any) => void;
  clearJob: () => void;

  // Actions
  setAuthenticated: (auth: boolean) => void
  setUser: (user: AppState["user"]) => void
  setCurrentLocation: (location: AppState["currentLocation"]) => void
  addToCart: (service: Service, quantity?: number) => void
  removeFromCart: (serviceId: string) => void
  updateCartItemQuantity: (serviceId: string, quantity: number) => void
  clearCart: () => void
  addAddress: (address: Address) => void
  addBooking: (booking: Booking) => void
  updateUser: (newData: Partial<NonNullable<AppState["user"]>>) => void;
  // NEW ACTIONS: Update and Cancel
  updateBooking: (id: string, updates: Partial<Booking>) => void
  cancelBooking: (id: string) => void

  getCartTotal: () => number
  getCartCount: () => number
  logout: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      currentLocation: null,
      savedAddresses: [],
      cart: [],
      bookings: [],
      activeJob: null, // Initial state is null
      setActiveJob: (job) => set({ activeJob: job }),
      clearJob: () => set({ activeJob: null }),

      setAuthenticated: (auth) => set({ isAuthenticated: auth }),
      setUser: (user) => set({ user }),
      setCurrentLocation: (location) => set({ currentLocation: location }),

      addToCart: (service, quantity = 1) =>
        set((state) => {
          const existing = state.cart.find((item) => item.service.id === service.id)
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.service.id === service.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            }
          }
          return { cart: [...state.cart, { service, quantity }] }
        }),

      removeFromCart: (serviceId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.service.id !== serviceId),
        })),
      updateUser: (newData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...newData } : null
        })),

      updateCartItemQuantity: (serviceId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { cart: state.cart.filter((item) => item.service.id !== serviceId) }
          }
          return {
            cart: state.cart.map((item) => (item.service.id === serviceId ? { ...item, quantity } : item)),
          }
        }),

      clearCart: () => set({ cart: [] }),

      addAddress: (address) =>
        set((state) => ({
          savedAddresses: [...state.savedAddresses, address],
        })),

      addBooking: (booking) =>
        set((state) => ({
          bookings: [booking, ...state.bookings],
        })),

      // IMPLEMENTATION: Update a booking (used for Rescheduling)
      updateBooking: (id, updates) =>
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.id === id ? { ...booking, ...updates } : booking
          ),
        })),

      // IMPLEMENTATION: Cancel a booking
      cancelBooking: (id) =>
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.id === id ? { ...booking, status: "cancelled" } : booking
          ),
        })),

      getCartTotal: () => {
        const state = get()
        return state.cart.reduce((total, item) => total + item.service.price * item.quantity, 0)
      },

      getCartCount: () => {
        const state = get()
        return state.cart.reduce((count, item) => count + item.quantity, 0)
      },

      logout: () => set({ isAuthenticated: false, user: null, cart: [], currentLocation: null }),
    }),
    {
      name: "service-hub-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)