import posthogJs from 'posthog-js'

// Create a mock PostHog instance for Node.js environment
const mockPostHog = {
  capture: () => {},
  init: () => {},
  debug: () => {},
}

// Export the appropriate PostHog instance based on environment
export const posthog = typeof window !== 'undefined' ? posthogJs : mockPostHog

// Initialize PostHog only in browser environment
if (typeof window !== 'undefined') {
  posthogJs.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    loaded: (posthog) => {
      if (import.meta.env.DEV) posthog.debug()
    }
  })
} 