// Import the worker eagerly so serverless bundlers include and register it.
// PDF.js otherwise resolves this file dynamically at runtime, which can fail
// after Vercel packages the server function.
import 'pdfjs-dist/legacy/build/pdf.worker.mjs';

export {getDocument} from 'pdfjs-dist/legacy/build/pdf.mjs';
