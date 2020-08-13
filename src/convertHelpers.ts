import { convertCatalog } from "catalog-converter";

export const parseCatalog = (catalog: any) => {
  const converted = convertCatalog(catalog);
  console.log("parseCatalog `catalog`, `converted`:", catalog, converted);
  return converted;
};

export const parseFile = async (file: File) => {
  const string = await file.text();
  try {
    const catalog = JSON.parse(string);
    return parseCatalog(catalog);
  } catch (e) {
    throw new Error(
      `Had a problem with parsing the file "${file.name}", is it a JSON file? ${e}`
    );
  }
};

export const parseWeblink = (link: string) => {
  return fetch(link, {
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(res => res.json())
    .catch(err => {
      const msg = `Had a problem with accessing the JSON at "${link}".
      Check that it is a valid link, or if you are sure it is valid,
      it may not be CORS enabled - try downloading the file to your computer
      and then dragging it onto this tool. ${err.message}`;
      throw new Error(msg);
    })
    .then(json => {
      const newCatalog = parseCatalog(json);
      return newCatalog;
    });
};
