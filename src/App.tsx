/// <reference types="styled-components/cssprop" />

import {
  CatalogResult,
  foldMessage,
  getMissingRequiredPropDetails,
  getUnknownPropDetails,
  getUnknownTypeDetails,
} from "catalog-converter";
import React, { useEffect, useState } from "react";
import styled, { DefaultTheme, useTheme } from "styled-components/macro";
import "./App.css";
import { parseFile, parseWeblink } from "./convertHelpers";
import Dropzone from "./Dropzone";

const FileSaver = require("file-saver");

const Box = require("terriajs/lib/Styled/Box").default;
const Button = require("terriajs/lib/Styled/Button").default;
const Text = require("terriajs/lib/Styled/Text").default;
const Spacing = require("terriajs/lib/Styled/Spacing").default;
const { Ul, Li }: any = require("terriajs/lib/Styled/List");
// const { Ol, Li }: any = require("terriajs/lib/Styled/List");

const Input = styled.input``;
const H1 = styled(Text).attrs({ as: "h1", heading: true })``;
const ErrorText = styled(Text).attrs({ extraExtraLarge: true })`
  color: red;
`;
const SuccessText = styled(Text).attrs({ extraExtraLarge: true })`
  color: green;
`;

type CurrentFileState = File | undefined;
type CatalogResultState = CatalogResult | undefined;
type ErrorState = Error | undefined;

interface AppState {
  theme: DefaultTheme;
  currentFile: CurrentFileState;
  setCurrentFile: (file: CurrentFileState) => void;
  weblink: string;
  setWeblink: (str: string) => void;
  error: ErrorState;
  setError: (err: ErrorState) => void;
  v8catalog: CatalogResultState;
  setV8catalog: (catalog: CatalogResultState) => void;
  handleSubmitLink: (
    e: React.FormEvent<HTMLFormElement | HTMLButtonElement>
  ) => void;
  clearError: () => void;
  resetState: () => void;
}
interface CatalogConverterUIProps {
  appState: AppState;
}

const Heading = ({ appState }: CatalogConverterUIProps) => {
  return (
    <>
      <H1 primary>TerriaJS Catalog Converter</H1>
      <Text extraExtraLarge>
        This tool will take version {`<=`}7 TerriaJS catalogs & convert them to
        be used with version 8 of TerriaJS.
      </Text>
      <Text extraExtraLarge>
        Please note that the converter is still in alpha as we are still in the
        process of developing version 8{" "}
        <span role="img" aria-label="smiley face">
          🙂
        </span>
      </Text>
      <Spacing bottom={2} />
      <Button secondary onClick={appState.resetState}>
        Reset files, errors & inputs
      </Button>
      <Spacing bottom={10} />
    </>
  );
};

