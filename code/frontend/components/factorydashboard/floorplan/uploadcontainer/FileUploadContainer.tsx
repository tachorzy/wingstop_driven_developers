import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import AcceptedUploadForm from "./AcceptedUploadForm";

interface DropFile extends File {
    path: string;
}

const FileUploadContainer = (props: {
    setFloorPlanFile: React.Dispatch<React.SetStateAction<File | null>>;
}) => {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    const { setFloorPlanFile } = props;

    const onDrop = useCallback((acceptedFiles: File[]) => {
        // call API endpoint that sends the floor-plan to the backend
        setUploadedFile(acceptedFiles[0]);
    }, []);

    const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
        useDropzone({
            accept: {
                "image/jpeg": [],
                "image/png": [],
                "image/svg+xml": [],
                // later add support for glb files.
            },
            maxFiles: 1,
            maxSize: 8000000,
            onDrop,
        });

    const acceptedFileItems = (acceptedFiles as DropFile[]).map((file) => (
        <li key={file.path}>
            {file.path} - {file.size} bytes
        </li>
    ));

    const fileRejectionItems = fileRejections.map(({ file, errors }) => (
        <li key={(file as DropFile).path}>
            {(file as DropFile).path} - {file.size} bytes
            <ul>
                {errors.map((e) => (
                    <li key={e.code}>{e.message}</li>
                ))}
            </ul>
        </li>
    ));

    return (
        <section className="w-full h-full flex flex-col gap-y-10">
            <div
                {...getRootProps({ className: "dropzone" })}
                className="group flex flex-col w-[62.5%] h-[30rem] p-10 gap-y-6 items-center justify-center border-MainBlue hover:border-LightBlue transition duration-700 ease-in border-dashed border-4 rounded-2xl cursor-pointer scale-[100.25%] shadow-sm"
                data-testid="dropzone"
            >
                <input data-testid="drop-input" {...getInputProps()} />
                <Image
                    width={90}
                    height={90}
                    src="/factorydashboard/upload.svg"
                    alt="upload icon"
                    className="group-hover:animate-pulse-slow transition duration-1000 ease-out"
                />
                <div>
                    <p className="text-slate-500 text-lg font-medium text-center">
                        Click or drop your floor plan file here to upload.
                    </p>
                    <em className="text-slate-700 text-lg font-medium text-center">
                        <span className="text-red-400">*</span>Files supported:
                        .png, .jpg, .svg, .glb
                    </em>
                </div>
            </div>
            <div className="absolute items-center justify-center">
                {uploadedFile && (
                    <AcceptedUploadForm
                        uploadedFile={uploadedFile}
                        setUploadedFile={setUploadedFile}
                        acceptedFileItems={acceptedFileItems}
                        fileRejectionItems={fileRejectionItems}
                        setFloorPlanFile={setFloorPlanFile}
                    />
                )}
            </div>
        </section>
    );
};

export default FileUploadContainer;
