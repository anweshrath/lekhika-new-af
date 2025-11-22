#!/bin/bash
# Copy all required services and convert ES6 to CommonJS

SERVICES=(
  "aiService.js"
  "narrativeStructureService.js"
  "exportService.js"
  "accentInstructionService.js"
  "sampleAnalysisService.js"
  "typographyService.js"
  "sessionManager.js"
  "aiResponseValidator.js"
  "workflowExecutionService.js"
)

# Check for BookCompilationService (case-sensitive)
if [ -f "src/services/BookCompilationService.js" ]; then
  SERVICES+=("BookCompilationService.js")
elif [ -f "src/services/bookCompilationService.js" ]; then
  SERVICES+=("bookCompilationService.js")
fi

# Check for professionalBookFormatter
if [ -f "src/services/professionalBookFormatter.js" ]; then
  SERVICES+=("professionalBookFormatter.js")
fi

echo "Files to copy:"
for service in "${SERVICES[@]}"; do
  if [ -f "src/services/$service" ]; then
    echo "  ✓ $service"
  else
    echo "  ✗ $service (NOT FOUND)"
  fi
done
