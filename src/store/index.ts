import create from "zustand";
import { INote } from "../types";

type Store = {
  note: INote | null;
  notes: INote[] | [];
  setNote: (note: INote | null) => void;
  setNotes: (notes: INote[]) => void;
  createNote: (note: INote) => void;
  updateNote: (note: INote) => void;
  deleteNote: (noteId: string) => void;
};

const useStore = create<Store>((set) => ({
  note: null,
  notes: [],
  setNote: (note) => set((state) => ({ ...state, note })),
  setNotes: (notes) => set((state) => ({ notes })),
  createNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
  deleteNote: (noteId) =>
    set((state) => ({
      notes: state.notes.filter((item) => item.id != noteId),
    })),
  updateNote: (note) =>
    set((state) => ({
      notes: state.notes.map((item) => {
        if (item.id === note.id) {
          return Object.assign(item, note);
        }
        return item;
      }),
    })),
}));

export default useStore;
