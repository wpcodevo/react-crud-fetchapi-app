import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import NoteModal from "./components/note.modal";
import CreateNote from "./components/notes/create.note";
import NoteItem from "./components/notes/note.component";
import NProgress from "nprogress";
import { INotesResponse } from "./types";
import useStore from "./store";

const BASE_URL = "http://localhost:8000/api";

function AppContent() {
  const [openNoteModal, setOpenNoteModal] = useState(false);
  const { notes, setNotes } = useStore();

  const getNotes = async ({ page, limit }: { page: number; limit: number }) => {
    try {
      NProgress.start();
      const response = await fetch(
        `${BASE_URL}/notes?page=${page}&limit=${limit}`,
        {
          method: "GET",
          mode: "cors",
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw error ? error : "Something bad happended";
      }
      const data = (await response.json()) as INotesResponse;
      setNotes(data.notes);

      NProgress.done();
    } catch (error: any) {
      const resMessage = error.message || error.detail || error.toString();
      toast.error(resMessage, {
        position: "top-right",
      });
      NProgress.done();
    }
  };

  useEffect(() => {
    getNotes({ page: 1, limit: 10 });
  }, []);

  return (
    <div className="2xl:max-w-[90rem] max-w-[68rem] mx-auto">
      <div className="m-8 grid grid-cols-[repeat(auto-fill,_320px)] gap-7 grid-rows-[1fr]">
        <div className="p-4 min-h-[18rem] bg-white rounded-lg border border-gray-200 shadow-md flex flex-col items-center justify-center">
          <div
            onClick={() => setOpenNoteModal(true)}
            className="flex items-center justify-center h-20 w-20 border-2 border-dashed border-ct-blue-600 rounded-full text-ct-blue-600 text-5xl cursor-pointer"
          >
            <i className="bx bx-plus"></i>
          </div>
          <h4
            onClick={() => setOpenNoteModal(true)}
            className="text-lg font-medium text-ct-blue-600 mt-5 cursor-pointer"
          >
            Add new note
          </h4>
        </div>
        {/* Note Items */}

        {notes?.map((note) => (
          <NoteItem key={note.id} note={note} />
        ))}

        {/* Create Note Modal */}
        <NoteModal
          openNoteModal={openNoteModal}
          setOpenNoteModal={setOpenNoteModal}
        >
          <CreateNote setOpenNoteModal={setOpenNoteModal} />
        </NoteModal>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <AppContent />
      <ToastContainer />
    </>
  );
}

export default App;
