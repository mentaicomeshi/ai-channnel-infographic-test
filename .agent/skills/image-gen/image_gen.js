/**
 * Image Generation Skill
 *
 * Gemini API (Nano Banana Pro) を使用した汎用画像生成スキル
 *
 * 使用方法:
 *   node image_gen.js --prompt <text> --output <dir> [--filename name.png]
 *   node image_gen.js --prompt-file <file> --output <dir> [--filename name.png]
 */

const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

// settings.local.json から環境変数を読み込み
const settingsPath = path.join(process.env.USERPROFILE || process.env.HOME, '.claude', 'settings.local.json');
if (fs.existsSync(settingsPath)) {
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    if (settings.env) {
      for (const [key, value] of Object.entries(settings.env)) {
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  } catch (e) {
    console.error(`[Image Gen] Warning: Failed to load settings.local.json: ${e.message}`);
  }
}

const args = minimist(process.argv.slice(2));

// APIキーの確認（GEMINI_API_KEY または NANOBANANA_GEMINI_API_KEY）
const API_KEY = process.env.GEMINI_API_KEY || process.env.NANOBANANA_GEMINI_API_KEY;
if (!API_KEY) {
  console.error('[Image Gen] Error: GEMINI_API_KEY is not set in settings.local.json');
  process.exit(1);
}

// Gemini AI クライアントの初期化
const ai = new GoogleGenAI({ apiKey: API_KEY });

// モデル名
const MODEL_NAME = process.env.NANOBANANA_MODEL || 'gemini-2.0-flash-exp';

// デフォルト解像度（1K, 2K, 4K から選択。大文字K必須）
const DEFAULT_IMAGE_SIZE = '2K';

// デフォルトアスペクト比
const DEFAULT_ASPECT_RATIO = '16:9';

/**
 * ファイル拡張子からMIME型を判定
 * @param {string} filePath - 画像ファイルのパス
 * @returns {string} MIME型
 */
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  return mimeTypes[ext] || 'image/png';
}

/**
 * 単一の参照画像をBase64エンコードして読み込み
 * @param {string} imagePath - 画像ファイルのパス
 * @returns {Object} inlineData形式のオブジェクト
 */
function loadSingleImage(imagePath) {
  const absolutePath = path.isAbsolute(imagePath)
    ? imagePath
    : path.resolve(process.cwd(), imagePath);

  if (!fs.existsSync(absolutePath)) {
    console.error(`[Image Gen] Error: Reference image not found: ${absolutePath}`);
    process.exit(1);
  }

  const imageBuffer = fs.readFileSync(absolutePath);
  const base64Data = imageBuffer.toString('base64');
  const mimeType = getMimeType(absolutePath);

  console.error(`[Image Gen] Reference image loaded: ${path.basename(absolutePath)} (${mimeType})`);

  return {
    inlineData: {
      mimeType: mimeType,
      data: base64Data,
    }
  };
}

/**
 * 複数の参照画像を読み込み（カンマ区切りまたは配列）
 * @param {string|string[]} imagePathArg - 画像パス（カンマ区切り文字列または配列）
 * @returns {Object[]} inlineData形式のオブジェクト配列
 */
function loadReferenceImages(imagePathArg) {
  if (!imagePathArg) return [];

  // minimistは同じオプションを複数回指定すると配列にする
  // または単一の文字列の場合はカンマで分割
  let paths = [];
  if (Array.isArray(imagePathArg)) {
    paths = imagePathArg;
  } else if (typeof imagePathArg === 'string') {
    paths = imagePathArg.split(',').map(p => p.trim()).filter(p => p);
  }

  return paths.map(p => loadSingleImage(p));
}

/**
 * 出力ディレクトリを作成
 * @param {string} outputPath - 出力先ディレクトリパス
 * @returns {string} 出力ディレクトリパス
 */
