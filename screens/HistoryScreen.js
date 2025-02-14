import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HistoryScreen = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const storedHistory = await AsyncStorage.getItem('timerHistory');
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        }
      } catch (error) {
        console.error('Error loading history:', error);
      }
    };
    loadHistory();
  }, []);

  /*const clearHistory = async () => {
    Alert.alert('Confirm', 'Are you sure you want to clear history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('timerHistory');
            setHistory([]);
          } catch (error) {
            console.error('Error clearing history:', error);
          }
        },
      },
    ]);
  };*/

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Timer History</Text>
      {history.length === 0 ? (
        <Text style={styles.emptyText}>No completed timers yet.</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <Text style={styles.timerName}>{item.name}</Text>
              <Text style={styles.timestamp}>Completed at: {item.completedAt}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16 },
  historyItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  timerName: { fontSize: 18, fontWeight: 'bold' },
  timestamp: { fontSize: 14, color: 'gray' },
});

export default HistoryScreen;

