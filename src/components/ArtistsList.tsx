import React, { useEffect } from 'react';
import { Button, FlatList, Text, View } from 'react-native';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { artistsState, useUpdateArtists } from '../state/artists';
import { Artist } from '../models/music';

const ArtistItem: React.FC<{ item: Artist } > = ({ item }) => (
  <View>
    <Text>{item.id}</Text>
    <Text style={{
      fontSize: 60,
      paddingBottom: 400,
    }}>{item.name}</Text>
  </View>
);

const List = () => {
  const artists = useRecoilValue(artistsState);

  const renderItem: React.FC<{ item: Artist }> = ({ item }) => (
    <ArtistItem item={item} />
  );

  console.log('rendering artists');

  useEffect(() => {
    console.log('mounting artists');
  });

  return (
    <FlatList
      data={artists}
      renderItem={renderItem}
      keyExtractor={item => item.id}
    />
  );
}

const ListPlusControls = () => {
  const resetArtists = useResetRecoilState(artistsState);
  const updateArtists = useUpdateArtists();

  return (
    <View>
        <Button 
          title='Reset to default'
          onPress={resetArtists}
        />
        <Button 
          title='Update from API'
          onPress={updateArtists}
        />
      <List />
    </View>
  );
}

const ArtistsList = () => (
  <View>
    <React.Suspense fallback={<Text>Loading...</Text>}>
      <ListPlusControls />
    </React.Suspense>
  </View>
)

export default ArtistsList;
