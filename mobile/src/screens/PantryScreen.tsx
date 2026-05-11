import { randomUUID } from "expo-crypto";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../navigation/types";
import type { PantryItem } from "../types/pantry";
import { getPantry, savePantry } from "../services/pantryStorage";

type Props = NativeStackScreenProps<MainStackParamList, "Pantry">;

export function PantryScreen(_props: Props) {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const load = useCallback(async () => {
    setItems(await getPantry());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function openAdd() {
    setEditingId(null);
    setDraftName("");
    setModalOpen(true);
  }

  function openEdit(item: PantryItem) {
    setEditingId(item.id);
    setDraftName(item.name);
    setModalOpen(true);
  }

  async function persist(next: PantryItem[]) {
    await savePantry(next);
    setItems(next);
  }

  async function handleSaveModal() {
    const name = draftName.trim();
    if (!name) return;
    if (editingId) {
      await persist(items.map((i) => (i.id === editingId ? { ...i, name } : i)));
    } else {
      await persist([...items, { id: randomUUID(), name }]);
    }
    setModalOpen(false);
  }

  async function handleDelete(id: string) {
    await persist(items.filter((i) => i.id !== id));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>My pantry</Text>
        <Text style={styles.subtitle}>Ingredients you have at home — used for recipe search.</Text>
        <Pressable style={styles.primaryBtn} onPress={openAdd}>
          <Text style={styles.primaryBtnText}>+ Add ingredient</Text>
        </Pressable>
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={items.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No ingredients yet. Add what you have in the kitchen.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Pressable style={styles.nameWrap} onPress={() => openEdit(item)}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.hint}>Tap to edit</Text>
            </Pressable>
            <Pressable
              style={styles.trashBtn}
              onPress={() => handleDelete(item.id)}
              accessibilityLabel="Remove ingredient"
            >
              <Text style={styles.trashIcon}>🗑</Text>
            </Pressable>
          </View>
        )}
      />

      <Modal visible={modalOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingId ? "Edit ingredient" : "Add ingredient"}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. chicken breast"
              placeholderTextColor="#9CA3AF"
              value={draftName}
              onChangeText={setDraftName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setModalOpen(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalSave} onPress={handleSaveModal}>
                <Text style={styles.modalSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#E5E7EB" },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: "800", color: "#111827" },
  subtitle: { marginTop: 4, color: "#6B7280", marginBottom: 12 },
  primaryBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#1D4ED8",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  primaryBtnText: { color: "#FFFFFF", fontWeight: "700" },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  emptyList: { flexGrow: 1, paddingHorizontal: 16, justifyContent: "center" },
  emptyText: { textAlign: "center", color: "#6B7280", fontSize: 16, lineHeight: 22 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  nameWrap: { flex: 1 },
  name: { fontSize: 17, fontWeight: "700", color: "#111827" },
  hint: { marginTop: 4, fontSize: 12, color: "#9CA3AF" },
  trashBtn: { padding: 8 },
  trashIcon: { fontSize: 20 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 12 },
  modalInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  modalCancel: { paddingVertical: 10, paddingHorizontal: 14 },
  modalCancelText: { fontWeight: "700", color: "#374151" },
  modalSave: {
    backgroundColor: "#1D4ED8",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  modalSaveText: { color: "#FFFFFF", fontWeight: "700" },
});
