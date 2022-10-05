import type { ClipboardEvent } from "react";
import { useRef, useState } from "react";

export function ImageUpload() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (e.clipboardData.files.length) {
      const fileObject = e.clipboardData.files[0];
      //for form submission
      if (hiddenFileInput.current) {
        hiddenFileInput.current.files = e.clipboardData.files;
      }

      //for preview
      setSelectedImage(fileObject);
    } else {
      alert(
        "No image data was found in your clipboard. Copy an image first or take a screenshot."
      );
    }
  };
  return (
    <>
      <input
        required={true}
        type="file"
        ref={hiddenFileInput}
        name="image"
        className="hidden"
        onChange={(event) => {
          if (event.target.files) {
            setSelectedImage(event.target.files[0]);
          }
        }}
      />
      {selectedImage ? (
        <div className="pt-2">
          <div>
            <div
              id="img-to-export"
              className="relative flex basis-2/4 items-center justify-center bg-transparent"
            >
              <img
                alt="not found"
                className="h-[512px] w-[512px] justify-self-auto "
                src={selectedImage && URL.createObjectURL(selectedImage)}
              />
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => {
                setSelectedImage(null);
              }}
              className="rounded text-lg text-white underline"
            >
              Clear
            </button>
          </div>
        </div>
      ) : (
        <div
          className="mt-2 flex h-[512px] w-[512px] items-center border-2 border-dashed border-gray-300 p-12 text-center  hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onPaste={handlePaste}
        >
          <button
            type="button"
            className="flex w-full flex-col items-center text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() =>
              hiddenFileInput.current && hiddenFileInput.current.click()
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className=" mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div className="flex justify-center text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md font-medium text-indigo-200 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
              >
                <span>
                  Click here to upload an image or just paste from clipboard
                </span>
              </label>
            </div>
          </button>
        </div>
      )}
    </>
  );
}
