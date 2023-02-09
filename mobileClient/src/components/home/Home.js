import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Colors, HEIGHT_RATIO, WIDTH_RATIO } from '../../styles/Styles'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useSelector, useDispatch } from 'react-redux'
import { setBottomPosition, selectCurrentTrack } from '../player/playerSlice'
import { getGreeting, searchMusicResultConvert } from '../../utils/shared'
import PlaylistCard from './PlaylistCard'
import MusicService from '../../services/music.service'
import MusicItem from '../common/MusicItem'
import Separator from '../common/Separator'

const Home = () => {
  const tabBarHeight = useBottomTabBarHeight()
  const dispatch = useDispatch()
  const [greeting, setGreeting] = useState('')
  const [musicList, setMusicList] = useState([])
  const [page, setPage] = useState(0)
  const [totalNumMusic, setTotalNumMusic] = useState(0)
  const [musicListLoading, setMusicListLoading] = useState(false)
  const PAGE_SIZE = 20
  const currentTrack = useSelector(selectCurrentTrack)

  // 选择在主页面监听正在播放的歌曲，并对每个MusicItem执行函数得到它是否在播放
  // Instead of 在每个MusicItem内做监听
  const isItemPlaying = (track) => {
    if (currentTrack) return currentTrack.id === track.id
  }

  useEffect(() => {
    const greetingText = getGreeting()
    setGreeting(greetingText)
  }, [])

  useEffect(() => {
    getFirstPageMusic()
  }, [])

  useEffect(() => {
    if (tabBarHeight) {
      dispatch(setBottomPosition(tabBarHeight))
    }
  }, [tabBarHeight])

  const getFirstPageMusic = async () => {
    try {
      setMusicListLoading(true)
      const res = await MusicService.searchAllMusic({ page: 0, size: PAGE_SIZE })
      const convertedMusic = searchMusicResultConvert(res.items)
      setPage(res.pageable.page)
      setTotalNumMusic(res.pageable.total)
      setMusicList(convertedMusic)
      setMusicListLoading(false)
    } catch (e) {
      console.log(e)
    }
  }

  // FlatList触底时触发
  // First check是否为最后一页，如是则return
  // fetch下一页的music并更新state
  const getNextPageMusic = async () => {
    try {
      if ((page + 1) * PAGE_SIZE >= totalNumMusic) return
      setMusicListLoading(true)
      const res = await MusicService.searchAllMusic({ page: page + 1, size: PAGE_SIZE })
      const convertedMusic = searchMusicResultConvert(res.items)
      setPage(res.pageable.page)
      setTotalNumMusic(res.pageable.total)
      setMusicList([...musicList, ...convertedMusic])
      setMusicListLoading(false)
    } catch (e) {
      console.log(e)
    }
  }

  const listHeaderComponent = (
    <View style={styles.container}>
      <Text style={styles.greetingText}>{greeting}</Text>
      <View style={styles.playlistCardsWrapper}>
        <View style={styles.playlistCardsSubWrapper}>
          <PlaylistCard title={'已收藏的歌曲'} />
          <PlaylistCard title={'莞儿合集'} cardImage={require('../../../assets/cover/莞儿.jpg')} />
        </View>
        <View style={[styles.playlistCardsSubWrapper, { marginTop: 6 }]}>
          <PlaylistCard title={'露早合集'} cardImage={require('../../../assets/cover/露早.jpg')} />
          <PlaylistCard title={'米诺合集'} cardImage={require('../../../assets/cover/米诺.jpg')} />
        </View>
        <View style={[styles.playlistCardsSubWrapper, { marginTop: 6 }]}>
          <PlaylistCard title={'虞莫合集'} cardImage={require('../../../assets/cover/虞莫.jpg')} />
          <PlaylistCard title={'柚恩合集'} cardImage={require('../../../assets/cover/柚恩.jpg')} />
        </View>
      </View>
      <Text style={styles.musicListTitle}>歌曲列表</Text>
    </View>
  )

  return (
    <FlatList
      data={musicList}
      renderItem={({ item, index }) => <MusicItem track={item} itemPlaying={isItemPlaying(item)} />}
      ListHeaderComponent={listHeaderComponent}
      ItemSeparatorComponent={Separator}
      ListFooterComponent={
        <View
          style={{ height: 58 * HEIGHT_RATIO + tabBarHeight, backgroundColor: Colors.white1 }}
        ></View>
      }
      onEndReached={getNextPageMusic}
      refreshing={musicListLoading}
      initialNumToRender={7}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white1,
    display: 'flex',
    paddingHorizontal: 20 * WIDTH_RATIO,
    paddingTop: 20 * WIDTH_RATIO
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black1
  },
  playlistCardsWrapper: {
    display: 'flex',
    marginTop: 30
  },
  playlistCardsSubWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  musicListTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 30,
    marginBottom: 10,
    color: Colors.black1
  }
})

export default Home
