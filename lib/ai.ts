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
              text: '请分析这张图片，并生成5-10个相关的中文标签。请直接返回标签列表，用逗号分隔，不要包含其他文字。例如：风景,山脉,蓝天,自然,户外' 
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
      .filter(tag => tag.length > 0 && tag.length < 20); // Basic validation

    return tags;
  } catch (error) {
    console.error('AI Tagging Error:', error);
    return [];
  }
}
