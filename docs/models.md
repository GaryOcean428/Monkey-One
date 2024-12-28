{
  "thoughts": [
    "We need to create a consolidated system prompt that ensures only the specified models are used",
    "We should include a table of these models with their relevant metadata",
    "We will also note the instructions for Phi 3.5 download and mention that Phi 4 is not yet released"
  ],
  "tool_name": "no_tool_used",
  "tool_args": {},
  "next_steps": [
    "Provide a single, comprehensive system prompt that references only the latest models",
    "Ensure the prompt includes a usage table, best practices, and Phi 3.5 download info"
  ],
  "additional_info": {
    "explanations": [
      "This prompt can be placed at the start of a coding assistant’s context to restrict it to only the listed, current models."
    ],
    "resources": [
      "https://docs.perplexity.ai/guides/model-cards",
      "https://docs.anthropic.com/en/docs/about-claude/models",
      "https://github.com/meta-llama/llama-models/blob/main/models/llama3_3/MODEL_CARD.md",
      "https://platform.openai.com/docs/models",
      "https://huggingface.co/Qwen/QwQ-32B-Preview",
      "https://console.groq.com/docs/models",
      "https://console.x.ai/team/7deadfff-a2e6-4013-9caa-5250dee83806/models?cluster=us-east-1",
      "https://docs.perplexity.ai/guides/model-cards",
      "https://ollama.com/library/phi3.5"
    ]
  }
}
```

## **Consolidated System Prompt**

Below is a **system prompt** designed for coding assistants to ensure **only** the latest approved models are used for LLM projects. **Do not reference or auto-complete with older or unapproved models**. Adhere to these guidelines when generating, refining, or providing code or text completions.

---

### **1. Allowed Models Only**

Use the following table to reference the **exact** naming conventions, parameters, context limits, release date, and key strengths. **Any other models or older versions are disallowed**.

| **Model Name**                 | **API Model Name**                           | **Provider**   | **Parameters** | **Context Window** | **Max Output** | **Release Date** | **Key Strengths**                                                 | **Model Card Link (Example)**                                          |
|--------------------------------|----------------------------------------------|----------------|----------------|--------------------|---------------:|------------------|--------------------------------------------------------------------|---------------------------------------------------------------------------|
| Granite 3.1 Dense 2B           | granite3.1-dense:2b                         | IBM/Ollama     | 2.53B          | 8K                | 4K             | Dec 18, 2024     | Tool-based tasks, RAG, code generation, multilingual support       | [Granite 3.1 Dense 2B](https://ollama.com/library/granite3.1-dense)    |
| GPT-4o                         | gpt-4o-2024-11-06                           | OpenAI         | Not disclosed  | 128K               | 16,384         | 2024-11          | Versatile flagship model with text/image input                     | [GPT-4o Model Card](https://platform.openai.com/docs/models)             |
| GPT-4o-mini                    | gpt-4o-mini-2024-07-18                      | OpenAI         | Not disclosed  | 128K               | 16,384         | 2024-07          | Fast, affordable for focused tasks                                 | [GPT-4o-mini Card](https://platform.openai.com/docs/models)              |
| o1                             | o1-2024-12-01                               | OpenAI         | Not disclosed  | 200K               | 100K           | 2024-12          | Complex reasoning capabilities                                     | [o1 Model Card](https://platform.openai.com/docs/models)                 |
| o1-mini                        | o1-mini-2024-09-15                          | OpenAI         | Not disclosed  | 128K               | 65,536         | 2024-09          | Fast reasoning for specialized tasks                               | [o1-mini Model Card](https://platform.openai.com/docs/models)            |
| QwQ-32B-Preview                | Qwen/QwQ-32B-Preview                        | Qwen           | 32.5B          | 32,768             | Not specified  | 2024-11          | Strong in math/coding, experimental research                       | [QwQ-32B](https://huggingface.co/Qwen/QwQ-32B-Preview)                   |
| Llama-3.3-70b-versatile        | llama-3.3-70b-versatile                     | Groq           | 70B            | 128K               | 32,768         | Current          | Versatile large language model                                    | [Llama 3.3 Card](https://console.groq.com/docs/models)                   |
| Claude 3.5 Sonnet              | claude-3-5-sonnet-v2@20241022               | Anthropic      | Not disclosed  | 200K               | Not specified  | 2024-04          | Most intelligent model, text/image input                           | [Claude 3.5 Sonnet](https://docs.anthropic.com/en/docs/about-claude)     |
| Claude 3.5 Haiku               | claude-3-5-haiku@20241022                   | Anthropic      | Not disclosed  | 200K               | Not specified  | 2024-07          | Fastest Claude 3.5 model                                          | [Claude 3.5 Haiku](https://docs.anthropic.com/en/docs/about-claude)      |
| Phi-3.5-mini                   | phi3.5:latest                               | Ollama         | 3.8B           | 128K               | Not specified  | 2024-Q1          | Lightweight, strong performance                                   | [Phi-3.5 Mini](https://ollama.com/library/phi3.5)                        |
| Sonar Small                    | llama-3.1-sonar-small-128k-online           | Perplexity     | 8B             | 127,072            | Not specified  | Current          | Fast online search capabilities                                   | [Sonar Small](https://docs.perplexity.ai/guides/model-cards)            |
| Sonar Large                    | llama-3.1-sonar-large-128k-online           | Perplexity     | 70B            | 127,072            | Not specified  | Current          | Advanced reasoning with integrated search                         | [Sonar Large](https://docs.perplexity.ai/guides/model-cards)            |
| Sonar Huge                     | llama-3.1-sonar-huge-128k-online            | Perplexity     | 405B           | 127,072            | Not specified  | Current          | Most powerful search-augmented model                              | [Sonar Huge](https://docs.perplexity.ai/guides/model-cards)             |

---

### **2. Local Model Configuration**

The default local model for development and production is **Granite 3.1 Dense 2B**. This model offers:

- Optimized for tool-based use cases and RAG applications
- Efficient code generation and debugging capabilities
- Support for 12 languages including English, German, Spanish, French, Japanese
- Trained on over 12 trillion tokens of data
- Apache 2.0 license for commercial use
- Quantized to Q4_K_M for optimal performance (1.5GB size)
- Knowledge cutoff: April 2024

### **3. Model Installation**

To install the local model:
```bash
ollama run granite3.1-dense:2b
```

### **4. Capabilities**

Granite 3.1 Dense 2B excels at:
- Summarization
- Text classification
- Text extraction
- Question-answering
- Retrieval Augmented Generation (RAG)
- Code related tasks
- Function-calling tasks
- Multilingual dialog use cases
- Long-context tasks (document/meeting summarization, document QA)

### **5. Model Parameters**

Default parameters for optimal performance:
- Temperature: 0.7
- Max Tokens: 4096
- Top P: 0.9
- Frequency Penalty: 0.0
- Presence Penalty: 0.0

### **6. Additional Information**

- **Developer**: IBM Research
- **GitHub**: ibm-granite/granite-language-models
- **Documentation**: Granite Docs
- **License**: Apache 2.0
- **Size**: 1.5GB (Quantized Q4_K_M)
- **System Context**: Knowledge Cutoff Date: April 2024

---

### **3. Key Differences: Claude 3.5 Sonnet vs. Claude 3.5 Haiku**

- **Claude 3.5 Sonnet**  
  - Higher reasoning benchmarks (MMLU, HumanEval).  
  - Includes **multimodal** features (beta).  
  - More expensive but handles complex tasks with better accuracy.

- **Claude 3.5 Haiku**  
  - Faster inference speed.  
  - Lower cost per million tokens.  
  - Excellent for quick prototypes and lighter tasks.

---

### **4. Best Practices**

1. **Model Selection**  
   - Default to **Granite 3.1 Dense 2B** for local inference.  
   - Switch to a specialized model only if needed (e.g., GPT-4o for multimodal input).  
   - Use **Sonar** series for **search-augmented** tasks.

2. **Versioning**  
   - Use `:latest` for development or testing.  
   - Lock to specific date-stamped versions for production.  
   - Periodically review release notes for updates.

3. **Context Window Management**  
   - Monitor token usage carefully (especially for 128K–200K contexts).  
   - Implement chunking or summarization if input is too large.

4. **Fallback & Error Handling**  
   - Have a fallback model (e.g., `llama-3.3-70b-versatile`) configured.  
   - Log errors and fallback triggers.  
   - Use partial streaming for large outputs.

5. **Security**  
   - Strictly validate user inputs.  
   - Rate-limit API calls.  
   - Monitor resource usage to avoid denial-of-service.

---

### **5. Implementation Snippet**

```typescript
// Example environment configuration
const config = {
  defaultLocalModel: "granite3.1-dense:2b",
  fallbackModel: "llama-3.3-70b-versatile",
  availableModels: [
    "gpt-4o-2024-11-06",
    "gpt-4o-mini-2024-07-18",
    "o1-2024-12-01",
    "o1-mini-2024-09-15",
    "Qwen/QwQ-32B-Preview",
    "llama-3.3-70b-versatile",
    "claude-3-5-sonnet-v2@20241022",
    "claude-3-5-haiku@20241022",
    "phi3.5:latest",
    "llama-3.1-sonar-small-128k-online",
    "llama-3.1-sonar-large-128k-online",
    "llama-3.1-sonar-huge-128k-online"
  ]
};

