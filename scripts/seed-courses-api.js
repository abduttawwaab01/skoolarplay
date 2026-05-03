// Seed script to populate courses to Neon database via API routes
// JavaScript version - no TypeScript errors

const BASE_URL = 'http://localhost:3000'

const coursesToSeed = [
  // German A2-C2
  'german-a2', 'german-b1', 'german-b2', 'german-c1', 'german-c2',
  
  // Arabic A1-C2
  'arabic-a1', 'arabic-a2', 'arabic-b1', 'arabic-b2', 'arabic-c1', 'arabic-c2',
  
  // Portuguese A1-C2
  'portuguese-a1', 'portuguese-a2', 'portuguese-b1', 'portuguese-b2', 'portuguese-c1', 'portuguese-c2',
  
  // Igbo A1-C2
  'igbo-a1', 'igbo-a2', 'igbo-b1', 'igbo-b2', 'igbo-c1', 'igbo-c2',
  
  // Swahili A1-C2
  'swahili-a1', 'swahili-a2', 'swahili-b1', 'swahili-b2', 'swahili-c1', 'swahili-c2',
]

async function seedCourse(courseSlug) {
  console.log(`Seeding ${courseSlug}...`)
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/courses/${courseSlug}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log(`  ✅ Success: ${data.message}`)
      return { success: true, course: courseSlug, data }
    } else {
      console.log(`  ❌ Failed: ${data.error || 'Unknown error'}`)
      return { success: false, course: courseSlug, error: data.error }
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`)
    return { success: false, course: courseSlug, error: error.message }
  }
}

async function main() {
  console.log('Starting to seed courses to Neon database...')
  console.log(`Total courses to seed: ${coursesToSeed.length}\n`)
  
  const results = []
  
  for (const courseSlug of coursesToSeed) {
    const result = await seedCourse(courseSlug)
    results.push(result)
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  
  console.log('\n========== SEEDING SUMMARY ==========')
  console.log(`Total: ${coursesToSeed.length}`)
  console.log(`Successful: ${successful}`)
  console.log(`Failed: ${failed}`)
    
  if (failed > 0) {
    console.log('\nFailed courses:')
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.course}: ${r.error}`)
    })
  }
}

main()
