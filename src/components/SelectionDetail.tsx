import { RefreshCcw } from 'lucide-react';
import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { RECORD } from './ViewCode';

interface SelectionDetailProps {
  record: RECORD | null;
  regenrateCode: () => void;
  isReady: boolean;
}

function SelectionDetail({ record, regenrateCode, isReady }: SelectionDetailProps) {
  if (!record) return null;

  return (
    <div className='p-5 bg-gray-100 rounded-lg'>
      <h2 className='font-bold my-2'>Wireframe</h2>
      <img 
        src={record?.imageUrl} 
        alt='Wireframe' 
        className='rounded-lg object-contain h-[200px] w-full border border-dashed p-2 bg-white'
      />

      <h2 className='font-bold mt-4 mb-2'>AI Model</h2>
      <Input defaultValue={record?.model} disabled={true} className='bg-white' />

      <h2 className='font-bold mt-4 mb-2'>Description</h2>
      <Textarea 
        defaultValue={record?.description}
        disabled={true}
        className='bg-white h-[180px]' 
      />

      <Button 
        className='mt-7 w-full' 
        disabled={!isReady} 
        onClick={regenrateCode}
      >
        <RefreshCcw className="mr-2 h-4 w-4" /> Regenerate Code
      </Button>
    </div>
  );
}

export default SelectionDetail; 