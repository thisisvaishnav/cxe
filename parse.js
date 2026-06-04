import fs from 'fs';

const rawData = fs.readFileSync('/Users/bombermac/.gemini/antigravity/brain/21fa3771-9b07-49fc-998d-cf29a66e5c00/scratch/notion_raw.json', 'utf8');
const data = JSON.parse(rawData);

const blocks = data.recordMap.block;

function getTitle(blockVal) {
  const title = blockVal.properties?.title;
  if (!title) return '';
  return title.map(t => t[0]).join('');
}

function getBlockContent(val) {
  if (val.type === 'code') {
    return val.properties?.title?.map(t => t[0]).join('') || '';
  }
  return getTitle(val);
}

function printBlockAndChildren(id, indent = '') {
  const block = blocks[id];
  if (!block) {
    console.log(`${indent}[MISSING] (ID: ${id})`);
    return;
  }
  const val = block.value?.value;
  if (!val) {
    console.log(`${indent}[EMPTY_VAL] (ID: ${id})`);
    return;
  }
  
  console.log(`${indent}[${val.type}] (ID: ${id}): ${getBlockContent(val)}`);
  
  const content = val.content;
  if (content && content.length > 0) {
    for (const childId of content) {
      printBlockAndChildren(childId, indent + '  ');
    }
  }
}

// Main page ID
const pageId = '35d46b36-b2e9-80e8-bbad-e451e894fd76';
printBlockAndChildren(pageId);
