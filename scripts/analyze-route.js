const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'courses', 'english-a1', 'route.ts')
const content = fs.readFileSync(filePath, 'utf8')

console.log('========== ANALYZING ENGLISH A1 ==========\n')
console.log('File size:', content.length, 'bytes')

// Count module titles
const moduleTitles = content.match(/"title":\s*"[^"]+"/g)
console.log('Module title strings (JSON style):', moduleTitles ? moduleTitles.length : 0)

// Count lesson titles (property title: "...")
const lessonTitles = content.match(/title:\s*"[^"]+"/g)
console.log('Lesson title strings (JS style):', lessonTitles ? lessonTitles.length : 0)

// Count question types
const questionTypes = content.match(/type:\s*"(MCQ|FILL_BLANK|TRUE_FALSE|MATCHING|ORDERING|CHECKBOX|SPEECH)"/g)
console.log('Question entries:', questionTypes ? questionTypes.length : 0)

// Try to extract the data object
const dataStart = content.indexOf('const englishA1CourseData = {')
if (dataStart === -1) {
  console.log('\nData object "englishA1CourseData" not found')
} else {
  console.log('\nData object starts at index:', dataStart)
  
  // Extract from dataStart to end of file, then find the closing brace of the object
  const afterData = content.substring(dataStart)
  
  // Find the end of the object by brace matching
  let braceCount = 0
  let inString = false
  let stringChar = null
  let i = 0
  
  // Skip the variable assignment part
  const objStart = afterData.indexOf('{')
  if (objStart === -1) {
    console.log('Object start not found')
    return
  }
  
  braceCount = 1
  i = objStart + 1
  
  while (i < afterData.length && braceCount > 0) {
    const char = afterData[i]
    
    if (inString) {
      if (char === stringChar && afterData[i-1] !== '\\') {
        inString = false
      }
    } else {
      if (char === '"' || char === "'" || char === '`') {
        inString = true
        stringChar = char
      } else if (char === '{') {
        braceCount++
      } else if (char === '}') {
        braceCount--
      }
    }
    i++
  }
  
  const dataString = afterData.substring(objStart, i)
  console.log('Extracted data length:', dataString.length)
  
  // Try to evaluate
  try {
    // Remove trailing commas which are invalid in strict JSON but valid in JS
    const cleaned = dataString.replace(/,\s*([}\]])/g, '$1')
    const data = new Function(`return (${cleaned});`)()
    
    console.log('\n========== EXTRACTED DATA ==========')
    console.log('Course title:', data.course.title)
    console.log('Course description:', data.course.description.substring(0, 50) + '...')
    console.log('Difficulty:', data.course.difficulty)
    console.log('Level:', data.course.minimumLevel)
    console.log('Number of modules:', data.modules.length)
    
    let totalLessons = 0
    let totalQuestions = 0
    data.modules.forEach((mod, mi) => {
      totalLessons += mod.lessons.length
      mod.lessons.forEach(lesson => {
        totalQuestions += lesson.questions.length
      })
    })
    
    console.log('Total lessons:', totalLessons)
    console.log('Total questions:', totalQuestions)
    console.log('Average questions per lesson:', (totalQuestions / totalLessons).toFixed(1))
    
    // Save as JSON
    const jsonPath = path.join(__dirname, '..', 'src', 'data', 'courses', 'english-a1.json')
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2))
    console.log('\n✅ Saved to english-a1.json')
    
  } catch (e) {
    console.log('Error evaluating data:', e.message)
    console.log('Data preview:', dataString.substring(0, 200))
  }
}
