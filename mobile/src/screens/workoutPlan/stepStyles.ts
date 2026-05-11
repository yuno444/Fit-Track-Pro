import { StyleSheet } from "react-native";

export const stepStyles = StyleSheet.create({
  block: {
    marginBottom: 18,
  },
  label: {
    fontWeight: "700",
    marginBottom: 8,
    color: "#111827",
    fontSize: 15,
  },
  hint: {
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
  },
  chipOn: {
    borderColor: "#1D4ED8",
    backgroundColor: "#DBEAFE",
  },
  chipText: {
    color: "#111827",
    fontWeight: "600",
  },
  chipTextOn: {
    color: "#1D3A8A",
  },
  pickerWrap: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 12,
    overflow: "hidden",
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  toggle: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  toggleOn: {
    borderColor: "#1D4ED8",
    backgroundColor: "#EFF6FF",
  },
  toggleText: {
    fontWeight: "600",
    color: "#374151",
  },
  summaryBox: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E3A8A",
  },
});
