'use client'

import { useState } from 'react'
import { motion, useDragControls } from 'framer-motion'
import { Calculator, X, GripHorizontal, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Parser } from 'expr-eval'

export function DraggableCalculator() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScientific, setIsScientific] = useState(false)
  const [display, setDisplay] = useState('0')
  const [equation, setEquation] = useState('')
  const dragControls = useDragControls()

  const handleNum = (num: string) => {
    if (display === '0') setDisplay(num)
    else setDisplay(display + num)
  }

  const handleOp = (op: string) => {
    setEquation(display + ' ' + op + ' ')
    setDisplay('0')
  }

  const handleEqual = () => {
    try {
      // Use expr-eval for safe mathematical expression parsing
      const fullExpression = equation + display
      const parser = new Parser()
      const result = parser.evaluate(fullExpression)
      setDisplay(String(result))
      setEquation('')
    } catch {
      setDisplay('Error')
    }
  }

  const handleClear = () => {
    setDisplay('0')
    setEquation('')
  }

  const handleScientific = (func: string) => {
    try {
      const val = parseFloat(display)
      let result = 0
      switch(func) {
        case 'sin': result = Math.sin(val); break;
        case 'cos': result = Math.cos(val); break;
        case 'tan': result = Math.tan(val); break;
        case 'log': result = Math.log10(val); break;
        case 'ln': result = Math.log(val); break;
        case 'sqrt': result = Math.sqrt(val); break;
        case 'sq': result = val * val; break;
      }
      setDisplay(String(result))
    } catch {
      setDisplay('Error')
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 rounded-full w-14 h-14 shadow-lg z-50 bg-slate-800 hover:bg-slate-700 text-white p-0 border-2 border-white/10"
      >
        <Calculator className="w-6 h-6" />
      </Button>
    )
  }

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.9, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`fixed bottom-24 left-6 z-50 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col ${isScientific ? 'w-80' : 'w-64'}`}
      style={{ touchAction: 'none' }}
    >
      {/* Header / Drag Handle */}
      <div 
        className="bg-slate-800 p-2 flex items-center justify-between cursor-grab active:cursor-grabbing border-b border-slate-700"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <GripHorizontal className="w-5 h-5 text-slate-400 mx-1" />
        <span className="text-xs font-semibold text-slate-300">Calculator</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="w-6 h-6 rounded-full hover:bg-slate-700 text-slate-400" onClick={() => setIsScientific(!isScientific)}>
            {isScientific ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="w-6 h-6 rounded-full hover:bg-red-500/20 hover:text-red-400 text-slate-400" onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Display */}
      <div className="p-4 bg-slate-900 text-right">
        <div className="text-slate-400 text-xs h-4 mb-1">{equation}</div>
        <div className="text-3xl font-mono text-white truncate">{display}</div>
      </div>

      {/* Keypad */}
      <div className="p-3 bg-slate-800 grid grid-cols-4 gap-2">
        {isScientific && (
          <div className="col-span-4 grid grid-cols-4 gap-2 mb-2 pb-2 border-b border-slate-700">
            {['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'sq', 'pi'].map(func => (
              <Button key={func} variant="secondary" className="h-8 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300" onClick={() => func === 'pi' ? setDisplay(String(Math.PI)) : handleScientific(func)}>
                {func === 'sqrt' ? '√' : func === 'sq' ? 'x²' : func === 'pi' ? 'π' : func}
              </Button>
            ))}
          </div>
        )}
        
        <Button variant="destructive" className="col-span-2 h-12 bg-red-500/20 text-red-400 hover:bg-red-500/30" onClick={handleClear}>AC</Button>
        <Button variant="secondary" className="h-12 bg-slate-700 hover:bg-slate-600 text-slate-200" onClick={() => setDisplay(display.length > 1 ? display.slice(0,-1) : '0')}>⌫</Button>
        <Button variant="secondary" className="h-12 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 font-mono text-lg" onClick={() => handleOp('/')}>÷</Button>
        
        {[7,8,9].map(n => <Button key={n} variant="ghost" className="h-12 bg-slate-900/50 hover:bg-slate-700 text-white font-mono text-lg" onClick={() => handleNum(String(n))}>{n}</Button>)}
        <Button variant="secondary" className="h-12 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 font-mono text-lg" onClick={() => handleOp('*')}>×</Button>
        
        {[4,5,6].map(n => <Button key={n} variant="ghost" className="h-12 bg-slate-900/50 hover:bg-slate-700 text-white font-mono text-lg" onClick={() => handleNum(String(n))}>{n}</Button>)}
        <Button variant="secondary" className="h-12 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 font-mono text-lg" onClick={() => handleOp('-')}>-</Button>
        
        {[1,2,3].map(n => <Button key={n} variant="ghost" className="h-12 bg-slate-900/50 hover:bg-slate-700 text-white font-mono text-lg" onClick={() => handleNum(String(n))}>{n}</Button>)}
        <Button variant="secondary" className="h-12 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 font-mono text-lg" onClick={() => handleOp('+')}>+</Button>
        
        <Button variant="ghost" className="col-span-2 h-12 bg-slate-900/50 hover:bg-slate-700 text-white font-mono text-lg" onClick={() => handleNum('0')}>0</Button>
        <Button variant="ghost" className="h-12 bg-slate-900/50 hover:bg-slate-700 text-white font-mono text-lg" onClick={() => handleNum('.')}>.</Button>
        <Button className="h-12 bg-indigo-500 hover:bg-indigo-600 text-white font-mono text-lg" onClick={handleEqual}>=</Button>
      </div>
    </motion.div>
  )
}
