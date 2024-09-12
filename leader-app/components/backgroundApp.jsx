import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function BackgroundApp({children}) {
  return (
    <View style={styles.background}>
      <Image
        source={require('../assets/backrond.png')} 
        style={styles.backgroundImage}
      />
      <Image
        source={require('../assets/leader.png')} 
        style={styles.titelImage}
      />
      <View style={styles.containerChildren}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  backgroundImage: {
    width: 500, 
    height: 900, 
    resizeMode: 'contain', 
    position: 'absolute', 
  },
  titelImage: {
    width: 350,
    height: 120, 
    resizeMode: 'contain',
    position: 'absolute', 
  },
  containerChildren: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: 140,
  }
});
