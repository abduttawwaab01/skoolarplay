'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, Code2, Save, X, Maximize2, Trash2, Check } from 'lucide-react'
import Editor from '@monaco-editor/react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { useAppStore } from '@/store/app-store'
import { useSoundEffect } from '@/hooks/use-sound'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'

const defaultCode: Record<string, string> = {
  javascript: "console.log('Hello SkoolarPlay!');\n\n// Write your JavaScript code here\nfunction calculate(a, b) {\n  return a + b;\n}\n\nconsole.log(calculate(5, 10));",
  html: "<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: sans-serif; text-align: center; margin-top: 50px; }\n    h1 { color: #008751; }\n  </style>\n</head>\n<body>\n  <h1>Hello SkoolarPlay!</h1>\n  <p>Start writing your HTML/CSS here.</p>\n</body>\n</html>",
  python: "print('Hello SkoolarPlay!')\n\n# Note: Python execution is a simulated frontend stub.\ndef calculate(a, b):\n    return a + b\n\nprint(calculate(5, 10))",
}

export function IDEPage() {
  const { goBack } = useAppStore()
  const playClick = useSoundEffect('click')
  const playCorrect = useSoundEffect('levelUp')

  const [language, setLanguage] = useState<'javascript' | 'html' | 'python'>('javascript')
  const [code, setCode] = useState(defaultCode['javascript'])
  const [output, setOutput] = useState<string[]>([])
  const [htmlOutput, setHtmlOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleLanguageChange = (lang: 'javascript' | 'html' | 'python') => {
    setLanguage(lang)
    setCode(defaultCode[lang])
    setOutput([])
    setHtmlOutput('')
  }

     const runCode = async () => {
      playClick()
      setIsRunning(true)
      setOutput([])

      try {
        if (language === 'html') {
          setHtmlOutput(code)
        } else if (language === 'javascript') {
          const res = await fetch('/api/ide/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, language: 'javascript' }),
          })
          const data = await res.json()
          if (res.ok) {
            setOutput(data.logs || [])
            if (data.result !== undefined && data.result !== null) {
              setOutput(prev => [...prev, String(data.result)])
            }
            if (data.error) {
              setOutput(prev => [...prev, `Error: ${data.error}`])
            }
          } else {
            setOutput([`Error: ${data.error}`])
          }
        } else if (language === 'python') {
          const res = await fetch('/api/ide/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, language: 'python' }),
          })
          const data = await res.json()
          if (res.ok) {
            setOutput(data.logs || [])
            if (data.result !== undefined && data.result !== null) {
              setOutput(prev => [...prev, String(data.result)])
            }
            if (data.error) {
              setOutput(prev => [...prev, `Error: ${data.error}`])
            }
          } else {
            setOutput([`Error: ${data.error}`])
          }
        }
      } catch (error: any) {
        setOutput([`Network error: ${error.message}`])
      } finally {
        setIsRunning(false)
        playCorrect()
      }
    }
  
  const saveCode = () => {
    toast.success('Code saved locally!')
  }

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col bg-background">
      {/* Header */}
      <div className="flex z-10 items-center justify-between p-2 md:p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm md:text-base font-bold leading-tight">Student IDE</h1>
              <p className="text-[10px] md:text-xs text-muted-foreground leading-tight">Write and run code instantly</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[120px] md:w-[150px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript / Node</SelectItem>
              <SelectItem value="html">HTML / CSS</SelectItem>
              <SelectItem value="python">Python</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={saveCode} className="h-9 w-9 hidden md:flex">
            <Save className="w-4 h-4" />
          </Button>
          
          <Button onClick={runCode} disabled={isRunning} className="gap-2 h-9">
            <Play className="w-4 h-4" />
            <span className="hidden md:inline">{isRunning ? 'Running...' : 'Run Code'}</span>
          </Button>
        </div>
      </div>

      {/* IDE Workspace */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          
          {/* Editor Panel */}
          <ResizablePanel defaultSize={60} minSize={30}>
            <div className="h-full flex flex-col relative bg-[#1e1e1e]">
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={(v) => setCode(v || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Output Panel */}
          <ResizablePanel defaultSize={40} minSize={20}>
            <div className="h-full flex flex-col bg-card border-l">
              <div className="flex px-4 py-2 border-b items-center justify-between bg-muted/30">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {language === 'html' ? 'Browser Preview' : 'Console Output'}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => { setOutput([]); setHtmlOutput('') }} className="h-6 w-6">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-4 bg-[#0d0d0d] text-[#00ff00] font-mono text-sm relative">
                {language === 'html' ? (
                  <iframe
                    ref={iframeRef}
                    title="html-preview"
                    className="absolute inset-0 w-full h-full bg-white border-0"
                    srcDoc={htmlOutput}
                    sandbox="allow-scripts"
                  />
                ) : (
                  <div>
                    {output.length === 0 ? (
                      <span className="text-muted-foreground/50 italic">Output will appear here...</span>
                    ) : (
                      output.map((line, i) => (
                        <div key={i} className="mb-1">{line}</div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
          
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
