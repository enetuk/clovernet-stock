export const useCopyText = (textToCopy: string): Promise<void> => {
  if (window.navigator.clipboard) {
    return window.navigator.clipboard.writeText(textToCopy);
  }
  const textArea = document.createElement("textarea");
  textArea.value = textToCopy;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  document.execCommand("copy");
  textArea.remove();
  return Promise.resolve();
};
