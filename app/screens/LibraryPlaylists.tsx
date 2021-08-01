import GradientFlatList from '@app/components/GradientFlatList'
import ListItem from '@app/components/ListItem'
import { useUpdatePlaylists } from '@app/hooks/music'
import { useActiveListRefresh } from '@app/hooks/server'
import { PlaylistListItem } from '@app/models/music'
import { playlistsAtom, playlistsUpdatingAtom } from '@app/state/music'
import { useAtomValue } from 'jotai/utils'
import React from 'react'
import { StyleSheet } from 'react-native'

const PlaylistRenderItem: React.FC<{ item: PlaylistListItem }> = ({ item }) => (
  <ListItem item={item} showArt={true} showStar={false} listStyle="big" />
)

const PlaylistsList = () => {
  const playlists = useAtomValue(playlistsAtom)
  const updating = useAtomValue(playlistsUpdatingAtom)
  const updatePlaylists = useUpdatePlaylists()

  useActiveListRefresh(playlists, updatePlaylists)

  return (
    <GradientFlatList
      contentContainerStyle={styles.listContent}
      data={playlists}
      renderItem={PlaylistRenderItem}
      keyExtractor={item => item.id}
      onRefresh={updatePlaylists}
      refreshing={updating}
      overScrollMode="never"
    />
  )
}

const styles = StyleSheet.create({
  listContent: {
    minHeight: '100%',
    paddingHorizontal: 10,
    paddingTop: 6,
  },
})

export default PlaylistsList
