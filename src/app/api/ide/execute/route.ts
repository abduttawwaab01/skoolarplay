import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, language, input } = body as { code: string; language?: string; input?: string }

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    // Limit code length to prevent abuse
    if (code.length > 10000) {
      return NextResponse.json({ error: 'Code exceeds maximum length (10000 chars)' }, { status: 400 })
    }

    // Handle Python execution via Piston API
    if (language === 'python') {
      try {
        const pistonResponse = await fetch('https://emkc.org/api/v2/piston/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: 'python3',
            version: '3.10',
            files: [{ content: code }],
            stdin: input || '',
          }),
        })

        if (!pistonResponse.ok) {
          return NextResponse.json({ error: 'Failed to execute Python code', logs: [] }, { status: 500 })
        }

        const pistonData = await pistonResponse.json()
        
        const logs: string[] = []
        if (pistonData.run?.stdout) {
          logs.push(...pistonData.run.stdout.split('\n').filter((l: string) => l.trim()))
        }
        if (pistonData.run?.stderr) {
          logs.push('Error: ' + pistonData.run.stderr)
        }

        return NextResponse.json({
          result: pistonData.run?.stdout?.trim() || null,
          logs,
          error: pistonData.run?.stderr || null,
        })
      } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to execute Python code', logs: [] }, { status: 500 })
      }
    }

    // JavaScript execution using Node.js sandbox
    const logs: string[] = []

    const sandbox: Record<string, any> = {
      console: {
        log: (...args: any[]) => {
          logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))
        },
        error: (...args: any[]) => {
          logs.push('Error: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))
        },
        warn: (...args: any[]) => {
          logs.push('Warn: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))
        },
        info: (...args: any[]) => {
          logs.push('Info: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))
        },
      },
      Math,
      Date,
      JSON,
      parse: JSON.parse,
      stringify: JSON.stringify,
      input,
      Array,
      Object,
      Number,
      String,
      Boolean,
    }

    const { Script, createContext } = await import('vm')
    const context = createContext(sandbox as any)

    let script: any
    try {
      script = new Script(code)
    } catch (err: any) {
      return NextResponse.json({ error: `Syntax error: ${err.message}`, logs: [] }, { status: 400 })
    }

    const timeoutMs = 1000
    let result: any = undefined
    let executionError: any = null

    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        executionError = new Error('Execution timeout: exceeded 1 second limit')
        resolve()
      }, timeoutMs)

      try {
        result = script.runInContext(context, {
          timeout: timeoutMs,
        })
      } catch (e) {
        executionError = e
      } finally {
        clearTimeout(timer)
        resolve()
      }
    })

    if (executionError) {
      return NextResponse.json({
        error: executionError instanceof Error ? executionError.message : String(executionError),
        logs,
        result: undefined,
      }, { status: 500 })
    }

    return NextResponse.json({
      result: typeof result === 'undefined' ? null : result,
      logs,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to execute code' }, { status: 500 })
  }
}
