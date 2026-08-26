import { Suspense } from "react";
import FilesClient from "@/components/files/files-client";

const FilesPage = () => {
  return (
    <Suspense fallback={null}>
      <FilesClient />
    </Suspense>
  );
};

export default FilesPage;
