import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env['ARK_API_KEY'],
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
});

export async function generateImageTags(base64Image: string): Promise<string[]> {
  try {
    console.log('----- AI Tagging Request Start -----');
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: base64Image, // OpenAI SDK supports base64 data URLs
              },
            },
            { 
              type: 'text', 
              text: `请分析这张图片，生成3-6个实用的中文标签，用于图片分类和检索。

标签要求：
1. 优先选择通用、高层次的分类标签，避免过度细节
2. 从以下维度考虑（选择2-3个最相关的）：
   - 主题类别：风景/人物/动物/建筑/美食/艺术/科技等
   - 场景类型：室内/室外/城市/自然/办公/居家等
   - 风格情感：温馨/活力/宁静/复古/现代/可爱等
   - 活动用途：旅行/工作/学习/娱乐/运动等
3. 避免罗列具体物品，除非该物品是图片的核心主题
4. 标签应该简洁（2-4个字）、通用、便于搜索

直接返回标签，用逗号分隔，不要其他文字。
示例：自然风景,山脉,宁静,户外
示例：室内,温馨,居家生活
示例：城市建筑,现代,夜景` 
            },
          ],
        },
      ],
      model: 'doubao-seed-1-6-lite-251015',
    });

    const content = completion.choices[0]?.message?.content || '';
    console.log('AI Response:', content);

    // Parse tags from the response
    // Assuming the AI follows instructions and returns comma-separated tags
    const tags = content
      .split(/[,，、\n]/) // Split by comma (English/Chinese), pause mark, or newline
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && tag.length < 30); // Allow longer tags for Chinese

    return tags;
  } catch (error) {
    console.error('AI Tagging Error:', error);
    return [];
  }
}
