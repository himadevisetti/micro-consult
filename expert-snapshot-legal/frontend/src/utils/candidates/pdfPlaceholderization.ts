// src/utils/candidates/pdfPlaceholderization.ts
import fs from "fs/promises";
import { spawn } from "child_process";
import path from "path";
import { Candidate } from "../../types/Candidate";
import type { ClauseBlock } from "../../types/ClauseBlock";
import { placeholderizeDocx } from "./docxPlaceholderization.js";
import { logDebug } from "../../utils/logger.js";
import { track } from "../../../track.js";

// --- Resolve project root and shim path ---
const projectRoot = process.env.PROJECT_ROOT ?? process.cwd();
const shimPath = path.join(projectRoot, "scripts/pdf2docx_shim.py");

// --- Resolve Python binary ---
let pythonBin: string;
if (process.env.VIRTUAL_ENV) {
  const venvRoot = path.resolve(projectRoot, process.env.VIRTUAL_ENV);
  pythonBin = path.join(venvRoot, "bin", "python3");
} else {
  pythonBin = "python3";
}

logDebug("pdfPlaceholderization.env", {
  projectRoot,
  VIRTUAL_ENV: process.env.VIRTUAL_ENV,
  resolvedPythonBin: pythonBin,
  resolvedShimPath: shimPath,
});

export async function placeholderizePdf(
  seedFilePath: string,
  candidates: Candidate[],
  clauseBlocks: ClauseBlock[]
): Promise<{ placeholderBuffer: Buffer; enrichedCandidates?: Candidate[] }> {
  // 1. Define temp output path for converted DOCX
  const tempDocxPath = seedFilePath.replace(/\.pdf$/i, ".converted.docx");

  // 2. Run pdf2docx via our shim
  await new Promise<void>((resolve, reject) => {
    const proc = spawn(pythonBin, [
      shimPath,
      "convert",
      seedFilePath,
      tempDocxPath,
    ]);

    proc.stdout.on("data", (data) => {
      logDebug("pdfPlaceholderization.converterStdout", {
        seedFilePath,
        message: data.toString(),
      });
    });

    proc.stderr.on("data", (data) => {
      logDebug("pdfPlaceholderization.converterStderr", {
        seedFilePath,
        message: data.toString(),
      });
    });

    proc.on("error", (err) => {
      logDebug("pdfPlaceholderization.conversionError", {
        seedFilePath,
        tempDocxPath,
        error: err.message,
      });
      reject(err);
    });

    proc.on("exit", (code) => {
      if (code === 0) {
        logDebug("pdfPlaceholderization.conversionSuccess", {
          seedFilePath,
          tempDocxPath,
        });
        resolve();
      } else {
        logDebug("pdfPlaceholderization.conversionFailure", {
          seedFilePath,
          tempDocxPath,
          exitCode: code,
        });
        reject(new Error(`pdf2docx failed with code ${code}`));
      }
    });
  });

  // 3. Read the converted DOCX into a Buffer
  const docxBuffer = await fs.readFile(tempDocxPath);

  // 4. Call placeholderizeDocx() with the converted buffer
  const { placeholderBuffer, enrichedCandidates } = await placeholderizeDocx(
    docxBuffer,
    candidates,
    clauseBlocks
  );

  // Track placeholderization telemetry
  await track("document_placeholderized", {
    format: "pdf",
    candidateCount: enrichedCandidates.length,
    clauseBlockCount: clauseBlocks.length,
  });

  return { placeholderBuffer, enrichedCandidates };
}
