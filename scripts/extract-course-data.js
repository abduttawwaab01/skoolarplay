// Extract course data from route.ts files and save as JSON
const fs = require('fs')
const path = require('path')

const coursesToExtract = [
  'yoruba-a1', 'yoruba-a2', 'yoruba-b1', 'yoruba-b2', 'yoruba-c1', 'yoruba-c2',
  'hausa-a1', 'hausa-a2', 'hausa-b1', 'hausa-b2', 'hausa-c1', 'hausa-c2',
  'english-a1', 'english-a2', 'english-b1', 'english-b2', 'english-c1', 'english-c2',
  'spanish-a1', 'spanish-a2', 'spanish-b1', 'spanish-b2', 'spanish-c1', 'spanish-c2',
  'german-a1', 'german-a2', 'german-b1', 'german-b2', 'german-c1', 'german-c2',
  'arabic-a1', 'arabic-a2', 'arabic-b1', 'arabic-b2', 'arabic-c1', 'arabic-c2',
  'portuguese-a1', 'portuguese-a2', 'portuguese-b1', 'portuguese-b2', 'portuguese-c1', 'portuguese-c2',
  'igbo-a1', 'igbo-a2', 'igbo-b1', 'igbo-b2', 'igbo-c1', 'igbo-c2',
  'swahili-a1', 'swahili-a2', 'swahili-b1', 'swahili-b2', 'swahili-c1', 'swahili-c2'
]

function extractCourseData(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    
    // Find the course data object - look for "const xxxCourseData = {" pattern
    const match = content.match(/(?:const\ \w+CourseData|const\ courseData)\s*=\s*(\{[\s\S]*?\});(?:\s*\n\s*export)?/)
    
    if (!match) {
      console.log(`  Could not find course data in ${filePath}`)
      return null
    }
    
    // Try to evaluate the object
    try {
      // Use Function constructor to evaluate the object literal
      const data = new Function(`return (${match[1]});`)()
      return data
    } catch (e) {
      console.log(`  Error evaluating data: ${e.message}`)
      return null
    }
  } catch (error) {
    console.log(`  Error reading ${filePath}: ${error.message}`)
    return null
  }
}

function ensureFullCourseData(courseName, data) {
  if (!data || !data.modules) return null
  
  // Check if we have full data (20 modules, ~10 lessons each)
  if (data.modules.length < 5) {
    console.log(`  Warning: ${courseName} has only ${data.modules.length} modules`)
  }
  
  return data
}

console.log('========== EXTRACTING COURSE DATA ==========\n')

coursesToExtract.forEach(courseName => {
  console.log(`Extracting: ${courseName}...`)
  
  const routePath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'courses', courseName, 'route.ts')
  
  if (!fs.existsSync(routePath)) {
    console.log(`  File not found: ${routePath}`)
    return
  }
  
  const data = extractCourseData(routePath)
  
  if (!data) {
    console.log(`  Failed to extract data`)
    return
  }
  
  const fullData = ensureFullCourseData(courseName, data)
  
  if (!fullData) {
    return
  }
  
  // Save as JSON
  const jsonPath = path.join(__dirname, '..', 'src', 'data', 'courses', `${courseName}.json`)
  fs.writeFileSync(jsonPath, JSON.stringify(fullData, null, 2))
  
  console.log(`  ✅ Saved to ${courseName}.json (${fullData.modules.length} modules)`)
})
