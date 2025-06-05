import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./colors";

const STORAGE_KEY = "@toDos";
const MODE_KEY = "@mode";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [editingKey, setEditingKey] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    loadToDos();
    loadMode();
  }, []);

  const travel = async () => {
    setWorking(false);
    await AsyncStorage.setItem(MODE_KEY, JSON.stringify(false));
  };
  const work = async () => {
    setWorking(true);
    await AsyncStorage.setItem(MODE_KEY, JSON.stringify(true));
  };

  const onChangeText = (payload) => setText(payload);

  const onChangeEditText = (payload) => setEditText(payload);

  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };

  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    if (s) setToDos(JSON.parse(s));
  };

  const loadMode = async () => {
    const mode = await AsyncStorage.getItem(MODE_KEY);
    if (mode !== null) {
      setWorking(JSON.parse(mode));
    }
  };

  const addToDo = async () => {
    if (text === "") return;
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, completed: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  const deleteToDo = (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("Do you want to delete this To Do?");
      if (ok) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        saveToDos(newToDos);
      }
    } else {
      Alert.alert("Delete To Do", "Are you sure?", [
        { text: "Cancel" },
        {
          text: "I'm Sure",
          style: "destructive",
          onPress: () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            saveToDos(newToDos);
          },
        },
      ]);
    }
  };

  const toggleComplete = (key) => {
    const newToDos = { ...toDos };
    newToDos[key].completed = !newToDos[key].completed;
    setToDos(newToDos);
    saveToDos(newToDos);
  };

  const startEdit = (key) => {
    setEditingKey(key);
    setEditText(toDos[key].text);
  };

  const saveEdit = (key) => {
    const newToDos = { ...toDos };
    newToDos[key].text = editText;
    setToDos(newToDos);
    saveToDos(newToDos);
    setEditingKey(null);
    setEditText("");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={
          working ? "What do you have to do?" : "Where do you want to go?"
        }
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              <TouchableOpacity onPress={() => toggleComplete(key)}>
                <Text style={styles.completeBtn}>
                  {toDos[key].completed ? "✅" : "⬜"}
                </Text>
              </TouchableOpacity>

              {editingKey === key ? (
                <TextInput
                  style={styles.editInput}
                  value={editText}
                  onChangeText={onChangeEditText}
                  onSubmitEditing={() => saveEdit(key)}
                />
              ) : (
                <Text
                  style={{
                    ...styles.toDoText,
                    textDecorationLine: toDos[key].completed
                      ? "line-through"
                      : "none",
                  }}
                >
                  {toDos[key].text}
                </Text>
              )}
              <View style={styles.actions}>
                {editingKey !== key && (
                  <TouchableOpacity onPress={() => startEdit(key)}>
                    <EvilIcons
                      name="pencil"
                      size={24}
                      color="black"
                      style={{ marginRight: 20 }}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => deleteToDo(key)}>
                  <Fontisto name="trash" size={18} color={theme.grey} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  completeBtn: {
    fontSize: 18,
    marginRight: 10,
  },
  editInput: {
    flex: 1,
    backgroundColor: "white",
    padding: 8,
    borderRadius: 10,
    fontSize: 16,
    marginRight: 10,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
});
