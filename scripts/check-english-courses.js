const fs = require('fs')
const path = require('path')

const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']

console.log('========== CHECKING ENGLISH COURSES ==========\n')

levels.forEach(level => {
  const filePath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'courses', `english-${level}`, 'route.ts')
  
  if (!fs.existsSync(filePath)) {
    console.log(`english-${level}: File not found`)
    return
  }
  
  const content = fs.readFileSync(filePath, 'utf8')
  const fileSize = content.length
  
  // Count modules
  const moduleMatches = content.match(/title:\s*"[^"]+"/g) || []
  // Count lessons (title: "..." in lessons array)
  const lessonMatches = content.match(/title:\s*"[^"]+"/g) || []
  // Count questions by type
  const questionMatches = content.match(/type:\s*"(MCQ|FILL_BLANK|TRUE_FALSE|MATCHING|ORDERING|CHECKBOX|SPEECH)"/g) || []
  
  console.log(`english-${level}:`)
  console.log(`  File size: ${(fileSize/1024).toFixed(1)}KB`)
  console.log(`  Module/lesson strings: ${moduleMatches.length}`)
  console.log(`  Question entries: ${questionMatches.length}`)
  
  // Try to extract actual data
  const dataStart = content.indexOf(`english${level.charAt(0).toUpperCase() + level.slice(1)}CourseData = {`)
  if (dataStart === -1) {
    console.log(`  Data object not found`)
  } else {
    console.log(`  Data object found at index: ${dataStart}`)
  }
  console.log('')
})
