# ⏳ Timer App

A **React Native** application that allows users to create, manage, and track countdown timers. Users can group timers into categories, start/pause/reset timers individually or in bulk, receive optional halfway alerts, and view a history of completed timers.

---

## 🚀 Features

### 🎯 Timer Management
- **Create Timers** – Add custom timers with name, duration, and category.
- **Manage Timers** – Start, pause, and reset timers individually or by category.
- **Halfway Alerts** – Optionally enable an alert when 50% of the timer has elapsed.
- **History Tracking** – View a log of completed timers with timestamps.
- **Persistent Storage** – Timers and history are saved even after the app is closed.

### 🔥 Additional Features
✅ **Grouped Timers** – Organize timers by category and manage them collectively.  
✅ **Start/Pause/Reset All** – Control all timers in a category at once.  
✅ **Intuitive UI** – Simple and easy-to-use design for quick access.  
✅ **Asynchronous Storage** – Saves data even if the app is closed and reopened.  

---

## 🛠 Tech Stack

| Layer       | Technology |
|------------|-----------|
| **Frontend** | React Native |
| **Storage** | AsyncStorage (for persistence) |
| **UI Components** | react-native-progress |

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```sh
git clone <repository_url>
cd <repository_name>
```

### 2️⃣ Install Dependencies
Ensure you have **Node.js** and **npm/yarn** installed. Then run:
```sh
npm install   # or yarn install
```

### 3️⃣ Run the Application
To start the React Native development server, use:
```sh
npx react-native run-android   # For Android devices/emulators
npx react-native run-ios       # For iOS (MacOS only)
```

---

## 💡 Assumptions Made
1. **Timers Count Down in Seconds** – The duration input is in seconds.
2. **History Should Be Persistent** – Timer completion records are stored using AsyncStorage.
3. **Halfway Alert Is Optional** – Users can enable or disable halfway alerts when adding a timer.
4. **Timers Continue Running in the Background** – If the app is not closed, timers continue updating.
5. **No Auto-Deletion of History** – Users can view the history of completed timers indefinitely.

---

## 🔮 Future Improvements
- **Notifications for Background Timers** – Display alerts when timers finish even if the app is minimized.
- **Customization Options** – Allow users to set custom alert percentages (e.g., 25%, 75%).
- **History Management** – Add a feature to clear history manually if needed.

---

Developed with ❤️ using React Native 🚀

