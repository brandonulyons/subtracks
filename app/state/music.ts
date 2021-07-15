import { Album, AlbumListItem, AlbumWithSongs, Artist, ArtistArt, ArtistInfo, Song } from '@app/models/music'
import { activeServerAtom, homeListTypesAtom } from '@app/state/settings'
import { SubsonicApiClient } from '@app/subsonic/api'
import { AlbumID3Element, ArtistID3Element, ArtistInfo2Element, ChildElement } from '@app/subsonic/elements'
import { GetAlbumList2Type } from '@app/subsonic/params'
import { GetArtistResponse } from '@app/subsonic/responses'
import { atom, useAtom } from 'jotai'
import { atomFamily, useAtomValue, useUpdateAtom } from 'jotai/utils'

export const artistsAtom = atom<Artist[]>([])
export const artistsUpdatingAtom = atom(false)

export const useUpdateArtists = () => {
  const server = useAtomValue(activeServerAtom)
  const [updating, setUpdating] = useAtom(artistsUpdatingAtom)
  const setArtists = useUpdateAtom(artistsAtom)

  if (!server) {
    return () => Promise.resolve()
  }

  return async () => {
    if (updating) {
      return
    }
    setUpdating(true)

    const client = new SubsonicApiClient(server)
    const response = await client.getArtists()

    setArtists(response.data.artists.map(mapArtistID3toArtist))
    setUpdating(false)
  }
}

export type HomeLists = { [key: string]: AlbumListItem[] }

export const homeListsUpdatingAtom = atom(false)
export const homeListsAtom = atom<HomeLists>({})
const homeListsWriteAtom = atom<HomeLists, { type: string; albums: AlbumListItem[] }>(
  get => get(homeListsAtom),
  (get, set, { type, albums }) => {
    const lists = get(homeListsAtom)
    set(homeListsAtom, {
      ...lists,
      [type]: albums,
    })
  },
)

export const useUpdateHomeLists = () => {
  const server = useAtomValue(activeServerAtom)
  const types = useAtomValue(homeListTypesAtom)
  const updateHomeList = useUpdateAtom(homeListsWriteAtom)
  const [updating, setUpdating] = useAtom(homeListsUpdatingAtom)

  if (!server) {
    return async () => {}
  }

  return async () => {
    if (updating) {
      return
    }
    setUpdating(true)

    const client = new SubsonicApiClient(server)

    const promises: Promise<any>[] = []
    for (const type of types) {
      promises.push(
        client.getAlbumList2({ type: type as GetAlbumList2Type, size: 20 }).then(response => {
          updateHomeList({ type, albums: response.data.albums.map(a => mapAlbumID3toAlbumListItem(a, client)) })
        }),
      )
    }
    await Promise.all(promises)

    setUpdating(false)
  }
}

export const albumListUpdatingAtom = atom(false)
export const albumListAtom = atom<AlbumListItem[]>([])

export const useUpdateAlbumList = () => {
  const server = useAtomValue(activeServerAtom)
  const updateList = useUpdateAtom(albumListAtom)
  const [updating, setUpdating] = useAtom(albumListUpdatingAtom)

  if (!server) {
    return async () => {}
  }

  return async () => {
    if (updating) {
      return
    }
    setUpdating(true)

    const client = new SubsonicApiClient(server)
    const response = await client.getAlbumList2({ type: 'alphabeticalByArtist', size: 500 })

    updateList(response.data.albums.map(a => mapAlbumID3toAlbumListItem(a, client)))
    setUpdating(false)
  }
}

export const albumAtomFamily = atomFamily((id: string) =>
  atom<AlbumWithSongs | undefined>(async get => {
    const server = get(activeServerAtom)
    if (!server) {
      return undefined
    }

    const client = new SubsonicApiClient(server)
    const response = await client.getAlbum({ id })
    return mapAlbumID3WithSongstoAlbunWithSongs(response.data.album, response.data.songs, client)
  }),
)

