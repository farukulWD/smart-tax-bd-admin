import FileDetails from "@/components/files/files-details";

const FileDetailsPage = async ({
  params,
}: {
  params: Promise<{ fileId: string }>;
}) => {
  const { fileId } = await params;
  return <FileDetails fileId={fileId} />;
};

export default FileDetailsPage;