const Weblink = ({ appState }: CatalogConverterUIProps) => {
  const { weblink, setWeblink, handleSubmitLink } = appState;
  return (
    <Li>
      <Text subHeading>Provide a web link to a v7 terriajs JSON catalog</Text>
      <Spacing bottom={2} />

      <form onSubmit={handleSubmitLink}>
        <label>
          Web link (e.g. try https://map.terria.io/init/terria.json)
          <Input
            css={`
              width: 100%;
              padding: 10px 0;
            `}
            value={weblink}
            onChange={(e) => setWeblink(e.target.value)}
          />
        </label>
        <Spacing bottom={2} />
        <Button primary onClick={handleSubmitLink}>
          <Text bold>Load web catalog</Text>
        </Button>
      </form>
    </Li>
  );
};
const Filelink = ({ appState }: CatalogConverterUIProps) => {
  const { error, setError, currentFile, setCurrentFile } = appState;
  return (
    <Li>
      <Text subHeading>Or select a local file (drag and drop works too)</Text>
      <Dropzone
        setError={setError}
        currentFile={currentFile}
        setCurrentFile={setCurrentFile}
      />
      {error && (
        <Box padded>
          <ErrorText>Error: {error.message}</ErrorText>
        </Box>
      )}
    </Li>
  );
};
const Results = ({ appState }: CatalogConverterUIProps) => {
  const { v8catalog, theme } = appState;
  return (
    <Li>
      <Text subHeading>Use catalog</Text>
      <Spacing bottom={2} />
      {v8catalog && v8catalog.result?.catalog === undefined && (
        <Box padded>
          <ErrorText>
            Looks like the catalog converter ran, but did not end up with any
            results
          </ErrorText>
        </Box>
      )}
      {v8catalog && v8catalog.result?.catalog !== undefined ? (
        <>
          <Box column fullWidth>
            <SuccessText>
              Parsed a new catalog with {v8catalog.result?.catalog?.length} root
              results!
            </SuccessText>
            <Spacing bottom={2} />
            <SuccessText>
              Download it & try it out on{" "}
              <a
                href="http://ci.terria.io/next/"
                target="_blank"
                rel="noopener noreferrer"
              >
                http://ci.terria.io/next/
              </a>
            </SuccessText>
            <Box paddedVertically={2}>
              <Button
                primary
                onClick={() => {
                  const blob = new Blob(
                    [JSON.stringify(v8catalog.result, null, 2)],
                    {
                      type: "application/json;charset=utf-8",
                    }
                  );
                  FileSaver.saveAs(blob, "v8-converted-catalog.json");
                }}
              >
                <Text bold>Download catalog</Text>
              </Button>
            </Box>
          </Box>

          {v8catalog.messages?.length > 0 && (
            <>
              <ErrorText>
                {v8catalog.messages?.length || 0} messages from converter
              </ErrorText>
              <Spacing bottom={2} />
              {v8catalog.messages.map((message, index) => (
                <React.Fragment key={index}>
                  <Box
                    padded
                    column
                    key={index}
                    theme={theme}
                    css={`
                      border: 1px solid ${(p: any) => p.theme.primary};
                    `}
                  >
                    <Text>Message: {message.message}</Text>
                    <Text>
                      Details:{" "}
                      {JSON.stringify(
                        foldMessage<any>({
                          isInputNotPlainObject: (m) => "",
                          isMissingRequiredProp: (m) =>
                            getMissingRequiredPropDetails(m),
                          isUnknownProp: (m) => getUnknownPropDetails(m),
                          isUnknownType: (m) => getUnknownTypeDetails(m),
                        })(message)
                      )}
                    </Text>
                    <Text>Path: {message.path.join(" → ")}</Text>
                    <Text>Severity: {message.severity}</Text>
                  </Box>
                  <Spacing bottom={2} />
                </React.Fragment>
              ))}
            </>
          )}
        </>
      ) : (
        <Text noFontSize>
          Parse a catalog first in order to download a new v8 catalog
        </Text>
      )}
    </Li>
  );
};

function App() {
  const theme = useTheme();
  const [currentFile, setCurrentFile] = useState<CurrentFileState>();
  const [weblink, setWeblink] = useState("");
  const [error, setError] = useState<Error | undefined>();
  const [v8catalog, setV8catalog] = useState<CatalogResult | undefined>();

  const clearError = () => setError(undefined);

  const resetState = () => {
    setCurrentFile(undefined);
    setWeblink("");
    setError(undefined);
    setV8catalog(undefined);
  };

  const handleSubmitLink = async (
    e: React.FormEvent<HTMLFormElement | HTMLButtonElement>
  ) => {
    e.preventDefault();
    setCurrentFile(undefined);
    try {
      const catalog = await parseWeblink(weblink);
      clearError();
      setV8catalog(catalog);
    } catch (e) {
      setError(e);
    }
  };

  const appState: AppState = {
    theme,
    currentFile,
    setCurrentFile,
    weblink,
    setWeblink,
    error,
    setError,
    v8catalog,
    setV8catalog,
    handleSubmitLink,
    clearError,
    resetState,
  };

  useEffect(() => {
    const gotFile = async () => {
      if (currentFile) {
        try {
          const catalog = await parseFile(currentFile);
          setV8catalog(catalog);
        } catch (e) {
          setError(e);
        }
      }
    };
    gotFile();
  }, [currentFile]);

  return (
    <Text extraExtraLarge>
      <Box
        paddedVertically={12}
        column
        fullHeight
        centered
        styledWidth="80vw"
        css={`
          margin: 0 auto;
        `}
      >
        <Heading appState={appState} />
        <Box left column fullWidth>
          <Ul css={"width:100%; li { margin-bottom: 40px; }"}>
            <Weblink appState={appState} />
            <Filelink appState={appState} />
            <Results appState={appState} />
          </Ul>
        </Box>
      </Box>
    </Text>
  );
}

export default App;
