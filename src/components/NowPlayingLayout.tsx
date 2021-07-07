import { useNavigation } from '@react-navigation/native'
import { useAtomValue } from 'jotai/utils'
import React from 'react'
import { StatusBar, StyleSheet, Text, View } from 'react-native'
import { State } from 'react-native-track-player'
import IconFA from 'react-native-vector-icons/FontAwesome'
import IconFA5 from 'react-native-vector-icons/FontAwesome5'
import Icon from 'react-native-vector-icons/Ionicons'
import IconMatCom from 'react-native-vector-icons/MaterialCommunityIcons'
import IconMat from 'react-native-vector-icons/MaterialIcons'
import {
  currentTrackAtom,
  playerStateAtom,
  queueNameAtom,
  useNext,
  usePause,
  usePlay,
  usePrevious,
  useProgress,
} from '../state/trackplayer'
import colors from '../styles/colors'
import { Font } from '../styles/text'
import { formatDuration } from '../util'
import CoverArt from './common/CoverArt'
import ImageGradientBackground from './common/ImageGradientBackground'
import PressableOpacity from './common/PressableOpacity'

const NowPlayingHeader = () => {
  const queueName = useAtomValue(queueNameAtom)
  const navigation = useNavigation()

  return (
    <View style={headerStyles.container}>
      <PressableOpacity onPress={() => navigation.goBack()} style={headerStyles.icons} ripple={true}>
        <IconMat name="arrow-back" color="white" size={25} />
      </PressableOpacity>
      <Text numberOfLines={1} style={headerStyles.queueName}>
        {queueName || 'Nothing playing...'}
      </Text>
      <PressableOpacity onPress={undefined} style={headerStyles.icons} ripple={true}>
        <IconMat name="more-vert" color="white" size={25} />
      </PressableOpacity>
    </View>
  )
}

const headerStyles = StyleSheet.create({
  container: {
    height: 58,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icons: {
    height: 42,
    width: 42,
    marginHorizontal: 8,
  },
  queueName: {
    fontFamily: Font.bold,
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
})

const SongCoverArt = () => {
  const track = useAtomValue(currentTrackAtom)

  return (
    <View style={coverArtStyles.container}>
      <CoverArt
        PlaceholderComponent={() => <View style={{ height: '100%', width: '100%' }} />}
        height={'100%'}
        width={'100%'}
        coverArtUri={track?.artwork as string}
      />
    </View>
  )
}

const coverArtStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 20,
  },
})

const SongInfo = () => {
  const track = useAtomValue(currentTrackAtom)

  return (
    <View style={infoStyles.container}>
      <View style={infoStyles.details}>
        <Text numberOfLines={1} style={infoStyles.title}>
          {track?.title}
        </Text>
        <Text numberOfLines={1} style={infoStyles.artist}>
          {track?.artist}
        </Text>
      </View>
      <View style={infoStyles.controls}>
        <PressableOpacity onPress={undefined}>
          <IconFA name="star-o" size={32} color={colors.text.secondary} />
        </PressableOpacity>
      </View>
    </View>
  )
}

const infoStyles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
  },
  details: {
    flex: 1,
    marginRight: 20,
  },
  controls: {
    justifyContent: 'center',
  },
  title: {
    height: 28,
    fontFamily: Font.bold,
    fontSize: 22,
    color: colors.text.primary,
  },
  artist: {
    height: 20,
    fontFamily: Font.regular,
    fontSize: 16,
    color: colors.text.secondary,
  },
})

const SeekBar = () => {
  const { position, duration } = useProgress()

  let progress = 0
  if (duration > 0) {
    progress = position / duration
  }

  return (
    <View style={seekStyles.container}>
      <View style={seekStyles.barContainer}>
        <View style={{ ...seekStyles.bars, ...seekStyles.barLeft, flex: progress }} />
        <View style={{ ...seekStyles.indicator }} />
        <View style={{ ...seekStyles.bars, ...seekStyles.barRight, flex: 1 - progress }} />
      </View>
      <View style={seekStyles.textContainer}>
        <Text style={seekStyles.text}>{formatDuration(position)}</Text>
        <Text style={seekStyles.text}>{formatDuration(duration)}</Text>
      </View>
    </View>
  )
}

const seekStyles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 26,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bars: {
    backgroundColor: colors.text.primary,
    height: 4,
  },
  barLeft: {
    marginRight: -6,
  },
  barRight: {
    opacity: 0.3,
    marginLeft: -6,
  },
  indicator: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: colors.text.primary,
    elevation: 1,
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    fontFamily: Font.regular,
    fontSize: 15,
    color: colors.text.primary,
  },
})

const PlayerControls = () => {
  const state = useAtomValue(playerStateAtom)
  const play = usePlay()
  const pause = usePause()
  const next = useNext()
  const previous = usePrevious()

  let playPauseIcon: string
  let playPauseAction: undefined | (() => void)
  let disabled: boolean

  switch (state) {
    case State.Playing:
    case State.Buffering:
    case State.Connecting:
      disabled = false
      playPauseIcon = 'pause-circle'
      playPauseAction = pause
      break
    case State.Paused:
      disabled = false
      playPauseIcon = 'play-circle'
      playPauseAction = play
      break
    default:
      disabled = true
      playPauseIcon = 'play-circle'
      playPauseAction = undefined
      break
  }

  return (
    <View style={controlsStyles.container}>
      <View style={controlsStyles.top}>
        <View style={controlsStyles.center}>
          <PressableOpacity onPress={undefined} disabled={disabled}>
            <Icon name="repeat" size={26} color="white" />
          </PressableOpacity>
        </View>

        <View style={controlsStyles.center}>
          <PressableOpacity onPress={previous} disabled={disabled}>
            <IconFA5 name="step-backward" size={36} color="white" />
          </PressableOpacity>
          <PressableOpacity onPress={playPauseAction} disabled={disabled} style={controlsStyles.play}>
            <IconFA name={playPauseIcon} size={82} color="white" />
          </PressableOpacity>
          <PressableOpacity onPress={next} disabled={disabled}>
            <IconFA5 name="step-forward" size={36} color="white" />
          </PressableOpacity>
        </View>

        <View style={controlsStyles.center}>
          <PressableOpacity onPress={undefined} disabled={disabled}>
            <Icon name="shuffle" size={26} color="white" />
          </PressableOpacity>
        </View>
      </View>
      <View style={controlsStyles.bottom}>
        <PressableOpacity onPress={undefined} disabled={disabled}>
          <IconMatCom name="cast-audio" size={20} color="white" />
        </PressableOpacity>
        <PressableOpacity onPress={undefined} disabled={disabled}>
          <IconMatCom name="playlist-play" size={24} color="white" />
        </PressableOpacity>
      </View>
    </View>
  )
}

const controlsStyles = StyleSheet.create({
  container: {
    width: '100%',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 34,
  },
  play: {
    marginHorizontal: 30,
  },
  center: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

const NowPlayingLayout = () => {
  const track = useAtomValue(currentTrackAtom)

  return (
    <View style={styles.container}>
      <ImageGradientBackground imageUri={track?.artworkThumb as string} imageKey={`${track?.album}${track?.artist}`} />
      <NowPlayingHeader />
      <View style={styles.content}>
        <SongCoverArt />
        <SongInfo />
        <SeekBar />
        <PlayerControls />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
  },
})

export default NowPlayingLayout
