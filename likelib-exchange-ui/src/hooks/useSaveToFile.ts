import { saveAs } from "file-saver";
import { KeysData } from "key-store";
export const useSaveToFile = (
  fileName: string,
  data: KeysData<string>
): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "'application/json'; charset=utf-8",
  });
  saveAs(blob, fileName);
};
