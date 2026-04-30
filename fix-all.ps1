# Fix Course API Route
$apiRoute = "C:\Users\Hp\Documents\Abdut Tawwab\SkoolarPlay\src\app\api\courses\[id]\route.ts"
if (Test-Path $apiRoute) {
    Write-Host "Found API route: $apiRoute"
    $content = Get-Content -Path $apiRoute -Raw
    # Check if params needs await
    if ($content -match 'params: \{ params: \{ id: string \} \}') {
        Write-Host "API route params look correct"
    }
} else {
    Write-Host "API route not found at: $apiRoute"
}

# Fix CoursePage
$coursePage = "C:\Users\Hp\Documents\Abdut Tawwab\SkoolarPlay\src\components\pages\course-page.tsx"
if (Test-Path $coursePage) {
    Write-Host "Found CoursePage: $coursePage"
    $content = Get-Content -Path $coursePage -Raw

    # Add better error handling
    $newContent = $content -replace "setError\('Failed to load course'\)", "setError(err.message || 'Failed to load course. Please check your connection and try again.')"

    # Add console logging
    $newContent = $newContent -replace "const res = await fetch\(`/api/courses/\$\{courseId\}`\)", "console.log('[CoursePage] Fetching course:', courseId)`n        const res = await fetch(`/api/courses/${courseId}`)`n        console.log('[CoursePage] API response status:', res.status)"

    # Add null check for course
    $newContent = $newContent -replace "setCourse\(data\.course\)", "if (!data.course) {`n          setError('Course data is invalid')`n          return`n        }`n        setCourse(data.course)"

    Set-Content -Path $coursePage -Value $newContent -Encoding UTF8
    Write-Host "Updated CoursePage with better error handling"
} else {
    Write-Host "CoursePage not found at: $coursePage"
}

Write-Host "Fix script completed"
