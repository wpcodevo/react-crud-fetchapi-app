import { FC, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { object, string, TypeOf } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingButton } from "../LoadingButton";
import { toast } from "react-toastify";
import NProgress from "nprogress";
import useStore from "../../store";
import { INoteResponse } from "../../types";

const BASE_URL = "http://localhost:8000/api";

type ICreateNoteProps = {
  setOpenNoteModal: (open: boolean) => void;
};

const createNoteSchema = object({
  title: string().min(1, "Title is required"),
  content: string().min(1, "Content is required"),
});

export type CreateNoteInput = TypeOf<typeof createNoteSchema>;

const CreateNote: FC<ICreateNoteProps> = ({ setOpenNoteModal }) => {
  const [loading, setLoading] = useState(false);
  const noteStore = useStore();
  const methods = useForm<CreateNoteInput>({
    resolver: zodResolver(createNoteSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const createNote = async (note: CreateNoteInput) => {
    try {
      NProgress.start();
      setLoading(true);
      const response = await fetch(`${BASE_URL}/notes/`, {
        method: "POST",
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
      noteStore.createNote(data.data.note);

      setLoading(false);
      setOpenNoteModal(false);
      NProgress.done();
      toast("Note created successfully", {
        type: "success",
        position: "top-right",
      });
    } catch (error: any) {
      setLoading(false);
      setOpenNoteModal(false);
      NProgress.done();
      const resMessage = error.message || error.detail || error.toString();
      toast.error(resMessage, {
        position: "top-right",
      });
    }
  };

  const onSubmitHandler: SubmitHandler<CreateNoteInput> = async (data) => {
    createNote(data);
  };
  return (
    <section>
      <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
        <h2 className="text-2xl text-ct-dark-600 font-semibold">Create Note</h2>
        <div
          onClick={() => setOpenNoteModal(false)}
          className="text-2xl text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg p-1.5 ml-auto inline-flex items-center cursor-pointer"
        >
          <i className="bx bx-x"></i>
        </div>
      </div>
      <form className="w-full" onSubmit={handleSubmit(onSubmitHandler)}>
        <div className="mb-2">
          <label className="block text-gray-700 text-lg mb-2" htmlFor="title">
            Title
          </label>
          <input
            className={twMerge(
              `appearance-none border border-gray-400 rounded w-full py-3 px-3 text-gray-700 mb-2  leading-tight focus:outline-none`,
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
              `appearance-none border border-gray-400 rounded w-full py-3 px-3 text-gray-700 mb-2 leading-tight focus:outline-none`,
              `${errors.content && "border-red-500"}`
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
            {errors.content && (errors.content.message as string)}
          </p>
        </div>
        <LoadingButton loading={loading}>Create Note</LoadingButton>
      </form>
    </section>
  );
};

export default CreateNote;
