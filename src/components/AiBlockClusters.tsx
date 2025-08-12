import React from 'react';
import { AiBlock } from '@/lib/textUtils';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface AiBlockClustersProps {
  clusters: AiBlock[];
  selectedParagraphs: Set<string>;
  onBlockSelect: (block: AiBlock, selected: boolean) => void;
}

export default function AiBlockClusters({ clusters, selectedParagraphs, onBlockSelect }: AiBlockClustersProps) {
  if (clusters.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-4 pt-4 mt-4 border-t">
       <h3 className="text-lg font-semibold">Tespit Edilen AI Blokları</h3>
      {clusters.map((block, i) => {
        // Check if all texts in block are selected
        const allSelected = block.texts.every(text => selectedParagraphs.has(text));
        const checkboxId = `block-${i}`;
        return (
          <div key={i} data-testid={`ai-block-${i}`} className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-800">Blok {block.start + 1}–{block.end + 1}</span>
               <div className="flex items-center space-x-2">
                <Checkbox
                  id={checkboxId}
                  checked={allSelected}
                  onCheckedChange={(checked) => onBlockSelect(block, !!checked)}
                />
                <Label htmlFor={checkboxId} className="cursor-pointer">Tümünü Seç</Label>
              </div>
            </div>
            <div className="space-y-2">
              {block.texts.map((text, j) => (
                <p key={j} className="text-sm text-gray-700 bg-yellow-100 p-2 rounded">{text}</p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
} 