import { pipeline } from '@xenova/transformers';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const MODEL_ID = 'microsoft/phi-3.5';
const OUTPUT_DIR = join(process.cwd(), 'public', 'models', 'phi-3.5-q4');

async function main() {
  try {
    console.log('Creating output directory...');
    mkdirSync(OUTPUT_DIR, { recursive: true });

    console.log('Downloading and preparing model...');
    const pipe = await pipeline('text-generation', MODEL_ID, {
      quantized: true,
      load_in_4bit: true,
      cache_dir: OUTPUT_DIR,
      progress_callback: (progress) => {
        console.log(`Download progress: ${Math.round(progress * 100)}%`);
      }
    });

    // Save model config
    const config = {
      model_type: 'phi',
      architectures: ['PhiForCausalLM'],
      quantization_config: {
        bits: 4,
        method: 'q4_0'
      },
      max_position_embeddings: 128000,
      hidden_size: 2048,
      intermediate_size: 8192,
      num_attention_heads: 32,
      num_hidden_layers: 32,
      torch_dtype: 'float16'
    };

    writeFileSync(
      join(OUTPUT_DIR, 'config.json'),
      JSON.stringify(config, null, 2)
    );

    console.log('Model preparation complete!');
  } catch (error) {
    console.error('Error preparing model:', error);
    process.exit(1);
  }
}

main();
