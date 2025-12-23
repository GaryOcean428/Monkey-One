# Self-Expansion Capabilities Plan (granite3.1-dense:2b)

This document describes the steps to evaluate and integrate self-expansion capabilities using the granite3.1-dense:2b model via Ollama. The implementation leverages current infrastructure (API call utilities, Pinecone for persistence, error handling in place, and environment configuration).

---

## 1. Overview of Changes

- Create a new module (or extend an existing one) to interface with the granite3.1-dense:2b model for generating self-modification or task-execution instructions.
- Add robust error handling, rate limiting, and security validations (e.g., ensuring that self-modification is only triggered by authorized actions).
- Integrate with existing API and configuration mechanisms.
- Optionally enable persistence of generated modifications or learned data via Pinecone.
- Introduce a new API endpoint (e.g., `/api/self-expansion`) for triggering self-expansion tasks (subject to manual review).

---

## 2. Key Code Interfaces and Pseudo-code

### 2.1. Model Executor Interface

Define a new interface for calling the model and processing tasks.  
*Example:*

```
interface SelfExpansionTask {
  taskDescription: string;
  prompt: string; // Additional context, if needed
}

interface SelfExpansionResult {
  modifiedCode?: string;
  instructions?: string;
  success: boolean;
  errorMessage?: string;
}
```

### 2.2. Function to Call the Model

Implement a function to call the Ollama API (or invoke a local process if applicable).  
*Pseudo-code:*

```
async function executeSelfExpansionTask(task: SelfExpansionTask): Promise<SelfExpansionResult> {
  // 1. Validate task input
  if (!isValid(task)) {
    return { success: false, errorMessage: "Invalid task description" }
  }

  // 2. Construct prompt combining task description and context (if any)
  const prompt = generatePrompt(task.taskDescription);

  // 3. Call the granite3.1-dense:2b model via appropriate API/CLI call
  try {
    const response = await callOllamaModel({
      model: 'granite3.1-dense:2b',
      prompt,
      // include additional parameters like temperature, topP, etc.
    });
  
    // 4. Validate and sanitize the response (security checks)
    if (!sanityCheck(response)) {
      throw new Error("Response failed security checks");
    }
  
    // 5. Parse the response to extract either direct code modifications or instructional output
    const result = parseModelResponse(response);
    return { success: true, ...result };
  } catch (error) {
    // Log error and return failure state
    logError(error);
    return { success: false, errorMessage: error.message };
  }
}
```

### 2.3. Rate Limiting and Security

Introduce rate limiting per invocation (use a simple timeout or middleware) and validate user/authorization context before calling self-expansion routines.
*Pseudo-code:*

```
if (!isUserAuthorized(currentUser)) {
  throw new Error("Unauthorized self-expansion request");
}

// Rate limiting pseudocode:
if (recentRequestsExceedLimit(currentUser)) {
  throw new Error("Rate limit exceeded");
}
```

### 2.4. Integration with Persistence (Pinecone)

Optionally store new modifications or “learned” vectors in Pinecone for future reference.
*Snippet:*

```
if (result.modifiedCode) {
  // Convert response into a vector and persist it
  const vectorData = generateVectorFromText(result.modifiedCode);
  await upsertVectors([{ id: generateUniqueId(), values: vectorData, metadata: { type: 'self-expansion' } }]);
}
```

### 2.5. API Endpoint for Self-Expansion

Create a new endpoint (or router) to trigger self-expansion tasks.  
*Pseudo-code using Express or similar:*

```
import { Router } from 'express';
const router = Router();

router.post('/api/self-expansion', async (req, res) => {
  try {
    // Pre-check user authentication and permissions
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: "Permission denied" });
    }
    
    // Extract task details from request
    const task: SelfExpansionTask = req.body;
    
    // Execute the self-expansion task
    const result = await executeSelfExpansionTask(task);
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    // Return the result to be reviewed/auto-applied if desired
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

---

## 3. Summary of File Changes

1. Create a new module (e.g., src/models/selfExpansion.ts) with the interface and functions (`executeSelfExpansionTask` and helpers like `callOllamaModel`, `generatePrompt`, `sanityCheck`, etc.).
2. Update the API routing (e.g., in the proxy/server or a dedicated Express route) to add a POST endpoint `/api/self-expansion` for triggering self-expansion tasks.
3. Integrate security validations by checking that the request comes from an authorized user.
4. (Optional) Extend the existing Pinecone integration in Desktop/Dev/Monkey-One/api/pinecone.ts to store self-expansion vectors.

---

## 4. Testing Considerations

- Prepare a suite of tests (using vitest or jest) to simulate self-expansion task requests.
- Verify that unauthorized requests are rejected.
- Ensure that successful responses pass sanity-check routines before applying them.
- Monitor and log all operations for both debugging and security auditing.

---

This plan provides an explicit guide for implementing self-expansion capabilities using the current granite3.1-dense:2b model while addressing security, rate limiting, integration, and persistence concerns.
