import React, { useEffect } from 'react';
import { FlatList, Image, Text, View } from 'react-native';
import { useRecoilValue } from 'recoil';
import { Artist } from '../../models/music';
import { artistsState, artistsUpdatingState, useUpdateArtists } from '../../state/music';
import textStyles from '../../styles/text';
import TopTabContainer from '../common/TopTabContainer';

const ArtistItem: React.FC<{ item: Artist } > = ({ item }) => (
  <View style={{
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    marginLeft: 6,
  }}>
    <Image
      source={item.coverArt ? { uri: 'https://reactnative.dev/img/tiny_logo.png'  } : require('../../../res/mic_on-fill.png')}
      style={{
        width: 56,
        height: 56,
      }}
    />
    <Text style={{
      ...textStyles.paragraph,
      marginLeft: 12,
    }}>{item.name}</Text>
  </View>
);

const ArtistsList = () => {
  const artists = useRecoilValue(artistsState);
  const updating = useRecoilValue(artistsUpdatingState);
  const updateArtists = useUpdateArtists();

  useEffect(() => {
    if (artists.length === 0) {
      updateArtists();
    }
  });

  const renderItem: React.FC<{ item: Artist }> = ({ item }) => (
    <ArtistItem item={item} />
  );

  return (
    <FlatList
      data={artists}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      onRefresh={updateArtists}
      refreshing={updating}
    />
  );
}

const ArtistsTab = () => (
  <TopTabContainer>
    <ArtistsList />
  </TopTabContainer>
);

export default ArtistsTab;