function getOutputDir(outputPath) {
  if (!outputPath) {
    console.error('[Image Gen] Error: --output is required');
    process.exit(1);
  }
  // 絶対パスに変換
  const outputDir = path.isAbsolute(outputPath) ? outputPath : path.resolve(process.cwd(), outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  return outputDir;
}

/**
 * 画像生成
 * @param {string} prompt - 画像生成プロンプト
 * @param {string} output - 出力先ディレクトリ
 * @param {string} filename - 出力ファイル名
 * @param {Object[]} referenceImages - 参照画像の配列（inlineData形式）
 */
async function generateImage(prompt, output, filename, referenceImages = []) {
  const outputDir = getOutputDir(output);
  const outputFilename = filename || `image_${Date.now()}.png`;
  const outputPath = path.join(outputDir, outputFilename);

  console.error(`[Image Gen] Generating image...`);
  console.error(`[Image Gen] Model: ${MODEL_NAME}`);
  console.error(`[Image Gen] Output: ${outputPath}`);
  if (referenceImages.length > 0) {
    console.error(`[Image Gen] Reference images: ${referenceImages.length}`);
  }

  try {
    // 画像サイズを取得（コマンドライン引数 > 環境変数 > デフォルト）
    const imageSize = args['image-size'] || process.env.NANOBANANA_IMAGE_SIZE || DEFAULT_IMAGE_SIZE;
    const aspectRatio = args['aspect-ratio'] || process.env.NANOBANANA_ASPECT_RATIO || DEFAULT_ASPECT_RATIO;
    console.error(`[Image Gen] Image Size: ${imageSize}, Aspect Ratio: ${aspectRatio}`);

    // contents を配列形式で構築
    const contents = [];

    // 参照画像を先に追加（複数対応）
    if (referenceImages && referenceImages.length > 0) {
      for (const img of referenceImages) {
        contents.push(img);
      }
    }

    // テキストプロンプトを追加
    contents.push({ text: prompt });

    // Gemini API を呼び出し
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: contents,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          imageSize: imageSize,
          aspectRatio: aspectRatio,
        },
      },
    });

    // レスポンスから画像データを抽出
    let imageGenerated = false;

    if (response.candidates && response.candidates[0] && response.candidates[0].content) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          // Base64データをバッファに変換して保存
          const buffer = Buffer.from(part.inlineData.data, 'base64');
          fs.writeFileSync(outputPath, buffer);
          imageGenerated = true;
          console.log(`Generated: ${outputPath}`);
          break;
        }
        if (part.text) {
          console.error(`[Image Gen] Model response: ${part.text}`);
        }
      }
    }

    if (!imageGenerated) {
      console.error('[Image Gen] Warning: No image data in response');
      console.error('[Image Gen] Full response:', JSON.stringify(response, null, 2));
      return null;
    }

    return outputPath;
  } catch (error) {
    console.error(`[Image Gen] Error:`, error.message);
    if (error.message.includes('API key')) {
      console.error(`\nTroubleshooting:`);
      console.error(`1. ~/.claude/settings.local.json の env に GEMINI_API_KEY が正しく設定されているか確認`);
      console.error(`2. APIキーが有効か確認: https://aistudio.google.com/apikey`);
    }
    if (error.message.includes('model')) {
      console.error(`\nTroubleshooting:`);
      console.error(`1. モデル名が正しいか確認: ${MODEL_NAME}`);
      console.error(`2. 利用可能なモデル: gemini-2.0-flash-exp, gemini-3-pro-image-preview`);
    }
    process.exit(1);
  }
}

/**
 * ヘルプを表示
 */
function showHelp() {
  console.log('Image Generation Skill');
  console.log('======================\n');
  console.log('Gemini API (Nano Banana Pro) を使用して画像を生成します。\n');
  console.log('Usage:');
  console.log('  node image_gen.js --prompt <text> --output <dir> [options]');
  console.log('  node image_gen.js --prompt-file <file> --output <dir> [options]\n');
  console.log('Options:');
  console.log('  --prompt <text>       画像生成プロンプト（直接指定）');
  console.log('  --prompt-file <file>  画像生成プロンプト（ファイルから読み込み）');
  console.log('  --output <dir>        出力先ディレクトリ');
  console.log('  --filename <name>     出力ファイル名（省略時は image_<timestamp>.png）');
  console.log('  --image-size <size>   画像サイズ: 1K, 2K, 4K（デフォルト: 2K）');
  console.log('  --aspect-ratio <ratio> アスペクト比（デフォルト: 16:9）');
  console.log('  --reference-image <path>  参照画像のパス（複数可：カンマ区切りまたは複数指定）');
  console.log('  --ref <path>          --reference-image の短縮形\n');
  console.log('Available Aspect Ratios:');
  console.log('  1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9\n');
  console.log('Examples:');
  console.log('  node image_gen.js --prompt "青い空と白い雲" --output ./output/assets');
  console.log('  node image_gen.js --prompt-file ./prompt.txt --output ./output/assets --filename office.png');
  console.log('  node image_gen.js --prompt "この画像を油絵風に" --ref ./input.png --output ./output/assets\n');
  console.log('Output:');
  console.log('  {output}/{filename}\n');
  console.log('Environment Variables (~/.claude/settings.local.json の env フィールド):');
  console.log('  GEMINI_API_KEY       - Google AI Studio API Key (required)');
  console.log('  NANOBANANA_MODEL     - Model name (default: gemini-2.0-flash-exp)');
}

/**
 * プロンプトを取得（直接指定またはファイルから）
 * @returns {string|null} プロンプト文字列
 */
function getPrompt() {
  // --prompt-file が指定されている場合、ファイルから読み込み
  if (args['prompt-file']) {
    const promptFilePath = path.isAbsolute(args['prompt-file'])
      ? args['prompt-file']
      : path.resolve(process.cwd(), args['prompt-file']);

    if (!fs.existsSync(promptFilePath)) {
      console.error(`[Image Gen] Error: Prompt file not found: ${promptFilePath}`);
      process.exit(1);
    }

    return fs.readFileSync(promptFilePath, 'utf-8');
  }

  // --prompt が指定されている場合、そのまま返す
  if (args.prompt) {
    return args.prompt;
  }

  return null;
}

// メイン処理
(async () => {
  const prompt = getPrompt();

  // 参照画像の読み込み（--reference-image または --ref）
  const referenceImageArg = args['reference-image'] || args.ref;
  const referenceImages = loadReferenceImages(referenceImageArg);

  if (prompt && args.output) {
    await generateImage(prompt, args.output, args.filename, referenceImages);
  } else {
    showHelp();
    if (!prompt) console.error('\nError: --prompt or --prompt-file is required');
    if (!args.output) console.error('\nError: --output is required');
  }
})();
