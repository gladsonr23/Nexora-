import test from 'node:test';
import assert from 'node:assert/strict';
import { createCanvas } from '@napi-rs/canvas';
import { jsPDF } from 'jspdf';
import { extractPdfWithOcr, pdfJsResourceOptions, reconcileOcr, nvidiaOcr } from './pattern-ocr.js';

test('PDF.js receives local decoder and font directories for scanned PDFs',async () => {
  const options = pdfJsResourceOptions();
  assert.match(options.wasmUrl,/pdfjs-dist\/wasm\/$/);
  assert.match(options.standardFontDataUrl,/pdfjs-dist\/standard_fonts\/$/);
  const { access } = await import('node:fs/promises');
  await access(`${options.wasmUrl}jbig2.wasm`);
});

test('OCR agreement requires matching numbers and sufficient confidence', () => {
  assert.equal(reconcileOcr({text:'Q1. Explain inheritance [8]',confidence:90},{text:'Q1. Explain inheritance [8]',confidence:.9}).status,'agree');
  assert.equal(reconcileOcr({text:'Q1. Explain inheritance [8]',confidence:90},{text:'Q1. Explain inheritance [3]',confidence:.9}).status,'review');
});

test('NVIDIA OCR uses the OCR endpoint and parses text detections',async () => {
  let called = false;
  const fetchImpl = async (url,options) => {
    called = true;
    assert.match(url,/nemotron-ocr-v2$/);
    assert.equal(JSON.parse(options.body).merge_levels[0],'paragraph');
    return {ok:true,json:async () => ({data:[{text_detections:[{text_prediction:{text:'Q1. Define arrays [5]',confidence:.95}}]}]})};
  };
  const result = await nvidiaOcr(Buffer.from('png'),'test-key',fetchImpl);
  assert.equal(called,true);
  assert.match(result.text,/Define arrays/);
});

test('scanned PDF uses local Tesseract even if NVIDIA is unavailable',async () => {
  const canvas = createCanvas(1400,500);
  const context = canvas.getContext('2d');
  context.fillStyle='white'; context.fillRect(0,0,1400,500);
  context.fillStyle='black'; context.font='bold 42px Arial';
  context.fillText('Q1. Explain inheritance in Java [8]',45,115);
  const document = new jsPDF({unit:'pt',format:[700,250]});
  document.addImage(canvas.toBuffer('image/png'),'PNG',0,0,700,250);
  const pages = await extractPdfWithOcr(Buffer.from(document.output('arraybuffer')),{fetchImpl:async () => ({ok:false,status:503}),nvidiaKey:'test-key'});
  assert.equal(pages[0].source,'ocr');
  assert.match(pages[0].tesseract.text,/inheritance/i);
  assert.equal(pages[0].status,'review');
});
