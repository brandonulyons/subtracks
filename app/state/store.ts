import { createMusicSlice, MusicSlice } from '@app/state/music'
import { createSettingsSlice, SettingsSlice } from '@app/state/settings'
import AsyncStorage from '@react-native-async-storage/async-storage'
import create from 'zustand'
import { persist, StateStorage } from 'zustand/middleware'
import { createTrackPlayerSlice, TrackPlayerSlice } from './trackplayer'

export type Store = SettingsSlice &
  MusicSlice &
  TrackPlayerSlice & {
    hydrated: boolean
    setHydrated: (hydrated: boolean) => void
  }

const storage: StateStorage = {
  getItem: async name => {
    try {
      return await AsyncStorage.getItem(name)
    } catch (err) {
      console.error(`getItem error (key: ${name})`, err)
      return null
    }
  },
  setItem: async (name, item) => {
    try {
      await AsyncStorage.setItem(name, item)
    } catch (err) {
      console.error(`setItem error (key: ${name})`, err)
    }
  },
}

export const useStore = create<Store>(
  persist(
    (set, get) => ({
      ...createSettingsSlice(set, get),
      ...createMusicSlice(set, get),
      ...createTrackPlayerSlice(set, get),

      hydrated: false,
      setHydrated: hydrated => set({ hydrated }),
    }),
    {
      name: '@appStore',
      getStorage: () => storage,
      whitelist: ['settings'],
      onRehydrateStorage: _preState => {
        return async (postState, _error) => {
          await postState?.setActiveServer(postState.settings.activeServer, true)
          postState?.setHydrated(true)
        }
      },
    },
  ),
)
