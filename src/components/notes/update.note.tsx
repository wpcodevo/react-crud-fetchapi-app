import { FC, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { object, string, TypeOf } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingButton } from "../LoadingButton";
import { toast } from "react-toastify";
import NProgress from "nprogress";
import { INote, INoteResponse } from "../../types";
import useStore from "../../store";

const BASE_URL = "http://localhost:8000/api";

type IUpdateNoteProps = {
  note: INote;
  setOpenNoteModal: (open: boolean) => void;
};

const updateNoteSchema = object({
  title: string().min(1, "Title is required"),
  content: string().min(1, "Content is required"),
});

export type UpdateNoteInput = TypeOf<typeof updateNoteSchema>;

const UpdateNote: FC<IUpdateNoteProps> = ({ note, setOpenNoteModal }) => {
  const noteStore = useStore();
  const methods = useForm<UpdateNoteInput>({
    resolver: zodResolver(updateNoteSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (note) {
      methods.reset(note);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateNote = async ({
    noteId,
    note,
  }: {
    noteId: string;
    note: UpdateNoteInput;
  }) => {
    try {
      NProgress.start();
      const response = await fetch(`${BASE_URL}/notes/${noteId}`, {
        method: "PATCH",
        mode: "cors",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(note),
      });
      if (!response.ok) {
        const error = await response.json();
        throw error ? error : "Something bad happended";
      }
      const data = (await response.json()) as INoteResponse;
      noteStore.updateNote(data.note);
      setOpenNoteModal(false);
      NProgress.done();
      toast("Note updated successfully", {
        type: "success",
        position: "top-right",
      });
    } catch (error: any) {
      setOpenNoteModal(false);
      NProgress.done();
      const resMessage = error.message || error.detail || error.toString();
      toast.error(resMessage, {
        position: "top-right",
      });
    }
  };

  const onSubmitHandler: SubmitHandler<UpdateNoteInput> = async (data) => {
    updateNote({ noteId: note.id, note: data });
  };
  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl text-ct-dark-600 font-semibold">Update Note</h2>
        <div
          onClick={() => setOpenNoteModal(false)}
          className="text-2xl text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg p-1.5 ml-auto inline-flex items-center cursor-pointer"
        >
          <i className="bx bx-x"></i>
        </div>
      </div>{" "}
      <form className="w-full" onSubmit={handleSubmit(onSubmitHandler)}>
        <div className="mb-2">
          <label className="block text-gray-700 text-lg mb-2" htmlFor="title">
            Title
          </label>
          <input
            className={twMerge(
              `appearance-none border border-gray-400 rounded w-full py-3 px-3 text-gray-700 mb-2 leading-tight focus:outline-none`,
              `${errors["title"] && "border-red-500"}`
            )}
            {...methods.register("title")}
          />
          <p
            className={twMerge(
              `text-red-500 text-xs italic mb-2 invisible`,
              `${errors["title"] && "visible"}`
            )}
          >
            {errors["title"]?.message as string}
          </p>
        </div>
        <div className="mb-2">
          <label className="block text-gray-700 text-lg mb-2" htmlFor="title">
            Content
          </label>
          <textarea
            className={twMerge(
              `appearance-none border rounded w-full py-3 px-3 text-gray-700 mb-2 leading-tight focus:outline-none`,
              `${errors.content ? "border-red-500" : "border-gray-400"}`
            )}
            rows={6}
            {...register("content")}
          />
          <p
            className={twMerge(
              `text-red-500 text-xs italic mb-2`,
              `${errors.content ? "visible" : "invisible"}`
            )}
          >
            {errors.content && errors.content.message}
          </p>
        </div>
        <LoadingButton loading={false}>Update Note</LoadingButton>
      </form>
    </section>
  );
};

export default UpdateNote;