export const artistInfoAtomFamily = atomFamily((id: string) =>
  atom<ArtistInfo | undefined>(async get => {
    const server = get(activeServerAtom)
    if (!server) {
      return undefined
    }

    const client = new SubsonicApiClient(server)
    const [artistResponse, artistInfoResponse] = await Promise.all([
      client.getArtist({ id }),
      client.getArtistInfo2({ id }),
    ])
    return mapArtistInfo(artistResponse.data, artistInfoResponse.data.artistInfo, client)
  }),
)

export const artistArtAtomFamily = atomFamily((id: string) =>
  atom<ArtistArt | undefined>(async get => {
    const artistInfo = get(artistInfoAtomFamily(id))
    if (!artistInfo) {
      return undefined
    }

    const coverArtUris = artistInfo.albums
      .filter(a => a.coverArtThumbUri !== undefined)
      .sort((a, b) => {
        if (b.year && a.year) {
          return b.year - a.year
        } else {
          return a.name.localeCompare(b.name)
        }
      })
      .map(a => a.coverArtThumbUri) as string[]

    return {
      coverArtUris,
      uri: artistInfo.largeImageUrl,
    }
  }),
)

function mapArtistID3toArtist(artist: ArtistID3Element): Artist {
  return {
    id: artist.id,
    name: artist.name,
    starred: artist.starred,
  }
}

function mapArtistInfo(
  artistResponse: GetArtistResponse,
  info: ArtistInfo2Element,
  client: SubsonicApiClient,
): ArtistInfo {
  const { artist, albums } = artistResponse

  const mappedAlbums = albums.map(a => mapAlbumID3toAlbum(a, client))
  const coverArtUris = mappedAlbums
    .sort((a, b) => {
      if (a.year && b.year) {
        return b.year - a.year
      } else {
        return a.name.localeCompare(b.name) - 9000
      }
    })
    .map(a => a.coverArtThumbUri)
    .filter(a => a !== undefined) as string[]

  return {
    ...mapArtistID3toArtist(artist),
    albums: mappedAlbums,
    coverArtUris,
    mediumImageUrl: info.mediumImageUrl,
    largeImageUrl: info.largeImageUrl,
  }
}

function mapCoverArtUri(item: { coverArt?: string }, client: SubsonicApiClient) {
  return {
    coverArtUri: item.coverArt ? client.getCoverArtUri({ id: item.coverArt }) : undefined,
  }
}

function mapCoverArtThumbUri(item: { coverArt?: string }, client: SubsonicApiClient) {
  return {
    coverArtThumbUri: item.coverArt ? client.getCoverArtUri({ id: item.coverArt, size: '256' }) : undefined,
  }
}

function mapAlbumID3toAlbumListItem(album: AlbumID3Element, client: SubsonicApiClient): AlbumListItem {
  return {
    id: album.id,
    name: album.name,
    artist: album.artist,
    starred: album.starred,
    ...mapCoverArtThumbUri(album, client),
  }
}

function mapAlbumID3toAlbum(album: AlbumID3Element, client: SubsonicApiClient): Album {
  return {
    ...mapAlbumID3toAlbumListItem(album, client),
    ...mapCoverArtUri(album, client),
    ...mapCoverArtThumbUri(album, client),
    year: album.year,
  }
}

function mapChildToSong(child: ChildElement, client: SubsonicApiClient): Song {
  return {
    id: child.id,
    album: child.album,
    artist: child.artist,
    title: child.title,
    track: child.track,
    duration: child.duration,
    starred: child.starred,
    streamUri: client.streamUri({ id: child.id }),
    ...mapCoverArtUri(child, client),
    ...mapCoverArtThumbUri(child, client),
  }
}

function mapAlbumID3WithSongstoAlbunWithSongs(
  album: AlbumID3Element,
  songs: ChildElement[],
  client: SubsonicApiClient,
): AlbumWithSongs {
  return {
    ...mapAlbumID3toAlbum(album, client),
    songs: songs.map(s => mapChildToSong(s, client)),
  }
}