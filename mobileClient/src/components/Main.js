import { View, StyleSheet, Platform } from 'react-native'
import React, { useEffect } from 'react'
import Player from './player/Player'
import StartScreen from './StartScreen'
import {
  selectFinishedSetup,
  setFinishedSetup,
  selectBottomPosition,
  setTrackRepeatMode
} from './player/playerSlice'
import { useSelector, useDispatch } from 'react-redux'
import TrackPlayer, { RepeatMode } from 'react-native-track-player'
import { Colors, DEVICE_LOGIC_HEIGHT } from '../styles/Styles'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Home from './home/Home'
import Search from './search/Search'
import Library from './library/Library'
import { SafeAreaView } from 'react-native-safe-area-context'
import LinearGradient from 'react-native-linear-gradient'
import { Icon } from '@rneui/themed'
import { TrackRepeatMode } from '../constants/Player'

const Main = () => {
  const finishedSetup = useSelector(selectFinishedSetup)
  const dispatch = useDispatch()
  const Tab = createBottomTabNavigator()
  const playerBottomPosition = useSelector(selectBottomPosition)

  useEffect(() => {
    const setupTrackplayer = async () => {
      try {
        if (!finishedSetup) {
          await TrackPlayer.setupPlayer({ maxBuffer: 150 })
          await TrackPlayer.updateOptions({ progressUpdateEventInterval: 1 })
          // repeatMode后续要从本地缓存里取，然后传给TrackPlayer
          // 现在默认是Queue（列表循环）
          await TrackPlayer.setRepeatMode(RepeatMode.Queue)
          const repeatMode = await TrackPlayer.getRepeatMode()
          switch (repeatMode) {
            case RepeatMode.Off:
              dispatch(setTrackRepeatMode(TrackRepeatMode.Off))
              break
            case RepeatMode.Track:
              dispatch(setTrackRepeatMode(TrackRepeatMode.Track))
              break
            case RepeatMode.Queue:
              dispatch(setTrackRepeatMode(TrackRepeatMode.Queue))
              break
          }
        }
        dispatch(setFinishedSetup(true))
      } catch (e) {
        console.log(e)
      }
    }
    setupTrackplayer()
  }, [])

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {!finishedSetup && <StartScreen />}
      {finishedSetup && (
        <>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarStyle: {
                position: 'absolute'
              },
              tabBarBackground: () => (
                <View style={{ flex: 1 }}>
                  <LinearGradient
                    end={{ x: 0.5, y: 0.5 }}
                    colors={[Colors.white1Transparent, Colors.white1]}
                    style={{ flex: 1 }}
                  />
                </View>
              ),
              tabBarIcon: ({ focused, color, size }) => {
                let iconName
                if (route.name === '主页') {
                  iconName = 'home'
                  return <Icon name={iconName} type="octicon" color={color} />
                } else if (route.name === '搜索') {
                  iconName = 'search'
                  return <Icon name={iconName} type="octicon" color={color} />
                } else if (route.name === '库') {
                  iconName = 'library-music'
                  return <Icon name={iconName} type="material" color={color} />
                }
              },
              tabBarActiveTintColor: Colors.pink1,
              tabBarInactiveTintColor: Colors.grey1
            })}
          >
            <Tab.Screen name="主页" component={Home} />
            <Tab.Screen name="搜索" component={Search} />
            <Tab.Screen name="库" component={Library} />
          </Tab.Navigator>
          <View
            style={{
              position: 'absolute',
              bottom: playerBottomPosition
            }}
          >
            <Player />
          </View>
        </>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white1,
    flex: 1
  }
})

export default Main
