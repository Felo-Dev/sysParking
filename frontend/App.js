import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';

const Sidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const widthAnim = new Animated.Value(expanded ? 250 : 70);
  

  const toggleSidebar = () => {
    setExpanded(!expanded);
    Animated.parallel([
      Animated.timing(widthAnim, {
        toValue: expanded ? 70 : 250,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  return (
    <View style={styles.fullScreen}>
      {/* Fondo con opacidad reducida */}
      {expanded && (
        <TouchableOpacity  onPress={toggleSidebar} />
      )}

      {/* Barra lateral */}
      <Animated.View style={[styles.container, { width: widthAnim }]}>
        <TouchableOpacity style={styles.toggleButton} onPress={toggleSidebar}>
          <Text style={styles.toggleText}>{expanded ? '⇤' : '⇥'}</Text>
        </TouchableOpacity>

        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>{expanded ? '👤 Usuario' : '👤'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>{expanded ? '⚙️ Configuración' : '⚙️'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>{expanded ? 'ℹ️ Información' : 'ℹ️'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>{expanded ? '📝 Registrar' : '📝'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>{expanded ? '📊 Estadísticas' : '📊'}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
  container: {
    height: '100%',
    backgroundColor: '#0566F7C5',
    paddingVertical: 20,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    position: 'absolute',
    left: 0,
    alignItems: 'center',
  },
  toggleButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  toggleText: {
    fontSize: 20,
    color: '#fff',
  },
  menu: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  menuItem: {
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
  },
  menuText: {
    color: '#EEEEEE',
    fontSize: 16,
  },
});

export default Sidebar;
