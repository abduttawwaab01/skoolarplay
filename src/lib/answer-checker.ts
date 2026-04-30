export type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'FILL_BLANK' | 'CHECKBOX' | 'DRAG_DROP' | 'MATCHING' | 'ORDERING' | 'SPEECH' | string

export function compareAnswers(
  type: QuestionType,
  submittedAnswer: string,
  correctAnswerData: string
): boolean {
  const typeUpper = type.toUpperCase()

  if (typeUpper === 'MCQ') {
    const submitted = submittedAnswer.toLowerCase().trim()
    const correct = String(correctAnswerData).toLowerCase().trim()
    return submitted === correct
  }

  if (typeUpper === 'TRUE_FALSE') {
    const submitted = submittedAnswer.toLowerCase().trim()
    const correct = String(correctAnswerData).toLowerCase().trim()
    return submitted === correct
  }

  if (typeUpper === 'FILL_BLANK') {
    const submitted = submittedAnswer.trim().toLowerCase()
    const correct = String(correctAnswerData).trim().toLowerCase()
    return submitted === correct
  }

  if (typeUpper === 'CHECKBOX') {
    let correctAnswers: string[] = []
    try {
      const parsed = JSON.parse(correctAnswerData)
      if (Array.isArray(parsed)) {
        correctAnswers = parsed.map(a => String(a).toLowerCase().trim())
      } else {
        correctAnswers = [String(parsed).toLowerCase().trim()]
      }
    } catch {
      correctAnswers = [correctAnswerData.toLowerCase().trim()]
    }

    let submittedAnswers: string[] = []
    try {
      const parsed = JSON.parse(submittedAnswer)
      if (Array.isArray(parsed)) {
        submittedAnswers = parsed.map(a => String(a).toLowerCase().trim())
      } else {
        submittedAnswers = [String(parsed).toLowerCase().trim()]
      }
    } catch {
      submittedAnswers = [submittedAnswer.toLowerCase().trim()]
    }

    if (submittedAnswers.length !== correctAnswers.length) {
      return false
    }

    const correctSet = new Set(correctAnswers)
    return submittedAnswers.every(a => correctSet.has(a))
  }

  if (typeUpper === 'ORDERING') {
    let correctOrder: string[] = []
    try {
      const parsed = JSON.parse(correctAnswerData)
      if (Array.isArray(parsed)) {
        correctOrder = parsed.map(a => String(a).toLowerCase().trim())
      } else {
        correctOrder = [String(parsed).toLowerCase().trim()]
      }
    } catch {
      correctOrder = [correctAnswerData.toLowerCase().trim()]
    }

    let submittedOrder: string[] = []
    try {
      const parsed = JSON.parse(submittedAnswer)
      if (Array.isArray(parsed)) {
        submittedOrder = parsed.map(a => String(a).toLowerCase().trim())
      } else {
        submittedOrder = [String(parsed).toLowerCase().trim()]
      }
    } catch {
      submittedOrder = [submittedAnswer.toLowerCase().trim()]
    }

    if (submittedOrder.length !== correctOrder.length) {
      return false
    }

    return submittedOrder.every((item, index) => item === correctOrder[index])
  }

  if (typeUpper === 'DRAG_DROP') {
    let correctSlots: string[] = []
    try {
      const parsed = JSON.parse(correctAnswerData)
      if (Array.isArray(parsed)) {
        correctSlots = parsed.map(a => String(a).toLowerCase().trim())
      } else {
        correctSlots = [String(parsed).toLowerCase().trim()]
      }
    } catch {
      correctSlots = [correctAnswerData.toLowerCase().trim()]
    }

    let submittedSlots: string[] = []
    try {
      const parsed = JSON.parse(submittedAnswer)
      if (Array.isArray(parsed)) {
        submittedSlots = parsed.map(a => String(a).toLowerCase().trim())
      } else {
        submittedSlots = [String(parsed).toLowerCase().trim()]
      }
    } catch {
      submittedSlots = [submittedAnswer.toLowerCase().trim()]
    }

    if (submittedSlots.length !== correctSlots.length) {
      return false
    }

    return submittedSlots.every((item, index) => item === correctSlots[index])
  }

  if (typeUpper === 'MATCHING') {
    let correctPairs: Array<{ left: string; right: string }> = []
    try {
      const parsed = JSON.parse(correctAnswerData)
      if (Array.isArray(parsed)) {
        correctPairs = parsed.map((p: any) => ({
          left: String(p.left || '').toLowerCase().trim(),
          right: String(p.right || '').toLowerCase().trim(),
        }))
      }
    } catch {
      correctPairs = []
    }

    let submittedPairs: Array<{ left: string; right: string }> = []
    try {
      const parsed = JSON.parse(submittedAnswer)
      if (Array.isArray(parsed)) {
        submittedPairs = parsed.map((p: any) => ({
          left: String(p.left || '').toLowerCase().trim(),
          right: String(p.right || '').toLowerCase().trim(),
        }))
      }
    } catch {
      submittedPairs = []
    }

    if (submittedPairs.length !== correctPairs.length) {
      return false
    }

    return submittedPairs.every((submittedPair) =>
      correctPairs.some(
        (correctPair) =>
          submittedPair.left === correctPair.left &&
          submittedPair.right === correctPair.right
      )
    )
  }

  if (typeUpper === 'SPEECH') {
    const submitted = submittedAnswer.toLowerCase().trim()
    const expected = String(correctAnswerData).toLowerCase().trim()
    
    if (submitted === expected) {
      return true
    }

    const normalizeString = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim()

    const normalizedSubmitted = normalizeString(submitted)
    const normalizedExpected = normalizeString(expected)

    if (normalizedSubmitted === normalizedExpected) {
      return true
    }

    const wordsExpected = new Set(normalizedExpected.split(' ').filter(w => w.length > 2))
    const wordsSubmitted = normalizedSubmitted.split(' ').filter(w => w.length > 2)

    if (wordsExpected.size === 0) return false

    const matchingWords = wordsSubmitted.filter(w => wordsExpected.has(w))
    const matchRatio = matchingWords.length / wordsExpected.size

    return matchRatio >= 0.8
  }

  return submittedAnswer === String(correctAnswerData)
}

export function parseCorrectAnswer(correctAnswerData: string): any {
  try {
    return JSON.parse(correctAnswerData)
  } catch {
    return correctAnswerData
  }
}