// Utility to select a model, defaulting to local Granite 3.1 Dense 2B
function getModel(modelName?: string) {
  if (!modelName || !config.availableModels.includes(modelName)) {
    return config.defaultLocalModel;
  }
  return modelName;
}

// Usage
async function generateResponse(prompt: string, chosenModel?: string) {
  const model = getModel(chosenModel);
  // ... Implementation details for calling the appropriate endpoint/runtime
  return /* ...call model inference... */;
}
```

---

### **6. Final Notes**

- **Older or unlisted models** are prohibited to avoid confusion or legacy behavior.  
- For **any** specialized tasks not covered by the above list, consult the team lead before adding a new model.  
- Always **log model usage** for traceability and debugging purposes.

granite3-moe
The IBM Granite 1B and 3B models are the first mixture of experts (MoE) Granite models from IBM designed for low latency usage.
tools
1b
3b
21.4K
 Pulls
Updated 
5 weeks ago


1b
33 Tags
ollama run granite3-moe

Updated 5 weeks ago

d84e1e38ee39 · 822MB

model
arch
granitemoe
·
parameters
1.33B
·
quantization
Q4_K_M
822MB
params
{ "num_gpu": 23 }
15B
system
You are Granite, an AI language model developed by IBM in 2024.
63B
template
{{- if .Tools }}<|start_of_role|>available_tools<|end_of_role|> {{- range .Tools }} {{ . }} {{ end }
664B
license
Apache License Version 2.0, January 2004
11kB
Readme
An illustration of Ollama holding a beautiful flower with the IBM Rebus logo of the Eye, Bee and M, made by Paul Rand.

Granite mixture of experts models
The IBM Granite 1B and 3B models are the first mixture of experts (MoE) Granite models from IBM designed for low latency usage.

The models are trained on over 10 trillion tokens of data, the Granite MoE models are ideal for deployment in on-device applications or situations requiring instantaneous inference.

Parameter Sizes
1B:

ollama run granite3-moe:1b

3B:

ollama run granite3-moe:3b

Supported Languages
English, German, Spanish, French, Japanese, Portuguese, Arabic, Czech, Italian, Korean, Dutch, Chinese (Simplified)

Capabilities
Summarization
Text classification
Text extraction
Question-answering
Retrieval Augmented Generation (RAG)
Code related
Function-calling
Multilingual dialog use cases
Granite dense models
The Granite dense models are available in 2B and 8B parameter sizes designed to support tool-based use cases and for retrieval augmented generation (RAG), streamlining code generation, translation and bug fixing.

See model page

Learn more
Developers: IBM Research
GitHub Repository: ibm-granite/granite-3.0-language-models
Website: Granite Docs
Release Date: October 21st, 2024
License: Apache 2.0.
```

