type RagRawDocument = {
    source: string;
    sourceType: "guide" | "course" | "lecturer" | "category";
    sourceId: string;
    text: string;
};
type RagIngestionSection = {
    sourceType: RagRawDocument["sourceType"];
    source: string;
    documents: number;
    chunks: number;
    embeddedSuccess: number;
    embeddedFailed: number;
};
export type RagIngestionReport = {
    runId: string;
    status: "running" | "succeeded" | "failed" | "skipped";
    startedAt: string;
    finishedAt?: string;
    durationMs?: number;
    collection: string;
    forceReindex: boolean;
    message: string;
    totalDocuments: number;
    totalChunks: number;
    totalEmbeddedSuccess: number;
    totalEmbeddedFailed: number;
    requestedUpsertPoints: number;
    verifiedIndexedByRunId: number;
    collectionPointCount: number;
    sections: RagIngestionSection[];
    error?: string;
};
declare class RagIngestionService {
    private static readonly GUIDE_FILENAME;
    private readonly qdrantHost;
    private readonly qdrantPort;
    private readonly qdrantUseTls;
    private readonly qdrantApiKey;
    private readonly qdrantCollection;
    private readonly embeddingDimensions;
    private readonly embeddingModel;
    private readonly geminiApiKey;
    private readonly geminiBaseUrl;
    private readonly geminiEmbeddingPath;
    private readonly startupIngestEnabled;
    private readonly startupForceReindex;
    private readonly qdrantInitializeSchema;
    private readonly qdrantUpsertBatchSize;
    private lastReport;
    private runningPromise;
    private get qdrantUrl();
    getStatus(): {
        running: boolean;
        startupIngestEnabled: boolean;
        startupForceReindex: boolean;
        lastReport: RagIngestionReport | null;
    };
    runIngestion(options?: {
        forceReindex?: boolean;
    }): Promise<RagIngestionReport>;
    runStartupIngestion(): Promise<RagIngestionReport>;
    private executeIngestion;
    private buildGuideDocuments;
    private buildCourseDocuments;
    private buildLecturerDocuments;
    private buildCategoryDocuments;
    private splitTextIntoChunks;
    private generateEmbedding;
    private ensureQdrantCollection;
    private deleteQdrantCollectionIfExists;
    private upsertPointsInBatches;
    private countCollectionPointsByRunId;
    private countCollectionPoints;
    private buildQdrantRequestConfig;
    private wrapQdrantError;
}
export declare const ragIngestionService: RagIngestionService;
export {};
//# sourceMappingURL=ragIngestionService.d.ts.map