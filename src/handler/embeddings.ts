import { createIndex, uploadDocuments } from "@lib/ms";
import { Request, Response } from "express";

const createIndexHandler = async (_: Request, res: Response): Promise<void> => {
  try {
    console.log("Creating index...");
    await createIndex();
    res.json({ success: true });
  } catch (error) {
    console.error("Error during index creation:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const uploadDocumentHandler = async (
  _: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("Uploading documents...");
    await uploadDocuments();
    res.json({ success: true });
  } catch (error) {
    console.error("Error during upload:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export { createIndexHandler, uploadDocumentHandler };
