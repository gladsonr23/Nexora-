// Keep a live reference to the worker module so serverless bundlers include it.
// PDF.js otherwise dynamically imports ./pdf.worker.mjs when running without
// Worker support, which can fail after Vercel packages the server function.
import * as pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.mjs';
import {getDocument} from 'pdfjs-dist/legacy/build/pdf.mjs';

globalThis.pdfjsWorker = pdfjsWorker;

export {getDocument};
