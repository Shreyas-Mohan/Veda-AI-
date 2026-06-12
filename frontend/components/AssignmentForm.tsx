'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAssignmentStore } from '../store/useAssignmentStore';

import { FileUp, BookOpen, Clock, X, Loader2 } from 'lucide-react';

export default function AssignmentForm() {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setAssignmentId, setStatus } = useAssignmentStore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    dueDate: '',
    questionTypes: [] as string[],
    totalQuestions: 10,
    totalMarks: 50,
    instructions: '',
    pdfText: ''
  });

  const questionTypeOptions = ['Multiple Choice', 'Short Answer', 'Long Answer'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setAssignmentId(data._id);
      setStatus('pending');
      router.push(`/assignment/${data._id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      questionTypes: prev.questionTypes.includes(type)
        ? prev.questionTypes.filter(t => t !== type)
        : [...prev.questionTypes, type]
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    // For text files, read content directly
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, pdfText: e.target?.result as string || '' }));
      };
      reader.readAsText(file);
    } else {
      // Mock for PDF: usually you'd parse PDF on server or client using pdf.js
      setFormData(prev => ({ ...prev, pdfText: `[Extracted text from ${file.name}]` }));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        const fakeEvent = { target: fileInputRef.current } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleFileUpload(fakeEvent);
      }
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
      
      {/* Header */}
      <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-[22px] font-semibold text-gray-900 tracking-tight">Create Assessment</h2>
        <div className="flex gap-2">
           <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
           </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        
        {/* Top Two Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* File Upload Section */}
            <div className="space-y-4">
                <label className="block text-[15px] font-medium text-gray-800 flex items-center gap-2">
                    <FileUp className="w-4 h-4 text-blue-500" />
                    Upload Syllabus / Material (PDF/Txt)
                </label>
                
                <input 
                  type="file" 
                  accept=".txt,.pdf" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload} 
                />
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer group h-[140px] 
                  ${fileName ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'}`}
                >
                    <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-105 transition-transform">
                        <FileUp className={`w-5 h-5 ${fileName ? 'text-blue-500' : 'text-gray-400'}`} />
                    </div>
                    {fileName ? (
                      <span className="text-sm font-medium text-blue-700 truncate max-w-[90%]">{fileName}</span>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-blue-600">Click to upload</span>
                        <span className="text-xs text-gray-400 mt-1">or drag and drop text files</span>
                      </>
                    )}
                </div>
                <textarea 
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm text-gray-900 placeholder:text-gray-400 resize-none bg-white"
                    placeholder="Alternatively, paste syllabus text here..."
                    value={formData.pdfText}
                    onChange={e => setFormData({ ...formData, pdfText: e.target.value })}
                />
            </div>

            {/* Assessment Details */}
            <div className="space-y-6">
                <div>
                    <label className="block text-[15px] font-medium text-gray-800 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        Due Date
                    </label>
                    <input 
                        type="date" 
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-900 bg-white shadow-sm"
                        value={formData.dueDate}
                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-[15px] font-medium text-gray-800 mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-purple-500" />
                        Question Types
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                    {questionTypeOptions.map(type => {
                        const isSelected = formData.questionTypes.includes(type);
                        return (
                            <button
                                type="button"
                                key={type}
                                onClick={() => handleTypeToggle(type)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border-2 ${
                                    isSelected 
                                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm' 
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {type}
                            </button>
                        );
                    })}
                    </div>
                </div>
            </div>
        </div>

        <div className="h-px bg-gray-100 w-full my-6"></div>

        {/* Second Row: Marks, Questions, Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="md:col-span-1 border border-gray-200 rounded-lg p-5 bg-white shadow-sm place-content-center">
                <label className="block text-sm font-semibold text-gray-600 mb-1 text-center">Total Questions</label>
                <div className="flex items-center justify-center">
                    <input 
                        type="number" 
                        min="1"
                        required
                        className="w-20 text-center font-bold text-3xl text-gray-900 border-none bg-transparent focus:ring-0 p-0"
                        value={formData.totalQuestions}
                        onChange={e => setFormData({ ...formData, totalQuestions: Number(e.target.value) })}
                    />
                </div>
            </div>

            <div className="md:col-span-1 border border-gray-200 rounded-lg p-5 bg-white shadow-sm place-content-center">
                <label className="block text-sm font-semibold text-gray-600 mb-1 text-center">Total Marks</label>
                <div className="flex items-center justify-center">
                    <input 
                        type="number"
                        min="1"
                        required
                        className="w-20 text-center font-bold text-3xl text-gray-900 border-none bg-transparent focus:ring-0 p-0"
                        value={formData.totalMarks}
                        onChange={e => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                    />
                </div>
            </div>

            <div className="md:col-span-2">
                <label className="block text-[15px] font-medium text-gray-800 mb-2">Additional Instructions</label>
                <textarea 
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm text-gray-900 placeholder:text-gray-400 resize-none shadow-sm bg-white"
                    placeholder="Add specific instructions for generation (e.g. Include case studies, focus on practical scenarios...)"
                    value={formData.instructions}
                    onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                />
            </div>
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end">
            <button 
                type="submit" 
                disabled={loading || formData.questionTypes.length === 0}
                className="bg-blue-600 text-white rounded-lg px-8 py-3.5 font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_4px_14px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.3)] flex items-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating Paper...
                    </>
                ) : 'Generate Question Paper'}
            </button>
        </div>

      </form>
    </div>
  );
}