import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

const Sidebar = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.username}>👤 Nombre de Usuario</Text>
      
      <TouchableOpacity style={styles.menuItem}>
        <Text style={styles.menuText}>⚙️ Configuración</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <Text style={styles.menuText}>ℹ️ Información</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <Text style={styles.menuText}>📝 Registrar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <Text style={styles.menuText}>📊 Estadísticas</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 250,
    height: '100%',
    backgroundColor: '#222831',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  username: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#393E464F',
  },
  menuText: {
    color: '#EEEEEE',
    fontSize: 16,
  },
});

export default Sidebar;