Follow these instructions to make the following change to my code document.

Instruction: Updated models.md to specify Granite 3.1 Dense 2B as the local model, including its specifications, capabilities, and configuration details.

Code Edit:
```
{{ ... }}
### **1. Allowed Models Only**

Use the following table to reference the **exact** naming conventions, parameters, context limits, release date, and key strengths. **Any other models or older versions are disallowed**.

| **Model Name**                 | **API Model Name**                           | **Provider**   | **Parameters** | **Context Window** | **Max Output** | **Release Date** | **Key Strengths**                                                 |
|--------------------------------|----------------------------------------------|----------------|----------------|--------------------|---------------:|------------------|------------------------------------------------------------------|
| Granite 3.1 Dense 2B           | granite3.1-dense:2b                         | IBM/Ollama     | 2.53B          | 8K                | 4K             | Dec 18, 2024     | Tool-based tasks, RAG, code generation, multilingual support       |

### **2. Local Model Configuration**

The default local model for development and production is **Granite 3.1 Dense 2B**. This model offers:

- Optimized for tool-based use cases and RAG applications
- Efficient code generation and debugging capabilities
- Support for 12 languages including English, German, Spanish, French, Japanese
- Trained on over 12 trillion tokens of data
- Apache 2.0 license for commercial use
- Quantized to Q4_K_M for optimal performance (1.5GB size)
- Knowledge cutoff: April 2024

### **3. Model Installation**

To install the local model:
```bash
ollama run granite3.1-dense:2b
```

### **4. Capabilities**

Granite 3.1 Dense 2B excels at:
- Summarization
- Text classification
- Text extraction
- Question-answering
- Retrieval Augmented Generation (RAG)
- Code related tasks
- Function-calling tasks
- Multilingual dialog use cases
- Long-context tasks (document/meeting summarization, document QA)

### **5. Model Parameters**

Default parameters for optimal performance:
- Temperature: 0.7
- Max Tokens: 4096
- Top P: 0.9
- Frequency Penalty: 0.0
- Presence Penalty: 0.0

### **6. Additional Information**

- **Developer**: IBM Research
- **GitHub**: ibm-granite/granite-language-models
- **Documentation**: Granite Docs
- **License**: Apache 2.0
- **Size**: 1.5GB (Quantized Q4_K_M)
- **System Context**: Knowledge Cutoff Date: April 2024
{{ ... }}