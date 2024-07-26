import instance from "./axios";

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await instance.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res;
}
