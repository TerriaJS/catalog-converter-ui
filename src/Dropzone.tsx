import React, { useCallback } from "react";
import { useTheme } from "styled-components/macro";
import { useDropzone } from "react-dropzone";
const Box = require("terriajs/lib/Styled/Box").default;

interface DropzoneProps {
  currentFile?: File;
  setCurrentFile: (file: File) => void;
  setError: (error: Error) => void;
}

export default function Dropzone(props: DropzoneProps) {
  const { currentFile, setCurrentFile, setError } = props;
  const theme = useTheme();
  const onDrop = useCallback(
    acceptedFiles => {
      if (acceptedFiles?.length > 1) {
        const msg = "Please only one catalog at a time";
        setError(new Error(msg));
      }
      setCurrentFile(acceptedFiles[0]);
    },
    [setCurrentFile, setError]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Box
      {...getRootProps()}
      column
      theme={theme}
      css={`
        height: 500px;
        border: 1px dotted ${(p: any) => p.theme.primary};
      `}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop catalog here ...</p>
      ) : (
        <p>Drag n' drop a catalog here, or click to select a catalog file</p>
      )}
      {currentFile && (
        <Box column>
          <p>Current File: {currentFile.name}</p>
        </Box>
      )}
    </Box>
  );
}
