import axios from 'axios';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { generateCode } from '../api/ai-model/route';
import Constants from '../data/Constants';
import CodeEditor from './CodeEditor';
import SelectionDetail from './SelectionDetail';

export interface RECORD {
  id: number;
  description: string;
  code: any;
  imageUrl: string;
  model: string;
  createdBy: string;
  uid: string;
}

function ViewCode() {
  const { uid } = useParams();
  const [loading, setLoading] = useState(false);
  const [codeResp, setCodeResp] = useState('');
  const [record, setRecord] = useState<RECORD | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (uid) {
      getRecordInfo();
    }
  }, [uid]);

  const getRecordInfo = async (regen = false) => {
    console.log("Getting record info...");
    setIsReady(false);
    setCodeResp('');
    setLoading(true);

    try {
      // In a real app, this would be your API call to get the record info
      // For now, we'll simulate a response
      const response = await axios.get(`/api/wireframe-to-code?uid=${uid}`);
      const data = response.data;
      setRecord(data);

      if (data?.code == null || regen) {
        generateCodeFromRecord(data);
      } else {
        setCodeResp(data?.code?.resp);
        setLoading(false);
        setIsReady(true);
      }
    } catch (error) {
      console.error("Error fetching record:", error);
      setLoading(false);
    }
  };

  const generateCodeFromRecord = async (record: RECORD) => {
    setLoading(true);
    try {
      const prompt = record?.description + ":" + Constants.PROMPT;
      
      // Call our API function directly instead of using fetch
      const response = await generateCode(record.model, prompt, record?.imageUrl);
      
      setLoading(false);
      
      // Process the stream response
      const decoder = new TextDecoder();
      let text = '';
      
      // Read and process each chunk from the stream
      for await (const chunk of response) {
        const content = chunk.choices?.[0]?.delta?.content || "";
        text += content;
        setCodeResp(text
          .replace('```jsx', '')
          .replace('```javascript', '')
          .replace('javascript', '')
          .replace('jsx', '')
          .replace('```', '')
        );
      }
      
      setIsReady(true);
      
      // Only update if we have a UID and code is not present
      if (text && record?.uid && record?.code == null) {
        updateCodeToDb(text);
      }
    } catch (error) {
      console.error("Error generating code:", error);
      setLoading(false);
    }
  };

  const updateCodeToDb = async (code: string) => {
    if (!record) return;
    
    try {
      // Here you would update the code in your database
      const result = await axios.put('/api/wireframe-to-code', {
        uid: record.uid,
        codeResp: { resp: code }
      });
      console.log("Code updated:", result);
    } catch (error) {
      console.error("Error updating code:", error);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-5 p-5 gap-10">
        <div>
          {/* Selection Details */}
          <SelectionDetail 
            record={record} 
            regenrateCode={() => getRecordInfo(true)}
            isReady={isReady}
          />
        </div>
        <div className="col-span-4">
          {/* Code Editor */}
          {loading ? (
            <div>
              <h2 className="font-bold text-2xl text-center p-20 flex items-center justify-center bg-slate-100 h-[80vh] rounded-xl">
                <Loader2 className="animate-spin mr-2" /> Analyzing the Wireframe...
              </h2>
            </div>
          ) : (
            <CodeEditor codeResp={codeResp} isReady={isReady} />
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewCode; 