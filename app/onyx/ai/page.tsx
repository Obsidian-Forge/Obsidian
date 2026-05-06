// app/onyx/ai/page.tsx
// ONYX AI - Profesyonel Kod ve Döküman Asistanı

'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  file?: { name: string; type: string; size: number };
}

export default function OnyxAI() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'ONYX AI hazır. Sana nasıl yardımcı olabilirim?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedFile]);

  const shortenFileName = (name: string, maxLen: number = 25): string => {
    if (name.length <= maxLen) return name;
    const ext = name.split('.').pop();
    const base = name.substring(0, name.lastIndexOf('.'));
    return base.substring(0, maxLen - ext!.length - 3) + '...' + ext;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isCodeBlock = (content: string): boolean => {
    return content.includes('```') || 
           content.includes('<!DOCTYPE') || 
           content.includes('<html') ||
           content.includes('import ') ||
           content.includes('const ') ||
           content.includes('function ') ||
           content.includes('export ') ||
           content.includes('class ') ||
           content.includes('@app');
  };

  const getContentType = (content: string): string => {
    const lower = content.toLowerCase();
    if (lower.includes('```html') || lower.includes('<!doctype') || lower.includes('<html')) return 'HTML';
    if (lower.includes('```css') || lower.includes('{') && lower.includes(':')) return 'CSS';
    if (lower.includes('```tsx') || lower.includes('```typescript')) return 'TypeScript';
    if (lower.includes('```jsx') || lower.includes('```javascript')) return 'JavaScript';
    if (lower.includes('```python') || lower.includes('import ') && lower.includes('def ')) return 'Python';
    if (lower.includes('```sql') || lower.includes('select ') || lower.includes('create table')) return 'SQL';
    if (lower.includes('```json') || lower.includes('"')) return 'JSON';
    if (lower.includes('```bash') || lower.includes('npm ') || lower.includes('git ')) return 'Terminal';
    if (lower.includes('```')) return 'Code';
    return 'Code';
  };

  const cleanCode = (content: string): string => {
    return content.replace(/```[\w]*\n?/g, '').replace(/```/g, '').trim();
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(cleanCode(text));
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadContent = (content: string, type: string) => {
    const extensions: Record<string, string> = {
      HTML: 'html', CSS: 'css', TypeScript: 'tsx', JavaScript: 'jsx',
      Python: 'py', SQL: 'sql', JSON: 'json', Terminal: 'sh', Code: 'txt',
    };
    const ext = extensions[type] || 'txt';
    const blob = new Blob([cleanCode(content)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onyx-output.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedFile) || loading) return;

    const userMsg: Message = { 
      role: 'user', 
      content: input || '[Dosya gönderildi]',
      file: selectedFile ? { name: selectedFile.name, type: selectedFile.type, size: selectedFile.size } : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setLoading(true);

    try {
      const response = await fetch('/api/onyx-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Cevap alınamadı.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Bağlantı hatası.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      
      {/* LOGO */}
      <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <Image src="/ai.svg" alt="Onyx" width={18} height={18} style={{ filter: 'brightness(0) invert(1)' }} />
        </div>
        <span className="text-sm font-light tracking-[6px] text-black">ONYX AI</span>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-6 pt-20 pb-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, i) => {
            const contentType = getContentType(msg.content);
            const showCodeWindow = msg.role === 'assistant' && isCodeBlock(msg.content);
            
            return (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={msg.role === 'user' ? 'max-w-[85%]' : 'w-full'}>
                  
                  {/* User */}
                  {msg.role === 'user' && (
                    <div className="bg-black text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm font-light leading-relaxed inline-block max-w-full">
                      {msg.file && (
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/20 text-xs opacity-80">
                          <span>📎 {shortenFileName(msg.file.name)}</span>
                          <span className="opacity-50">{formatFileSize(msg.file.size)}</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  )}

                  {/* AI Kod Penceresi */}
                  {msg.role === 'assistant' && showCodeWindow && (
                    <div className="bg-[#1e1e1e] border border-[#333] rounded-xl overflow-hidden shadow-lg">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-[#2d2d2d] border-b border-[#333]">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-[#ff5f57] cursor-pointer hover:brightness-110" />
                            <div className="w-3 h-3 rounded-full bg-[#febc2e] cursor-pointer hover:brightness-110" />
                            <div className="w-3 h-3 rounded-full bg-[#28c840] cursor-pointer hover:brightness-110" />
                          </div>
                          <span className="text-[10px] text-[#888] ml-3 tracking-[2px] uppercase font-mono">
                            {contentType}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => copyToClipboard(msg.content, i)}
                            className="text-[10px] text-[#888] hover:text-white tracking-[2px] px-3 py-1.5 rounded transition-colors font-mono"
                          >
                            {copiedIndex === i ? '✓ COPIED' : '📋 COPY'}
                          </button>
                          <button
                            onClick={() => downloadContent(msg.content, contentType)}
                            className="text-[10px] text-[#888] hover:text-white tracking-[2px] px-3 py-1.5 rounded transition-colors font-mono"
                          >
                            ⬇ DOWNLOAD
                          </button>
                        </div>
                      </div>
                      <div className="p-5 text-sm font-mono text-[#d4d4d4] leading-relaxed overflow-x-auto whitespace-pre-wrap bg-[#1e1e1e]">
                        {cleanCode(msg.content)}
                      </div>
                    </div>
                  )}

                  {/* AI Normal Mesaj */}
                  {msg.role === 'assistant' && !showCodeWindow && (
                    <div className="text-[#444] text-sm font-light leading-relaxed px-1 whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {loading && (
            <div className="flex items-center gap-2 text-[#bbb] text-xs tracking-[4px] pl-1">
              <span className="w-1.5 h-1.5 bg-[#ccc] rounded-full animate-pulse" />
              ONYX DÜŞÜNÜYOR...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* FILE PREVIEW */}
      {selectedFile && (
        <div className="max-w-3xl mx-auto w-full px-6 pb-2">
          <div className="flex items-center gap-3 bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl px-4 py-2">
            <span className="text-sm">📄</span>
            <span className="text-sm text-[#333] font-light flex-1">{shortenFileName(selectedFile.name, 30)}</span>
            <span className="text-[11px] text-[#bbb]">{formatFileSize(selectedFile.size)}</span>
            <button onClick={removeFile} className="text-[#bbb] hover:text-red-500 text-lg leading-none">×</button>
          </div>
        </div>
      )}

      {/* INPUT */}
      <div className="max-w-3xl mx-auto w-full px-6 pb-6">
        <div className="flex items-center gap-2 bg-[#f5f5f5] border border-[#e5e5e5] rounded-full px-2
                        focus-within:border-[#bbb] focus-within:bg-[#eee] transition-all">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#bbb] hover:text-black transition-colors flex-shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
          <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesaj yaz..."
            className="flex-1 bg-transparent text-black text-sm font-light py-3 focus:outline-none placeholder:text-[#ccc]"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || (!input.trim() && !selectedFile)}
            className="w-9 h-9 rounded-full bg-black flex items-center justify-center hover:bg-[#333] transition-all flex-shrink-0 disabled:opacity-20"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}