import { config } from "@config/env";
import { Document } from "@langchain/core/documents";
import { AzureOpenAIEmbeddings } from "@langchain/openai";
import {
  SearchClient,
  SearchIndexClient,
  AzureKeyCredential,
  SearchIndex,
  SearchField,
  VectorSearch,
} from "@azure/search-documents";

const INDEX_NAME = "documents-index";

// Initialize the SearchClient for document operations (search and upload)
const searchClient = new SearchClient<{ id: string }>(
  config.AZURE_AISEARCH_ENDPOINT,
  INDEX_NAME,
  new AzureKeyCredential(config.AZURE_AISEARCH_KEY)
);

// Initialize the SearchIndexClient for index operations (create, delete, etc.)
const indexClient = new SearchIndexClient(
  config.AZURE_AISEARCH_ENDPOINT,
  new AzureKeyCredential(config.AZURE_AISEARCH_KEY)
);

// Set up the OpenAI embeddings (Azure)
const embeddings = new AzureOpenAIEmbeddings({
  azureOpenAIApiKey: config.AZURE_OPENAI_API_KEY,
  azureOpenAIApiInstanceName: config.AZURE_OPENAI_ENDPOINT,
  azureOpenAIApiDeploymentName: "ada-002", // Model for embeddings
  azureOpenAIApiVersion: config.AZURE_OPENAI_API_VERSION,
  azureOpenAIBasePath: `${config.AZURE_OPENAI_ENDPOINT}/openai/deployments/`,
  verbose: true,
});

// Create an index in Azure Cognitive Search (if not already created)
async function createIndex() {
  const index: SearchIndex = {
    name: INDEX_NAME,
    fields: [
      { name: "id", type: "Edm.String", key: true },
      { name: "content", type: "Edm.String", searchable: true },
      {
        name: "embedding",
        type: "Collection(Edm.Single)",
        searchable: true,
        vectorSearchDimensions: 1536,
        vectorSearchProfileName: "default",
      },
      { name: "metadata", type: "Edm.String" },
    ],
    vectorSearch: {
      // 1️⃣ Define the HNSW algorithm configuration
      algorithms: [
        {
          name: "default",
          kind: "hnsw",
          parameters: {
            m: 4,
            efConstruction: 400,
            efSearch: 400,
            metric: "cosine",
          },
        },
      ],
      // 2️⃣ Reference it in a profile
      profiles: [
        {
          name: "default",
          algorithmConfigurationName: "default",
        },
      ],
    },
  };

  try {
    await indexClient.createIndex(index);
    console.log("Index created successfully.");
  } catch (error) {
    console.error("Error creating index:", error);
  }
}

interface PdfDocument {
  id: string;
  pageContent: string;
  metadata: any;
}

// Function to upload documents to Azure Cognitive Search
async function syncDocuments(pdfDocs: PdfDocument[]) {
  // 1️⃣ Embed + build payload
  const embeddingsResult = await embeddings.embedDocuments(
    pdfDocs.map((d) => d.pageContent)
  );
  const payload = pdfDocs.map((doc, i) => ({
    id: doc.id,
    content: doc.pageContent,
    embedding: embeddingsResult[i],
    metadata: JSON.stringify(doc.metadata),
  }));

  // 2️⃣ Upsert current docs
  await searchClient.uploadDocuments(payload);

  const currentIds = new Set(pdfDocs.map((d) => d.id));
  await deleteStaleDocuments(currentIds);
}

async function deleteStaleDocuments(currentIds: Set<string>) {
  const toDeleteIds: string[] = [];

  const searchResult = await searchClient.search("*", {
    select: ["id"],
    top: 1000,
  });

  // 2️⃣ Iterate over the async iterator in searchResult.results
  for await (const hit of searchResult.results) {
    const existingId = hit.document.id;
    if (!currentIds.has(existingId)) {
      toDeleteIds.push(existingId);
    }
  }

  // Delete stale docs by passing an array of IDs (not objects)
  if (toDeleteIds.length) {
    await searchClient.deleteDocuments("id", toDeleteIds);
    console.log(`Deleted ${toDeleteIds.length} stale documents.`);
  }
}

// Example documents
const document1: PdfDocument = {
  id: "1",
  pageContent: "The powerhouse of the cell is the mitochondria",
  metadata: { type: "example" },
};
const document2: PdfDocument = {
  id: "2",
  pageContent: "Buildings are made out of brick",
  metadata: { type: "example" },
};
const document3: PdfDocument = {
  id: "3",
  pageContent: "Mitochondria are made out of lipids",
  metadata: { type: "example" },
};
const document4: PdfDocument = {
  id: "4",
  pageContent: "The 2024 Olympics are in Paris",
  metadata: { type: "example" },
};

async function uploadDocuments() {
  return syncDocuments([document1, document2, document3, document4]);
}

// Function to perform a search in the vector store
async function search(query: string) {
  try {
    const result = await searchClient.search(query, {
      includeTotalCount: true,
      filter: "", // Optional filtering (e.g., metadata)
      top: 5, // Number of results to return
    });
    console.log("Search results:", result);
    return result;
  } catch (error) {
    console.error("Error during search:", error);
  }
}

export { createIndex, uploadDocuments, search };
