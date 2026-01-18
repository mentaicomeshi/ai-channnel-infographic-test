$sourceDir = "E:\development\work\infographic-test\prompts\2026-01-18_22-11-34"
$outputDir = "E:\development\work\infographic-test\prompts\2026-01-18_22-11-34\images"
$scriptPath = "e:\development\work\infographic-test\.agent\skills\image-gen\image_gen.js"

# Ensure output directory exists
if (-not (Test-Path -Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir
}

# Get all markdown files
$files = Get-ChildItem -Path $sourceDir -Filter "*.md"

foreach ($file in $files) {
    $outputFilename = $file.Name.Replace(".md", ".png")
    Write-Host "Generating image for $($file.Name)..."
    try {
        node $scriptPath --prompt-file $file.FullName --output $outputDir --filename $outputFilename
        # Sleep for 10 seconds to avoid rate limits
        Start-Sleep -Seconds 10
    } catch {
        Write-Error "Failed to generate image for $($file.Name): $_"
    }
}
