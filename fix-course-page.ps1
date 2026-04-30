$filePath = "C:\Users\Hp\Documents\Abdut Tawwab\SkoolarPlay\src\components\pages\course-page.tsx"
$content = Get-Content -Path $filePath -Raw

# Add logging and improve error handling
$oldText = '  useEffect(() => {
    if (!courseId) {
      setLoading(false)
      setError(''No course specified'')
      return
    }

    async function fetchCourse() {
      try {
        const res = await fetch(`/api/courses/${courseId}`)
        if (!res.ok) {
          const data = await res.json()
          if (data.requiresPremium) {
            setError(''This course is for premium members only. Upgrade to SkoolarPlay+ to access it.'')
          } else {
            setError(''Course not found'')
          }
          return
        }
        const data = await res.json()
        setCourse(data.course)

        // Auto-expand current module
        const currentModule = data.course.modules[data.course.currentModuleIndex]
        if (currentModule) {
          setExpandedModules(new Set([currentModule.id]))
        }
      } catch (err) {
        setError(err.message || ''Failed to load course. Please check your connection and try again.'')
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [courseId])'

$newText = '  useEffect(() => {
    if (!courseId) {
      setLoading(false)
      setError(''No course specified'')
      return
    }

    async function fetchCourse() {
      try {
        console.log(''[CoursePage] Fetching course:'', courseId)
        const res = await fetch(`/api/courses/${courseId}`)
        console.log(''[CoursePage] API response status:'', res.status)

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          console.error(''[CoursePage] API error:'', data)

          if (res.status === 404) {
            setError(''Course not found'')
          } else if (data.requiresPremium) {
            setError(''This course is for premium members only. Upgrade to SkoolarPlay+ to access it.'')
          } else if (res.status === 401) {
            setError(''Please log in to access this course'')
          } else if (res.status === 403) {
            setError(''You do not have permission to access this course'')
          } else {
            setError(''Failed to load course. Please try again.'')
          }
          return
        }

        const data = await res.json()
        console.log(''[CoursePage] Course data received:'', data.course?.title)

        if (!data.course) {
          setError(''Course data is invalid'')
          return
        }

        setCourse(data.course)

        // Auto-expand current module
        if (data.course.modules && data.course.modules.length > 0) {
          const currentModule = data.course.modules[data.course.currentModuleIndex || 0]
          if (currentModule) {
            setExpandedModules(new Set([currentModule.id]))
          }
        }
      } catch (err: any) {
        console.error(''[CoursePage] Error fetching course:'', err)
        setError(err.message || ''Failed to load course. Please check your connection and try again.'')
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [courseId])'

if ($content.Contains($oldText)) {
    $newContent = $content.Replace($oldText, $newText)
    Set-Content -Path $filePath -Value $newContent -Encoding UTF8
    Write-Host "Successfully updated CoursePage error handling"
} else {
    Write-Host "Could not find the exact text to replace"
    # Try alternative approach - just add logging
    $newContent2 = $content -replace "const res = await fetch\(`/api/courses/\$\{courseId\}`\)", "console.log('[CoursePage] Fetching course:', courseId)`n        const res = await fetch(`/api/courses/${courseId}`)" -replace "if \(!res\.ok\) \{", "if (!res.ok) {`n          console.log('[CoursePage] API response status:', res.status)"
    Set-Content -Path $filePath -Value $newContent2 -Encoding UTF8
    Write-Host "Applied alternative fix with logging"
}
