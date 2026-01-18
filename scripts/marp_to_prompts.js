const fs = require('fs');
const path = require('path');

// 引数チェック
if (process.argv.length < 3) {
  console.error('Usage: node marp_to_prompts.js <input_markdown_file>');
  process.exit(1);
}

const inputFile = process.argv[2];

// ファイル読み込み
try {
  const content = fs.readFileSync(inputFile, 'utf-8');
  
  // Frontmatterの除去とスライド分割
  // Marpファイルは通常冒頭にFrontmatterがあり、スライドは `---` で区切られる
  const slides = content.split(/^---$/m).map(s => s.trim()).filter(s => s.length > 0);

  // 最初のブロックがFrontmatter（marp: trueが含まれる）なら除外
  let startIndex = 0;
  if (slides[0].includes('marp: true')) {
    startIndex = 1;
  }

  // 出力ディレクトリの作成
  const now = new Date();
  const timestamp = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + '_' +
    String(now.getHours()).padStart(2, '0') + '-' +
    String(now.getMinutes()).padStart(2, '0') + '-' +
    String(now.getSeconds()).padStart(2, '0');
  
  const outputBaseDir = path.join(path.dirname(inputFile), 'prompts');
  const outputDir = path.join(outputBaseDir, timestamp);

  if (!fs.existsSync(outputBaseDir)) {
    fs.mkdirSync(outputBaseDir);
  }
  fs.mkdirSync(outputDir);

  console.log(`Created output directory: ${outputDir}`);

  // テンプレート
  const templateHeader = `以下の説明文を元に、見やすいスライド資料を作成してください。

・フォーマット
アスペクト比: 16:9
解像度: 2K

・デザイン
シンプルな白背景、黒文字、メインカラーは青、フラットーカラー
イメージキャラクターとしてかわいい黒猫。
小物はワイン、本、ペン、ノートを必要に応じて使用すること。
見やすいスッキリした図解にしてください。
最後に文字を清書するように再生成してください。文字以外の要素は変更禁止です。

・説明文
`;

  // スライドごとの処理
  let slideCount = 0;
  for (let i = startIndex; i < slides.length; i++) {
    const slideContent = slides[i];
    
    // 見出しを抽出してファイル名にする
    const match = slideContent.match(/^#+\s+(.+)$/m);
    let title = `slide_${i - startIndex + 1}`;
    if (match) {
      // ファイル名として不適切な文字を置換
      const safeTitle = match[1].replace(/[\\/:*?"<>|]/g, '_').trim();
      title += `_${safeTitle}`;
    }

    const outputContent = templateHeader + slideContent;
    const outputPath = path.join(outputDir, `${title}.md`);

    fs.writeFileSync(outputPath, outputContent, 'utf-8');
    console.log(`Generated: ${outputPath}`);
    slideCount++;
  }

  console.log(`Successfully generated ${slideCount} prompt files.`);

} catch (err) {
  console.error('Error processing file:', err);
  process.exit(1);
}
