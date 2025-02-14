import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, Switch, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const HomeScreen = ({ navigation }) => {
  const [timers, setTimers] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [completionModal, setCompletionModal] = useState({ visible: false, timerName: '' });
  const [newTimer, setNewTimer] = useState({ name: '', duration: '', category: '', halfwayAlert: false });
  const [modalVisible, setModalVisible] = useState(false);
  const [halfwayModal, setHalfwayModal ] = useState({visible : false, timerName : ""});

  useEffect(() => {
    const loadTimers = async () => {
      try {
        const storedTimers = await AsyncStorage.getItem('timers');
        if (storedTimers) {
          setTimers(JSON.parse(storedTimers));
        }
      } catch (error) {
        console.error('Error loading timers:', error);
      }
    };
    loadTimers();
  }, []);

  useEffect(() => {
    const saveTimers = async () => {
      try {
        await AsyncStorage.setItem('timers', JSON.stringify(timers));
      } catch (error) {
        console.error('Error saving timers:', error);
      }
    };
    if (timers.length > 0) {
      saveTimers();
    }
  }, [timers]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers =>
        prevTimers.map(timer => {
          if (timer.status === 'Running' && timer.remaining > 0) {
            const newRemaining = timer.remaining - 1;
            const halfTime = Math.floor(timer.duration / 2);
  
            // Trigger halfway alert if enabled
            if (newRemaining === halfTime && timer.halfwayAlert && !timer.halfAlertTriggered) {
        
               setHalfwayModal({ visible: true, timerName: timer.name });
              return { ...timer, remaining: newRemaining, halfAlertTriggered: true };
            }
  
            return { ...timer, remaining: newRemaining };
          } else if (timer.remaining === 0 && timer.status === 'Running') {
            saveToHistory(timer.name);
            setCompletionModal({ visible: true, timerName: timer.name });
            return { ...timer, status: 'Completed' };
          }
          return timer;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [timers]);


  const saveToHistory = async (name) => {
    try {
      const existingHistory = await AsyncStorage.getItem('timerHistory');
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      history.push({ name, completedAt: new Date().toLocaleString() });
      await AsyncStorage.setItem('timerHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving timer history:', error);
    }
  };


  const startTimer = id => {
    setTimers(prev => prev.map(timer => (timer.id === id ? { ...timer, status: 'Running' } : timer)));
  };

  const pauseTimer = id => {
    setTimers(prev => prev.map(timer => (timer.id === id ? { ...timer, status: 'Paused' } : timer)));
  };

  const resetTimer = id => {
    setTimers(prev => prev.map(timer => (timer.id === id ? { ...timer, remaining: timer.duration, status: 'Paused', halfAlertTriggered: false } : timer)));
  };

  const startAllTimers = category => {
    setTimers(prev => prev.map(timer => (timer.category === category ? { ...timer, status: 'Running' } : timer)));
  };

  const pauseAllTimers = category => {
    setTimers(prev => prev.map(timer => (timer.category === category ? { ...timer, status: 'Paused' } : timer)));
  };

  const resetAllTimers = category => {
    setTimers(prev => prev.map(timer => (timer.category === category ? { ...timer, remaining: timer.duration, status: 'Paused', halfAlertTriggered: false } : timer)));
  };

  const toggleCategory = category => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const addNewTimer = () => {
    if (!newTimer.name || !newTimer.duration || !newTimer.category) {
      Alert.alert('Error', 'Please enter all fields');
      return;
    }
    const newTimerObj = {
      id: Date.now(),
      name: newTimer.name,
      duration: Number(newTimer.duration),
      remaining: Number(newTimer.duration),
      status: 'Paused',
      category: newTimer.category,
      halfwayAlert: newTimer.halfwayAlert,
      halfAlertTriggered: false,
    };

    setTimers(prevTimers => [...prevTimers, newTimerObj]);
    setNewTimer({ name: '', duration: '', category: '', halfwayAlert: false });
    setModalVisible(false);
  };

const exportData = async () => {
    try {
      const historyData = await AsyncStorage.getItem('timerHistory');
      if (!historyData) {
        console.log('No history data to export.');
        return;
      }
  
      if (Platform.OS === 'web') {
        // Web: Create a downloadable file
        const blob = new Blob([historyData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'timer_history.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Mobile: Use expo-file-system
        const fileUri = FileSystem.documentDirectory + 'timer_history.json';
        await FileSystem.writeAsStringAsync(fileUri, historyData);
        
        // Share the file (optional)
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        }
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const groupedTimers = timers.reduce((groups, timer) => {
    if (!groups[timer.category]) groups[timer.category] = [];
    groups[timer.category].push(timer);
    return groups;
  }, {});

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Timers</Text>
      <Button title="Add Timer" onPress={() => setModalVisible(true)} />
      <Button title="View History" onPress={() => navigation.navigate('History')} />
      <Button title="Export Data" onPress={exportData} />
      {Object.keys(groupedTimers).map(category => (
        <View key={category}>
          <TouchableOpacity onPress={() => toggleCategory(category)} style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}>{category}</Text>
          </TouchableOpacity>
          {expandedCategories[category] && (
            <>
              <View style={styles.buttons}>
                <Button title="Start All" onPress={() => startAllTimers(category)} />
                <Button title="Pause All" onPress={() => pauseAllTimers(category)} />
                <Button title="Reset All" onPress={() => resetAllTimers(category)} />
              </View>
              {groupedTimers[category].map(timer => (
                <View key={timer.id} style={styles.timer}>
                  <Text>{timer.name} - {timer.remaining}s ({timer.status})</Text>
                  <Progress.Bar progress={timer.remaining / timer.duration} width={200} color={timer.status === 'Completed' ? 'green' : 'blue'} />
                  <View style={styles.buttons}>
                    <Button title="Start" onPress={() => startTimer(timer.id)} />
                    <Button title="Pause" onPress={() => pauseTimer(timer.id)} />
                    <Button title="Reset" onPress={() => resetTimer(timer.id)} />
                  </View>
                </View>
              ))}
            </>
          )}
        </View>
      ))}

    <Modal visible={halfwayModal.visible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>You're halfway through "{halfwayModal.timerName}"!</Text>
            <Button title="OK" onPress={() => setHalfwayModal({ visible: false, timerName: '' })} />
          </View>
        </View>
      </Modal>
      <Modal visible={completionModal.visible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Timer "{completionModal.timerName}" is completed!</Text>
            <Button title="Close" onPress={() => setCompletionModal({ visible: false, timerName: '' })} />
          </View>
        </View>
      </Modal>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput placeholder="Name" value={newTimer.name} onChangeText={text => setNewTimer({ ...newTimer, name: text })} style={styles.input} />
            <TextInput placeholder="Duration (seconds)" value={newTimer.duration} onChangeText={text => setNewTimer({ ...newTimer, duration: text })} keyboardType="numeric" style={styles.input} />
            <TextInput placeholder="Category" value={newTimer.category} onChangeText={text => setNewTimer({ ...newTimer, category: text })} style={styles.input} />
       <View style={styles.switchContainer}>
              <Text>Halfway Alert</Text>
              <Switch value={newTimer.halfwayAlert} onValueChange={value => setNewTimer({ ...newTimer, halfwayAlert: value })} />
            </View>
            <Button title="Add Timer" onPress={addNewTimer} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    categoryHeader: { backgroundColor: '#ddd', padding: 10, marginBottom: 5 },
    categoryTitle: { fontSize: 18, fontWeight: 'bold' },
    timer: { padding: 10, borderBottomWidth: 1 },
    buttons: { flexDirection: 'row', gap: 10, marginTop: 5 },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: 300, alignItems: 'center' },
    input: { borderWidth: 1, padding: 10, marginBottom: 10, width: '100%' },
  });

export default HomeScreen;